# 🍏 VitaTech - Aplicação Front-end

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)

> A ponte perfeita entre o profissional de nutrição e o sucesso do paciente. O **VitaTech** é uma plataforma inovadora que permite o acompanhamento contínuo de rotinas alimentares e de treinos, com comunicação em tempo real.

---

## ✨ Funcionalidades Principais

*   **🔐 Autenticação Inteligente:** Login seguro com JWT e redirecionamento automático baseado em perfis (Paciente vs. Nutricionista).
*   **📊 Dashboards Personalizados:** Interfaces dedicadas e otimizadas para as necessidades do paciente e do profissional.
*   **🥗 Diário de Rotina:** Registo de refeições (com pesquisa de alimentos e macronutrientes) e de treinos diários.
*   **🤝 Sistema de Vínculo:** Pesquisa inteligente de profissionais (com *debounce*) e fluxo completo de envio, aprovação e gestão de convites de acompanhamento.
*   **💬 Chat em Tempo Real:** Mensagens instantâneas entre o paciente e o nutricionista integradas num painel flutuante universal, alimentado por WebSockets (STOMP).

---

## 🛠️ Tecnologias Utilizadas

O ecossistema do front-end foi desenhado para ser rápido, tipado e escalável:

*   **[React](https://reactjs.org/)** com **[Vite](https://vitejs.dev/)**: Para uma experiência de desenvolvimento ultra-rápida e uma build otimizada.
*   **[TypeScript](https://www.typescriptlang.org/)**: Tipagem estática em toda a aplicação (Interfaces, DTOs e Contextos).
*   **[Axios](https://axios-http.com/)**: Gestão de requisições HTTP REST com suporte a interceptores para o token de autenticação.
*   **[@stomp/stompjs](https://stomp-js.github.io/)**: Cliente WebSocket para comunicação em tempo real no módulo de chat.
*   **[React Router](https://reactrouter.com/)**: Roteamento dinâmico e proteção de rotas privadas.

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
Certifique-se de que tem o [Node.js](https://nodejs.org/) (versão 18+ recomendada) e o `npm` (ou `yarn`) instalados na sua máquina. O back-end (Spring Boot) também deve estar a correr localmente para fornecer os dados.

### Passos para a instalação

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/seu-usuario/vitatech-client.git
   cd vitatech-client
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as Variáveis de Ambiente:**
   Crie um ficheiro `.env` na raiz do projeto e adicione a URL do seu back-end (Spring Boot):
   ```env
   VITE_API_URL=http://localhost:8080
   ```

4. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```
   *A aplicação estará disponível em `http://localhost:5173` (ou a porta indicada pelo Vite).*

---

## 🌐 Deploy em Produção

Esta aplicação está configurada para deploy contínuo na **Vercel**. 

*   O roteamento do lado do cliente está assegurado pelo ficheiro `vercel.json` na raiz do projeto, que previne erros 404 ao recarregar rotas privadas.
*   A URL da API em produção é gerida de forma dinâmica lendo a variável `VITE_API_URL` configurada no painel da Vercel, o que permite uma comunicação fluída com o back-end hospedado no Render.

---

## 🤝 Como Contribuir

1. Faça um Fork do projeto
2. Crie uma branch para a sua funcionalidade (`git checkout -b feature/MinhaNovaFeature`)
3. Faça o commit das suas alterações (`git commit -m 'Adiciona MinhaNovaFeature'`)
4. Faça o push para a branch (`git push origin feature/MinhaNovaFeature`)
5. Abra um Pull Request