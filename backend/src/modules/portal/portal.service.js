const crypto = require('crypto');
const pool   = require('../../config/db');

/** Normaliza RUT chileno: elimina puntos, guiones y espacios, deja dígito verificador al final. */
function normalizarRut(rut) {
  if (!rut) return '';
  return String(rut).replace(/[.\-\s]/g, '').toUpperCase();
}

/** Genera (si no existe) el portal_token del presupuesto y marca el primer pago. */
async function marcarPrimerPago(presupuestoId, { rol, usuarioId }) {
  const params = rol === 'admin' ? [presupuestoId] : [usuarioId, presupuestoId];
  const filtro = rol === 'admin' ? '' : 'AND abogado_id = $1';
  const pId    = rol === 'admin' ? '$1' : '$2';

  // Cargar presupuesto con permiso
  const { rows } = await pool.query(
    `SELECT * FROM presupuestos WHERE id = ${pId} ${filtro}`,
    params
  );
  const pres = rows[0];
  if (!pres) return null;

  const token = pres.portal_token || crypto.randomBytes(24).toString('hex');

  const { rows: act } = await pool.query(
    `UPDATE presupuestos
     SET primer_pago_recibido_en = COALESCE(primer_pago_recibido_en, NOW()),
         portal_token            = $1
     WHERE id = $2
     RETURNING *`,
    [token, presupuestoId]
  );
  return act[0];
}

/** Obtiene datos públicos del portal por su token. */
async function obtenerPorToken(token) {
  const { rows } = await pool.query(
    `SELECT p.id, p.nombre_prospecto, p.correo, p.telefono,
            p.portal_completado_en, p.cliente_id,
            u.nombre AS abogado_nombre
     FROM presupuestos p
     LEFT JOIN usuarios u ON u.id = p.abogado_id
     WHERE p.portal_token = $1`,
    [token]
  );
  return rows[0] || null;
}

/**
 * Guarda los datos del cliente desde el formulario público.
 * - Valida RUT único (si existe cliente con ese RUT, lo vincula y actualiza).
 * - Crea cliente con estado='activo'.
 * - Vincula presupuesto.cliente_id + portal_completado_en.
 */
async function completarPortal(token, datos) {
  const rutNormalizado = normalizarRut(datos.rut);
  if (!rutNormalizado) {
    throw { status: 400, mensaje: 'El RUT es obligatorio' };
  }
  if (!datos.nombre || !datos.nombre.trim()) {
    throw { status: 400, mensaje: 'El nombre es obligatorio' };
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      `SELECT id, abogado_id, cliente_id, portal_completado_en
       FROM presupuestos WHERE portal_token = $1 FOR UPDATE`,
      [token]
    );
    const pres = rows[0];
    if (!pres) {
      await client.query('ROLLBACK');
      throw { status: 404, mensaje: 'Portal no encontrado' };
    }
    if (pres.portal_completado_en) {
      await client.query('ROLLBACK');
      throw { status: 400, mensaje: 'Este formulario ya fue completado' };
    }

    // Busca cliente existente por RUT
    const { rows: existentes } = await client.query(
      `SELECT id FROM clientes WHERE rut = $1`,
      [rutNormalizado]
    );

    const campos = {
      rut:               rutNormalizado,
      nombre:            datos.nombre?.trim(),
      apellidos:         datos.apellidos || null,
      email:             datos.email || null,
      telefono:          datos.telefono || null,
      direccion:         datos.direccion || null,
      tipo:              datos.tipo || 'persona',
      estado_civil:      datos.estado_civil || null,
      ocupacion:         datos.ocupacion || null,
      nacionalidad:      datos.nacionalidad || null,
      genero:            datos.genero || null,
      nombre_conyuge:    datos.nombre_conyuge || null,
      apellidos_conyuge: datos.apellidos_conyuge || null,
      rut_conyuge:       datos.rut_conyuge ? normalizarRut(datos.rut_conyuge) : null,
      direccion_conyuge: datos.direccion_conyuge || null,
    };

    let clienteId;
    if (existentes[0]) {
      clienteId = existentes[0].id;
      // Actualiza datos y reactiva
      const sets = Object.keys(campos)
        .map((k, i) => `${k} = COALESCE($${i + 1}, ${k})`)
        .join(', ');
      const vals = Object.values(campos);
      await client.query(
        `UPDATE clientes
         SET ${sets}, estado = 'activo', abogado_id = COALESCE(abogado_id, $${vals.length + 1})
         WHERE id = $${vals.length + 2}`,
        [...vals, pres.abogado_id, clienteId]
      );
    } else {
      const keys = Object.keys(campos);
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
      const vals = Object.values(campos);
      const { rows: creados } = await client.query(
        `INSERT INTO clientes (${keys.join(', ')}, estado, abogado_id)
         VALUES (${placeholders}, 'activo', $${vals.length + 1})
         RETURNING id`,
        [...vals, pres.abogado_id]
      );
      clienteId = creados[0].id;
    }

    await client.query(
      `UPDATE presupuestos
       SET cliente_id = $1, portal_completado_en = NOW()
       WHERE id = $2`,
      [clienteId, pres.id]
    );

    await client.query('COMMIT');
    return { cliente_id: clienteId };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { marcarPrimerPago, obtenerPorToken, completarPortal };
