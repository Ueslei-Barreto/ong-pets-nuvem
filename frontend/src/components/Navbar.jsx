import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav style={{
      background: 'white',
      borderBottom: '2px solid #f97316',
      padding: '0 20px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '1.8rem' }}>🐾</span>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', fontWeight: 700, color: '#f97316' }}>
            ONG Pets
          </span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link to="/" style={{ fontWeight: 600, color: '#78716c' }}>Adotar</Link>
          {usuario ? (
            <>
              <Link to="/admin" style={{ fontWeight: 600, color: '#78716c' }}>Painel</Link>
              <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '6px 16px' }}>
                Sair
              </button>
            </>
          ) : (
            <>
              <Link to="/cadastro-ong" style={{ fontWeight: 600, color: '#78716c' }}>
                Cadastre sua ONG
              </Link>
              <Link to="/admin/login" className="btn btn-primary" style={{ padding: '8px 18px' }}>
                Área Admin
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
