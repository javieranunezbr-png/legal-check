const pool = require('../../config/db');

const MENSAJE_DEFAULT =
  'Hemos recibido tus datos correctamente. Bienvenido/a a nuestro estudio jurídico — ' +
  'a partir de ahora trabajaremos contigo de forma personalizada y bajo estricto secreto profesional. ' +
  'Te contactaremos a la brevedad para coordinar los próximos pasos.';

async function obtener(abogadoId) {
  const { rows } = await pool.query(
    `SELECT * FROM configuracion_estudio WHERE abogado_id = $1`,
    [abogadoId]
  );
  return rows[0] || {
    abogado_id: abogadoId,
    mensaje_bienvenida_portal: MENSAJE_DEFAULT,
  };
}

async function obtenerMensajeBienvenida(abogadoId) {
  if (!abogadoId) return MENSAJE_DEFAULT;
  const { rows } = await pool.query(
    `SELECT mensaje_bienvenida_portal FROM configuracion_estudio WHERE abogado_id = $1`,
    [abogadoId]
  );
  return rows[0]?.mensaje_bienvenida_portal || MENSAJE_DEFAULT;
}

async function actualizar(abogadoId, datos) {
  const mensaje = (datos.mensaje_bienvenida_portal ?? '').trim() || MENSAJE_DEFAULT;
  const { rows } = await pool.query(
    `INSERT INTO configuracion_estudio (abogado_id, mensaje_bienvenida_portal)
     VALUES ($1, $2)
     ON CONFLICT (abogado_id) DO UPDATE SET
       mensaje_bienvenida_portal = EXCLUDED.mensaje_bienvenida_portal,
       actualizado_en            = NOW()
     RETURNING *`,
    [abogadoId, mensaje]
  );
  return rows[0];
}

module.exports = { obtener, obtenerMensajeBienvenida, actualizar, MENSAJE_DEFAULT };
