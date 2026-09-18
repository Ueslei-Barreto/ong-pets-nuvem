import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';

export default function PetDetalhe() {
  const { id } = useParams();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ nome_adotante: '', email_adotante: '', telefone: '', mensagem: '' });
  const [enviando, setEnviando] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    api.get(`/pets/${id}`)
      .then(res => setPet(res.data))
      .catch(() => setPet(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setFeedback(null);
    try {
      await api.post('/adocoes', { ...form, pet_id: id });
      setFeedback({ tipo: 'success', msg: '🎉 Solicitação enviada! A ONG entrará em contato em breve.' });
      setForm({ nome_adotante: '', email_adotante: '', telefone: '', mensagem: '' });
    } catch (err) {
      setFeedback({ tipo: 'error', msg: err.response?.data?.erro || 'Erro ao enviar solicitação.' });
    } finally {
      setEnviando(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}><p style={{ fontSize: '3rem' }}>🐾</p></div>;
  if (!pet) return <div style={{ textAlign: 'center', padding: 80 }}><p>Pet não encontrado.</p><Link to="/" className="btn btn-primary" style={{ marginTop: 20 }}>Voltar</Link></div>;

  // foto_url agora e a URL completa do Supabase Storage
  const fotoUrl = pet.foto_url || 'https://placehold.co/600x400/fef3c7/f97316?text=🐾';

  return (
    <div>
      <Navbar />
      <div className="container" style={{ padding: '40px 20px' }}>
        <Link to="/" style={{ color: '#f97316', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 24 }}>
          ← Voltar ao catálogo
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
          {/* Foto e info */}
          <div>
            <img src={fotoUrl} alt={pet.nome} style={{ width: '100%', borderRadius: 16, objectFit: 'cover', maxHeight: 420 }} />

            <div className="card" style={{ padding: 24, marginTop: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem' }}>{pet.nome}</h1>
                <span className={`badge badge-${pet.status}`}>{pet.status}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                {[
                  ['Espécie', pet.especie],
                  ['Raça', pet.raca || 'Não informada'],
                  ['Porte', pet.porte || 'Não informado'],
                  ['Sexo', pet.sexo || 'Não informado'],
                  ['Idade', pet.idade_anos ? `${pet.idade_anos} ano(s)` : 'Não informada'],
                ].map(([label, val]) => (
                  <div key={label}>
                    <span style={{ fontSize: '0.8rem', color: '#78716c', fontWeight: 700 }}>{label}</span>
                    <p style={{ fontWeight: 600, textTransform: 'capitalize' }}>{val}</p>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                {pet.vacinado && <span className="badge badge-disponivel">✅ Vacinado</span>}
                {pet.castrado && <span className="badge" style={{ background: '#dbeafe', color: '#1e40af' }}>✂️ Castrado</span>}
              </div>

              {pet.descricao && (
                <p style={{ color: '#57534e', lineHeight: 1.7 }}>{pet.descricao}</p>
              )}
            </div>
          </div>

          {/* ONG responsavel + formulario de adocao */}
          <div>
            {pet.ong_nome && (
              <div className="card" style={{ padding: 24, marginBottom: 24, background: '#fff7ed', border: '1px solid #fed7aa' }}>
                <p style={{ fontSize: '0.78rem', fontWeight: 800, color: '#9a3412', letterSpacing: 1, marginBottom: 8 }}>
                  ONG RESPONSÁVEL
                </p>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 6 }}>🏠 {pet.ong_nome}</h3>
                {pet.ong_cidade && (
                  <p style={{ color: '#78716c', fontSize: '0.9rem' }}>
                    📍 {pet.ong_cidade}{pet.ong_uf ? `/${pet.ong_uf}` : ''}
                  </p>
                )}
                <div style={{ display: 'flex', gap: 16, marginTop: 10, flexWrap: 'wrap' }}>
                  {pet.ong_telefone && <span style={{ fontSize: '0.88rem', color: '#57534e' }}>📱 {pet.ong_telefone}</span>}
                  {pet.ong_email && <span style={{ fontSize: '0.88rem', color: '#57534e' }}>📧 {pet.ong_email}</span>}
                </div>
              </div>
            )}

            <div className="card" style={{ padding: 32 }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', marginBottom: 8 }}>
                Quero adotar {pet.nome} ❤️
              </h2>
              <p style={{ color: '#78716c', marginBottom: 24 }}>
                Preencha o formulário e a ONG entrará em contato para os próximos passos.
              </p>

              {pet.status !== 'disponivel' && (
                <div className="alert alert-error">
                  Este pet não está disponível para adoção no momento.
                </div>
              )}

              {feedback && (
                <div className={`alert alert-${feedback.tipo === 'success' ? 'success' : 'error'}`}>
                  {feedback.msg}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Seu nome *</label>
                  <input
                    type="text"
                    value={form.nome_adotante}
                    onChange={e => setForm(p => ({ ...p, nome_adotante: e.target.value }))}
                    placeholder="Nome completo"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={form.email_adotante}
                    onChange={e => setForm(p => ({ ...p, email_adotante: e.target.value }))}
                    placeholder="seu@email.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Telefone / WhatsApp</label>
                  <input
                    type="tel"
                    value={form.telefone}
                    onChange={e => setForm(p => ({ ...p, telefone: e.target.value }))}
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div className="form-group">
                  <label>Por que você quer adotar {pet.nome}?</label>
                  <textarea
                    value={form.mensagem}
                    onChange={e => setForm(p => ({ ...p, mensagem: e.target.value }))}
                    rows={4}
                    placeholder="Nos conte um pouco sobre você e sua casa..."
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
                  disabled={enviando || pet.status !== 'disponivel'}
                >
                  {enviando ? 'Enviando...' : '❤️ Quero adotar!'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
