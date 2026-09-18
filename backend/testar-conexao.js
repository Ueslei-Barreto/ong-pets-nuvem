// testar-conexao.js
// Coloque na pasta backend/ e rode com:  node testar-conexao.js
// Testa varias combinacoes de host/porta e diz qual funciona.

require('dotenv').config();
const { Pool } = require('pg');

const REF = 'ozqzpxkwszldkyhawrcg';        // Project ID
const SENHA = 'Ong2026012345678910';         // senha atual do banco (sem codificar)

const candidatos = [
  {
    nome: 'Session pooler  (aws-1, porta 5432)',
    url: `postgresql://postgres.${REF}:${encodeURIComponent(SENHA)}@aws-1-sa-east-1.pooler.supabase.com:5432/postgres`,
  },
  {
    nome: 'Session pooler  (aws-0, porta 5432)',
    url: `postgresql://postgres.${REF}:${encodeURIComponent(SENHA)}@aws-0-sa-east-1.pooler.supabase.com:5432/postgres`,
  },
  {
    nome: 'Transaction pooler (aws-1, porta 6543)',
    url: `postgresql://postgres.${REF}:${encodeURIComponent(SENHA)}@aws-1-sa-east-1.pooler.supabase.com:6543/postgres`,
  },
  {
    nome: 'Transaction pooler (aws-0, porta 6543)',
    url: `postgresql://postgres.${REF}:${encodeURIComponent(SENHA)}@aws-0-sa-east-1.pooler.supabase.com:6543/postgres`,
  },
  {
    nome: 'Conexao direta (db.<ref>.supabase.co, precisa de IPv6)',
    url: `postgresql://postgres:${encodeURIComponent(SENHA)}@db.${REF}.supabase.co:5432/postgres`,
  },
];

// Testa tambem exatamente o que esta no .env
if (process.env.DATABASE_URL) {
  candidatos.unshift({ nome: 'O que esta no seu .env', url: process.env.DATABASE_URL });
}

const testar = async ({ nome, url }) => {
  const pool = new Pool({
    connectionString: url,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 8000,
  });

  try {
    const r = await pool.query('SELECT COUNT(*) AS n FROM pets');
    console.log(`  FUNCIONOU  ${nome}  -> ${r.rows[0].n} pets`);
    return url;
  } catch (e) {
    const motivo =
      e.code === '28P01' ? 'senha recusada'
      : e.code === '42P01' ? 'CONECTOU, mas a tabela pets nao existe (schema nao rodou)'
      : e.code === 'ENOTFOUND' ? 'host nao existe'
      : e.code === 'ETIMEDOUT' || /timeout/i.test(e.message) ? 'sem resposta (rede/IPv6)'
      : e.message;
    console.log(`  falhou     ${nome}  -> ${e.code || ''} ${motivo}`);
    return null;
  } finally {
    await pool.end().catch(() => {});
  }
};

(async () => {
  console.log('\nTestando conexoes...\n');
  let vencedor = null;

  for (const c of candidatos) {
    const ok = await testar(c);
    if (ok && !vencedor) vencedor = ok;
  }

  console.log('\n' + '='.repeat(60));
  if (vencedor) {
    console.log('Use esta linha no seu .env:\n');
    console.log('DATABASE_URL=' + vencedor);
  } else {
    console.log('Nenhuma combinacao funcionou.');
    console.log('Se todas deram "senha recusada", a senha no Supabase e outra:');
    console.log('Settings > Database > Reset database password, e atualize a');
    console.log('constante SENHA no topo deste arquivo.');
  }
  console.log('='.repeat(60) + '\n');
})();
