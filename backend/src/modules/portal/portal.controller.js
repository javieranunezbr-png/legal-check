const svc = require('./portal.service');

async function obtenerPublico(req, res) {
  try {
    const p = await svc.obtenerPorToken(req.params.token);
    if (!p) return res.status(404).json({ mensaje: 'Portal no encontrado' });
    res.json(p);
  } catch {
    res.status(500).json({ mensaje: 'Error al obtener portal' });
  }
}

async function completar(req, res) {
  try {
    const r = await svc.completarPortal(req.params.token, req.body);
    res.json({ mensaje: 'Datos recibidos', ...r });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ mensaje: err.mensaje || 'Error al guardar datos' });
  }
}

async function marcarPrimerPago(req, res) {
  try {
    const ctx = { rol: req.usuario.rol, usuarioId: req.usuario.id };
    const p = await svc.marcarPrimerPago(req.params.id, ctx);
    if (!p) return res.status(404).json({ mensaje: 'Presupuesto no encontrado' });
    res.json({
      portal_token: p.portal_token,
      primer_pago_recibido_en: p.primer_pago_recibido_en,
    });
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ mensaje: err.mensaje || 'Error al marcar pago' });
  }
}

module.exports = { obtenerPublico, completar, marcarPrimerPago };
