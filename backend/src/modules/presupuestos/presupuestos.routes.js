const router             = require('express').Router();
const ctrl               = require('./presupuestos.controller');
const { verificarToken } = require('../../middleware/auth');

// Rutas públicas (sin auth) — deben ir antes del middleware
router.get('/public/:token',          ctrl.obtenerPublico);
router.patch('/:token/responder',     ctrl.responder);

// Rutas privadas
router.use(verificarToken);

router.post('/:id/enviar-correo', ctrl.enviarCorreo);
router.post('/:id/marcar-enviado', ctrl.marcarEnviado);

router.get('/',          ctrl.listar);
router.get('/:id',       ctrl.obtener);
router.post('/',         ctrl.crear);
router.put('/:id',       ctrl.actualizar);
router.delete('/:id',    ctrl.eliminar);

module.exports = router;
