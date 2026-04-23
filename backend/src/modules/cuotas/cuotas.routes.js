const router             = require('express').Router();
const ctrl               = require('./cuotas.controller');
const { verificarToken } = require('../../middleware/auth');
const { soloAdmin }      = require('../../middleware/roles');

router.use(verificarToken);

// Cuotas de un acuerdo específico
router.get('/acuerdo/:acuerdoId',    ctrl.listarPorAcuerdo);

// Marcar como pagada
router.patch('/:id/pagar',           ctrl.marcarPagada);

// Actualizar vencidas (solo admin o llamada interna/cron)
router.post('/actualizar-vencidas',  soloAdmin, ctrl.actualizarVencidas);

module.exports = router;
