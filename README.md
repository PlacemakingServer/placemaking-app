---

# 🎯 PredictFlow Frontend

**URL de Acesso:** [https://frontend-triunfantes.vercel.app](https://frontend-triunfantes.vercel.app)
**Credenciais de Teste:**
📧 **Usuário:** `teste@test.com`
🔐 **Senha:** `z1x2c3v4`

---

## 📦 Visão Geral

O **PredictFlow** é um sistema de gestão visual e colaborativa de ordens de compra, times e performance de pedidos. É focado em facilitar o acompanhamento, análise e controle de processos de vendas, com forte suporte a gráficos, filtros e dashboards.

Essa aplicação frontend foi desenvolvida com **Next.js** e **Tailwind CSS**, e está integrada com uma API externa (via variável de ambiente `NEXT_PUBLIC_SERVER_URL`) para realizar operações como login, registro, listagem e criação de dados.

---

## ✨ Funcionalidades Principais

### 🔐 Autenticação

* Login com persistência de sessão via `cookies`.
* Cadastro de novos usuários com cargo e time.
* Esqueci minha senha (simulado).

### 📊 Dashboard

* Visão geral dos KPIs principais:

  * Total de pedidos.
  * Pedidos resolvidos.
  * Pendentes e atrasados.
* Gráficos:

  * Barras (estágios dos pedidos).
  * Pizza (distribuição por país).
* Tabela dos 5 últimos pedidos com acesso detalhado.

### 📁 Ordens de Compra (`/order`)

* Listagem completa dos pedidos da base.
* Filtro global por texto.
* Importação de CSV.
* Criação de novo pedido com validação de campos.
* Paginação automática.

### 👥 Equipe (`/team`)

* Cadastro de novos colaboradores (listados ou não).
* Pesquisa e paginação.
* Exibição de membros com identificação de "não listados".
* Visualização detalhada de cada membro:

  * Informações pessoais.
  * Pedidos atribuídos.
  * Logs de atividade.

### 📄 Página de Pedido (`/deal/[id]`)

* Ficha técnica completa do pedido.
* Campos de status, datas, país, cliente, responsáveis.
* Linha do tempo interativa com base no `vis-timeline`.

### 📄 Página de Usuário (`/user/[id]`)

* Detalhes pessoais e profissionais.
* Pedidos relacionados ao usuário.
* Histórico de atividade por logs de modificação.

---

## 🛠️ Tecnologias Utilizadas

* **Framework:** [Next.js](https://nextjs.org/)
* **Estilo:** [Tailwind CSS](https://tailwindcss.com/)
* **Gráficos:** `chart.js`, `react-chartjs-2`, `vis-timeline`
* **HTTP:** `axios` + `js-cookie`
* **Animações:** `framer-motion`

---

## 🚀 Executando Localmente

```bash
git clone https://github.com/seu-usuario/predictflow-frontend.git
cd predictflow-frontend
npm install

# Crie um .env.local com:
NEXT_PUBLIC_SERVER_URL=http://localhost:8000

npm run dev
```

---

## 🔐 Observações de Segurança

* Autenticação baseada em token via `Bearer Token`.
* Cookies são configurados com `Secure` e `SameSite=Strict`.
* Tokens são interceptados automaticamente via `axios.interceptors`.

---

## 📄 Estrutura de Diretórios

```
📂 components         → Componentes reutilizáveis (Input, Sidebar, Table, etc.)
📂 pages              → Rotas da aplicação (auth, dashboard, deal, order, team, etc.)
📂 services           → Integrações com API externa (axios)
📂 styles             → Tailwind e customizações globais
📂 repositories       → Funções de autenticação (login/register)
```

---

## 🧪 Acesso de Teste

* Para testar a aplicação:

  * Acesse [https://frontend-triunfantes.vercel.app](https://frontend-triunfantes.vercel.app)
  * Faça login com:

    * **Email:** `teste@test.com`
    * **Senha:** `z1x2c3v4`

---
