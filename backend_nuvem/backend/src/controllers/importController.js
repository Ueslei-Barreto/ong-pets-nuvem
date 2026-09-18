const Papa = require('papaparse');
const { pool } = require('../config/database');

const COLUNAS = ['nome', 'especie', 'raca', 'idade_anos', 'porte', 'sexo', 'descricao', 'vacinado', 'castrado'];

const sim = (v) => ['sim', 's', 'true', '1', 'x'].includes(String(v || '').trim().toLowerCase());

// Importacao em massa: a ONG sobe a planilha que ja mantinha
const importarCsv = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ erro: 'Envie um arquivo CSV no campo "arquivo".' });
  }

  const texto = req.file.buffer.toString('utf-8');

  const parsed = Papa.parse(texto, {
    header: true,
    skipEmptyLines: true,
    delimiter: '',            // detecta virgula ou ponto-e-virgula automaticamente
    transformHeader: (h) => h.trim().toLowerCase(),
  });

  if (!parsed.data.length) {
    return res.status(400).json({ erro: 'O arquivo esta vazio ou fora do formato esperado.' });
  }

  const faltando = ['nome', 'especie'].filter((c) => !parsed.meta.fields.includes(c));
  if (faltando.length) {
    return res.status(400).json({
      erro: `Colunas obrigatorias ausentes: ${faltando.join(', ')}.`,
      colunas_esperadas: COLUNAS,
    });
  }

  const cliente = await pool.connect();
  const erros = [];
  let importados = 0;

  try {
    await cliente.query('BEGIN');

    for (let i = 0; i < parsed.data.length; i++) {
      const linha = parsed.data[i];
      const numero = i + 2; // +1 do cabecalho, +1 porque planilha comeca em 1

      if (!linha.nome || !linha.especie) {
        erros.push({ linha: numero, motivo: 'nome e especie sao obrigatorios' });
        continue;
      }

      const idade = parseInt(linha.idade_anos);

      await cliente.query(
        `INSERT INTO pets
           (ong_id, nome, especie, raca, idade_anos, porte, sexo, descricao, vacinado, castrado, usuario_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [
          req.usuario.ong_id,
          String(linha.nome).trim(),
          String(linha.especie).trim().toLowerCase(),
          linha.raca ? String(linha.raca).trim() : null,
          Number.isNaN(idade) ? null : idade,
          linha.porte ? String(linha.porte).trim().toLowerCase() : null,
          linha.sexo ? String(linha.sexo).trim().toLowerCase() : null,
          linha.descricao ? String(linha.descricao).trim() : null,
          sim(linha.vacinado),
          sim(linha.castrado),
          req.usuario.id,
        ]
      );

      importados++;
    }

    await cliente.query('COMMIT');

    res.status(201).json({
      mensagem: `${importados} pet(s) importado(s) com sucesso.`,
      importados,
      ignorados: erros.length,
      erros,
    });
  } catch (err) {
    await cliente.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ erro: 'Erro ao importar o arquivo. Nenhum registro foi gravado.' });
  } finally {
    cliente.release();
  }
};

// Devolve o CSV modelo para a ONG preencher
const baixarModelo = (req, res) => {
  const csv = [
    COLUNAS.join(','),
    'Rex,cachorro,Labrador,2,grande,macho,Docil e brincalhao,sim,nao',
    'Mel,gato,Siames,1,pequeno,femea,Carinhosa e tranquila,sim,sim',
  ].join('\n');

  res.header('Content-Type', 'text/csv; charset=utf-8');
  res.attachment('modelo_importacao_pets.csv');
  res.send(csv);
};

module.exports = { importarCsv, baixarModelo };
