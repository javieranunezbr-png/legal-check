const pool = require('../../config/db');

const SELECT_BASE = `
  SELECT e.*,
         c.titulo  AS causa_titulo,
         c.rol_causa,
         cl.nombre AS cliente_nombre,
         cl.apellidos AS cliente_apellidos,
         u.nombre  AS abogado_nombre
  FROM agenda_eventos e
  LEFT JOIN causas    c  ON c.id  = e.causa_id
  LEFT JOIN clientes  cl ON cl.id = c.cliente_id
  LEFT JOIN usuarios  u  ON u.id  = e.abogado_id
`;

function ctxFiltro({ rol, usuarioId }, paramIdx = 1) {
  if (rol === 'admin') return { sql: '', params: [] };
  return { sql: `AND e.abogado_id = $${paramIdx}`, params: [usuarioId] };
}

async function listar(ctx, { desde, hasta, causaId } = {}) {
  const params = [];
  const cond = [];

  if (ctx.rol !== 'admin') {
    params.push(ctx.usuarioId);
    cond.push(`e.abogado_id = $${params.length}`);
  }
  if (desde) {
    params.push(desde);
    cond.push(`e.fecha >= $${params.length}`);
  }
  if (hasta) {
    params.push(hasta);
    cond.push(`e.fecha <= $${params.length}`);
  }
  if (causaId) {
    params.push(causaId);
    cond.push(`e.causa_id = $${params.length}`);
  }

  const where = cond.length ? `WHERE ${cond.join(' AND ')}` : '';
  const { rows } = await pool.query(
    `${SELECT_BASE} ${where} ORDER BY e.fecha ASC`,
    params
  );
  return rows;
}

async function obtenerPorId(id, ctx) {
  const f = ctxFiltro(ctx, 2);
  const { rows } = await pool.query(
    `${SELECT_BASE} WHERE e.id = $1 ${f.sql}`,
    [id, ...f.params]
  );
  return rows[0] || null;
}

async function crear(datos, abogadoId) {
  const { titulo, tipo, descripcion, fecha, causa_id } = datos;
  const { rows } = await pool.query(
    `INSERT INTO agenda_eventos
       (abogado_id, causa_id, titulo, tipo, descripcion, fecha)
     VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING id`,
    [
      abogadoId,
      causa_id || null,
      (titulo || '').trim(),
      tipo || 'gestion',
      descripcion || null,
      fecha,
    ]
  );
  return obtenerPorId(rows[0].id, { rol: 'admin' });
}

const CAMPOS = ['titulo', 'tipo', 'descripcion', 'fecha', 'causa_id', 'estado'];

async function actualizar(id, datos, ctx) {
  // Verifica permiso
  const actual = await obtenerPorId(id, ctx);
  if (!actual) return null;

  const sets = CAMPOS.map((c, i) => `${c} = COALESCE($${i + 1}, ${c})`).join(', ');
  const vals = CAMPOS.map(c => (datos[c] === undefined ? null : datos[c]));
  await pool.query(
    `UPDATE agenda_eventos SET ${sets} WHERE id = $${CAMPOS.length + 1}`,
    [...vals, id]
  );
  return obtenerPorId(id, { rol: 'admin' });
}

async function eliminar(id, ctx) {
  const actual = await obtenerPorId(id, ctx);
  if (!actual) return false;
  await pool.query('DELETE FROM agenda_eventos WHERE id = $1', [id]);
  return true;
}

/** Eventos pendientes en los próximos N días (default 7). */
async function alertas(ctx, dias = 7) {
  const params = [];
  let filtro = '';
  if (ctx.rol !== 'admin') {
    params.push(ctx.usuarioId);
    filtro = `AND e.abogado_id = $${params.length}`;
  }
  const { rows } = await pool.query(
    `${SELECT_BASE}
     WHERE e.estado = 'pendiente'
       AND e.fecha >= CURRENT_DATE
       AND e.fecha <= CURRENT_DATE + INTERVAL '${Number(dias)} days'
       ${filtro}
     ORDER BY e.fecha ASC`,
    params
  );
  return rows;
}

module.exports = { listar, obtenerPorId, crear, actualizar, eliminar, alertas };
