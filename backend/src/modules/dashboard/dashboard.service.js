const pool = require('../../config/db');

async function resumen({ rol, usuarioId }) {
  const esAdmin = rol === 'admin';
  const filtroCliente = esAdmin ? '' : 'AND abogado_id = $1';
  const filtroCausa   = esAdmin ? '' : 'AND abogado_id = $1';
  const params        = esAdmin ? [] : [usuarioId];

  const [
    clientesActivos,
    cuotasVencidas,
    causasActivas,
    cobrosMes,
  ] = await Promise.all([

    // 1. Total clientes activos
    pool.query(
      `SELECT COUNT(*) AS total
       FROM clientes
       WHERE estado = 'vigente' ${filtroCliente}`,
      params
    ),

    // 2. Cuotas vencidas: cantidad y monto total
    pool.query(
      `SELECT COUNT(q.id) AS cantidad, COALESCE(SUM(q.monto), 0) AS monto_total
       FROM cuotas q
       JOIN acuerdos_cobro a ON a.id = q.acuerdo_id
       JOIN causas ca         ON ca.id = a.causa_id
       WHERE q.estado = 'vencida' ${esAdmin ? '' : 'AND ca.abogado_id = $1'}`,
      params
    ),

    // 3. Causas activas con acuerdos que tienen cuotas venciendo en los próximos 7 días
    pool.query(
      `SELECT DISTINCT ca.id, ca.titulo, ca.rol_causa,
              cl.nombre AS cliente_nombre, cl.apellidos AS cliente_apellidos,
              MIN(q.fecha_vencimiento) AS proxima_cuota
       FROM causas ca
       JOIN clientes cl        ON cl.id = ca.cliente_id
       JOIN acuerdos_cobro a   ON a.causa_id = ca.id
       JOIN cuotas q           ON q.acuerdo_id = a.id
       WHERE ca.estado = 'activa'
         AND q.estado = 'pendiente'
         AND q.fecha_vencimiento BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
         ${esAdmin ? '' : 'AND ca.abogado_id = $1'}
       GROUP BY ca.id, ca.titulo, ca.rol_causa, cl.nombre, cl.apellidos
       ORDER BY proxima_cuota`,
      params
    ),

    // 4. Cobrado vs esperado este mes
    pool.query(
      `SELECT
         COALESCE(SUM(CASE WHEN q.estado = 'pagada'
                           AND DATE_TRUNC('month', q.fecha_pago) = DATE_TRUNC('month', CURRENT_DATE)
                      THEN q.monto ELSE 0 END), 0) AS cobrado_mes,
         COALESCE(SUM(CASE WHEN DATE_TRUNC('month', q.fecha_vencimiento) = DATE_TRUNC('month', CURRENT_DATE)
                      THEN q.monto ELSE 0 END), 0) AS esperado_mes
       FROM cuotas q
       JOIN acuerdos_cobro a ON a.id = q.acuerdo_id
       JOIN causas ca         ON ca.id = a.causa_id
       WHERE 1=1 ${esAdmin ? '' : 'AND ca.abogado_id = $1'}`,
      params
    ),
  ]);

  return {
    clientes_activos:  parseInt(clientesActivos.rows[0].total),
    cuotas_vencidas: {
      cantidad:    parseInt(cuotasVencidas.rows[0].cantidad),
      monto_total: parseFloat(cuotasVencidas.rows[0].monto_total),
    },
    causas_con_vencimiento_proximo: causasActivas.rows,
    cobros_mes: {
      cobrado:  parseFloat(cobrosMes.rows[0].cobrado_mes),
      esperado: parseFloat(cobrosMes.rows[0].esperado_mes),
    },
  };
}

module.exports = { resumen };
