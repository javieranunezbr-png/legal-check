const svc = require('./agenda.service');

const ctx = (req) => ({ rol: req.usuario.rol, usuarioId: req.usuario.id });

async function listar(req, res) {
  try {
    const { desde, hasta, causaId } = req.query;
    res.json(await svc.listar(ctx(req), { desde, hasta, causaId }));
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al obtener la agenda' });
  }
}

async function alertas(req, res) {
  try {
    const dias = Number(req.query.dias) || 7;
    res.json(await svc.alertas(ctx(req), dias));
  } catch {
    res.status(500).json({ mensaje: 'Error al obtener alertas' });
  }
}

async function obtener(req, res) {
  try {
    const e = await svc.obtenerPorId(req.params.id, ctx(req));
    if (!e) return res.status(404).json({ mensaje: 'Evento no encontrado' });
    res.json(e);
  } catch {
    res.status(500).json({ mensaje: 'Error al obtener el evento' });
  }
}

async function crear(req, res) {
  try {
    if (!req.body.titulo || !req.body.fecha) {
      return res.status(400).json({ mensaje: 'Título y fecha son obligatorios' });
    }
    const e = await svc.crear(req.body, req.usuario.id);
    res.status(201).json(e);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: 'Error al crear el evento' });
  }
}

async function actualizar(req, res) {
  try {
    const e = await svc.actualizar(req.params.id, req.body, ctx(req));
    if (!e) return res.status(404).json({ mensaje: 'Evento no encontrado' });
    res.json(e);
  } catch {
    res.status(500).json({ mensaje: 'Error al actualizar el evento' });
  }
}

async function eliminar(req, res) {
  try {
    const ok = await svc.eliminar(req.params.id, ctx(req));
    if (!ok) return res.status(404).json({ mensaje: 'Evento no encontrado' });
    res.json({ mensaje: 'Evento eliminado' });
  } catch {
    res.status(500).json({ mensaje: 'Error al eliminar el evento' });
  }
}

module.exports = { listar, alertas, obtener, crear, actualizar, eliminar };
