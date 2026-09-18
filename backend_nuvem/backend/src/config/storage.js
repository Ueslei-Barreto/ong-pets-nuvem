const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config();

const BUCKET = process.env.SUPABASE_BUCKET || 'pets';

let cliente = null;

// Inicializacao preguicosa: o servidor sobe mesmo sem as chaves configuradas.
// Sem isso, qualquer rota quebra logo no require quando o .env esta incompleto.
const getCliente = () => {
  if (cliente) return cliente;

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    throw new Error(
      'Storage nao configurado. Defina SUPABASE_URL e SUPABASE_SERVICE_KEY no .env.'
    );
  }

  cliente = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  return cliente;
};

// Recebe o arquivo em memoria (multer.memoryStorage) e devolve a URL publica.
// O disco do Render e efemero: arquivo salvo localmente some no proximo deploy.
const enviarImagem = async (arquivo) => {
  if (!arquivo) return null;

  const supabase = getCliente();
  const extensao = path.extname(arquivo.originalname).toLowerCase();
  const nome = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extensao}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(nome, arquivo.buffer, {
      contentType: arquivo.mimetype,
      upsert: false,
    });

  if (error) throw new Error(`Falha ao enviar imagem: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(nome);
  return data.publicUrl;
};

module.exports = { getCliente, enviarImagem, BUCKET };
