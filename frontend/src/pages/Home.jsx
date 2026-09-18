import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import PetCard from '../components/PetCard';
import api from '../services/api';

const filtrosVazios = { especie: '', porte: '', sexo: '', cidade: '', ong_id: '' };

export default function Home() {
  const [pets, setPets] = useState([]);
  const [cidades, setCidades] = useState([]);
  const [ongs, setOngs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState(filtrosVazios);

  // Carrega as opcoes dos filtros uma unica vez
  useEffect(() => {
    api.get('/ongs/cidades').then((r) => setCidades(r.data)).catch(() => {});
    api.get('/ongs').then((r) => setOngs(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const buscarPets = async () => {
      setLoading(true);
      try {
        const params = {};
        Object.entries(filtros).forEach(([k, v]) => { if (v) params[k] = v; });
        const res = await api.get('/pets', { params });
        setPets(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    buscarPets();
  }, [filtros]);

  const set = (campo) => (e) => setFiltros((p) => ({ ...p, [campo]: e.target.value }));
  const temFiltro = Object.values(filtros).some(Boolean);

  return (
    <div>
      <Navbar />

      {/* Hero */}
      <section style={{
        background: 'linear-gradient(135deg, #fff7ed 0%, #fef3c7 100%)',
        padding: '60px 20px',
        textAlign: 'center',
        borderBottom: '1px solid #fed7aa',
      }}>
        <div className="container">
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            color: '#1c1917',
            marginBottom: 16,
          }}>
            Encontre seu novo<br />
            <span style={{ color: '#f97316' }}>melhor amigo 🐾</span>
          </h1>
          <p style={{ color: '#78716c', fontSize: '1.1rem', maxWidth: 560, margin: '0 auto 20px' }}>
            Animais de {ongs.length || 'várias'} ONGs da região em um só lugar.
            Adote, não compre!
          </p>
          <Link to="/cadastro-ong" style={{ color: '#f97316', fontWeight: 700, fontSize: '0.95rem' }}>
            É de uma ONG? Cadastre sua organização →
          </Link>
        </div>
      </section>

      {/* Filtros */}
      <section style={{ background: 'white', borderBottom: '1px solid #e7e5e4', padding: '16px 20px' }}>
        <div className="container" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, color: '#57534e' }}>Filtrar:</span>

          <select value={filtros.cidade} onChange={set('cidade')} style={{ width: 'auto', padding: '8px 12px' }}>
            <option value="">📍 Todas as cidades</option>
            {cidades.map((c) => (
              <option key={`${c.cidade}-${c.uf}`} value={c.cidade}>{c.cidade}/{c.uf}</option>
            ))}
          </select>

          <select value={filtros.ong_id} onChange={set('ong_id')} style={{ width: 'auto', padding: '8px 12px' }}>
            <option value="">🏠 Todas as ONGs</option>
            {ongs.map((o) => (
              <option key={o.id} value={o.id}>{o.nome}</option>
            ))}
          </select>

          <select value={filtros.especie} onChange={set('especie')} style={{ width: 'auto', padding: '8px 12px' }}>
            <option value="">Todas as espécies</option>
            <option value="cachorro">🐶 Cachorro</option>
            <option value="gato">🐱 Gato</option>
            <option value="outro">🐾 Outro</option>
          </select>

          <select value={filtros.porte} onChange={set('porte')} style={{ width: 'auto', padding: '8px 12px' }}>
            <option value="">Qualquer porte</option>
            <option value="pequeno">Pequeno</option>
            <option value="medio">Médio</option>
            <option value="grande">Grande</option>
          </select>

          <select value={filtros.sexo} onChange={set('sexo')} style={{ width: 'auto', padding: '8px 12px' }}>
            <option value="">Qualquer sexo</option>
            <option value="macho">Macho</option>
            <option value="femea">Fêmea</option>
          </select>

          {temFiltro && (
            <button
              onClick={() => setFiltros(filtrosVazios)}
              className="btn btn-outline"
              style={{ padding: '7px 14px', fontSize: '0.85rem' }}
            >
              ✕ Limpar
            </button>
          )}
        </div>
      </section>

      {/* Grid de pets */}
      <main className="container" style={{ padding: '40px 20px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <p style={{ fontSize: '3rem' }}>🐾</p>
            <p style={{ color: '#78716c', marginTop: 12 }}>Carregando pets...</p>
          </div>
        ) : pets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <p style={{ fontSize: '3rem' }}>😿</p>
            <p style={{ color: '#78716c', marginTop: 12 }}>Nenhum pet encontrado com esses filtros.</p>
          </div>
        ) : (
          <>
            <p style={{ color: '#78716c', marginBottom: 24 }}>
              {pets.length} pet{pets.length !== 1 ? 's' : ''} disponíve{pets.length !== 1 ? 'is' : 'l'}
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 24,
            }}>
              {pets.map(pet => <PetCard key={pet.id} pet={pet} />)}
            </div>
          </>
        )}
      </main>

      <footer style={{ textAlign: 'center', padding: '40px 20px', color: '#a8a29e', borderTop: '1px solid #e7e5e4' }}>
        <p>🐾 ONG Pets · Feito com ❤️ para os animais</p>
      </footer>
    </div>
  );
}
