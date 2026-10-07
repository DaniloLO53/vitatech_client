import { useState, useContext } from 'react';
import type { SyntheticEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { api } from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import './Login.css'; // Reutilizamos o mesmo ficheiro de estilos!

export function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'PATIENT' | 'NUTRITIONIST'>('PATIENT');
  
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { signIn } = useContext(AuthContext);
  const navigate = useNavigate();

  async function handleRegister(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      // Chamada à API para registar conforme a especificação[cite: 1]
      const response = await api.post('/api/auth/register', {
        name,
        email,
        password,
        role
      });

      // A API já devolve o token e os dados no registo, logo podemos fazer auto-login[cite: 1]
      const { token, name: userName, role: userRole } = response.data;
      signIn(token, { name: userName, role: userRole });

      // Redireciona com base na role[cite: 3]
      if (userRole === 'NUTRITIONIST') {
        navigate('/painel-nutricionista');
      } else {
        navigate('/painel-paciente');
      }

    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response && error.response.data) {
          setErrorMessage(error.response.data); // Exibe mensagem em texto simples[cite: 3]
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
        
        <h1 className="login-logo">VitaTech</h1>
        <p className="login-subtitle">Crie a sua conta e comece agora</p>
        
        {errorMessage && (
          <div className="login-error">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleRegister} className="login-form">
          <div className="input-group">
            <label htmlFor="name">Nome Completo</label>
            <input 
              id="name"
              type="text" 
              placeholder="O seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

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
              placeholder="Crie uma senha forte"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <div className="input-group">
            <label htmlFor="role">Eu sou um(a):</label>
            <select 
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as 'PATIENT' | 'NUTRITIONIST')}
              required
              /* Adicionamos o mesmo estilo dos inputs para ficar uniforme */
              style={{
                padding: '12px 14px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '15px',
                outline: 'none',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
            >
              <option value="PATIENT">Paciente</option>
              <option value="NUTRITIONIST">Nutricionista</option>
            </select>
          </div>

          <button type="submit" className="btn-submit" disabled={isLoading}>
            {isLoading ? 'A registar...' : 'Criar Conta'}
          </button>
        </form>

        <div style={{ marginTop: '20px', fontSize: '14px', color: '#6b7280' }}>
          Já tem uma conta? <Link to="/login" style={{ color: '#10b981', fontWeight: 600, textDecoration: 'none' }}>Faça login aqui</Link>
        </div>
        
      </div>
    </div>
  );
}