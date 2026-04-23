const pool        = require('../../config/db');
const { hashPassword } = require('../auth/auth.service');

const CAMPOS_PUBLICOS = 'id, nombre, email, rol, activo, creado_en';

async function listar() {
  const { rows } = await pool.query(
    `SELECT ${CAMPOS_PUBLICOS} FROM usuarios ORDER BY nombre`
  );
  return rows;
}

async function obtenerPorId(id) {
  const { rows } = await pool.query(
    `SELECT ${CAMPOS_PUBLICOS} FROM usuarios WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
}

async function crear({ nombre, email, password, rol }) {
  const hash = await hashPassword(password);
  const { rows } = await pool.query(
    `INSERT INTO usuarios (nombre, email, password, rol)
     VALUES ($1, $2, $3, $4)
     RETURNING ${CAMPOS_PUBLICOS}`,
    [nombre, email.trim().toLowerCase(), hash, rol]
  );
  return rows[0];
}

async function actualizar(id, { nombre, email, rol, activo }) {
  const { rows } = await pool.query(
    `UPDATE usuarios
     SET nombre = COALESCE($1, nombre),
         email  = COALESCE($2, email),
         rol    = COALESCE($3, rol),
         activo = COALESCE($4, activo)
     WHERE id = $5
     RETURNING ${CAMPOS_PUBLICOS}`,
    [nombre, email, rol, activo, id]
  );
  return rows[0] || null;
}

async function cambiarPassword(id, nuevaPassword) {
  const hash = await hashPassword(nuevaPassword);
  await pool.query('UPDATE usuarios SET password = $1 WHERE id = $2', [hash, id]);
}

module.exports = { listar, obtenerPorId, crear, actualizar, cambiarPassword };
