# EventHub — Sistema de Gestão de Eventos e Inscrições

EventHub é uma aplicação web monolítica para gestão de eventos e inscrições, desenvolvida com arquitetura **MVC** (Model-View-Controller) usando Node.js, Express e renderização server-side com EJS.

## 📌 O que é o projeto

Organizadores podem criar, editar, excluir e acompanhar eventos e seus inscritos. Participantes podem navegar pelos eventos disponíveis, visualizar detalhes e se inscrever, respeitando limite de capacidade e evitando inscrições duplicadas.

## 🛠️ Tecnologias utilizadas

- Node.js
- Express
- MySQL (mysql2 com Prepared Statements)
- EJS (renderização server-side)
- express-session (autenticação por sessão)
- bcryptjs (hash de senhas)
- express-validator (validação e sanitização)
- dotenv (variáveis de ambiente)
- cookie-parser, method-override

## 🏗️ Arquitetura MVC

```
eventhub-mvc/
├── controllers/     # Lógica de negócio e orquestração das requisições
├── models/          # Acesso ao banco de dados (queries com Prepared Statements)
├── routes/          # Definição das rotas HTTP
├── views/           # Templates EJS (renderização server-side)
│   ├── partials/    # Componentes reutilizáveis (header, footer, alertas)
│   ├── auth/         # Views de login e cadastro
│   └── eventos/      # Views de eventos e inscrições
├── middlewares/      # Autenticação, autorização e tratamento de erros
├── public/            # Arquivos estáticos (CSS, JS, imagens)
├── database/          # Script SQL de criação do banco
├── config/            # Configuração de banco de dados e sessão
├── .env.example
├── server.js          # Ponto de entrada da aplicação
└── package.json
```

O fluxo segue o padrão MVC clássico: **routes** recebem a requisição → chamam o **controller** correspondente → o controller usa o **model** para acessar o banco → o resultado é renderizado em uma **view** EJS.

## ⚙️ Como instalar

1. Clone o repositório:
   ```bash
   git clone <url-do-repositorio>
   cd eventhub-mvc
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

## 🔐 Como configurar o `.env`

1. Copie o arquivo de exemplo:
   ```bash
   cp .env.example .env
   ```

2. Preencha as variáveis com seus dados:
   ```env
   PORT=3000

   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=sua_senha
   DB_NAME=eventhub
   DB_SSL=false

   SESSION_SECRET=uma_string_aleatoria_e_segura

   NODE_ENV=development
   ```

   > Em produção (ex: banco em nuvem), defina `DB_SSL=true` e `NODE_ENV=production`.

## 🗄️ Banco de dados

1. Crie o banco e as tabelas executando o script SQL completo:
   ```bash
   mysql -u root -p < database/schema.sql
   ```
   Isso criará o banco `eventhub` com as tabelas `usuarios`, `eventos` e `inscricoes`, já com chaves estrangeiras e índices.

## ▶️ Como executar

Modo desenvolvimento (com reinício automático):
```bash
npm run dev
```

Modo produção:
```bash
npm start
```

A aplicação estará disponível em `http://localhost:3000` (ou na porta definida em `PORT`).

## ✅ Funcionalidades

### Autenticação
- Cadastro de usuários (organizador ou participante)
- Login e logout com sessão via cookie `httpOnly`
- Senhas protegidas com `bcryptjs` (nunca armazenadas em texto puro)
- Middlewares de autenticação e autorização por tipo de usuário

### Organizador
- Criar, editar e excluir eventos
- Visualizar seus próprios eventos ("Meus eventos")
- Visualizar a lista de inscritos em cada evento

### Participante
- Navegar pelos eventos disponíveis
- Visualizar detalhes de um evento
- Inscrever-se e cancelar inscrição
- Visualizar suas inscrições ("Minhas inscrições")
- Impedimento de inscrição duplicada e respeito ao limite de capacidade do evento

## 🔒 Segurança

- Todas as queries usam **Prepared Statements** (`pool.execute` do mysql2), nunca concatenando valores em SQL.
- Senhas com hash `bcryptjs`.
- Sessão configurada com cookie `httpOnly` e segredo em variável de ambiente.
- Validação e sanitização de entradas com `express-validator`.
- Tratamento de erros com `try/catch` em todos os controllers, sem exposição de stack trace ao usuário.
- Segredos (banco de dados, sessão) apenas em variáveis de ambiente (`.env`, nunca commitado).

## 📂 Estrutura de pastas

Ver seção [Arquitetura MVC](#🏗️-arquitetura-mvc) acima.

## 🚀 Como fazer deploy (Render)

1. Crie um banco MySQL em nuvem (ex: Aiven) e anote host, porta, usuário, senha e nome do banco.
2. Execute o `database/schema.sql` nesse banco para criar as tabelas.
3. No Render, crie um novo **Web Service** apontando para o repositório `eventhub-mvc`.
4. Configure o **Build Command**: `npm install`.
5. Configure o **Start Command**: `npm start`.
6. Defina as variáveis de ambiente no painel do Render (as mesmas do `.env`, com `DB_SSL=true` e `NODE_ENV=production`).
7. O Render define a porta automaticamente via `process.env.PORT`, já suportado pela aplicação.
8. Faça o deploy e acesse a URL gerada.

## 📄 Licença

Projeto acadêmico desenvolvido para fins de recuperação trimestral.
