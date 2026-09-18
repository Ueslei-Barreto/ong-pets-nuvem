const express = require('express');
const router = express.Router();
const multer = require('multer');
const { autenticar } = require('../middleware/auth');
const { importarCsv, baixarModelo } = require('../controllers/importController');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
});

router.get('/modelo', baixarModelo);
router.post('/csv', autenticar, upload.single('arquivo'), importarCsv);

module.exports = router;
