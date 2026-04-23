const svc = require('./acuerdos.service');

const ctx = (req) => ({ rol: req.usuario.rol, usuarioId: req.usuario.id });

async function listar(req, res) {
  try {
    res.json(await svc.listarTodos(ctx(req)));
  } catch {
    res.status(500).json({ mensaje: 'Error al obtener acuerdos' });
  }
}

async function listarPorCausa(req, res) {
  try {
    res.json(await svc.listarPorCausa(req.params.causaId));
  } catch {
    res.status(500).json({ mensaje: 'Error al obtener acuerdos' });
  }
}

async function obtener(req, res) {
  try {
    const acuerdo = await svc.obtenerPorId(req.params.id);
    if (!acuerdo) return res.status(404).json({ mensaje: 'Acuerdo no encontrado' });
    res.json(acuerdo);
  } catch {
    res.status(500).json({ mensaje: 'Error al obtener acuerdo' });
  }
}

async function crear(req, res) {
  try {
    const { causa_id, monto_total, tipo_cobro, fecha_acuerdo } = req.body;
    if (!causa_id || !monto_total || !tipo_cobro || !fecha_acuerdo) {
      return res.status(400).json({ mensaje: 'causa_id, monto_total, tipo_cobro y fecha_acuerdo son requeridos' });
    }
    if (['cuotas', 'mixto'].includes(tipo_cobro)) {
      if (!req.body.cantidad_cuotas || !req.body.fecha_primera_cuota) {
        return res.status(400).json({ mensaje: 'cantidad_cuotas y fecha_primera_cuota son requeridos para este tipo de cobro' });
      }
    }
    const acuerdo = await svc.crear(req.body);
    res.status(201).json(acuerdo);
  } catch (err) {
    if (err.code === '23503') return res.status(400).json({ mensaje: 'Causa no encontrada' });
    res.status(500).json({ mensaje: 'Error al crear acuerdo' });
  }
}

async function actualizar(req, res) {
  try {
    const acuerdo = await svc.actualizar(req.params.id, req.body);
    if (!acuerdo) return res.status(404).json({ mensaje: 'Acuerdo no encontrado' });
    res.json(acuerdo);
  } catch {
    res.status(500).json({ mensaje: 'Error al actualizar acuerdo' });
  }
}

module.exports = { listar, listarPorCausa, obtener, crear, actualizar };
