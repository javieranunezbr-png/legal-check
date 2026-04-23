const pool = require('../../config/db');

async function listarPorAcuerdo(acuerdoId) {
  const { rows } = await pool.query(
    'SELECT * FROM cuotas WHERE acuerdo_id = $1 ORDER BY numero_cuota',
    [acuerdoId]
  );
  return rows;
}

async function marcarPagada(id, { fecha_pago, metodo_pago, comprobante, notas }) {
  const { rows } = await pool.query(
    `UPDATE cuotas SET
       estado      = 'pagada',
       fecha_pago  = COALESCE($1, CURRENT_DATE),
       metodo_pago = COALESCE($2, metodo_pago),
       comprobante = COALESCE($3, comprobante),
       notas       = COALESCE($4, notas)
     WHERE id = $5 AND estado != 'pagada'
     RETURNING *`,
    [fecha_pago, metodo_pago, comprobante, notas, id]
  );

  if (!rows[0]) {
    // La cuota no existe o ya estaba pagada
    const { rows: [existe] } = await pool.query('SELECT id, estado FROM cuotas WHERE id = $1', [id]);
    if (!existe) throw { status: 404, mensaje: 'Cuota no encontrada' };
    throw { status: 409, mensaje: 'La cuota ya está marcada como pagada' };
  }
  return rows[0];
}

// Actualiza a 'vencida' todas las cuotas pendientes con fecha_vencimiento < hoy
async function actualizarVencidas() {
  const { rows, rowCount } = await pool.query(
    `UPDATE cuotas SET estado = 'vencida'
     WHERE estado = 'pendiente' AND fecha_vencimiento < CURRENT_DATE
     RETURNING id, acuerdo_id, numero_cuota, fecha_vencimiento`
  );
  return { actualizadas: rowCount, cuotas: rows };
}

module.exports = { listarPorAcuerdo, marcarPagada, actualizarVencidas };
