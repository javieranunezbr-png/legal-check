const pool = require('../../config/db');

async function listar({ rol, usuarioId, clienteId }) {
  const params  = rol === 'admin' ? [] : [usuarioId];
  const filtroRol = rol === 'admin' ? '' : 'AND ca.abogado_id = $1';

  let filtroCliente = '';
  if (clienteId) {
    params.push(parseInt(clienteId));
    filtroCliente = `AND ca.cliente_id = $${params.length}`;
  }

  const sql = `
    SELECT ca.*,
           cl.nombre        AS cliente_nombre,
           cl.apellidos     AS cliente_apellidos,
           cl.rut           AS cliente_rut,
           u.nombre         AS abogado_nombre,
           -- Indica si hay cuotas vencidas en esta causa
           EXISTS (
             SELECT 1 FROM acuerdos_cobro a
             JOIN cuotas q ON q.acuerdo_id = a.id
             WHERE a.causa_id = ca.id AND q.estado = 'vencida'
           ) AS tiene_cuotas_vencidas,
           -- Fecha de la próxima cuota pendiente
           (SELECT MIN(q.fecha_vencimiento) FROM acuerdos_cobro a
            JOIN cuotas q ON q.acuerdo_id = a.id
            WHERE a.causa_id = ca.id AND q.estado = 'pendiente'
           ) AS proxima_cuota_fecha
    FROM causas ca
    JOIN clientes cl ON cl.id = ca.cliente_id
    JOIN usuarios u  ON u.id  = ca.abogado_id
    WHERE 1=1 ${filtroRol} ${filtroCliente}
    ORDER BY ca.creado_en DESC
  `;
  const { rows } = await pool.query(sql, params);
  return rows;
}

async function obtenerPorId(id, { rol, usuarioId }) {
  const params = rol === 'admin' ? [id] : [usuarioId, id];
  const filtro = rol === 'admin' ? '' : 'AND ca.abogado_id = $1';
  const paramId = rol === 'admin' ? '$1' : '$2';

  const sql = `
    SELECT ca.*,
           cl.nombre        AS cliente_nombre,
           cl.apellidos     AS cliente_apellidos,
           cl.rut           AS cliente_rut,
           u.nombre         AS abogado_nombre
    FROM causas ca
    JOIN clientes cl ON cl.id = ca.cliente_id
    JOIN usuarios u  ON u.id  = ca.abogado_id
    WHERE ca.id = ${paramId} ${filtro}
  `;
  const { rows } = await pool.query(sql, params);
  return rows[0] || null;
}

async function crear({ titulo, descripcion, rol_causa, tribunal, materia, estado, cliente_id, abogado_id, fecha_inicio, fecha_termino }) {
  const { rows } = await pool.query(
    `INSERT INTO causas (titulo, descripcion, rol_causa, tribunal, materia, estado, cliente_id, abogado_id, fecha_inicio, fecha_termino)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     RETURNING *`,
    [titulo, descripcion, rol_causa, tribunal, materia, estado || 'activa', cliente_id, abogado_id, fecha_inicio, fecha_termino]
  );
  return rows[0];
}

async function actualizar(id, datos, { rol, usuarioId }) {
  const filtro = rol === 'admin' ? '' : 'AND abogado_id = $1';
  const params = rol === 'admin' ? [] : [usuarioId];
  const p = (n) => `$${params.length + n}`;

  const sql = `
    UPDATE causas SET
      titulo        = COALESCE(${p(1)}, titulo),
      descripcion   = COALESCE(${p(2)}, descripcion),
      rol_causa     = COALESCE(${p(3)}, rol_causa),
      tribunal      = COALESCE(${p(4)}, tribunal),
      materia       = COALESCE(${p(5)}, materia),
      estado        = COALESCE(${p(6)}, estado),
      abogado_id    = COALESCE(${p(7)}, abogado_id),
      fecha_termino = COALESCE(${p(8)}, fecha_termino),
      actualizado_en = NOW()
    WHERE id = ${p(9)} ${filtro}
    RETURNING *
  `;
  const { titulo, descripcion, rol_causa, tribunal, materia, estado, abogado_id, fecha_termino } = datos;
  const { rows } = await pool.query(sql, [
    ...params,
    titulo, descripcion, rol_causa, tribunal, materia, estado, abogado_id, fecha_termino,
    id,
  ]);
  return rows[0] || null;
}

async function cambiarEstado(id, estado, { rol, usuarioId }) {
  const estadosValidos = ['activa', 'cerrada', 'suspendida', 'archivada'];
  if (!estadosValidos.includes(estado)) {
    throw { status: 400, mensaje: `Estado inválido. Use: ${estadosValidos.join(', ')}` };
  }

  const filtro = rol === 'admin' ? '' : 'AND abogado_id = $1';
  const params = rol === 'admin' ? [id, estado] : [usuarioId, id, estado];
  const pId    = rol === 'admin' ? '$1' : '$2';
  const pEst   = rol === 'admin' ? '$2' : '$3';

  const sql = `
    UPDATE causas SET estado = ${pEst}, actualizado_en = NOW()
    WHERE id = ${pId} ${filtro}
    RETURNING id, titulo, estado
  `;
  const { rows } = await pool.query(sql, params);
  return rows[0] || null;
}

module.exports = { listar, obtenerPorId, crear, actualizar, cambiarEstado };
