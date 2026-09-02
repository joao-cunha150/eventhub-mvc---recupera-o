/**
 * Ponto de entrada da aplicação EventHub (arquitetura MVC monolítica).
 */
require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');

const sessionMiddleware = require('./config/session');
const { injetarUsuarioNasViews } = require('./middlewares/authMiddleware');
const { paginaNaoEncontrada, tratarErros } = require('./middlewares/errorMiddleware');

const indexRoutes = require('./routes/indexRoutes');
const authRoutes = require('./routes/authRoutes');
const eventoRoutes = require('./routes/eventoRoutes');

const app = express();

// Necessário para o funcionamento correto de cookies seguros
// quando a aplicação está hospedada atrás do proxy do Render.
app.set('trust proxy', 1);

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares globais
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(sessionMiddleware);
app.use(injetarUsuarioNasViews);

// Rotas
app.use('/', indexRoutes);
app.use('/auth', authRoutes);
app.use('/eventos', eventoRoutes);

// 404 e tratamento de erros (sempre por último)
app.use(paginaNaoEncontrada);
app.use(tratarErros);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`EventHub rodando em http://localhost:${PORT}`);
});