import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const n = (v) => Number(v || 0);

export default function Dashboard() {
  const { usuario } = useAuth();
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/ongs/indicadores')
      .then((res) => setDados(res.data))
      .catch(() => setDados(null))
      .finally(() => setLoading(false));
  }, []);

  const pets = dados?.pets || {};
  const adocoes = dados?.adocoes || {};

  const cards = [
    { label: 'Total de Pets', value: n(pets.total_pets), icon: '🐾', cor: '#f97316' },
    { label: 'Disponíveis', value: n(pets.disponiveis), icon: '✅', cor: '#22c55e' },
    { label: 'Reservados', value: n(pets.reservados), icon: '⏳', cor: '#eab308' },
    { label: 'Adotados', value: n(pets.adotados), icon: '🏠', cor: '#3b82f6' },
    { label: 'Solicitações Pendentes', value: n(adocoes.pendentes), icon: '📩', cor: '#a855f7' },
  ];

  const maiorEspecie = Math.max(1, ...(dados?.por_especie || []).map((e) => n(e.total)));

  return (
    <div style={{ display: 'flex' }}>
      <AdminSidebar />
      <main style={{ marginLeft: 240, flex: 1, padding: 40, minHeight: '100vh', background: '#fafaf9' }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', marginBottom: 8 }}>
          Dashboard
        </h1>
        <p style={{ color: '#78716c', marginBottom: 32 }}>
          {usuario?.ong_nome || 'Sua ONG'}
          {usuario?.ong_cidade ? ` · ${usuario.ong_cidade}` : ''}
        </p>

        {loading ? (
          <p style={{ color: '#78716c' }}>Carregando indicadores...</p>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20, marginBottom: 32 }}>
              {cards.map((card) => (
                <div key={card.label} className="card" style={{ padding: 24 }}>
                  <div style={{ fontSize: '2rem', marginBottom: 12 }}>{card.icon}</div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, color: card.cor }}>{card.value}</div>
                  <div style={{ color: '#78716c', fontSize: '0.9rem', marginTop: 4 }}>{card.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
              {/* Tempo medio ate a adocao */}
              <div className="card" style={{ padding: 28 }}>
                <h2 style={{ fontSize: '1.05rem', marginBottom: 6 }}>Tempo médio até a adoção</h2>
                <p style={{ color: '#a8a29e', fontSize: '0.85rem', marginBottom: 16 }}>
                  Do cadastro do animal até a adoção concluída
                </p>
                {pets.dias_medio_ate_adocao ? (
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontSize: '2.6rem', fontWeight: 800, color: '#f97316' }}>
                      {Number(pets.dias_medio_ate_adocao).toFixed(0)}
                    </span>
                    <span style={{ color: '#78716c', fontWeight: 600 }}>dias</span>
                  </div>
                ) : (
                  <p style={{ color: '#a8a29e' }}>Ainda sem adoções concluídas.</p>
                )}
              </div>

              {/* Distribuicao por especie */}
              <div className="card" style={{ padding: 28 }}>
                <h2 style={{ fontSize: '1.05rem', marginBottom: 16 }}>Animais por espécie</h2>
                {(dados?.por_especie || []).length === 0 ? (
                  <p style={{ color: '#a8a29e' }}>Nenhum animal cadastrado ainda.</p>
                ) : (
                  dados.por_especie.map((e) => (
                    <div key={e.especie} style={{ marginBottom: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: 5 }}>
                        <span style={{ textTransform: 'capitalize', fontWeight: 600, color: '#57534e' }}>{e.especie}</span>
                        <span style={{ color: '#78716c' }}>{n(e.total)}</span>
                      </div>
                      <div style={{ height: 8, background: '#f5f5f4', borderRadius: 20, overflow: 'hidden' }}>
                        <div style={{
                          width: `${(n(e.total) / maiorEspecie) * 100}%`,
                          height: '100%', background: '#f97316', borderRadius: 20,
                        }} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Resumo das solicitacoes */}
            <div className="card" style={{ padding: 28, marginBottom: 32 }}>
              <h2 style={{ fontSize: '1.05rem', marginBottom: 16 }}>Solicitações de adoção</h2>
              <div style={{ display: 'flex', gap: 32 }}>
                {[
                  ['Total', adocoes.total, '#57534e'],
                  ['Pendentes', adocoes.pendentes, '#eab308'],
                  ['Aprovadas', adocoes.aprovadas, '#22c55e'],
                  ['Recusadas', adocoes.recusadas, '#ef4444'],
                ].map(([label, valor, cor]) => (
                  <div key={label}>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: cor }}>{n(valor)}</div>
                    <div style={{ color: '#78716c', fontSize: '0.85rem' }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div style={{ display: 'flex', gap: 16 }}>
          <Link to="/admin/pets/novo" className="btn btn-primary">+ Cadastrar novo pet</Link>
          <Link to="/admin/importar" className="btn btn-outline">📄 Importar planilha</Link>
          <Link to="/admin/adocoes" className="btn btn-outline">Ver solicitações</Link>
        </div>
      </main>
    </div>
  );
}
