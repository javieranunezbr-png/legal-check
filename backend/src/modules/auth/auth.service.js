const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const pool    = require('../../config/db');

async function login(email, password) {
  const { rows } = await pool.query(
    'SELECT id, nombre, email, password, rol, activo FROM usuarios WHERE email = $1',
    [email]
  );

  const usuario = rows[0];
  if (!usuario) {
    throw { status: 401, mensaje: 'Credenciales incorrectas' };
  }
  if (!usuario.activo) {
    throw { status: 403, mensaje: 'Usuario desactivado' };
  }

  const passwordValida = await bcrypt.compare(password, usuario.password);
  if (!passwordValida) {
    throw { status: 401, mensaje: 'Credenciales incorrectas' };
  }

  const payload = { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol };
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  });

  return { token, usuario: payload };
}

async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

module.exports = { login, hashPassword };
