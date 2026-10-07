import axios from "axios";

export const api = axios.create({
  // Deixe vazio ou com '/' para que a requisição use a porta do front-end (5173)
  // e o Proxy do Vite faça o redirecionamento automático para a 8080
  baseURL: "",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("@VitaTech:token");

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
