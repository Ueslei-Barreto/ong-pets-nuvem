import { Link } from 'react-router-dom';

export default function PetCard({ pet }) {
  // foto_url agora e a URL completa do Supabase Storage
  const fotoUrl = pet.foto_url || 'https://placehold.co/300x200/fef3c7/f97316?text=🐾+Sem+foto';

  return (
    <Link to={`/pet/${pet.id}`} style={{ display: 'block' }}>
      <div className="card" style={{
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
      }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.12)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
        }}
      >
        <div style={{ position: 'relative' }}>
          <img
            src={fotoUrl}
            alt={pet.nome}
            style={{ width: '100%', height: 200, objectFit: 'cover' }}
          />
          <span
            className={`badge badge-${pet.status}`}
            style={{ position: 'absolute', top: 12, right: 12 }}
          >
            {pet.status}
          </span>
        </div>

        <div style={{ padding: '16px' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: 4 }}>{pet.nome}</h3>
          <p style={{ color: '#78716c', fontSize: '0.9rem', marginBottom: 10 }}>
            {pet.raca || pet.especie} · {pet.porte} · {pet.sexo}
            {pet.idade_anos ? ` · ${pet.idade_anos} ano${pet.idade_anos !== 1 ? 's' : ''}` : ''}
          </p>

          {/* Identifica a ONG dona do animal no catalogo unificado */}
          {pet.ong_nome && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: '#fff7ed', color: '#9a3412',
              padding: '4px 10px', borderRadius: 20,
              fontSize: '0.75rem', fontWeight: 700, marginBottom: 12,
            }}>
              🏠 {pet.ong_nome}
              {pet.ong_cidade ? ` · ${pet.ong_cidade}` : ''}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            {pet.vacinado && (
              <span style={{ fontSize: '0.75rem', background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>
                ✅ Vacinado
              </span>
            )}
            {pet.castrado && (
              <span style={{ fontSize: '0.75rem', background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>
                ✂️ Castrado
              </span>
            )}
          </div>

          <p style={{ marginTop: 12, color: '#57534e', fontSize: '0.88rem', lineHeight: 1.5,
            overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {pet.descricao || 'Esperando um lar cheio de amor! 🐾'}
          </p>
        </div>
      </div>
    </Link>
  );
}
