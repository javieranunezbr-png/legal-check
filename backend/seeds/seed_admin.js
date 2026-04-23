// Crea el usuario administrador inicial
// Uso: node seeds/seed_admin.js
require('dotenv').config();
const pool            = require('../src/config/db');
const { hashPassword } = require('../src/modules/auth/auth.service');

async function run() {
  const hash = await hashPassword('Admin1234!');
  const { rows } = await pool.query(
    `INSERT INTO usuarios (nombre, email, password, rol)
     VALUES ($1, $2, $3, 'admin')
     ON CONFLICT (email) DO NOTHING
     RETURNING id, email, rol`,
    ['Administrador', 'admin@legalcheck.cl', hash]
  );

  if (rows.length > 0) {
    console.log('✓ Admin creado:', rows[0]);
  } else {
    console.log('Admin ya existe, no se creó de nuevo.');
  }

  await pool.end();
}

run().catch(err => { console.error(err); process.exit(1); });
