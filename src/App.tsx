import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Login } from './pages/Login';
import { Register } from './pages/Register'; // <-- Importe aqui
import { DashboardPaciente } from './pages/DashboardPaciente';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} /> {/* <-- Nova rota aqui */}
          
          <Route path="/painel-paciente" element={<DashboardPaciente />} />
          <Route path="/painel-nutricionista" element={<h2>Painel do Nutricionista</h2>} />
          
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;