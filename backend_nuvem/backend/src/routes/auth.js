const express = require('express');
const router = express.Router();
const { autenticar } = require('../middleware/auth');
const { login, cadastro } = require('../controllers/authController');

router.post('/login', login);
router.post('/cadastro', autenticar, cadastro); // novo admin dentro da ONG logada

module.exports = router;
