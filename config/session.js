/**
 * Configuração do middleware de sessão (express-session).
 * O segredo da sessão vem exclusivamente de variável de ambiente.
 */
require('dotenv').config();
const session = require('express-session');

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Middleware de sessão configurado com cookies httpOnly.
 */
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'fallback_secret_do_not_use_in_production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: isProduction, // exige HTTPS em produção
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 8, // 8 horas
  },
});

module.exports = sessionMiddleware;
