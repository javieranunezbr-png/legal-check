const pool = require('../../config/db');

const CAMPOS_EDITABLE = [
  'nombre','apellidos','email','telefono','direccion','tipo',
  'estado_civil','ocupacion','nacionalidad','genero','clave_unica',
  'nombre_conyuge','apellidos_conyuge','rut_conyuge','direccion_conyuge',
  'canal_llegada','abogado_id','notas',
];

async function listar({ rol, usuarioId }) {
  const params = rol === 'admin' ? [] : [usuarioId];
  const filtro = rol === 'admin' ? '' : 'AND c.abogado_id = $1';

  const { rows } = await pool.query(
    `SELECT c.*, u.nombre AS abogado_nombre
     FROM clientes c
     LEFT JOIN usuarios u ON u.id = c.abogado_id
     WHERE 1=1 ${filtro}
     ORDER BY c.nombre`,
    params
  );
  return rows;
}

async function obtenerPorId(id, { rol, usuarioId }) {
  const params = rol === 'admin' ? [id] : [usuarioId, id];
  const filtro = rol === 'admin' ? '' : 'AND c.abogado_id = $1';
  const pId    = rol === 'admin' ? '$1' : '$2';

  const { rows } = await pool.query(
    `SELECT c.*, u.nombre AS abogado_nombre
     FROM clientes c
     LEFT JOIN usuarios u ON u.id = c.abogado_id
     WHERE c.id = ${pId} ${filtro}`,
    params
  );
  return rows[0] || null;
}

async function crear(datos) {
  const {
    rut, nombre, apellidos, email, telefono, direccion, tipo,
    estado_civil, ocupacion, nacionalidad, genero, clave_unica,
    nombre_conyuge, apellidos_conyuge, rut_conyuge, direccion_conyuge,
    canal_llegada, estado, abogado_id, notas,
  } = datos;

  const { rows } = await pool.query(
    `INSERT INTO clientes (
       rut, nombre, apellidos, email, telefono, direccion, tipo,
       estado_civil, ocupacion, nacionalidad, genero, clave_unica,
       nombre_conyuge, apellidos_conyuge, rut_conyuge, direccion_conyuge,
       canal_llegada, estado, abogado_id, notas
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
     RETURNING *`,
    [
      rut, nombre, apellidos, email, telefono, direccion, tipo || 'persona',
      estado_civil, ocupacion, nacionalidad, genero, clave_unica,
      nombre_conyuge, apellidos_conyuge, rut_conyuge, direccion_conyuge,
      canal_llegada, estado || 'vigente', abogado_id, notas,
    ]
  );
  return rows[0];
}

async function actualizar(id, datos, { rol, usuarioId }) {
  // baseParams: [] para admin, [usuarioId] para abogado
  const baseParams = rol === 'admin' ? [] : [usuarioId];
  const filtro     = rol === 'admin' ? '' : 'AND abogado_id = $1';

  // Los valores van después de baseParams → $n+1 ... $n+campos
  const sets = CAMPOS_EDITABLE
    .map((c, i) => `${c} = COALESCE($${baseParams.length + i + 1}, ${c})`)
    .join(', ');

  const vals = CAMPOS_EDITABLE.map(c => datos[c] ?? null);

  // El id va al final
  const pId = `$${baseParams.length + CAMPOS_EDITABLE.length + 1}`;

  const { rows } = await pool.query(
    `UPDATE clientes SET ${sets} WHERE id = ${pId} ${filtro} RETURNING *`,
    [...baseParams, ...vals, id]
  );
  return rows[0] || null;
}

async function cambiarEstado(id, estado, { rol, usuarioId }) {
  const estadosValidos = ['vigente', 'terminado', 'derivado'];
  if (!estadosValidos.includes(estado)) {
    throw { status: 400, mensaje: `Estado inválido. Use: ${estadosValidos.join(', ')}` };
  }

  const baseParams = rol === 'admin' ? [] : [usuarioId];
  const filtro     = rol === 'admin' ? '' : 'AND abogado_id = $1';
  const pId        = `$${baseParams.length + 1}`;
  const pEstado    = `$${baseParams.length + 2}`;

  const { rows } = await pool.query(
    `UPDATE clientes SET estado = ${pEstado}
     WHERE id = ${pId} ${filtro}
     RETURNING id, nombre, estado`,
    [...baseParams, id, estado]
  );
  return rows[0] || null;
}

module.exports = { listar, obtenerPorId, crear, actualizar, cambiarEstado };
