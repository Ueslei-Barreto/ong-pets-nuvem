import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import api from '../../services/api';

export default function FormPet() {
  const { id } = useParams();
  const editando = !!id;
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nome: '', especie: 'cachorro', raca: '', idade_anos: '',
    porte: 'medio', sexo: 'macho', descricao: '',
    vacinado: false, castrado: false, status: 'disponivel',
  });
  const [foto, setFoto] = useState(null);
  const [previewFoto, setPreviewFoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (editando) {
      api.get(`/pets/${id}`).then(res => {
        const p = res.data;
        setForm({
          nome: p.nome, especie: p.especie, raca: p.raca || '',
          idade_anos: p.idade_anos || '', porte: p.porte || 'medio',
          sexo: p.sexo || 'macho', descricao: p.descricao || '',
          vacinado: p.vacinado, castrado: p.castrado, status: p.status,
        });
        if (p.foto_url) {
          // foto_url agora e a URL completa do Supabase Storage
          setPreviewFoto(p.foto_url);
        }
      });
    }
  }, [id]);

  const handleFoto = (e) => {
    const arquivo = e.target.files[0];
    if (arquivo) {
      setFoto(arquivo);
      setPreviewFoto(URL.createObjectURL(arquivo));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    try {
      const dados = new FormData();
      Object.entries(form).forEach(([k, v]) => dados.append(k, v));
      if (foto) dados.append('foto', foto);

      if (editando) {
        await api.put(`/pets/${id}`, dados, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/pets', dados, { headers: { 'Content-Type': 'multipart/form-data' } });
      }

      navigate('/admin/pets');
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao salvar pet.');
    } finally {
      setLoading(false);
    }
  };

  const campo = (label, field, tipo = 'text', opcoes = null) => (
    <div className="form-group">
      <label>{label}</label>
      {opcoes ? (
        <select value={form[field]} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}>
          {opcoes.map(([val, lbl]) => <option key={val} value={val}>{lbl}</option>)}
        </select>
      ) : (
        <input
          type={tipo}
          value={form[field]}
          onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
        />
      )}
    </div>
  );

  return (
    <div style={{ display: 'flex' }}>
      <AdminSidebar />
      <main style={{ marginLeft: 240, flex: 1, padding: 40, background: '#fafaf9', minHeight: '100vh' }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', marginBottom: 8 }}>
          {editando ? 'Editar Pet' : 'Cadastrar Novo Pet'}
        </h1>
        <p style={{ color: '#78716c', marginBottom: 32 }}>
          {editando ? 'Atualize as informações do pet' : 'Preencha os dados do pet para adoção'}
        </p>

        {erro && <div className="alert alert-error">{erro}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
            {/* Coluna esquerda */}
            <div className="card" style={{ padding: 28 }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 20, color: '#f97316' }}>
                📋 Informações Básicas
              </h2>
              {campo('Nome *', 'nome')}
              {campo('Espécie *', 'especie', 'text', [
                ['cachorro', '🐶 Cachorro'],
                ['gato', '🐱 Gato'],
                ['outro', '🐾 Outro'],
              ])}
              {campo('Raça', 'raca')}
              {campo('Idade (anos)', 'idade_anos', 'number')}
              {campo('Porte', 'porte', 'text', [
                ['pequeno', 'Pequeno'],
                ['medio', 'Médio'],
                ['grande', 'Grande'],
              ])}
              {campo('Sexo', 'sexo', 'text', [
                ['macho', 'Macho'],
                ['femea', 'Fêmea'],
              ])}
              {editando && campo('Status', 'status', 'text', [
                ['disponivel', 'Disponível'],
                ['reservado', 'Reservado'],
                ['adotado', 'Adotado'],
              ])}
            </div>

            {/* Coluna direita */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div className="card" style={{ padding: 28 }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 20, color: '#f97316' }}>
                  📸 Foto
                </h2>
                {previewFoto && (
                  <img src={previewFoto} alt="Preview" style={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 8, marginBottom: 12 }} />
                )}
                <input type="file" accept="image/*" onChange={handleFoto} style={{ padding: '8px 0' }} />
                <p style={{ color: '#a8a29e', fontSize: '0.8rem', marginTop: 6 }}>JPG, PNG ou WebP até 5MB</p>
              </div>

              <div className="card" style={{ padding: 28 }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 20, color: '#f97316' }}>
                  🏥 Saúde
                </h2>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 14 }}>
                  <input
                    type="checkbox"
                    checked={form.vacinado}
                    onChange={e => setForm(p => ({ ...p, vacinado: e.target.checked }))}
                    style={{ width: 18, height: 18 }}
                  />
                  <span style={{ fontWeight: 600 }}>Vacinado</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={form.castrado}
                    onChange={e => setForm(p => ({ ...p, castrado: e.target.checked }))}
                    style={{ width: 18, height: 18 }}
                  />
                  <span style={{ fontWeight: 600 }}>Castrado</span>
                </label>
              </div>

              <div className="card" style={{ padding: 28 }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 20, color: '#f97316' }}>
                  📝 Descrição
                </h2>
                <textarea
                  value={form.descricao}
                  onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))}
                  rows={4}
                  placeholder="Descreva a personalidade e história do pet..."
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
            <button type="submit" className="btn btn-primary" style={{ padding: '12px 28px' }} disabled={loading}>
              {loading ? 'Salvando...' : editando ? '✅ Salvar alterações' : '+ Cadastrar pet'}
            </button>
            <button type="button" onClick={() => navigate('/admin/pets')} className="btn btn-outline">
              Cancelar
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
