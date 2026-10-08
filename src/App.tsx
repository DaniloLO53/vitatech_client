import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { DashboardPaciente } from './pages/DashboardPaciente';
import { DashboardNutricionista } from './pages/DashboardNutricionista';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/painel-paciente" element={<DashboardPaciente />} />
          <Route path="/painel-nutricionista" element={<DashboardNutricionista />} />
          
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;