const crypto    = require('crypto');
const pool      = require('../../config/db');
const configSvc = require('../configuracion/configuracion.service');

/** Normaliza RUT chileno: elimina puntos, guiones y espacios. */
function normalizarRut(rut) {
  if (!rut) return '';
  return String(rut).replace(/[.\-\s]/g, '').toUpperCase();
}

const CAMPOS_REQUERIDOS = [
  'nombre','apellidos','rut','email','telefono','ocupacion',
  'estado_civil','nacionalidad','genero','clave_unica',
  'direccion','comuna','region',
  'como_nos_conociste',
];

const ETIQUETAS = {
  nombre: 'Nombres', apellidos: 'Apellidos', rut: 'RUT',
  email: 'Correo electrónico', telefono: 'Teléfono', ocupacion: 'Ocupación',
  estado_civil: 'Estado civil', nacionalidad: 'Nacionalidad', genero: 'Género',
  clave_unica: 'Clave única',
  direccion: 'Dirección', comuna: 'Comuna', region: 'Región',
  como_nos_conociste: '¿Cómo nos conociste?',
};

/** Devuelve datos públicos del cliente por su token de ingreso. */
async function obtenerPorToken(token) {
  const { rows } = await pool.query(
    `SELECT c.id, c.nombre, c.apellidos, c.email, c.telefono,
            c.ingreso_completado, c.abogado_id,
            u.nombre AS abogado_nombre
     FROM clientes c
     LEFT JOIN usuarios u ON u.id = c.abogado_id
     WHERE c.token_ingreso = $1`,
    [token]
  );
  const cli = rows[0];
  if (!cli) return null;
  cli.mensaje_bienvenida = await configSvc.obtenerMensajeBienvenida(cli.abogado_id);
  return cli;
}

/**
 * Completa la ficha del cliente desde el formulario público.
 * Reglas:
 *  - Todos los campos del spec son obligatorios (excepto clave_unica y consideraciones).
 *  - Si el RUT enviado ya existe en otro cliente → "Ya tienes una ficha registrada con nosotros."
 *  - Si este mismo cliente ya completó el ingreso → mismo mensaje (idempotencia + protección).
 *  - Marca cliente.estado='activo' e ingreso_completado=true.
 */
async function completarPortal(token, datos) {
  const rutNormalizado = normalizarRut(datos.rut);

  // Validación de campos obligatorios
  const faltantes = CAMPOS_REQUERIDOS.filter(c => {
    const v = c === 'rut' ? rutNormalizado : datos[c];
    return !v || !String(v).trim();
  });
  if (faltantes.length) {
    throw {
      status: 400,
      mensaje: 'Faltan campos obligatorios: ' + faltantes.map(c => ETIQUETAS[c] || c).join(', '),
    };
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      `SELECT id, ingreso_completado FROM clientes
       WHERE token_ingreso = $1 FOR UPDATE`,
      [token]
    );
    const cliente = rows[0];
    if (!cliente) {
      await client.query('ROLLBACK');
      throw { status: 404, mensaje: 'Link no válido o expirado' };
    }
    if (cliente.ingreso_completado) {
      await client.query('ROLLBACK');
      throw { status: 409, mensaje: 'Ya tienes una ficha registrada con nosotros.' };
    }

    // Verificar que el RUT no esté ya en otro cliente
    const { rows: conflictos } = await client.query(
      `SELECT id FROM clientes WHERE rut = $1 AND id <> $2`,
      [rutNormalizado, cliente.id]
    );
    if (conflictos[0]) {
      await client.query('ROLLBACK');
      throw { status: 409, mensaje: 'Ya tienes una ficha registrada con nosotros.' };
    }

    await client.query(
      `UPDATE clientes SET
         nombre              = $1,
         apellidos           = $2,
         rut                 = $3,
         email               = $4,
         telefono            = $5,
         ocupacion           = $6,
         estado_civil        = $7,
         nacionalidad        = $8,
         genero              = $9,
         clave_unica         = $10,
         direccion           = $11,
         comuna              = $12,
         region              = $13,
         canal_llegada       = $14,
         consideraciones     = $15,
         estado              = 'activo',
         ingreso_completado  = TRUE,
         ingreso_completado_en = NOW()
       WHERE id = $16`,
      [
        datos.nombre.trim(),
        datos.apellidos.trim(),
        rutNormalizado,
        datos.email.trim(),
        datos.telefono.trim(),
        datos.ocupacion.trim(),
        datos.estado_civil,
        datos.nacionalidad.trim(),
        datos.genero,
        datos.clave_unica || null,
        datos.direccion.trim(),
        datos.comuna.trim(),
        datos.region,
        datos.como_nos_conociste,
        datos.consideraciones || null,
        cliente.id,
      ]
    );

    await client.query('COMMIT');
    return { cliente_id: cliente.id };
  } catch (err) {
    try { await client.query('ROLLBACK'); } catch {}
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { obtenerPorToken, completarPortal };
