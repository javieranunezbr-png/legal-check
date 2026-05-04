const router             = require('express').Router();
const ctrl               = require('./configuracion.controller');
const { verificarToken } = require('../../middleware/auth');

router.use(verificarToken);

router.get('/',  ctrl.obtener);
router.put('/',  ctrl.actualizar);

module.exports = router;
