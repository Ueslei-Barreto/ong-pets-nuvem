const jwt = require('jsonwebtoken');

const autenticar = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ erro: 'Acesso negado. Faca login primeiro.' });
  }

  try {
    const dados = jwt.verify(token, process.env.JWT_SECRET);

    // Token antigo, gerado antes do multi-ONG, nao serve mais.
    if (!dados.ong_id) {
      return res.status(403).json({ erro: 'Sessao desatualizada. Faca login novamente.' });
    }

    req.usuario = dados; // { id, email, role, ong_id }
    next();
  } catch (err) {
    return res.status(403).json({ erro: 'Token invalido ou expirado.' });
  }
};

module.exports = { autenticar };
