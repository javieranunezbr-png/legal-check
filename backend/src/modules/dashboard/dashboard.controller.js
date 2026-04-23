const svc = require('./dashboard.service');

async function resumen(req, res) {
  try {
    const datos = await svc.resumen({ rol: req.usuario.rol, usuarioId: req.usuario.id });
    res.json(datos);
  } catch {
    res.status(500).json({ mensaje: 'Error al obtener resumen del dashboard' });
  }
}

module.exports = { resumen };
