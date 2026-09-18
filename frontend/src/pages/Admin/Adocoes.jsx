import { useState, useEffect } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import api from '../../services/api';

export default function Adocoes() {
  const [adocoes, setAdocoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState('pendente');

  const buscar = async () => {
    try {
      const res = await api.get('/adocoes');
      setAdocoes(res.data);
    } catch (err) {} finally { setLoading(false); }
  };

  useEffect(() => { buscar(); }, []);

  const atualizarStatus = async (id, status) => {
    try {
      // a rota mudou de PUT para PATCH na versao em nuvem
      await api.patch(`/adocoes/${id}`, { status });
      setAdocoes(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    } catch (err) {
      alert(err.response?.data?.erro || 'Erro ao atualizar.');
    }
  };

  const filtradas = adocoes.filter(a => filtroStatus === 'todos' || a.status === filtroStatus);

  return (
    <div style={{ display: 'flex' }}>
      <AdminSidebar />
      <main style={{ marginLeft: 240, flex: 1, padding: 40, background: '#fafaf9', minHeight: '100vh' }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', marginBottom: 8 }}>
          Solicitações de Adoção
        </h1>

        <div style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
          {['pendente', 'aprovado', 'recusado', 'todos'].map(s => (
            <button
              key={s}
              onClick={() => setFiltroStatus(s)}
              className={`btn ${filtroStatus === s ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '6px 16px', fontSize: '0.85rem', textTransform: 'capitalize' }}
            >
              {s} ({s === 'todos' ? adocoes.length : adocoes.filter(a => a.status === s).length})
            </button>
          ))}
        </div>

        {loading ? <p style={{ color: '#78716c' }}>Carregando...</p> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filtradas.length === 0 && (
              <div style={{ textAlign: 'center', padding: 60 }}>
                <p style={{ fontSize: '2rem' }}>📭</p>
                <p style={{ color: '#78716c', marginTop: 8 }}>Nenhuma solicitação {filtroStatus}.</p>
              </div>
            )}
            {filtradas.map(a => (
              <div key={a.id} className="card" style={{ padding: 24 }}>
                <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                  <img
                    src={a.foto_url || 'https://placehold.co/64x64/fef3c7/f97316?text=🐾'}
                    alt={a.pet_nome}
                    style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 10, flexShrink: 0 }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div>
                        <h3 style={{ fontWeight: 700 }}>{a.nome_adotante}</h3>
                        <p style={{ color: '#78716c', fontSize: '0.9rem' }}>
                          Quer adotar: <strong>{a.pet_nome}</strong> ({a.pet_especie})
                        </p>
                      </div>
                      <span className={`badge badge-${a.status}`}>{a.status}</span>
                    </div>

                    <div style={{ display: 'flex', gap: 24, marginBottom: 10 }}>
                      <span style={{ fontSize: '0.9rem', color: '#57534e' }}>📧 {a.email_adotante}</span>
                      {a.telefone && <span style={{ fontSize: '0.9rem', color: '#57534e' }}>📱 {a.telefone}</span>}
                      <span style={{ fontSize: '0.85rem', color: '#a8a29e' }}>
                        {new Date(a.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>

                    {a.mensagem && (
                      <p style={{ background: '#fafaf9', padding: '10px 14px', borderRadius: 8, fontSize: '0.9rem', color: '#57534e', marginBottom: 12 }}>
                        "{a.mensagem}"
                      </p>
                    )}

                    {a.status === 'pendente' && (
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={() => atualizarStatus(a.id, 'aprovado')} className="btn btn-success" style={{ padding: '7px 16px', fontSize: '0.85rem' }}>
                          ✅ Aprovar
                        </button>
                        <button onClick={() => atualizarStatus(a.id, 'recusado')} className="btn btn-danger" style={{ padding: '7px 16px', fontSize: '0.85rem' }}>
                          ✕ Recusar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
