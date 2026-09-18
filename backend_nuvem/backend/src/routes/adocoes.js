const express = require('express');
const router = express.Router();
const { autenticar } = require('../middleware/auth');
const { solicitarAdocao, listarAdocoes, atualizarStatusAdocao } = require('../controllers/adocoesController');

router.post('/', solicitarAdocao);
router.get('/', autenticar, listarAdocoes);
router.patch('/:id', autenticar, atualizarStatusAdocao);

module.exports = router;
