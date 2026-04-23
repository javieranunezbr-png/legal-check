const router             = require('express').Router();
const ctrl               = require('./acuerdos.controller');
const { verificarToken } = require('../../middleware/auth');

router.use(verificarToken);

router.get('/',                ctrl.listar);          // Resumen global (rol-aware)
router.get('/causa/:causaId',  ctrl.listarPorCausa);  // Por causa específica
router.get('/:id',             ctrl.obtener);
router.post('/',               ctrl.crear);
router.put('/:id',             ctrl.actualizar);

module.exports = router;
