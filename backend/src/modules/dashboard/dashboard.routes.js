const router             = require('express').Router();
const ctrl               = require('./dashboard.controller');
const { verificarToken } = require('../../middleware/auth');

router.use(verificarToken);

router.get('/resumen', ctrl.resumen);

module.exports = router;
