const svc = require('./portal.service');

async function obtenerPublico(req, res) {
  try {
    const c = await svc.obtenerPorToken(req.params.token);
    if (!c) return res.status(404).json({ mensaje: 'Link no válido o expirado' });
    res.json(c);
  } catch {
    res.status(500).json({ mensaje: 'Error al cargar el portal' });
  }
}

async function completar(req, res) {
  try {
    const r = await svc.completarPortal(req.params.token, req.body);
    res.json({ mensaje: '¡Tus datos fueron recibidos. Bienvenido/a!', ...r });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ mensaje: err.mensaje || 'Error al guardar datos' });
  }
}

module.exports = { obtenerPublico, completar };
