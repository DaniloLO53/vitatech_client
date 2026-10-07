import { useState, useContext } from 'react';
import type { SyntheticEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { api } from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import './Login.css'; // Importando os estilos modernos


export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { signIn } = useContext(AuthContext);
  const navigate = useNavigate();

  async function handleLogin(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const response = await api.post('/api/auth/login', {
        email,
        password,
      });

      const { token, name, role } = response.data;
      signIn(token, { name, role });

      if (role === 'NUTRITIONIST') {
        navigate('/painel-nutricionista');
      } else {
        navigate('/painel-paciente');
      }

    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response && error.response.data) {
          setErrorMessage(error.response.data);
        } else {
          setErrorMessage('Erro ao conectar com o servidor.');
        }
      } else {
        setErrorMessage('Ocorreu um erro inesperado.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        
        {/* Cabeçalho da área de Saúde */}
        <h1 className="login-logo">VitaTech</h1>
        <p className="login-subtitle">Nutrição e Bem-estar ao seu alcance</p>
        
        {errorMessage && (
          <div className="login-error">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <label htmlFor="email">E-mail</label>
            <input 
              id="email"
              type="email" 
              placeholder="exemplo@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Senha</label>
            <input 
              id="password"
              type="password" 
              placeholder="Sua senha de acesso"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-submit" disabled={isLoading}>
            {isLoading ? 'Entrando...' : 'Entrar na Plataforma'}
          </button>
        </form>
        <div style={{ marginTop: '20px', fontSize: '14px', color: '#6b7280', textAlign: 'center' }}>
          Ainda não tem conta? <Link to="/register" style={{ color: '#10b981', fontWeight: 600, textDecoration: 'none' }}>Registe-se aqui</Link>
        </div>
      </div>
    </div>
  );
}