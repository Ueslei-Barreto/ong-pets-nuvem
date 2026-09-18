const { pool, query } = require('../config/database');

const solicitarAdocao = async (req, res) => {
  const { pet_id, nome_adotante, email_adotante, telefone, mensagem } = req.body;

  if (!pet_id || !nome_adotante || !email_adotante) {
    return res.status(400).json({ erro: 'Pet, nome e email sao obrigatorios.' });
  }

  const cliente = await pool.connect();

  try {
    const pet = await cliente.query('SELECT id, ong_id, status FROM pets WHERE id = $1', [pet_id]);

    if (pet.rowCount === 0) {
      return res.status(404).json({ erro: 'Pet nao encontrado.' });
    }
    if (pet.rows[0].status !== 'disponivel') {
      return res.status(400).json({ erro: 'Este pet nao esta disponivel para adocao.' });
    }

    await cliente.query('BEGIN');

    // ong_id vem do pet: o adotante nao escolhe, evita solicitacao cruzada
    const resultado = await cliente.query(
      `INSERT INTO adocoes (pet_id, ong_id, nome_adotante, email_adotante, telefone, mensagem)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING *`,
      [pet_id, pet.rows[0].ong_id, nome_adotante, email_adotante, telefone || null, mensagem || null]
    );

    await cliente.query("UPDATE pets SET status = 'reservado', updated_at = NOW() WHERE id = $1", [pet_id]);

    await cliente.query('COMMIT');

    res.status(201).json({
      mensagem: 'Solicitacao enviada! A ONG entrara em contato em breve.',
      adocao: resultado.rows[0],
    });
  } catch (err) {
    await cliente.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ erro: 'Erro ao processar solicitacao.' });
  } finally {
    cliente.release();
  }
};

const listarAdocoes = async (req, res) => {
  try {
    const resultado = await query(
      `SELECT a.*, p.nome AS pet_nome, p.especie AS pet_especie, p.foto_url
       FROM adocoes a
       JOIN pets p ON p.id = a.pet_id
       WHERE a.ong_id = $1
       ORDER BY a.created_at DESC`,
      [req.usuario.ong_id]
    );
    res.json(resultado.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro ao buscar solicitacoes.' });
  }
};

const atualizarStatusAdocao = async (req, res) => {
  const { status } = req.body;

  if (!['aprovado', 'recusado'].includes(status)) {
    return res.status(400).json({ erro: 'Status invalido.' });
  }

  const cliente = await pool.connect();

  try {
    const adocao = await cliente.query(
      'SELECT * FROM adocoes WHERE id = $1 AND ong_id = $2',
      [req.params.id, req.usuario.ong_id]
    );

    if (adocao.rowCount === 0) {
      return res.status(404).json({ erro: 'Solicitacao nao encontrada nesta ONG.' });
    }

    await cliente.query('BEGIN');

    await cliente.query('UPDATE adocoes SET status = $1 WHERE id = $2', [status, req.params.id]);

    if (status === 'aprovado') {
      await cliente.query(
        "UPDATE pets SET status = 'adotado', adotado_em = NOW(), updated_at = NOW() WHERE id = $1",
        [adocao.rows[0].pet_id]
      );
    } else {
      await cliente.query(
        "UPDATE pets SET status = 'disponivel', adotado_em = NULL, updated_at = NOW() WHERE id = $1",
        [adocao.rows[0].pet_id]
      );
    }

    await cliente.query('COMMIT');

    res.json({ mensagem: `Solicitacao ${status} com sucesso!` });
  } catch (err) {
    await cliente.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ erro: 'Erro ao atualizar solicitacao.' });
  } finally {
    cliente.release();
  }
};

module.exports = { solicitarAdocao, listarAdocoes, atualizarStatusAdocao };
