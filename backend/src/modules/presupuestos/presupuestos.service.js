const crypto         = require('crypto');
const pool           = require('../../config/db');
const gestionesSvc   = require('../gestiones/gestiones.service');

/** Genera fechas de cuotas mensuales a partir de la fecha base. */
function fechasMensuales(fechaInicio, cantidad) {
  const fechas = [];
  const base = new Date(fechaInicio);
  for (let i = 0; i < cantidad; i++) {
    const f = new Date(base);
    f.setMonth(f.getMonth() + i);
    fechas.push(f.toISOString().split('T')[0]);
  }
  return fechas;
}

/**
 * Aceptación del presupuesto: dentro de la transacción crea cliente +
 * causa + acuerdo + cuotas y vincula todo al presupuesto.
 */
async function activarPresupuesto(client, pres) {
  // 1) Cliente con estado 'pendiente' (completará su ficha desde el portal)
  const partes = String(pres.nombre_prospecto || '').trim().split(/\s+/);
  const nombre    = partes[0] || pres.nombre_prospecto || 'Cliente';
  const apellidos = partes.slice(1).join(' ') || null;
  const tokenIngreso = crypto.randomBytes(24).toString('hex');

  const { rows: cli } = await client.query(
    `INSERT INTO clientes
       (nombre, apellidos, email, telefono, estado, abogado_id, token_ingreso)
     VALUES ($1,$2,$3,$4,'pendiente',$5,$6)
     RETURNING id`,
    [nombre, apellidos, pres.correo || null, pres.telefono || null,
     pres.abogado_id, tokenIngreso]
  );
  const clienteId = cli[0].id;

  // 2) Causa
  const materias = Array.isArray(pres.materias) ? pres.materias : [];
  const materiaPrincipal = materias[0] || null;
  const tituloCausa =
    materias.length ? materias.join(' / ') : (pres.descripcion?.slice(0, 200) || 'Caso de ' + nombre);

  const { rows: cau } = await client.query(
    `INSERT INTO causas (titulo, descripcion, materia, estado,
                         cliente_id, abogado_id, fecha_inicio)
     VALUES ($1,$2,$3,'activa',$4,$5,CURRENT_DATE)
     RETURNING id`,
    [tituloCausa, pres.descripcion || null, materiaPrincipal, clienteId, pres.abogado_id]
  );
  const causaId = cau[0].id;

  // 3) Acuerdo de cobro vinculado a la causa
  const numeroCuotas = Number(pres.numero_cuotas) || 1;
  const fechaPrimera = pres.fecha_primera_cuota || new Date().toISOString().split('T')[0];

  const { rows: acu } = await client.query(
    `INSERT INTO acuerdos_cobro
       (causa_id, descripcion, monto_total, tipo_cobro, fecha_acuerdo, estado, notas)
     VALUES ($1,$2,$3,'cuotas',CURRENT_DATE,'vigente',$4)
     RETURNING id`,
    [causaId, pres.descripcion || null, pres.honorarios_total || 0,
     pres.notas || null]
  );
  const acuerdoId = acu[0].id;

  // 4) Cuotas mensuales: usamos el monto_cuota acordado en el presupuesto.
  //    Si no hay fecha_primera_cuota, las cuotas se crean con
  //    fecha_vencimiento NULL — al marcar la primera como pagada se
  //    recalcularán mensualmente desde la fecha de pago.
  if (numeroCuotas > 0) {
    const tieneFechaInicio = Boolean(pres.fecha_primera_cuota);
    const fechas = tieneFechaInicio ? fechasMensuales(fechaPrimera, numeroCuotas) : null;
    const montoCuota = pres.monto_cuota
      ? Number(pres.monto_cuota)
      : Number((Number(pres.honorarios_total) / numeroCuotas).toFixed(2));

    for (let i = 0; i < numeroCuotas; i++) {
      await client.query(
        `INSERT INTO cuotas (acuerdo_id, numero_cuota, monto, fecha_vencimiento)
         VALUES ($1,$2,$3,$4)`,
        [acuerdoId, i + 1, montoCuota, fechas ? fechas[i] : null]
      );
    }
  }

  // 5) Vincula cliente_id + acuerdo_id al presupuesto
  await client.query(
    `UPDATE presupuestos SET cliente_id = $1, acuerdo_id = $2 WHERE id = $3`,
    [clienteId, acuerdoId, pres.id]
  );

  return { clienteId, causaId, acuerdoId };
}

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

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Bloqueamos la fila para evitar doble-aceptación concurrente
    const { rows: actuales } = await client.query(
      `SELECT * FROM presupuestos WHERE token_unico = $1 FOR UPDATE`,
      [token]
    );
    const actual = actuales[0];
    if (!actual) {
      await client.query('ROLLBACK');
      return null;
    }
    if (!['enviado','borrador'].includes(actual.estado)) {
      await client.query('ROLLBACK');
      throw { status: 400, mensaje: `El presupuesto ya fue ${actual.estado}` };
    }

    const { rows: actualizado } = await client.query(
      `UPDATE presupuestos
         SET estado = $1, respondido_en = NOW()
       WHERE id = $2
       RETURNING *`,
      [accion, actual.id]
    );
    let pres = actualizado[0];

    // Si es aceptación, creamos cliente + causa + acuerdo + cuotas
    if (accion === 'aceptado' && !pres.acuerdo_id) {
      const { acuerdoId } = await activarPresupuesto(client, pres);
      pres.acuerdo_id = acuerdoId;
    }

    await client.query('COMMIT');
    return pres;
  } catch (err) {
    try { await client.query('ROLLBACK'); } catch {}
    throw err;
  } finally {
    client.release();
  }
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
