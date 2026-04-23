const svc = require('./clientes.service');

const ctx = (req) => ({ rol: req.usuario.rol, usuarioId: req.usuario.id });

async function listar(req, res) {
  try {
    res.json(await svc.listar(ctx(req)));
  } catch {
    res.status(500).json({ mensaje: 'Error al obtener clientes' });
  }
}

async function obtener(req, res) {
  try {
    const cliente = await svc.obtenerPorId(req.params.id, ctx(req));
    if (!cliente) return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    res.json(cliente);
  } catch {
    res.status(500).json({ mensaje: 'Error al obtener cliente' });
  }
}

async function crear(req, res) {
  try {
    const { rut, nombre } = req.body;
    if (!rut || !nombre) {
      return res.status(400).json({ mensaje: 'RUT y nombre son requeridos' });
    }
    const cliente = await svc.crear(req.body);
    res.status(201).json(cliente);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ mensaje: 'El RUT ya está registrado' });
    res.status(500).json({ mensaje: 'Error al crear cliente' });
  }
}

async function actualizar(req, res) {
  try {
    const cliente = await svc.actualizar(req.params.id, req.body, ctx(req));
    if (!cliente) return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    res.json(cliente);
  } catch {
    res.status(500).json({ mensaje: 'Error al actualizar cliente' });
  }
}

async function cambiarEstado(req, res) {
  try {
    const { estado } = req.body;
    if (!estado) return res.status(400).json({ mensaje: 'Estado requerido' });
    const cliente = await svc.cambiarEstado(req.params.id, estado, ctx(req));
    if (!cliente) return res.status(404).json({ mensaje: 'Cliente no encontrado' });
    res.json(cliente);
  } catch (err) {
    const status = err.status || 500;
    res.status(status).json({ mensaje: err.mensaje || 'Error al cambiar estado' });
  }
}

module.exports = { listar, obtener, crear, actualizar, cambiarEstado };
