const router = require('express').Router();
const ctrl   = require('./portal.controller');

// Rutas 100% públicas — el cliente completa su ficha desde el link del correo
router.get('/:token',  ctrl.obtenerPublico);
router.post('/:token', ctrl.completar);

module.exports = router;
