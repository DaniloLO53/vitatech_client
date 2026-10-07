import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Sempre que o front-end chamar algo que comece por '/api',
      // o Vite encaminha em segredo para o back-end na porta 8080
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
});
