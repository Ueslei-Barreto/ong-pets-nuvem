const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { autenticar } = require('../middleware/auth');
const {
  listarPets, buscarPet, listarMeusPets, criarPet, atualizarPet, deletarPet,
} = require('../controllers/petsController');

// memoryStorage: o arquivo vai direto para o Supabase, sem tocar no disco
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const permitidos = /jpeg|jpg|png|webp/;
    if (permitidos.test(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error('Apenas imagens JPG, PNG ou WebP sao permitidas.'));
  },
});

router.get('/', listarPets);                       // catalogo publico (todas as ONGs)
router.get('/meus', autenticar, listarMeusPets);   // painel da ONG logada
router.get('/:id', buscarPet);
router.post('/', autenticar, upload.single('foto'), criarPet);
router.put('/:id', autenticar, upload.single('foto'), atualizarPet);
router.delete('/:id', autenticar, deletarPet);

module.exports = router;
