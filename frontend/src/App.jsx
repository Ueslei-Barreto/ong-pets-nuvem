import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './index.css';

import Home from './pages/Home';
import PetDetalhe from './pages/PetDetalhe';
import CadastroOng from './pages/CadastroOng';
import Login from './pages/Admin/Login';
import Dashboard from './pages/Admin/Dashboard';
import GerenciarPets from './pages/Admin/GerenciarPets';
import FormPet from './pages/Admin/FormPet';
import Adocoes from './pages/Admin/Adocoes';
import ImportarCsv from './pages/Admin/ImportarCsv';

const RotaPrivada = ({ children }) => {
  const { usuario } = useAuth();
  return usuario ? children : <Navigate to="/admin/login" replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pet/:id" element={<PetDetalhe />} />
          <Route path="/cadastro-ong" element={<CadastroOng />} />
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin" element={<RotaPrivada><Dashboard /></RotaPrivada>} />
          <Route path="/admin/pets" element={<RotaPrivada><GerenciarPets /></RotaPrivada>} />
          <Route path="/admin/pets/novo" element={<RotaPrivada><FormPet /></RotaPrivada>} />
          <Route path="/admin/pets/editar/:id" element={<RotaPrivada><FormPet /></RotaPrivada>} />
          <Route path="/admin/importar" element={<RotaPrivada><ImportarCsv /></RotaPrivada>} />
          <Route path="/admin/adocoes" element={<RotaPrivada><Adocoes /></RotaPrivada>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
