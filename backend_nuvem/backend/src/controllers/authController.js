const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

const login = async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: 'Email e senha sao obrigatorios.' });
  }

  try {
    const resultado = await query(
      `SELECT u.*, o.nome AS ong_nome, o.cidade AS ong_cidade
       FROM usuarios u
       JOIN ongs o ON o.id = u.ong_id
       WHERE u.email = $1`,
      [email]
    );

    if (resultado.rowCount === 0) {
      return res.status(401).json({ erro: 'Credenciais invalidas.' });
    }

    const usuario = resultado.rows[0];
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);

    if (!senhaCorreta) {
      return res.status(401).json({ erro: 'Credenciais invalidas.' });
    }

    // ong_id dentro do token e o que garante o isolamento entre organizacoes
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, role: usuario.role, ong_id: usuario.ong_id },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role,
        ong_id: usuario.ong_id,
        ong_nome: usuario.ong_nome,
        ong_cidade: usuario.ong_cidade,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

// Cadastra um admin adicional DENTRO da ONG de quem esta logado.
// Para criar uma ONG nova com o primeiro admin, use POST /ongs.
const cadastro = async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: 'Nome, email e senha sao obrigatorios.' });
  }
  if (senha.length < 6) {
    return res.status(400).json({ erro: 'A senha deve ter pelo menos 6 caracteres.' });
  }

  try {
    const existente = await query('SELECT id FROM usuarios WHERE email = $1', [email]);
    if (existente.rowCount > 0) {
      return res.status(409).json({ erro: 'Este email ja esta cadastrado.' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const resultado = await query(
      `INSERT INTO usuarios (ong_id, nome, email, senha_hash)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nome, email, role, ong_id`,
      [req.usuario.ong_id, nome, email, senhaHash]
    );

    res.status(201).json({ mensagem: 'Usuario criado com sucesso!', usuario: resultado.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
};

module.exports = { login, cadastro };
