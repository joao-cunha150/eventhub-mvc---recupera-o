/**
 * Controller responsável pelas operações de eventos (CRUD do organizador
 * e visualização/inscrição do participante).
 */
const { validationResult } = require('express-validator');
const EventoModel = require('../models/eventoModel');
const InscricaoModel = require('../models/inscricaoModel');

const EventoController = {
  /**
   * Lista todos os eventos disponíveis (página pública/participante).
   * @async
   * @param {Request} req Requisição HTTP.
   * @param {Response} res Resposta HTTP.
   * @returns {Promise<void>}
   * @throws {Error} Caso ocorra erro no processamento.
   */
  async listar(req, res) {
    try {
      const eventos = await EventoModel.listarTodos();
      res.render('eventos/lista', { titulo: 'Eventos disponíveis', eventos });
    } catch (erro) {
      console.error('[EventoController.listar]', erro.message);
      res.status(500).render('erro', {
        titulo: 'Erro interno',
        mensagem: 'Não foi possível carregar os eventos.',
        usuario: res.locals.usuario,
      });
    }
  },

  /**
   * Exibe os detalhes de um evento específico.
   * @async
   * @param {Request} req Requisição HTTP.
   * @param {Response} res Resposta HTTP.
   * @returns {Promise<void>}
   * @throws {Error} Caso ocorra erro no processamento.
   */
  async detalhes(req, res) {
    try {
      const evento = await EventoModel.buscarPorId(req.params.id);
      if (!evento) {
        return res.status(404).render('404', { titulo: 'Evento não encontrado', usuario: res.locals.usuario });
      }

      let jaInscrito = false;
      if (res.locals.usuario) {
        jaInscrito = await InscricaoModel.existeInscricao(res.locals.usuario.id, evento.id);
      }

      return res.render('eventos/detalhes', { titulo: evento.titulo, evento, jaInscrito });
    } catch (erro) {
      console.error('[EventoController.detalhes]', erro.message);
      return res.status(500).render('erro', {
        titulo: 'Erro interno',
        mensagem: 'Não foi possível carregar o evento.',
        usuario: res.locals.usuario,
      });
    }
  },

  /**
   * Exibe o formulário de criação de evento.
   * @param {Request} req Requisição HTTP.
   * @param {Response} res Resposta HTTP.
   * @returns {void}
   */
  exibirFormularioCriacao(req, res) {
    res.render('eventos/criar', { titulo: 'Criar evento', erros: [], dados: {} });
  },

  /**
   * Cria um novo evento associado ao organizador logado.
   * @async
   * @param {Request} req Requisição HTTP.
   * @param {Response} res Resposta HTTP.
   * @returns {Promise<void>}
   * @throws {Error} Caso ocorra erro no processamento.
   */
  async criar(req, res) {
    const erros = validationResult(req);
    const { titulo, descricao, data_evento: dataEvento, horario, local, capacidade } = req.body;

    if (!erros.isEmpty()) {
      return res.status(400).render('eventos/criar', {
        titulo: 'Criar evento',
        erros: erros.array(),
        dados: req.body,
      });
    }

    try {
      const eventoId = await EventoModel.criar({
        titulo,
        descricao,
        dataEvento,
        horario,
        local,
        capacidade,
        usuarioId: res.locals.usuario.id,
      });
      req.session.mensagemSucesso = 'Evento criado com sucesso!';
      return res.redirect(`/eventos/${eventoId}`);
    } catch (erro) {
      console.error('[EventoController.criar]', erro.message);
      return res.status(500).render('erro', {
        titulo: 'Erro interno',
        mensagem: 'Não foi possível criar o evento.',
        usuario: res.locals.usuario,
      });
    }
  },

  /**
   * Lista os eventos criados pelo organizador logado.
   * @async
   * @param {Request} req Requisição HTTP.
   * @param {Response} res Resposta HTTP.
   * @returns {Promise<void>}
   * @throws {Error} Caso ocorra erro no processamento.
   */
  async meusEventos(req, res) {
    try {
      const eventos = await EventoModel.listarPorOrganizador(res.locals.usuario.id);
      res.render('eventos/meus-eventos', { titulo: 'Meus eventos', eventos });
    } catch (erro) {
      console.error('[EventoController.meusEventos]', erro.message);
      res.status(500).render('erro', {
        titulo: 'Erro interno',
        mensagem: 'Não foi possível carregar seus eventos.',
        usuario: res.locals.usuario,
      });
    }
  },

  /**
   * Exibe o formulário de edição de um evento existente.
   * @async
   * @param {Request} req Requisição HTTP.
   * @param {Response} res Resposta HTTP.
   * @returns {Promise<void>}
   * @throws {Error} Caso ocorra erro no processamento.
   */
  async exibirFormularioEdicao(req, res) {
    try {
      const evento = await EventoModel.buscarPorId(req.params.id);
      if (!evento) {
        return res.status(404).render('404', { titulo: 'Evento não encontrado', usuario: res.locals.usuario });
      }
      if (evento.usuario_id !== res.locals.usuario.id) {
        return res.status(403).render('erro', {
          titulo: 'Acesso negado',
          mensagem: 'Você não tem permissão para editar esse evento.',
          usuario: res.locals.usuario,
        });
      }
      return res.render('eventos/editar', { titulo: 'Editar evento', erros: [], evento });
    } catch (erro) {
      console.error('[EventoController.exibirFormularioEdicao]', erro.message);
      return res.status(500).render('erro', {
        titulo: 'Erro interno',
        mensagem: 'Não foi possível carregar o evento.',
        usuario: res.locals.usuario,
      });
    }
  },

  /**
   * Atualiza os dados de um evento existente.
   * @async
   * @param {Request} req Requisição HTTP.
   * @param {Response} res Resposta HTTP.
   * @returns {Promise<void>}
   * @throws {Error} Caso ocorra erro no processamento.
   */
  async atualizar(req, res) {
    const erros = validationResult(req);
    const { titulo, descricao, data_evento: dataEvento, horario, local, capacidade } = req.body;

    try {
      const evento = await EventoModel.buscarPorId(req.params.id);
      if (!evento) {
        return res.status(404).render('404', { titulo: 'Evento não encontrado', usuario: res.locals.usuario });
      }
      if (evento.usuario_id !== res.locals.usuario.id) {
        return res.status(403).render('erro', {
          titulo: 'Acesso negado',
          mensagem: 'Você não tem permissão para editar esse evento.',
          usuario: res.locals.usuario,
        });
      }

      if (!erros.isEmpty()) {
        return res.status(400).render('eventos/editar', {
          titulo: 'Editar evento',
          erros: erros.array(),
          evento: { ...evento, ...req.body },
        });
      }

      await EventoModel.atualizar(req.params.id, { titulo, descricao, dataEvento, horario, local, capacidade });
      req.session.mensagemSucesso = 'Evento atualizado com sucesso!';
      return res.redirect(`/eventos/${req.params.id}`);
    } catch (erro) {
      console.error('[EventoController.atualizar]', erro.message);
      return res.status(500).render('erro', {
        titulo: 'Erro interno',
        mensagem: 'Não foi possível atualizar o evento.',
        usuario: res.locals.usuario,
      });
    }
  },

  /**
   * Exclui um evento existente.
   * @async
   * @param {Request} req Requisição HTTP.
   * @param {Response} res Resposta HTTP.
   * @returns {Promise<void>}
   * @throws {Error} Caso ocorra erro no processamento.
   */
  async excluir(req, res) {
    try {
      const evento = await EventoModel.buscarPorId(req.params.id);
      if (!evento) {
        return res.status(404).render('404', { titulo: 'Evento não encontrado', usuario: res.locals.usuario });
      }
      if (evento.usuario_id !== res.locals.usuario.id) {
        return res.status(403).render('erro', {
          titulo: 'Acesso negado',
          mensagem: 'Você não tem permissão para excluir esse evento.',
          usuario: res.locals.usuario,
        });
      }

      await EventoModel.excluir(req.params.id);
      req.session.mensagemSucesso = 'Evento excluído com sucesso!';
      return res.redirect('/eventos/meus-eventos');
    } catch (erro) {
      console.error('[EventoController.excluir]', erro.message);
      return res.status(500).render('erro', {
        titulo: 'Erro interno',
        mensagem: 'Não foi possível excluir o evento.',
        usuario: res.locals.usuario,
      });
    }
  },

  /**
   * Lista os participantes inscritos em um evento (visão do organizador).
   * @async
   * @param {Request} req Requisição HTTP.
   * @param {Response} res Resposta HTTP.
   * @returns {Promise<void>}
   * @throws {Error} Caso ocorra erro no processamento.
   */
  async listarInscritos(req, res) {
    try {
      const evento = await EventoModel.buscarPorId(req.params.id);
      if (!evento) {
        return res.status(404).render('404', { titulo: 'Evento não encontrado', usuario: res.locals.usuario });
      }
      if (evento.usuario_id !== res.locals.usuario.id) {
        return res.status(403).render('erro', {
          titulo: 'Acesso negado',
          mensagem: 'Você não tem permissão para ver os inscritos desse evento.',
          usuario: res.locals.usuario,
        });
      }

      const inscritos = await InscricaoModel.listarPorEvento(req.params.id);
      return res.render('eventos/inscritos', { titulo: `Inscritos em ${evento.titulo}`, evento, inscritos });
    } catch (erro) {
      console.error('[EventoController.listarInscritos]', erro.message);
      return res.status(500).render('erro', {
        titulo: 'Erro interno',
        mensagem: 'Não foi possível carregar os inscritos.',
        usuario: res.locals.usuario,
      });
    }
  },
};

module.exports = EventoController;
