import { useState, useRef } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import api from '../../services/api';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function ImportarCsv() {
  const [arquivo, setArquivo] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState(null);
  const inputRef = useRef();

  const enviar = async (e) => {
    e.preventDefault();
    if (!arquivo) return;

    setEnviando(true);
    setResultado(null);
    setErro(null);

    const dados = new FormData();
    dados.append('arquivo', arquivo);

    try {
      const res = await api.post('/importacao/csv', dados, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResultado(res.data);
      setArquivo(null);
      if (inputRef.current) inputRef.current.value = '';
    } catch (err) {
      setErro(err.response?.data || { erro: 'Erro ao importar o arquivo.' });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <AdminSidebar />
      <main style={{ marginLeft: 240, flex: 1, padding: 40, background: '#fafaf9', minHeight: '100vh' }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', marginBottom: 8 }}>
          Importar pets por planilha
        </h1>
        <p style={{ color: '#78716c', marginBottom: 32 }}>
          Já mantém uma lista em Excel? Suba de uma vez, sem cadastrar um por um.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
          {/* Upload */}
          <div className="card" style={{ padding: 32 }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: 20 }}>1. Envie o arquivo</h2>

            <form onSubmit={enviar}>
              <div
                style={{
                  border: '2px dashed #fed7aa',
                  borderRadius: 12,
                  padding: 32,
                  textAlign: 'center',
                  background: '#fffbf5',
                  marginBottom: 20,
                  cursor: 'pointer',
                }}
                onClick={() => inputRef.current?.click()}
              >
                <p style={{ fontSize: '2rem', marginBottom: 8 }}>📄</p>
                <p style={{ fontWeight: 700, color: '#57534e' }}>
                  {arquivo ? arquivo.name : 'Clique para escolher o CSV'}
                </p>
                <p style={{ fontSize: '0.85rem', color: '#a8a29e', marginTop: 4 }}>
                  Máximo 2 MB
                </p>
                <input
                  ref={inputRef}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={(e) => { setArquivo(e.target.files[0]); setResultado(null); setErro(null); }}
                  style={{ display: 'none' }}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: 12 }}
                disabled={!arquivo || enviando}
              >
                {enviando ? 'Importando...' : '⬆️ Importar'}
              </button>
            </form>
          </div>

          {/* Instrucoes */}
          <div className="card" style={{ padding: 32 }}>
            <h2 style={{ fontSize: '1.1rem', marginBottom: 20 }}>2. Formato esperado</h2>

            <p style={{ color: '#57534e', fontSize: '0.9rem', marginBottom: 16, lineHeight: 1.6 }}>
              A primeira linha precisa ser o cabeçalho. Aceita vírgula ou ponto-e-vírgula
              (o Excel brasileiro salva com ponto-e-vírgula).
            </p>

            <div style={{
              background: '#1c1917', color: '#d6d3d1', padding: 14,
              borderRadius: 8, fontSize: '0.75rem', fontFamily: 'monospace',
              overflowX: 'auto', marginBottom: 16, whiteSpace: 'pre',
            }}>
              nome,especie,raca,idade_anos,porte,{'\n'}sexo,descricao,vacinado,castrado
            </div>

            <ul style={{ color: '#57534e', fontSize: '0.88rem', lineHeight: 1.9, paddingLeft: 18 }}>
              <li><strong>nome</strong> e <strong>especie</strong> são obrigatórios</li>
              <li><strong>vacinado</strong> e <strong>castrado</strong>: use <code>sim</code> ou <code>nao</code></li>
              <li>Linhas inválidas são ignoradas e reportadas</li>
              <li>Se houver erro de banco, nada é gravado</li>
            </ul>

            <a
              href={`${API_URL}/importacao/modelo`}
              className="btn btn-outline"
              style={{ marginTop: 20, padding: '8px 16px', fontSize: '0.88rem' }}
            >
              ⬇️ Baixar planilha modelo
            </a>
          </div>
        </div>

        {/* Resultado */}
        {resultado && (
          <div className="card" style={{ padding: 28, marginTop: 24 }}>
            <div className="alert alert-success" style={{ marginBottom: resultado.erros?.length ? 20 : 0 }}>
              ✅ {resultado.mensagem}
              {resultado.ignorados > 0 && ` ${resultado.ignorados} linha(s) ignorada(s).`}
            </div>

            {resultado.erros?.length > 0 && (
              <>
                <h3 style={{ fontSize: '0.95rem', marginBottom: 12, color: '#57534e' }}>
                  Linhas que não entraram:
                </h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ background: '#f5f5f4' }}>
                      <th style={{ padding: '8px 12px', textAlign: 'left', width: 100 }}>Linha</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Motivo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultado.erros.map((e, i) => (
                      <tr key={i} style={{ borderTop: '1px solid #e7e5e4' }}>
                        <td style={{ padding: '8px 12px', fontWeight: 700 }}>{e.linha}</td>
                        <td style={{ padding: '8px 12px', color: '#78716c' }}>{e.motivo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        )}

        {erro && (
          <div className="card" style={{ padding: 28, marginTop: 24 }}>
            <div className="alert alert-error">❌ {erro.erro}</div>
            {erro.colunas_esperadas && (
              <p style={{ color: '#57534e', fontSize: '0.88rem' }}>
                Colunas aceitas: {erro.colunas_esperadas.join(', ')}
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
