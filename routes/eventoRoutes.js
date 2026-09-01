/**
 * Rotas de eventos e inscrições.
 */
const express = require('express');
const { body } = require('express-validator');
const EventoController = require('../controllers/eventoController');
const InscricaoController = require('../controllers/inscricaoController');
const { autenticado, permitirTipos } = require('../middlewares/authMiddleware');

const router = express.Router();

const validacaoEvento = [
  body('titulo').trim().notEmpty().withMessage('O título é obrigatório.'),
  body('descricao').trim().notEmpty().withMessage('A descrição é obrigatória.'),
  body('data_evento').notEmpty().withMessage('A data do evento é obrigatória.')
    .isDate().withMessage('Informe uma data válida.'),
  body('horario').trim().notEmpty().withMessage('O horário é obrigatório.'),
  body('local').trim().notEmpty().withMessage('O local é obrigatório.'),
  body('capacidade').optional({ checkFalsy: true }).isInt({ min: 1 }).withMessage('Capacidade deve ser um número inteiro positivo.'),
];

// Rotas específicas (precisam vir antes de /:id para não conflitar)
router.get('/meus-eventos', autenticado, permitirTipos('organizador'), EventoController.meusEventos);
router.get('/minhas-inscricoes', autenticado, permitirTipos('participante'), InscricaoController.minhasInscricoes);

router.get('/criar', autenticado, permitirTipos('organizador'), EventoController.exibirFormularioCriacao);
router.post('/criar', autenticado, permitirTipos('organizador'), validacaoEvento, EventoController.criar);

router.get('/', EventoController.listar);
router.get('/:id', EventoController.detalhes);

router.get('/:id/editar', autenticado, permitirTipos('organizador'), EventoController.exibirFormularioEdicao);
router.post('/:id/editar', autenticado, permitirTipos('organizador'), validacaoEvento, EventoController.atualizar);
router.post('/:id/excluir', autenticado, permitirTipos('organizador'), EventoController.excluir);

router.get('/:id/inscritos', autenticado, permitirTipos('organizador'), EventoController.listarInscritos);

router.post('/:id/inscrever', autenticado, permitirTipos('participante'), InscricaoController.inscrever);
router.post('/:id/cancelar-inscricao', autenticado, permitirTipos('participante'), InscricaoController.cancelar);

module.exports = router;
