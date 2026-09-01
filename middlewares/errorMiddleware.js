/**
 * Middlewares centralizados de tratamento de erros.
 */

/**
 * Middleware para rotas não encontradas (404).
 * @param {Request} req Requisição HTTP.
 * @param {Response} res Resposta HTTP.
 * @returns {void}
 */
function paginaNaoEncontrada(req, res) {
  res.status(404).render('404', {
    titulo: 'Página não encontrada',
    usuario: (req.session && req.session.usuario) || null,
  });
}

/**
 * Middleware central de tratamento de erros da aplicação.
 * Nunca expõe stack trace ao usuário final.
 * @param {Error} err Erro capturado.
 * @param {Request} req Requisição HTTP.
 * @param {Response} res Resposta HTTP.
 * @param {Function} next Próximo middleware.
 * @returns {void}
 */
// eslint-disable-next-line no-unused-vars
function tratarErros(err, req, res, next) {
  console.error('[ERRO]', err.message);
  res.status(500).render('erro', {
    titulo: 'Erro interno',
    mensagem: 'Ocorreu um erro inesperado. Tente novamente mais tarde.',
    usuario: (req.session && req.session.usuario) || null,
  });
}

module.exports = { paginaNaoEncontrada, tratarErros };
