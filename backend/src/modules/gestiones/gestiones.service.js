const pool = require('../../config/db');

async function listar(abogadoId) {
  const { rows } = await pool.query(
    `SELECT * FROM gestiones WHERE abogado_id = $1 ORDER BY nombre`,
    [abogadoId]
  );
  return rows;
}

async function crear({ nombre, precio_sugerido, descripcion }, abogadoId) {
  const { rows } = await pool.query(
    `INSERT INTO gestiones (abogado_id, nombre, precio_sugerido, descripcion)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (abogado_id, nombre) DO UPDATE
       SET precio_sugerido = EXCLUDED.precio_sugerido,
           descripcion     = EXCLUDED.descripcion
     RETURNING *`,
    [abogadoId, nombre, precio_sugerido || 0, descripcion || null]
  );
  return rows[0];
}

async function actualizar(id, { nombre, precio_sugerido, descripcion }, abogadoId) {
  const { rows } = await pool.query(
    `UPDATE gestiones
     SET nombre = COALESCE($1, nombre),
         precio_sugerido = COALESCE($2, precio_sugerido),
         descripcion = COALESCE($3, descripcion)
     WHERE id = $4 AND abogado_id = $5
     RETURNING *`,
    [nombre ?? null, precio_sugerido ?? null, descripcion ?? null, id, abogadoId]
  );
  return rows[0] || null;
}

async function eliminar(id, abogadoId) {
  const { rowCount } = await pool.query(
    `DELETE FROM gestiones WHERE id = $1 AND abogado_id = $2`,
    [id, abogadoId]
  );
  return rowCount > 0;
}

/**
 * Busca gestión por nombre (case-insensitive) en el catálogo del abogado.
 * Si no existe, la crea. Retorna id.
 */
async function upsertPorNombre(client, { nombre, precio, detalle }, abogadoId) {
  const nombreTrim = (nombre || '').trim();
  if (!nombreTrim) return null;

  const { rows: existentes } = await client.query(
    `SELECT id FROM gestiones
     WHERE abogado_id = $1 AND LOWER(nombre) = LOWER($2)
     LIMIT 1`,
    [abogadoId, nombreTrim]
  );
  if (existentes[0]) return existentes[0].id;

  const { rows } = await client.query(
    `INSERT INTO gestiones (abogado_id, nombre, precio_sugerido, descripcion)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [abogadoId, nombreTrim, precio || 0, detalle || null]
  );
  return rows[0].id;
}

module.exports = { listar, crear, actualizar, eliminar, upsertPorNombre };
