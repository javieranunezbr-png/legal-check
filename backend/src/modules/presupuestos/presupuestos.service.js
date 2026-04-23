const crypto         = require('crypto');
const pool           = require('../../config/db');
const gestionesSvc   = require('../gestiones/gestiones.service');

// ---------- helpers ----------

async function itemsDe(presupuestoId) {
  const { rows } = await pool.query(
    `SELECT id, gestion_id, nombre, precio, detalle, orden
     FROM presupuesto_items
     WHERE presupuesto_id = $1
     ORDER BY orden, id`,
    [presupuestoId]
  );
  return rows;
}

async function guardarItems(client, presupuestoId, items, abogadoId) {
  // Borra todos los items previos y reinserta (más simple que diff)
  await client.query(
    `DELETE FROM presupuesto_items WHERE presupuesto_id = $1`,
    [presupuestoId]
  );

  if (!Array.isArray(items) || items.length === 0) return 0;

  let total = 0;
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const nombre = (it.nombre || '').trim();
    if (!nombre) continue;
    const precio = Number(it.precio) || 0;
    const detalle = it.detalle || null;

    // Busca o crea la gestión en el catálogo del abogado
    let gestionId = it.gestion_id || null;
    if (!gestionId) {
      gestionId = await gestionesSvc.upsertPorNombre(
        client,
        { nombre, precio, detalle },
        abogadoId
      );
    }

    await client.query(
      `INSERT INTO presupuesto_items
         (presupuesto_id, gestion_id, nombre, precio, detalle, orden)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [presupuestoId, gestionId, nombre, precio, detalle, i]
    );

    total += precio;
  }

  return total;
}

// ---------- CRUD ----------

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
  const pres = rows[0];
  if (!pres) return null;
  pres.items = await itemsDe(pres.id);
  return pres;
}

async function obtenerPorToken(token) {
  const { rows } = await pool.query(
    `SELECT p.*, u.nombre AS abogado_nombre, u.email AS abogado_email
     FROM presupuestos p
     LEFT JOIN usuarios u ON u.id = p.abogado_id
     WHERE p.token_unico = $1`,
    [token]
  );
  const pres = rows[0];
  if (!pres) return null;
  pres.items = await itemsDe(pres.id);
  return pres;
}

async function crear(datos, abogadoId) {
  const {
    nombre_prospecto, correo, telefono, descripcion, materias,
    honorarios_total, numero_cuotas, monto_cuota, fecha_primera_cuota,
    notas, estado, items,
  } = datos;

  const token = crypto.randomBytes(24).toString('hex');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
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
    const pres = rows[0];

    const totalItems = await guardarItems(client, pres.id, items, abogadoId);

    // Si hay items, el total pasa a ser la suma de ellos
    if (totalItems > 0) {
      const nCuotas = Number(numero_cuotas) || 1;
      const cuota   = Math.round(totalItems / nCuotas);
      const { rows: act } = await client.query(
        `UPDATE presupuestos
         SET honorarios_total = $1, monto_cuota = $2
         WHERE id = $3 RETURNING *`,
        [totalItems, cuota, pres.id]
      );
      Object.assign(pres, act[0]);
    }

    await client.query('COMMIT');
    pres.items = await itemsDe(pres.id);
    return pres;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

const CAMPOS_EDITABLE = [
  'nombre_prospecto','correo','telefono','descripcion','materias',
  'honorarios_total','numero_cuotas','monto_cuota','fecha_primera_cuota',
  'notas','estado',
];

async function actualizar(id, datos, { rol, usuarioId }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Verifica permiso + obtiene abogado_id real del registro
    const { rows: dueño } = await client.query(
      `SELECT abogado_id FROM presupuestos WHERE id = $1`,
      [id]
    );
    if (!dueño[0]) {
      await client.query('ROLLBACK');
      return null;
    }
    if (rol !== 'admin' && dueño[0].abogado_id !== usuarioId) {
      await client.query('ROLLBACK');
      return null;
    }
    const abogadoId = dueño[0].abogado_id;

    const sets = CAMPOS_EDITABLE
      .map((c, i) => `${c} = COALESCE($${i + 1}, ${c})`)
      .join(', ');
    const vals = CAMPOS_EDITABLE.map(c => datos[c] ?? null);
    const pId  = `$${CAMPOS_EDITABLE.length + 1}`;

    const { rows } = await client.query(
      `UPDATE presupuestos SET ${sets} WHERE id = ${pId} RETURNING *`,
      [...vals, id]
    );
    const pres = rows[0];

    // Si mandaron items, los reemplazamos y recalculamos total
    if (Array.isArray(datos.items)) {
      const totalItems = await guardarItems(client, id, datos.items, abogadoId);
      if (totalItems > 0) {
        const nCuotas = Number(datos.numero_cuotas) || Number(pres.numero_cuotas) || 1;
        const cuota   = Math.round(totalItems / nCuotas);
        const { rows: act } = await client.query(
          `UPDATE presupuestos
           SET honorarios_total = $1, monto_cuota = $2
           WHERE id = $3 RETURNING *`,
          [totalItems, cuota, id]
        );
        Object.assign(pres, act[0]);
      }
    }

    await client.query('COMMIT');
    pres.items = await itemsDe(id);
    return pres;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
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
