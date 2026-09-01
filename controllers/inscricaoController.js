/**
 * Controller responsável pelas inscrições de participantes em eventos.
 */
const EventoModel = require('../models/eventoModel');
const InscricaoModel = require('../models/inscricaoModel');

const InscricaoController = {
  /**
   * Realiza a inscrição do participante logado em um evento.
   * Impede inscrições duplicadas e valida a capacidade máxima.
   * @async
   * @param {Request} req Requisição HTTP.
   * @param {Response} res Resposta HTTP.
   * @returns {Promise<void>}
   * @throws {Error} Caso ocorra erro no processamento.
   */
  async inscrever(req, res) {
    const eventoId = req.params.id;
    const usuarioId = res.locals.usuario.id;

    try {
      const evento = await EventoModel.buscarPorId(eventoId);
      if (!evento) {
        return res.status(404).render('404', { titulo: 'Evento não encontrado', usuario: res.locals.usuario });
      }

      const jaInscrito = await InscricaoModel.existeInscricao(usuarioId, eventoId);
      if (jaInscrito) {
        req.session.mensagemErro = 'Você já está inscrito nesse evento.';
        return res.redirect(`/eventos/${eventoId}`);
      }

      if (evento.capacidade) {
        const totalInscritos = await InscricaoModel.contarPorEvento(eventoId);
        if (totalInscritos >= evento.capacidade) {
          req.session.mensagemErro = 'Este evento já atingiu a capacidade máxima.';
          return res.redirect(`/eventos/${eventoId}`);
        }
      }

      await InscricaoModel.criar(usuarioId, eventoId);
      req.session.mensagemSucesso = 'Inscrição realizada com sucesso!';
      return res.redirect(`/eventos/${eventoId}`);
    } catch (erro) {
      console.error('[InscricaoController.inscrever]', erro.message);
      return res.status(500).render('erro', {
        titulo: 'Erro interno',
        mensagem: 'Não foi possível realizar a inscrição.',
        usuario: res.locals.usuario,
      });
    }
  },

  /**
   * Cancela a inscrição do participante logado em um evento.
   * @async
   * @param {Request} req Requisição HTTP.
   * @param {Response} res Resposta HTTP.
   * @returns {Promise<void>}
   * @throws {Error} Caso ocorra erro no processamento.
   */
  async cancelar(req, res) {
    const eventoId = req.params.id;
    const usuarioId = res.locals.usuario.id;

    try {
      await InscricaoModel.cancelar(usuarioId, eventoId);
      req.session.mensagemSucesso = 'Inscrição cancelada com sucesso!';
      return res.redirect('/eventos/minhas-inscricoes');
    } catch (erro) {
      console.error('[InscricaoController.cancelar]', erro.message);
      return res.status(500).render('erro', {
        titulo: 'Erro interno',
        mensagem: 'Não foi possível cancelar a inscrição.',
        usuario: res.locals.usuario,
      });
    }
  },

  /**
   * Lista as inscrições do participante logado.
   * @async
   * @param {Request} req Requisição HTTP.
   * @param {Response} res Resposta HTTP.
   * @returns {Promise<void>}
   * @throws {Error} Caso ocorra erro no processamento.
   */
  async minhasInscricoes(req, res) {
    try {
      const inscricoes = await InscricaoModel.listarPorUsuario(res.locals.usuario.id);
      res.render('eventos/minhas-inscricoes', { titulo: 'Minhas inscrições', inscricoes });
    } catch (erro) {
      console.error('[InscricaoController.minhasInscricoes]', erro.message);
      res.status(500).render('erro', {
        titulo: 'Erro interno',
        mensagem: 'Não foi possível carregar suas inscrições.',
        usuario: res.locals.usuario,
      });
    }
  },
};

module.exports = InscricaoController;
