import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import api from '../../services/api';

export default function GerenciarPets() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  const buscar = async () => {
    try {
      // /pets/meus devolve apenas os animais da ONG do usuario logado
      const res = await api.get('/pets/meus');
      setPets(res.data);
    } catch (err) {} finally { setLoading(false); }
  };

  useEffect(() => { buscar(); }, []);

  const deletar = async (id, nome) => {
    if (!window.confirm(`Remover ${nome}?`)) return;
    try {
      await api.delete(`/pets/${id}`);
      setPets(pets.filter(p => p.id !== id));
    } catch (err) { alert('Erro ao remover pet.'); }
  };

  return (
    <div style={{ display: 'flex' }}>
      <AdminSidebar />
      <main style={{ marginLeft: 240, flex: 1, padding: 40, background: '#fafaf9', minHeight: '100vh' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem' }}>Gerenciar Pets</h1>
            <p style={{ color: '#78716c' }}>{pets.length} pets cadastrados</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link to="/admin/importar" className="btn btn-outline">📄 Importar CSV</Link>
            <Link to="/admin/pets/novo" className="btn btn-primary">+ Novo pet</Link>
          </div>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#78716c' }}>Carregando...</p>
        ) : pets.length === 0 ? (
          <div className="card" style={{ padding: 60, textAlign: 'center' }}>
            <p style={{ fontSize: '2.5rem' }}>🐾</p>
            <p style={{ color: '#78716c', margin: '12px 0 20px' }}>
              Nenhum pet cadastrado ainda nesta ONG.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <Link to="/admin/pets/novo" className="btn btn-primary">Cadastrar o primeiro</Link>
              <Link to="/admin/importar" className="btn btn-outline">Importar planilha</Link>
            </div>
          </div>
        ) : (
          <div className="card" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f5f5f4' }}>
                  {['Foto', 'Nome', 'Espécie', 'Porte', 'Status', 'Ações'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: '#57534e', fontSize: '0.85rem' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pets.map((pet, i) => (
                  <tr key={pet.id} style={{ borderTop: '1px solid #e7e5e4', background: i % 2 === 0 ? 'white' : '#fafaf9' }}>
                    <td style={{ padding: '10px 16px' }}>
                      <img
                        src={pet.foto_url || 'https://placehold.co/50x50/fef3c7/f97316?text=🐾'}
                        alt={pet.nome}
                        style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 8 }}
                      />
                    </td>
                    <td style={{ padding: '10px 16px', fontWeight: 700 }}>{pet.nome}</td>
                    <td style={{ padding: '10px 16px', textTransform: 'capitalize', color: '#57534e' }}>{pet.especie}</td>
                    <td style={{ padding: '10px 16px', textTransform: 'capitalize', color: '#57534e' }}>{pet.porte || '-'}</td>
                    <td style={{ padding: '10px 16px' }}>
                      <span className={`badge badge-${pet.status}`}>{pet.status}</span>
                    </td>
                    <td style={{ padding: '10px 16px' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Link
                          to={`/admin/pets/editar/${pet.id}`}
                          className="btn btn-outline"
                          style={{ padding: '5px 12px', fontSize: '0.8rem' }}
                        >
                          ✏️ Editar
                        </Link>
                        <button
                          onClick={() => deletar(pet.id, pet.nome)}
                          className="btn btn-danger"
                          style={{ padding: '5px 12px', fontSize: '0.8rem' }}
                        >
                          🗑️ Remover
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
