const crypto   = require('crypto');
const pool     = require('../../config/db');
const emailSvc = require('../../services/email');

async function listarPorAcuerdo(acuerdoId) {
  const { rows } = await pool.query(
    'SELECT * FROM cuotas WHERE acuerdo_id = $1 ORDER BY numero_cuota',
    [acuerdoId]
  );
  return rows;
}

/**
 * Si la cuota recién pagada es la PRIMERA del acuerdo y el cliente todavía no
 * completó su ficha, generamos token y enviamos el link del portal por correo.
 * Falla en silencio: no bloquea el pago si el correo falla.
 */
async function dispararPortalIngresoSiCorresponde(cuota) {
  try {
    if (Number(cuota.numero_cuota) !== 1) return;

    const { rows } = await pool.query(
      `SELECT c.id            AS cliente_id,
              c.nombre, c.apellidos, c.email,
              c.token_ingreso, c.ingreso_completado,
              u.nombre AS abogado_nombre,
              u.email  AS abogado_email
       FROM cuotas cu
       JOIN acuerdos_cobro ac ON ac.id = cu.acuerdo_id
       JOIN causas         ca ON ca.id = ac.causa_id
       JOIN clientes       c  ON c.id  = ca.cliente_id
       LEFT JOIN usuarios  u  ON u.id  = c.abogado_id
       WHERE cu.id = $1`,
      [cuota.id]
    );
    const ctx = rows[0];
    if (!ctx) return;
    if (ctx.ingreso_completado) return;
    if (!ctx.email) {
      console.warn(`Cliente ${ctx.cliente_id} sin email: no se envía portal de ingreso`);
      return;
    }

    let token = ctx.token_ingreso;
    if (!token) {
      token = crypto.randomBytes(24).toString('hex');
      await pool.query(
        `UPDATE clientes SET token_ingreso = $1 WHERE id = $2`,
        [token, ctx.cliente_id]
      );
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const link = `${frontendUrl}/ingreso/${token}`;

    await emailSvc.enviarPortalIngreso({
      destinatario:  ctx.email,
      nombreCliente: [ctx.nombre, ctx.apellidos].filter(Boolean).join(' '),
      link,
      nombreAbogado: ctx.abogado_nombre,
      emailAbogado:  ctx.abogado_email,
    });
  } catch (err) {
    console.error('Error disparando portal de ingreso:', err);
  }
}

/**
 * Si se marcó como pagada la primera cuota del acuerdo, ajusta la fecha de
 * vencimiento de las cuotas pendientes/vencidas siguientes para que se
 * calculen mensualmente desde la fecha de pago efectiva. Esto cubre el caso
 * en que el presupuesto no traía fecha_primera_cuota y las cuotas se crearon
 * con fechas placeholder.
 */
async function ajustarFechasSiguientes(cuotaPagada) {
  if (Number(cuotaPagada.numero_cuota) !== 1) return;
  const fechaBase = cuotaPagada.fecha_pago;
  if (!fechaBase) return;

  const { rows } = await pool.query(
    `SELECT id, numero_cuota FROM cuotas
     WHERE acuerdo_id = $1 AND estado IN ('pendiente','vencida')
     ORDER BY numero_cuota`,
    [cuotaPagada.acuerdo_id]
  );

  for (const c of rows) {
    const f = new Date(fechaBase);
    f.setMonth(f.getMonth() + (Number(c.numero_cuota) - 1));
    const fechaIso = f.toISOString().split('T')[0];
    await pool.query(
      `UPDATE cuotas SET fecha_vencimiento = $1 WHERE id = $2`,
      [fechaIso, c.id]
    );
  }
}

async function marcarPagada(id, { fecha_pago, metodo_pago, comprobante, notas }) {
  const { rows } = await pool.query(
    `UPDATE cuotas SET
       estado            = 'pagada',
       fecha_pago        = COALESCE($1, CURRENT_DATE),
       fecha_vencimiento = COALESCE(fecha_vencimiento, COALESCE($1, CURRENT_DATE)),
       metodo_pago       = COALESCE($2, metodo_pago),
       comprobante       = COALESCE($3, comprobante),
       notas             = COALESCE($4, notas)
     WHERE id = $5 AND estado != 'pagada'
     RETURNING *`,
    [fecha_pago, metodo_pago, comprobante, notas, id]
  );

  if (!rows[0]) {
    const { rows: [existe] } = await pool.query('SELECT id, estado FROM cuotas WHERE id = $1', [id]);
    if (!existe) throw { status: 404, mensaje: 'Cuota no encontrada' };
    throw { status: 409, mensaje: 'La cuota ya está marcada como pagada' };
  }

  // Si era la primera cuota, recalcular fechas de las siguientes
  await ajustarFechasSiguientes(rows[0]);

  // Trigger del portal del cliente — no esperamos resultado
  dispararPortalIngresoSiCorresponde(rows[0]);

  return rows[0];
}

async function actualizarFechaVencimiento(id, fecha_vencimiento) {
  if (!fecha_vencimiento) {
    throw { status: 400, mensaje: 'Falta la fecha de vencimiento' };
  }
  const { rows } = await pool.query(
    `UPDATE cuotas SET fecha_vencimiento = $1
     WHERE id = $2 AND estado != 'pagada'
     RETURNING *`,
    [fecha_vencimiento, id]
  );
  if (!rows[0]) throw { status: 404, mensaje: 'Cuota no encontrada o ya pagada' };
  return rows[0];
}

async function actualizarVencidas() {
  const { rows, rowCount } = await pool.query(
    `UPDATE cuotas SET estado = 'vencida'
     WHERE estado = 'pendiente' AND fecha_vencimiento < CURRENT_DATE
     RETURNING id, acuerdo_id, numero_cuota, fecha_vencimiento`
  );
  return { actualizadas: rowCount, cuotas: rows };
}

module.exports = { listarPorAcuerdo, marcarPagada, actualizarFechaVencimiento, actualizarVencidas };
