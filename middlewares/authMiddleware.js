/**
 * Middlewares relacionados à autenticação e autorização por sessão.
 */

/**
 * Garante que o usuário esteja autenticado antes de acessar a rota.
 * Caso contrário, redireciona para o login.
 * @param {Request} req Requisição HTTP.
 * @param {Response} res Resposta HTTP.
 * @param {Function} next Próximo middleware.
 * @returns {void}
 */
function autenticado(req, res, next) {
  if (req.session && req.session.usuario) {
    res.locals.usuario = req.session.usuario;
    return next();
  }
  req.session.mensagemErro = 'Você precisa estar logado para acessar essa página.';
  return res.redirect('/auth/login');
}

/**
 * Garante que o usuário NÃO esteja autenticado (usado em telas de login/cadastro).
 * @param {Request} req Requisição HTTP.
 * @param {Response} res Resposta HTTP.
 * @param {Function} next Próximo middleware.
 * @returns {void}
 */
function visitante(req, res, next) {
  if (req.session && req.session.usuario) {
    return res.redirect('/eventos');
  }
  return next();
}

/**
 * Restringe o acesso à rota apenas para usuários com o(s) tipo(s) informado(s).
 * @param {...string} tipos Tipos de usuário permitidos (ex: 'organizador').
 * @returns {Function} Middleware do Express.
 */
function permitirTipos(...tipos) {
  return (req, res, next) => {
    if (!req.session || !req.session.usuario) {
      return res.redirect('/auth/login');
    }
    if (!tipos.includes(req.session.usuario.tipo_usuario)) {
      return res.status(403).render('erro', {
        titulo: 'Acesso negado',
        mensagem: 'Você não tem permissão para acessar essa página.',
        usuario: req.session.usuario,
      });
    }
    return next();
  };
}

/**
 * Disponibiliza dados do usuário logado (se houver) em todas as views.
 * @param {Request} req Requisição HTTP.
 * @param {Response} res Resposta HTTP.
 * @param {Function} next Próximo middleware.
 * @returns {void}
 */
function injetarUsuarioNasViews(req, res, next) {
  res.locals.usuario = (req.session && req.session.usuario) || null;
  res.locals.mensagemErro = (req.session && req.session.mensagemErro) || null;
  res.locals.mensagemSucesso = (req.session && req.session.mensagemSucesso) || null;
  if (req.session) {
    delete req.session.mensagemErro;
    delete req.session.mensagemSucesso;
  }
  next();
}

module.exports = {
  autenticado,
  visitante,
  permitirTipos,
  injetarUsuarioNasViews,
};
