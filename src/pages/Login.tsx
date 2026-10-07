import { useState, useContext } from "react";
import type { SyntheticEvent } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { AuthContext } from "../contexts/AuthContext";
import axios from "axios";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { signIn } = useContext(AuthContext);
  const navigate = useNavigate();

  async function handleLogin(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      // Chamada à API conforme a especificação[cite: 1]
      const response = await api.post("/api/auth/login", {
        email,
        password,
      });

      const { token, name, role } = response.data;

      // Guarda os dados no nosso Contexto/LocalStorage
      signIn(token, { name, role });

      // Redireciona com base na role
      if (role === "NUTRITIONIST") {
        navigate("/painel-nutricionista");
      } else {
        navigate("/painel-paciente");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Agora o TypeScript sabe que 'error' é um AxiosError e reconhece o '.response'
        if (error.response && error.response.data) {
          setErrorMessage(error.response.data); // Mensagem de erro do back-end[cite: 3]
        } else {
          setErrorMessage("Erro ao conectar com o servidor.");
        }
      } else {
        // Caso ocorra um erro que não seja do Axios (ex: erro de sintaxe)
        setErrorMessage("Ocorreu um erro inesperado.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "50px auto",
        fontFamily: "sans-serif",
      }}
    >
      <h2>Login - VitaTech</h2>

      {errorMessage && (
        <div
          style={{
            backgroundColor: "#ffebee",
            color: "#c62828",
            padding: "10px",
            marginBottom: "15px",
            borderRadius: "4px",
          }}
        >
          {errorMessage}
        </div>
      )}

      <form
        onSubmit={handleLogin}
        style={{ display: "flex", flexDirection: "column", gap: "15px" }}
      >
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>

        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{ padding: "10px", cursor: "pointer" }}
        >
          {isLoading ? "A entrar..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
