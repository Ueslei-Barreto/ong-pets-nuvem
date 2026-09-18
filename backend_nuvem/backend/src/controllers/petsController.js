const { query } = require('../config/database');
const { enviarImagem } = require('../config/storage');

// -------------------------------------------------------------
// Catalogo publico: junta TODAS as ONGs numa busca unificada
// -------------------------------------------------------------
const listarPets = async (req, res) => {
  const { especie, porte, status, sexo, cidade, ong_id } = req.query;

  const condicoes = [];
  const valores = [];

  const adicionar = (sql, valor) => {
    valores.push(valor);
    condicoes.push(sql.replace('?', `$${valores.length}`));
  };

  if (especie) adicionar('p.especie = ?', especie);
  if (porte)   adicionar('p.porte = ?', porte);
  if (sexo)    adicionar('p.sexo = ?', sexo);
  if (cidade)  adicionar('o.cidade = ?', cidade);
  if (ong_id)  adicionar('p.ong_id = ?', parseInt(ong_id));

  if (status) adicionar('p.status = ?', status);
  else condicoes.push("p.status <> 'adotado'");

  const where = condicoes.length ? `WHERE ${condicoes.join(' AND ')}` : '';

  try {
    const resultado = await query(
      `SELECT p.*, o.nome AS ong_nome, o.cidade AS ong_cidade, o.uf AS ong_uf
       FROM pets p
       JOIN ongs o ON o.id = p.ong_id
       ${where}
       ORDER BY p.created_at DESC`,
      valores
    );
    res.json(resultado.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar pets.' });
  }
};

const buscarPet = async (req, res) => {
  try {
    const resultado = await query(
      `SELECT p.*, o.nome AS ong_nome, o.cidade AS ong_cidade, o.uf AS ong_uf,
              o.telefone AS ong_telefone, o.email_contato AS ong_email
       FROM pets p
       JOIN ongs o ON o.id = p.ong_id
       WHERE p.id = $1`,
      [req.params.id]
    );

    if (resultado.rowCount === 0) {
      return res.status(404).json({ erro: 'Pet nao encontrado.' });
    }

    res.json(resultado.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar pet.' });
  }
};

// -------------------------------------------------------------
// Area administrativa: sempre restrita a ONG do usuario logado
// -------------------------------------------------------------
const listarMeusPets = async (req, res) => {
  try {
    const resultado = await query(
      'SELECT * FROM pets WHERE ong_id = $1 ORDER BY created_at DESC',
      [req.usuario.ong_id]
    );
    res.json(resultado.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar pets da ONG.' });
  }
};

const criarPet = async (req, res) => {
  const { nome, especie, raca, idade_anos, porte, sexo, descricao, vacinado, castrado } = req.body;

  if (!nome || !especie) {
    return res.status(400).json({ erro: 'Nome e especie sao obrigatorios.' });
  }

  const verdadeiro = (v) => v === true || v === 'true' || v === '1' || v === 1;

  try {
    const foto_url = await enviarImagem(req.file);

    const resultado = await query(
      `INSERT INTO pets
         (ong_id, nome, especie, raca, idade_anos, porte, sexo, descricao, foto_url, vacinado, castrado, usuario_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING *`,
      [
        req.usuario.ong_id, nome, especie, raca || null,
        idade_anos ? parseInt(idade_anos) : null,
        porte || null, sexo || null, descricao || null, foto_url,
        verdadeiro(vacinado), verdadeiro(castrado), req.usuario.id,
      ]
    );

    res.status(201).json(resultado.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao cadastrar pet.' });
  }
};

const atualizarPet = async (req, res) => {
  const { nome, especie, raca, idade_anos, porte, sexo, descricao, vacinado, castrado, status } = req.body;

  const campos = ['updated_at = NOW()'];
  const valores = [];

  const definir = (coluna, valor) => {
    valores.push(valor);
    campos.push(`${coluna} = $${valores.length}`);
  };

  if (nome !== undefined)       definir('nome', nome);
  if (especie !== undefined)    definir('especie', especie);
  if (raca !== undefined)       definir('raca', raca);
  if (idade_anos !== undefined) definir('idade_anos', idade_anos ? parseInt(idade_anos) : null);
  if (porte !== undefined)      definir('porte', porte);
  if (sexo !== undefined)       definir('sexo', sexo);
  if (descricao !== undefined)  definir('descricao', descricao);
  if (vacinado !== undefined)   definir('vacinado', vacinado === true || vacinado === 'true');
  if (castrado !== undefined)   definir('castrado', castrado === true || castrado === 'true');

  if (status !== undefined) {
    definir('status', status);
    // Marca a data da adocao: e dela que sai o indicador de tempo medio
    campos.push(status === 'adotado' ? 'adotado_em = NOW()' : 'adotado_em = NULL');
  }

  try {
    if (req.file) {
      const foto_url = await enviarImagem(req.file);
      definir('foto_url', foto_url);
    }

    valores.push(req.params.id);
    const posId = valores.length;
    valores.push(req.usuario.ong_id);
    const posOng = valores.length;

    const resultado = await query(
      `UPDATE pets SET ${campos.join(', ')}
       WHERE id = $${posId} AND ong_id = $${posOng}
       RETURNING *`,
      valores
    );

    if (resultado.rowCount === 0) {
      return res.status(404).json({ erro: 'Pet nao encontrado nesta ONG.' });
    }

    res.json(resultado.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao atualizar pet.' });
  }
};

const deletarPet = async (req, res) => {
  try {
    const resultado = await query(
      'DELETE FROM pets WHERE id = $1 AND ong_id = $2 RETURNING id',
      [req.params.id, req.usuario.ong_id]
    );

    if (resultado.rowCount === 0) {
      return res.status(404).json({ erro: 'Pet nao encontrado nesta ONG.' });
    }

    res.json({ mensagem: 'Pet removido com sucesso.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao deletar pet.' });
  }
};

module.exports = { listarPets, buscarPet, listarMeusPets, criarPet, atualizarPet, deletarPet };
