const express = require('express');
const router = express.Router();
const { autenticar } = require('../middleware/auth');
const {
  consultarCep, criarOng, listarOngs, listarCidades, indicadores,
} = require('../controllers/ongsController');

router.get('/', listarOngs);
router.get('/cidades', listarCidades);
router.get('/cep/:cep', consultarCep);       // integracao ViaCEP
router.post('/', criarOng);                  // cadastro publico de ONG
router.get('/indicadores', autenticar, indicadores);

module.exports = router;
