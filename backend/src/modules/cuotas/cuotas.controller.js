const svc = require('./cuotas.service');

async function listarPorAcuerdo(req, res) {
  try {
    res.json(await svc.listarPorAcuerdo(req.params.acuerdoId));
  } catch {
    res.status(500).json({ mensaje: 'Error al obtener cuotas' });
  }
}

async function marcarPagada(req, res) {
  try {
    const cuota = await svc.marcarPagada(req.params.id, req.body);
    res.json(cuota);
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ mensaje: err.mensaje || 'Error al marcar cuota como pagada' });
  }
}

async function actualizarFecha(req, res) {
  try {
    const cuota = await svc.actualizarFechaVencimiento(req.params.id, req.body.fecha_vencimiento);
    res.json(cuota);
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ mensaje: err.mensaje || 'Error al actualizar fecha' });
  }
}

async function actualizarVencidas(req, res) {
  try {
    const resultado = await svc.actualizarVencidas();
    res.json({ mensaje: `${resultado.actualizadas} cuota(s) marcadas como vencidas`, ...resultado });
  } catch {
    res.status(500).json({ mensaje: 'Error al actualizar cuotas vencidas' });
  }
}

module.exports = { listarPorAcuerdo, marcarPagada, actualizarFecha, actualizarVencidas };
