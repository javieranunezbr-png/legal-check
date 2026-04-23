const svc = require('./gestiones.service');

async function listar(req, res) {
  try {
    res.json(await svc.listar(req.usuario.id));
  } catch {
    res.status(500).json({ mensaje: 'Error al obtener gestiones' });
  }
}

async function crear(req, res) {
  try {
    const { nombre } = req.body;
    if (!nombre) return res.status(400).json({ mensaje: 'El nombre es requerido' });
    const g = await svc.crear(req.body, req.usuario.id);
    res.status(201).json(g);
  } catch {
    res.status(500).json({ mensaje: 'Error al crear gestión' });
  }
}

async function actualizar(req, res) {
  try {
    const g = await svc.actualizar(req.params.id, req.body, req.usuario.id);
    if (!g) return res.status(404).json({ mensaje: 'Gestión no encontrada' });
    res.json(g);
  } catch {
    res.status(500).json({ mensaje: 'Error al actualizar gestión' });
  }
}

async function eliminar(req, res) {
  try {
    const ok = await svc.eliminar(req.params.id, req.usuario.id);
    if (!ok) return res.status(404).json({ mensaje: 'Gestión no encontrada' });
    res.json({ mensaje: 'Gestión eliminada' });
  } catch {
    res.status(500).json({ mensaje: 'Error al eliminar gestión' });
  }
}

module.exports = { listar, crear, actualizar, eliminar };
