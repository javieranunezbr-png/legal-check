const router             = require('express').Router();
const ctrl               = require('./clientes.controller');
const { verificarToken } = require('../../middleware/auth');

router.use(verificarToken);

router.get('/',                  ctrl.listar);
router.get('/:id',               ctrl.obtener);
router.post('/',                 ctrl.crear);
router.put('/:id',               ctrl.actualizar);
router.patch('/:id/estado',      ctrl.cambiarEstado);

module.exports = router;
