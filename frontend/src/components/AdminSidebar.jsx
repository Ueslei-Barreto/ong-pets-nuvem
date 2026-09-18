import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const itens = [
  { path: '/admin', label: 'Dashboard', icon: '📊' },
  { path: '/admin/pets', label: 'Pets', icon: '🐾' },
  { path: '/admin/importar', label: 'Importar CSV', icon: '📄' },
  { path: '/admin/adocoes', label: 'Adoções', icon: '❤️' },
  { path: '/', label: 'Ver site', icon: '🌐' },
];

export default function AdminSidebar() {
  const location = useLocation();
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <aside style={{
      width: 240,
      background: '#1c1917',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 0',
      position: 'fixed',
      top: 0, left: 0, bottom: 0,
    }}>
      <div style={{ padding: '0 20px 24px', borderBottom: '1px solid #292524' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '1.6rem' }}>🐾</span>
          <span style={{ fontFamily: "'Playfair Display', serif", color: '#f97316', fontSize: '1.2rem', fontWeight: 700 }}>
            ONG Pets
          </span>
        </div>

        {/* Deixa explicito em qual organizacao o admin esta trabalhando */}
        {usuario?.ong_nome && (
          <p style={{ color: '#f5f5f4', fontSize: '0.85rem', marginTop: 10, fontWeight: 700 }}>
            {usuario.ong_nome}
          </p>
        )}
        <p style={{ color: '#a8a29e', fontSize: '0.8rem', marginTop: 4 }}>
          Olá, {usuario?.nome?.split(' ')[0]}!
        </p>
      </div>

      <nav style={{ flex: 1, padding: '16px 0' }}>
        {itens.map(item => {
          const ativo = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 20px',
              color: ativo ? '#f97316' : '#d6d3d1',
              background: ativo ? '#292524' : 'transparent',
              fontWeight: ativo ? 700 : 500,
              fontSize: '0.95rem',
              borderLeft: ativo ? '3px solid #f97316' : '3px solid transparent',
              transition: 'all 0.15s',
            }}>
              <span>{item.icon}</span> {item.label}
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: '16px 20px', borderTop: '1px solid #292524' }}>
        <button
          onClick={() => { logout(); navigate('/'); }}
          style={{
            width: '100%', padding: '10px', background: '#292524',
            color: '#d6d3d1', border: 'none', borderRadius: 8,
            cursor: 'pointer', fontFamily: 'Nunito', fontWeight: 600,
          }}
        >
          🚪 Sair
        </button>
      </div>
    </aside>
  );
}
