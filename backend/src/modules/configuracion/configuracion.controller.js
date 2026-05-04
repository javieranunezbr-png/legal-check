const svc = require('./configuracion.service');

async function obtener(req, res) {
  try {
    const c = await svc.obtener(req.usuario.id);
    res.json(c);
  } catch {
    res.status(500).json({ mensaje: 'Error al obtener configuración' });
  }
}

async function actualizar(req, res) {
  try {
    const c = await svc.actualizar(req.usuario.id, req.body);
    res.json(c);
  } catch {
    res.status(500).json({ mensaje: 'Error al actualizar configuración' });
  }
}

module.exports = { obtener, actualizar };
