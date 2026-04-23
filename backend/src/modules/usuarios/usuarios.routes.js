const router             = require('express').Router();
const ctrl               = require('./usuarios.controller');
const { verificarToken } = require('../../middleware/auth');
const { soloAdmin }      = require('../../middleware/roles');

router.use(verificarToken, soloAdmin);

router.get('/',              ctrl.listar);
router.get('/:id',           ctrl.obtener);
router.post('/',             ctrl.crear);
router.put('/:id',           ctrl.actualizar);
router.patch('/:id/password', ctrl.cambiarPassword);

module.exports = router;
