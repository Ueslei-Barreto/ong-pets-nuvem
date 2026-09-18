import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';

const vazio = {
  nome: '', cnpj: '', email_contato: '', telefone: '', cep: '', descricao: '',
  admin_nome: '', admin_email: '', admin_senha: '',
};

export default function CadastroOng() {
  const navigate = useNavigate();
  const [form, setForm] = useState(vazio);
  const [endereco, setEndereco] = useState(null);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const set = (campo) => (e) => setForm((p) => ({ ...p, [campo]: e.target.value }));

  // Integracao com API externa: preenche o endereco ao sair do campo CEP
  const buscarCep = async () => {
    const cep = form.cep.replace(/\D/g, '');
    if (cep.length !== 8) { setEndereco(null); return; }

    setBuscandoCep(true);
    try {
      const res = await api.get(`/ongs/cep/${cep}`);
      setEndereco(res.data);
    } catch (err) {
      setEndereco(null);
      setFeedback({ tipo: 'error', msg: 'CEP não encontrado. Você pode continuar sem ele.' });
    } finally {
      setBuscandoCep(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setFeedback(null);
    try {
      await api.post('/ongs', form);
      setFeedback({ tipo: 'success', msg: '🎉 ONG cadastrada! Redirecionando para o login...' });
      setTimeout(() => navigate('/admin/login'), 2000);
    } catch (err) {
      setFeedback({ tipo: 'error', msg: err.response?.data?.erro || 'Erro ao cadastrar ONG.' });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container" style={{ padding: '40px 20px', maxWidth: 760 }}>
        <Link to="/" style={{ color: '#f97316', fontWeight: 600, display: 'inline-block', marginBottom: 20 }}>
          ← Voltar ao catálogo
        </Link>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <p style={{ fontSize: '2.5rem' }}>🏠</p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', marginBottom: 8 }}>
            Cadastre sua ONG
          </h1>
          <p style={{ color: '#78716c' }}>
            Divulgue seus animais no catálogo regional e alcance mais adotantes. É gratuito.
          </p>
        </div>

        {feedback && (
          <div className={`alert alert-${feedback.tipo === 'success' ? 'success' : 'error'}`}>
            {feedback.msg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="card" style={{ padding: 32, marginBottom: 24 }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: 20, color: '#f97316' }}>Dados da organização</h2>

            <div className="form-group">
              <label>Nome da ONG *</label>
              <input type="text" value={form.nome} onChange={set('nome')} placeholder="Ex.: Patas do Vale" required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label>CNPJ</label>
                <input type="text" value={form.cnpj} onChange={set('cnpj')} placeholder="00.000.000/0001-00" />
              </div>
              <div className="form-group">
                <label>Telefone</label>
                <input type="tel" value={form.telefone} onChange={set('telefone')} placeholder="(12) 99999-9999" />
              </div>
            </div>

            <div className="form-group">
              <label>Email de contato</label>
              <input type="email" value={form.email_contato} onChange={set('email_contato')} placeholder="contato@suaong.org" />
            </div>

            <div className="form-group">
              <label>CEP</label>
              <input
                type="text"
                value={form.cep}
                onChange={set('cep')}
                onBlur={buscarCep}
                placeholder="12244-000"
                maxLength={9}
              />
              {buscandoCep && (
                <p style={{ fontSize: '0.85rem', color: '#78716c', marginTop: 6 }}>Consultando CEP...</p>
              )}
              {endereco && (
                <div style={{
                  marginTop: 8, padding: '10px 14px', background: '#dcfce7',
                  borderRadius: 8, fontSize: '0.88rem', color: '#166534',
                }}>
                  📍 {endereco.logradouro}, {endereco.bairro} — {endereco.cidade}/{endereco.uf}
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Sobre a ONG</label>
              <textarea
                value={form.descricao}
                onChange={set('descricao')}
                rows={3}
                placeholder="Conte brevemente o trabalho que vocês realizam..."
              />
            </div>
          </div>

          <div className="card" style={{ padding: 32, marginBottom: 24 }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: 8, color: '#f97316' }}>Administrador</h2>
            <p style={{ color: '#78716c', fontSize: '0.9rem', marginBottom: 20 }}>
              Esta será a conta usada para gerenciar os animais da sua ONG.
            </p>

            <div className="form-group">
              <label>Nome do responsável *</label>
              <input type="text" value={form.admin_nome} onChange={set('admin_nome')} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label>Email de acesso *</label>
                <input type="email" value={form.admin_email} onChange={set('admin_email')} required />
              </div>
              <div className="form-group">
                <label>Senha * (mín. 6 caracteres)</label>
                <input type="password" value={form.admin_senha} onChange={set('admin_senha')} minLength={6} required />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: 14 }}
            disabled={enviando}
          >
            {enviando ? 'Cadastrando...' : '🏠 Cadastrar ONG'}
          </button>
        </form>
      </div>
    </div>
  );
}
