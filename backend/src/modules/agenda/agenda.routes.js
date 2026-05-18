const router             = require('express').Router();
const ctrl               = require('./agenda.controller');
const { verificarToken } = require('../../middleware/auth');

router.use(verificarToken);

router.get('/',            ctrl.listar);
router.get('/alertas',     ctrl.alertas);
router.get('/:id',         ctrl.obtener);
router.post('/',           ctrl.crear);
router.put('/:id',         ctrl.actualizar);
router.delete('/:id',      ctrl.eliminar);

module.exports = router;
