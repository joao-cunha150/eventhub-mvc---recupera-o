/**
 * Rota da página inicial da aplicação.
 */
const express = require('express');

const router = express.Router();

router.get('/', (req, res) => {
  res.render('index', { titulo: 'EventHub - Início' });
});

module.exports = router;
