const router          = require('express').Router();
const authController  = require('./auth.controller');
const { verificarToken } = require('../../middleware/auth');

// POST /api/auth/login
router.post('/login', authController.login);

// GET /api/auth/perfil  (requiere token)
router.get('/perfil', verificarToken, authController.perfil);

module.exports = router;
