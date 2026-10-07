import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Login } from './pages/Login';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Rotas temporárias apenas para testar o redirecionamento */}
          <Route path="/painel-paciente" element={<h2>Painel do Paciente</h2>} />
          <Route path="/painel-nutricionista" element={<h2>Painel do Nutricionista</h2>} />
          
          {/* Redireciona a raiz para o login */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;