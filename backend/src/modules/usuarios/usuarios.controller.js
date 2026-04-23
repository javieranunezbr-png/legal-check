const usuariosService = require('./usuarios.service');

async function listar(req, res) {
  try {
    const usuarios = await usuariosService.listar();
    res.json(usuarios);
  } catch {
    res.status(500).json({ mensaje: 'Error al obtener usuarios' });
  }
}

async function obtener(req, res) {
  try {
    const usuario = await usuariosService.obtenerPorId(req.params.id);
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    res.json(usuario);
  } catch {
    res.status(500).json({ mensaje: 'Error al obtener usuario' });
  }
}

async function crear(req, res) {
  try {
    const { nombre, email, password, rol } = req.body;
    if (!nombre || !email || !password || !rol) {
      return res.status(400).json({ mensaje: 'Todos los campos son requeridos' });
    }
    if (!['admin', 'abogado'].includes(rol)) {
      return res.status(400).json({ mensaje: 'Rol inválido' });
    }
    const usuario = await usuariosService.crear({ nombre, email, password, rol });
    res.status(201).json(usuario);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ mensaje: 'El email ya está registrado' });
    }
    res.status(500).json({ mensaje: 'Error al crear usuario' });
  }
}

async function actualizar(req, res) {
  try {
    const usuario = await usuariosService.actualizar(req.params.id, req.body);
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    res.json(usuario);
  } catch {
    res.status(500).json({ mensaje: 'Error al actualizar usuario' });
  }
}

async function cambiarPassword(req, res) {
  try {
    const { password } = req.body;
    if (!password || password.length < 8) {
      return res.status(400).json({ mensaje: 'La contraseña debe tener al menos 8 caracteres' });
    }
    await usuariosService.cambiarPassword(req.params.id, password);
    res.json({ mensaje: 'Contraseña actualizada' });
  } catch {
    res.status(500).json({ mensaje: 'Error al cambiar contraseña' });
  }
}

module.exports = { listar, obtener, crear, actualizar, cambiarPassword };
