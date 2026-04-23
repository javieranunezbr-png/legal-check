const pool = require('../../config/db');

function generarFechasCuotas(fechaInicio, cantidad, periodicidad = 'mensual') {
  const fechas = [];
  const base   = new Date(fechaInicio);
  for (let i = 0; i < cantidad; i++) {
    const f = new Date(base);
    if (periodicidad === 'mensual') {
      f.setMonth(f.getMonth() + i);
    } else if (periodicidad === 'quincenal') {
      f.setDate(f.getDate() + i * 15);
    } else if (periodicidad === 'semanal') {
      f.setDate(f.getDate() + i * 7);
    }
    fechas.push(f.toISOString().split('T')[0]);
  }
  return fechas;
}

// Lista todos los acuerdos vigentes del estudio (para el resumen de cobros)
async function listarTodos({ rol, usuarioId }) {
  const params  = rol === 'admin' ? [] : [usuarioId];
  const filtro  = rol === 'admin' ? '' : 'AND ca.abogado_id = $1';

  const { rows } = await pool.query(
    `SELECT a.*,
            ca.titulo        AS causa_titulo,
            ca.rol_causa,
            ca.id            AS causa_id,
            cl.nombre        AS cliente_nombre,
            cl.apellidos     AS cliente_apellidos,
            u.nombre         AS abogado_nombre,
            COUNT(q.id)                                                   AS total_cuotas,
            COUNT(CASE WHEN q.estado = 'vencida'   THEN 1 END)           AS cuotas_vencidas,
            COUNT(CASE WHEN q.estado = 'pagada'    THEN 1 END)           AS cuotas_pagadas,
            COUNT(CASE WHEN q.estado = 'pendiente' THEN 1 END)           AS cuotas_pendientes,
            COALESCE(SUM(CASE WHEN q.estado = 'pagada' THEN q.monto ELSE 0 END), 0) AS monto_cobrado,
            MIN(CASE WHEN q.estado IN ('pendiente','vencida') THEN q.fecha_vencimiento END) AS proxima_cuota
     FROM acuerdos_cobro a
     JOIN causas ca   ON ca.id = a.causa_id
     JOIN clientes cl ON cl.id = ca.cliente_id
     JOIN usuarios u  ON u.id  = ca.abogado_id
     LEFT JOIN cuotas q ON q.acuerdo_id = a.id
     WHERE a.estado = 'vigente' ${filtro}
     GROUP BY a.id, ca.titulo, ca.rol_causa, ca.id, cl.nombre, cl.apellidos, u.nombre
     ORDER BY cuotas_vencidas DESC, a.fecha_acuerdo DESC`,
    params
  );
  return rows;
}

async function listarPorCausa(causaId) {
  const { rows } = await pool.query(
    `SELECT a.*,
            COUNT(q.id)                                                   AS total_cuotas,
            COUNT(CASE WHEN q.estado = 'vencida'   THEN 1 END)           AS cuotas_vencidas,
            COUNT(CASE WHEN q.estado = 'pagada'    THEN 1 END)           AS cuotas_pagadas,
            COUNT(CASE WHEN q.estado = 'pendiente' THEN 1 END)           AS cuotas_pendientes,
            COALESCE(SUM(CASE WHEN q.estado = 'pagada' THEN q.monto ELSE 0 END), 0) AS monto_cobrado
     FROM acuerdos_cobro a
     LEFT JOIN cuotas q ON q.acuerdo_id = a.id
     WHERE a.causa_id = $1
     GROUP BY a.id
     ORDER BY a.creado_en DESC`,
    [causaId]
  );
  return rows;
}

async function obtenerPorId(id) {
  const { rows: [acuerdo] } = await pool.query(
    `SELECT a.*, ca.titulo AS causa_titulo, ca.rol_causa, ca.id AS causa_id,
            cl.nombre AS cliente_nombre, cl.apellidos AS cliente_apellidos
     FROM acuerdos_cobro a
     JOIN causas ca   ON ca.id = a.causa_id
     JOIN clientes cl ON cl.id = ca.cliente_id
     WHERE a.id = $1`,
    [id]
  );
  if (!acuerdo) return null;

  const { rows: cuotas } = await pool.query(
    'SELECT * FROM cuotas WHERE acuerdo_id = $1 ORDER BY numero_cuota',
    [id]
  );
  return { ...acuerdo, cuotas };
}

async function crear(datos) {
  const {
    causa_id, descripcion, monto_total, tipo_cobro, fecha_acuerdo,
    porcentaje_exito, notas,
    cantidad_cuotas, fecha_primera_cuota, periodicidad,
  } = datos;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: [acuerdo] } = await client.query(
      `INSERT INTO acuerdos_cobro
         (causa_id, descripcion, monto_total, tipo_cobro, fecha_acuerdo, porcentaje_exito, notas)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [causa_id, descripcion, monto_total, tipo_cobro, fecha_acuerdo, porcentaje_exito, notas]
    );

    let cuotasCreadas = [];
    const n = parseInt(cantidad_cuotas);
    if (['cuotas', 'mixto'].includes(tipo_cobro) && n > 0 && fecha_primera_cuota) {
      const montoCuota = (parseFloat(monto_total) / n).toFixed(2);
      const fechas = generarFechasCuotas(fecha_primera_cuota, n, periodicidad ?? 'mensual');

      for (let i = 0; i < fechas.length; i++) {
        const { rows: [cuota] } = await client.query(
          `INSERT INTO cuotas (acuerdo_id, numero_cuota, monto, fecha_vencimiento)
           VALUES ($1,$2,$3,$4) RETURNING *`,
          [acuerdo.id, i + 1, montoCuota, fechas[i]]
        );
        cuotasCreadas.push(cuota);
      }
    }

    await client.query('COMMIT');
    return { ...acuerdo, cuotas: cuotasCreadas };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function actualizar(id, { descripcion, monto_total, estado, porcentaje_exito, notas }) {
  const { rows } = await pool.query(
    `UPDATE acuerdos_cobro SET
       descripcion      = COALESCE($1, descripcion),
       monto_total      = COALESCE($2, monto_total),
       estado           = COALESCE($3, estado),
       porcentaje_exito = COALESCE($4, porcentaje_exito),
       notas            = COALESCE($5, notas)
     WHERE id = $6
     RETURNING *`,
    [descripcion, monto_total, estado, porcentaje_exito, notas, id]
  );
  return rows[0] || null;
}

module.exports = { listarTodos, listarPorCausa, obtenerPorId, crear, actualizar };
