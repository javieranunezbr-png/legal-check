const svc = require('./causas.service');

const ctx = (req) => ({ rol: req.usuario.rol, usuarioId: req.usuario.id });

async function listar(req, res) {
  try {
    res.json(await svc.listar({ ...ctx(req), clienteId: req.query.cliente_id }));
  } catch {
    res.status(500).json({ mensaje: 'Error al obtener causas' });
  }
}

async function obtener(req, res) {
  try {
    const causa = await svc.obtenerPorId(req.params.id, ctx(req));
    if (!causa) return res.status(404).json({ mensaje: 'Causa no encontrada' });
    res.json(causa);
  } catch {
    res.status(500).json({ mensaje: 'Error al obtener causa' });
  }
}

async function crear(req, res) {
  try {
    const { titulo, cliente_id, abogado_id, fecha_inicio } = req.body;
    if (!titulo || !cliente_id || !abogado_id || !fecha_inicio) {
      return res.status(400).json({ mensaje: 'título, cliente_id, abogado_id y fecha_inicio son requeridos' });
    }
    const causa = await svc.crear(req.body);
    res.status(201).json(causa);
  } catch (err) {
    if (err.code === '23503') return res.status(400).json({ mensaje: 'Cliente o abogado no existe' });
    res.status(500).json({ mensaje: 'Error al crear causa' });
  }
}

async function actualizar(req, res) {
  try {
    const causa = await svc.actualizar(req.params.id, req.body, ctx(req));
    if (!causa) return res.status(404).json({ mensaje: 'Causa no encontrada' });
    res.json(causa);
  } catch {
    res.status(500).json({ mensaje: 'Error al actualizar causa' });
  }
}

async function cambiarEstado(req, res) {
  try {
    const { estado } = req.body;
    if (!estado) return res.status(400).json({ mensaje: 'Estado requerido' });
    const causa = await svc.cambiarEstado(req.params.id, estado, ctx(req));
    if (!causa) return res.status(404).json({ mensaje: 'Causa no encontrada' });
    res.json(causa);
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ mensaje: err.mensaje || 'Error al cambiar estado' });
  }
}

module.exports = { listar, obtener, crear, actualizar, cambiarEstado };
