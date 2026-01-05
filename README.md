# next15-collection

Uma versão nova de um app de “coleções/games” usando Next.js 15 — um projeto de demonstração/portfólio para ilustrar como montar um sistema com frontend + backend leve, com funcionalidades de CRUD, autenticação, banco e mais.

---

## 🎯 Visão Geral

O objetivo deste projeto é construir uma **aplicação de “coleções de jogos”** (collection app) usando Next.js 15 como base. O app permite gerenciar coleções e games, com estrutura pensada para backend + frontend, banco de dados, autenticação e uma arquitetura moderna — servindo como base ou boilerplate para projetos mais robustos.

Link para a versão deployada: [next15-collection.vercel.app](https://next15-collection.vercel.app)

---

## 🧰 Tecnologias e Ferramentas Utilizadas

- Next.js 15
- TypeScript
- (Possível stack de banco — usando Drizzle ORM + banco Postgres via Vercel — a ser finalizada)
- Tailwind CSS (planejado)
- Configurações de ESLint / linting / boas práticas de código
- PNPM / NPM para gerenciamento de pacotes
- Estrutura modular (pastas `src/`, configuração com `next.config.*`, etc.)

---

## 📂 Estrutura do Projeto (diretórios principais)

/
├── .vscode/ # Configurações do editor (opcional)
├── src/ # Código fonte da aplicação
├── .env.example # Exemplo de variáveis de ambiente
├── .eslintrc.json # Configurações de linting
├── next.config.mjs # Configurações do Next.js
├── tailwind.config.ts # Configurações do Tailwind (quando implementado)
├── package.json # Dependências e scripts
├── pnpm-lock.yaml # Lock file (ou package-lock.json se usar NPM)
└── README.md # Este arquivo

Essa estrutura ajuda na organização, escalabilidade e manutenção do código.

---

## 🚀 Como Rodar o Projeto Localmente

### Pré-requisitos

- Node.js (versão recomendada: 14+ ou LTS atual)
- PNPM ou NPM

### Passos

```bash
# Clone este repositório
git clone https://github.com/arthur12320/next15-collection.git

# Vá para a pasta do projeto
cd next15-collection

# Instale as dependências
pnpm install   # ou npm install

# Crie um arquivo .env com as variáveis necessárias (copie de .env.example)
cp .env.example .env
# — Preencha as variáveis de ambiente conforme necessário (banco, chaves, etc.)

# Rode o servidor em modo de desenvolvimento
pnpm dev       # ou npm run dev

# Abra no navegador em: http://localhost:3000
```

Se você configurar banco de dados, autenticação ou variáveis, lembre-se de ajustar o .env adequadamente.
