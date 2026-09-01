/**
 * Controller responsável pelas operações de autenticação (cadastro, login, logout).
 */
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const UsuarioModel = require('../models/usuarioModel');

const SALT_ROUNDS = 10;

const AuthController = {
  /**
   * Renderiza a página de cadastro.
   * @param {Request} req Requisição HTTP.
   * @param {Response} res Resposta HTTP.
   * @returns {void}
   */
  exibirCadastro(req, res) {
    res.render('auth/cadastro', { titulo: 'Criar conta', erros: [], dados: {} });
  },

  /**
   * Renderiza a página de login.
   * @param {Request} req Requisição HTTP.
   * @param {Response} res Resposta HTTP.
   * @returns {void}
   */
  exibirLogin(req, res) {
    res.render('auth/login', { titulo: 'Entrar', erros: [], dados: {} });
  },

  /**
   * Processa o cadastro de um novo usuário.
   * @async
   * @param {Request} req Requisição HTTP.
   * @param {Response} res Resposta HTTP.
   * @returns {Promise<void>}
   * @throws {Error} Caso ocorra erro no processamento.
   */
  async cadastrar(req, res) {
    const erros = validationResult(req);
    const { nome, email, senha, tipo_usuario: tipoUsuario } = req.body;

    if (!erros.isEmpty()) {
      return res.status(400).render('auth/cadastro', {
        titulo: 'Criar conta',
        erros: erros.array(),
        dados: { nome, email, tipo_usuario: tipoUsuario },
      });
    }

    try {
      const usuarioExistente = await UsuarioModel.buscarPorEmail(email);
      if (usuarioExistente) {
        return res.status(400).render('auth/cadastro', {
          titulo: 'Criar conta',
          erros: [{ msg: 'Este e-mail já está cadastrado.' }],
          dados: { nome, email, tipo_usuario: tipoUsuario },
        });
      }

      const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);
      await UsuarioModel.criar({ nome, email, senhaHash, tipoUsuario });

      req.session.mensagemSucesso = 'Conta criada com sucesso! Faça login para continuar.';
      return res.redirect('/auth/login');
    } catch (erro) {
      console.error('[AuthController.cadastrar]', erro.message);
      return res.status(500).render('erro', {
        titulo: 'Erro interno',
        mensagem: 'Não foi possível concluir o cadastro. Tente novamente.',
        usuario: null,
      });
    }
  },

  /**
   * Realiza o login de um usuário.
   * @async
   * @param {Request} req Requisição HTTP.
   * @param {Response} res Resposta HTTP.
   * @returns {Promise<void>}
   * @throws {Error} Caso ocorra erro no processamento.
   */
  async login(req, res) {
    const erros = validationResult(req);
    const { email, senha } = req.body;

    if (!erros.isEmpty()) {
      return res.status(400).render('auth/login', {
        titulo: 'Entrar',
        erros: erros.array(),
        dados: { email },
      });
    }

    try {
      const usuario = await UsuarioModel.buscarPorEmail(email);

      if (!usuario) {
        return res.status(400).render('auth/login', {
          titulo: 'Entrar',
          erros: [{ msg: 'E-mail ou senha inválidos.' }],
          dados: { email },
        });
      }

      const senhaValida = await bcrypt.compare(senha, usuario.senha);
      if (!senhaValida) {
        return res.status(400).render('auth/login', {
          titulo: 'Entrar',
          erros: [{ msg: 'E-mail ou senha inválidos.' }],
          dados: { email },
        });
      }

      req.session.usuario = {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipo_usuario: usuario.tipo_usuario,
      };

      return res.redirect('/eventos');
    } catch (erro) {
      console.error('[AuthController.login]', erro.message);
      return res.status(500).render('erro', {
        titulo: 'Erro interno',
        mensagem: 'Não foi possível realizar o login. Tente novamente.',
        usuario: null,
      });
    }
  },

  /**
   * Realiza o logout do usuário, destruindo a sessão.
   * @param {Request} req Requisição HTTP.
   * @param {Response} res Resposta HTTP.
   * @returns {void}
   */
  logout(req, res) {
    req.session.destroy((erro) => {
      if (erro) {
        console.error('[AuthController.logout]', erro.message);
      }
      res.clearCookie('connect.sid');
      res.redirect('/auth/login');
    });
  },
};

module.exports = AuthController;
