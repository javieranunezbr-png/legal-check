const router             = require('express').Router();
const ctrl               = require('./documentos.controller');
const { verificarToken } = require('../../middleware/auth');

router.use(verificarToken);

// GET /api/documentos/cliente/:id?tipo=mandato|contrato
router.get('/cliente/:id', ctrl.generar);

module.exports = router;
