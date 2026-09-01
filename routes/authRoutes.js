/**
 * Rotas de autenticação (cadastro, login, logout).
 */
const express = require('express');
const { body } = require('express-validator');
const AuthController = require('../controllers/authController');
const { visitante } = require('../middlewares/authMiddleware');

const router = express.Router();

const validacaoCadastro = [
  body('nome').trim().notEmpty().withMessage('O nome é obrigatório.')
    .isLength({ min: 3 }).withMessage('O nome deve ter ao menos 3 caracteres.'),
  body('email').trim().isEmail().withMessage('Informe um e-mail válido.').normalizeEmail(),
  body('senha').isLength({ min: 6 }).withMessage('A senha deve ter ao menos 6 caracteres.'),
  body('tipo_usuario').isIn(['organizador', 'participante']).withMessage('Tipo de usuário inválido.'),
];

const validacaoLogin = [
  body('email').trim().isEmail().withMessage('Informe um e-mail válido.').normalizeEmail(),
  body('senha').notEmpty().withMessage('A senha é obrigatória.'),
];

router.get('/cadastro', visitante, AuthController.exibirCadastro);
router.post('/cadastro', visitante, validacaoCadastro, AuthController.cadastrar);

router.get('/login', visitante, AuthController.exibirLogin);
router.post('/login', visitante, validacaoLogin, AuthController.login);

router.post('/logout', AuthController.logout);
router.get('/logout', AuthController.logout);

module.exports = router;
