const router             = require('express').Router();
const ctrl               = require('./portal.controller');
const { verificarToken } = require('../../middleware/auth');

// Rutas públicas (sin auth) — el cliente completa el formulario
router.get('/:token',           ctrl.obtenerPublico);
router.post('/:token/completar', ctrl.completar);

// Rutas privadas — el abogado marca primer pago de un presupuesto
router.use(verificarToken);
router.post('/presupuesto/:id/marcar-primer-pago', ctrl.marcarPrimerPago);

module.exports = router;
