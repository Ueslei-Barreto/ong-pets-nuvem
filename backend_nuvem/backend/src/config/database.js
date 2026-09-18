const { Pool } = require('pg');
require('dotenv').config();

// Supabase exige SSL. A connection string vem do painel:
// Project Settings > Database > Connection string > Node.js (Session pooler)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
});

pool.on('connect', () => console.log('Conectado ao PostgreSQL'));
pool.on('error', (err) => console.error('Erro inesperado no pool:', err));

// Atalho: query(texto, [valores]) -> { rows, rowCount }
const query = (texto, valores) => pool.query(texto, valores);

module.exports = { pool, query };
