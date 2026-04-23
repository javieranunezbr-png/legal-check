const svc = require('./presupuestos.service');

const ctx = (req) => ({ rol: req.usuario.rol, usuarioId: req.usuario.id });

async function listar(req, res) {
  try {
    res.json(await svc.listar(ctx(req)));
  } catch {
    res.status(500).json({ mensaje: 'Error al obtener presupuestos' });
  }
}

async function obtener(req, res) {
  try {
    const p = await svc.obtenerPorId(req.params.id, ctx(req));
    if (!p) return res.status(404).json({ mensaje: 'Presupuesto no encontrado' });
    res.json(p);
  } catch {
    res.status(500).json({ mensaje: 'Error al obtener presupuesto' });
  }
}

async function obtenerPublico(req, res) {
  try {
    const p = await svc.obtenerPorToken(req.params.token);
    if (!p) return res.status(404).json({ mensaje: 'Presupuesto no encontrado' });
    // No exponer datos internos sensibles
    const { id, abogado_id, ...publico } = p;
    res.json(publico);
  } catch {
    res.status(500).json({ mensaje: 'Error al obtener presupuesto' });
  }
}

async function crear(req, res) {
  try {
    const { nombre_prospecto } = req.body;
    if (!nombre_prospecto) {
      return res.status(400).json({ mensaje: 'El nombre del prospecto es requerido' });
    }
    const p = await svc.crear(req.body, req.usuario.id);
    res.status(201).json(p);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al crear presupuesto' });
  }
}

async function actualizar(req, res) {
  try {
    const p = await svc.actualizar(req.params.id, req.body, ctx(req));
    if (!p) return res.status(404).json({ mensaje: 'Presupuesto no encontrado' });
    res.json(p);
  } catch {
    res.status(500).json({ mensaje: 'Error al actualizar presupuesto' });
  }
}

async function responder(req, res) {
  try {
    const { accion } = req.body;
    const p = await svc.responder(req.params.token, accion);
    if (!p) return res.status(404).json({ mensaje: 'Presupuesto no encontrado' });
    res.json({ estado: p.estado, respondido_en: p.respondido_en });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ mensaje: err.mensaje || 'Error al responder presupuesto' });
  }
}

async function eliminar(req, res) {
  try {
    const ok = await svc.eliminar(req.params.id, ctx(req));
    if (!ok) return res.status(404).json({ mensaje: 'Presupuesto no encontrado' });
    res.json({ mensaje: 'Presupuesto eliminado' });
  } catch {
    res.status(500).json({ mensaje: 'Error al eliminar presupuesto' });
  }
}

module.exports = { listar, obtener, obtenerPublico, crear, actualizar, responder, eliminar };
