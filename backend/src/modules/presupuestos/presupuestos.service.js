const crypto = require('crypto');
const pool   = require('../../config/db');

async function listar({ rol, usuarioId }) {
  const params = rol === 'admin' ? [] : [usuarioId];
  const filtro = rol === 'admin' ? '' : 'AND p.abogado_id = $1';

  const { rows } = await pool.query(
    `SELECT p.*, u.nombre AS abogado_nombre
     FROM presupuestos p
     LEFT JOIN usuarios u ON u.id = p.abogado_id
     WHERE 1=1 ${filtro}
     ORDER BY p.creado_en DESC`,
    params
  );
  return rows;
}

async function obtenerPorId(id, { rol, usuarioId }) {
  const params = rol === 'admin' ? [id] : [usuarioId, id];
  const filtro = rol === 'admin' ? '' : 'AND p.abogado_id = $1';
  const pId    = rol === 'admin' ? '$1' : '$2';

  const { rows } = await pool.query(
    `SELECT p.*, u.nombre AS abogado_nombre, u.email AS abogado_email
     FROM presupuestos p
     LEFT JOIN usuarios u ON u.id = p.abogado_id
     WHERE p.id = ${pId} ${filtro}`,
    params
  );
  return rows[0] || null;
}

async function obtenerPorToken(token) {
  const { rows } = await pool.query(
    `SELECT p.*, u.nombre AS abogado_nombre, u.email AS abogado_email
     FROM presupuestos p
     LEFT JOIN usuarios u ON u.id = p.abogado_id
     WHERE p.token_unico = $1`,
    [token]
  );
  return rows[0] || null;
}

async function crear(datos, abogadoId) {
  const {
    nombre_prospecto, correo, telefono, descripcion, materias,
    honorarios_total, numero_cuotas, monto_cuota, fecha_primera_cuota,
    notas, estado,
  } = datos;

  const token = crypto.randomBytes(24).toString('hex');

  const { rows } = await pool.query(
    `INSERT INTO presupuestos (
       abogado_id, nombre_prospecto, correo, telefono, descripcion, materias,
       honorarios_total, numero_cuotas, monto_cuota, fecha_primera_cuota,
       notas, estado, token_unico
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
     RETURNING *`,
    [
      abogadoId, nombre_prospecto, correo || null, telefono || null,
      descripcion || null, materias || [],
      honorarios_total || 0, numero_cuotas || 1, monto_cuota || 0,
      fecha_primera_cuota || null, notas || null,
      estado || 'borrador', token,
    ]
  );
  return rows[0];
}

const CAMPOS_EDITABLE = [
  'nombre_prospecto','correo','telefono','descripcion','materias',
  'honorarios_total','numero_cuotas','monto_cuota','fecha_primera_cuota',
  'notas','estado',
];

async function actualizar(id, datos, { rol, usuarioId }) {
  const baseParams = rol === 'admin' ? [] : [usuarioId];
  const filtro     = rol === 'admin' ? '' : 'AND abogado_id = $1';

  const sets = CAMPOS_EDITABLE
    .map((c, i) => `${c} = COALESCE($${baseParams.length + i + 1}, ${c})`)
    .join(', ');

  const vals = CAMPOS_EDITABLE.map(c => datos[c] ?? null);

  const pId = `$${baseParams.length + CAMPOS_EDITABLE.length + 1}`;

  const { rows } = await pool.query(
    `UPDATE presupuestos SET ${sets} WHERE id = ${pId} ${filtro} RETURNING *`,
    [...baseParams, ...vals, id]
  );
  return rows[0] || null;
}

async function responder(token, accion) {
  if (!['aceptado','rechazado'].includes(accion)) {
    throw { status: 400, mensaje: 'Acción inválida. Use "aceptado" o "rechazado"' };
  }

  const actual = await obtenerPorToken(token);
  if (!actual) return null;
  if (!['enviado','borrador'].includes(actual.estado)) {
    throw { status: 400, mensaje: `El presupuesto ya fue ${actual.estado}` };
  }

  const { rows } = await pool.query(
    `UPDATE presupuestos
     SET estado = $1, respondido_en = NOW()
     WHERE token_unico = $2
     RETURNING *`,
    [accion, token]
  );
  return rows[0];
}

async function eliminar(id, { rol, usuarioId }) {
  const baseParams = rol === 'admin' ? [] : [usuarioId];
  const filtro     = rol === 'admin' ? '' : 'AND abogado_id = $1';
  const pId        = `$${baseParams.length + 1}`;

  const { rowCount } = await pool.query(
    `DELETE FROM presupuestos WHERE id = ${pId} ${filtro}`,
    [...baseParams, id]
  );
  return rowCount > 0;
}

module.exports = {
  listar, obtenerPorId, obtenerPorToken, crear, actualizar, responder, eliminar,
};
