const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes       = require('./routes/auth');
const petsRoutes       = require('./routes/pets');
const adocoesRoutes    = require('./routes/adocoes');
const ongsRoutes       = require('./routes/ongs');
const importacaoRoutes = require('./routes/importacao');

const app = express();
const PORTA = process.env.PORT || 5000;

// Origens liberadas via variavel de ambiente (localhost em dev, Vercel em producao)
const origens = (process.env.CORS_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map((o) => o.trim());

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || origens.includes(origin)) return cb(null, true);
    cb(new Error(`Origem nao permitida: ${origin}`));
  },
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/auth',       authRoutes);
app.use('/pets',       petsRoutes);
app.use('/adocoes',    adocoesRoutes);
app.use('/ongs',       ongsRoutes);
app.use('/importacao', importacaoRoutes);

app.get('/', (req, res) => {
  res.json({ mensagem: 'API ONG Pets na Nuvem funcionando!', versao: '2.0' });
});

// Usado pelo monitor (UptimeRobot) para impedir a hibernacao do Render
app.get('/health', (req, res) => res.json({ status: 'ok', hora: new Date().toISOString() }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ erro: err.message || 'Erro interno no servidor.' });
});

app.listen(PORTA, () => {
  console.log(`Servidor rodando na porta ${PORTA}`);
});
