const svc = require('./documentos.service');

async function generar(req, res) {
  try {
    const ctx = { rol: req.usuario.rol, usuarioId: req.usuario.id };
    const doc = await svc.generar(req.params.id, req.query.tipo, ctx);
    if (!doc) return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    res.json(doc);
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ mensaje: err.mensaje || 'Error al generar el documento' });
  }
}

module.exports = { generar };
