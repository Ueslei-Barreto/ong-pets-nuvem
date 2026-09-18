const bcrypt = require('bcryptjs');
const { pool, query } = require('../config/database');

// -------------------------------------------------------------
// Integracao com API externa: ViaCEP
// -------------------------------------------------------------
const consultarCep = async (req, res) => {
  const cep = String(req.params.cep || '').replace(/\D/g, '');

  if (cep.length !== 8) {
    return res.status(400).json({ erro: 'CEP deve ter 8 digitos.' });
  }

  try {
    const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const dados = await resposta.json();

    if (dados.erro) {
      return res.status(404).json({ erro: 'CEP nao encontrado.' });
    }

    res.json({
      cep: dados.cep,
      logradouro: dados.logradouro,
      bairro: dados.bairro,
      cidade: dados.localidade,
      uf: dados.uf,
    });
  } catch (err) {
    console.error(err);
    res.status(502).json({ erro: 'Nao foi possivel consultar o servico de CEP.' });
  }
};

// -------------------------------------------------------------
// Cadastro publico de ONG + primeiro administrador (transacao)
// -------------------------------------------------------------
const criarOng = async (req, res) => {
  const {
    nome, cnpj, email_contato, telefone, cep, descricao,
    admin_nome, admin_email, admin_senha,
  } = req.body;

  if (!nome || !admin_nome || !admin_email || !admin_senha) {
    return res.status(400).json({ erro: 'Nome da ONG e dados do administrador sao obrigatorios.' });
  }
  if (admin_senha.length < 6) {
    return res.status(400).json({ erro: 'A senha deve ter pelo menos 6 caracteres.' });
  }

  // Preenche o endereco pelo ViaCEP quando o CEP e informado
  let endereco = { logradouro: null, bairro: null, cidade: null, uf: null };
  const cepLimpo = String(cep || '').replace(/\D/g, '');

  if (cepLimpo.length === 8) {
    try {
      const resposta = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const dados = await resposta.json();
      if (!dados.erro) {
        endereco = {
          logradouro: dados.logradouro,
          bairro: dados.bairro,
          cidade: dados.localidade,
          uf: dados.uf,
        };
      }
    } catch (err) {
      console.warn('ViaCEP indisponivel, seguindo sem endereco:', err.message);
    }
  }

  const cliente = await pool.connect();

  try {
    const emailUsado = await cliente.query('SELECT id FROM usuarios WHERE email = $1', [admin_email]);
    if (emailUsado.rowCount > 0) {
      return res.status(409).json({ erro: 'Este email de administrador ja esta cadastrado.' });
    }

    await cliente.query('BEGIN');

    const ong = await cliente.query(
      `INSERT INTO ongs (nome, cnpj, email_contato, telefone, cep, logradouro, bairro, cidade, uf, descricao)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [nome, cnpj || null, email_contato || null, telefone || null, cep || null,
       endereco.logradouro, endereco.bairro, endereco.cidade, endereco.uf, descricao || null]
    );

    const senhaHash = await bcrypt.hash(admin_senha, 10);

    const usuario = await cliente.query(
      `INSERT INTO usuarios (ong_id, nome, email, senha_hash)
       VALUES ($1,$2,$3,$4)
       RETURNING id, nome, email, role, ong_id`,
      [ong.rows[0].id, admin_nome, admin_email, senhaHash]
    );

    await cliente.query('COMMIT');

    res.status(201).json({
      mensagem: 'ONG cadastrada com sucesso! Faca login para comecar.',
      ong: ong.rows[0],
      administrador: usuario.rows[0],
    });
  } catch (err) {
    await cliente.query('ROLLBACK');
    console.error(err);
    if (err.code === '23505') {
      return res.status(409).json({ erro: 'CNPJ ou email ja cadastrado.' });
    }
    res.status(500).json({ erro: 'Erro ao cadastrar ONG.' });
  } finally {
    cliente.release();
  }
};

// Lista publica das ONGs, usada nos filtros do catalogo
const listarOngs = async (req, res) => {
  try {
    const resultado = await query(
      `SELECT o.id, o.nome, o.cidade, o.uf, o.descricao,
              COUNT(p.id) FILTER (WHERE p.status = 'disponivel') AS pets_disponiveis
       FROM ongs o
       LEFT JOIN pets p ON p.ong_id = o.id
       WHERE o.ativa = TRUE
       GROUP BY o.id
       ORDER BY o.nome`
    );
    res.json(resultado.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar ONGs.' });
  }
};

// Lista de cidades com ONG ativa, para o filtro do catalogo publico
const listarCidades = async (req, res) => {
  try {
    const resultado = await query(
      `SELECT DISTINCT cidade, uf FROM ongs
       WHERE ativa = TRUE AND cidade IS NOT NULL
       ORDER BY cidade`
    );
    res.json(resultado.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar cidades.' });
  }
};

// -------------------------------------------------------------
// Painel de indicadores (escopo: a ONG do usuario logado)
// -------------------------------------------------------------
const indicadores = async (req, res) => {
  const ongId = req.usuario.ong_id;

  try {
    const [resumo, porEspecie, adocoes] = await Promise.all([
      query(
        `SELECT
           COUNT(*)                                            AS total_pets,
           COUNT(*) FILTER (WHERE status = 'disponivel')       AS disponiveis,
           COUNT(*) FILTER (WHERE status = 'reservado')        AS reservados,
           COUNT(*) FILTER (WHERE status = 'adotado')          AS adotados,
           ROUND(AVG(EXTRACT(EPOCH FROM (adotado_em - created_at)) / 86400)
                 FILTER (WHERE adotado_em IS NOT NULL)::numeric, 1) AS dias_medio_ate_adocao
         FROM pets WHERE ong_id = $1`,
        [ongId]
      ),
      query(
        `SELECT especie, COUNT(*) AS total
         FROM pets WHERE ong_id = $1
         GROUP BY especie ORDER BY total DESC`,
        [ongId]
      ),
      query(
        `SELECT
           COUNT(*)                                      AS total,
           COUNT(*) FILTER (WHERE status = 'pendente')   AS pendentes,
           COUNT(*) FILTER (WHERE status = 'aprovado')   AS aprovadas,
           COUNT(*) FILTER (WHERE status = 'recusado')   AS recusadas
         FROM adocoes WHERE ong_id = $1`,
        [ongId]
      ),
    ]);

    res.json({
      pets: resumo.rows[0],
      por_especie: porEspecie.rows,
      adocoes: adocoes.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao calcular indicadores.' });
  }
};

module.exports = { consultarCep, criarOng, listarOngs, listarCidades, indicadores };
