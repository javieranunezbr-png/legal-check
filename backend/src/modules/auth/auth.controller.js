const authService = require('./auth.service');

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ mensaje: 'Email y contraseña son requeridos' });
    }

    const resultado = await authService.login(email.trim().toLowerCase(), password);
    return res.json(resultado);
  } catch (err) {
    const status = err.status || 500;
    const mensaje = err.mensaje || 'Error interno del servidor';
    return res.status(status).json({ mensaje });
  }
}

async function perfil(req, res) {
  return res.json({ usuario: req.usuario });
}

module.exports = { login, perfil };
