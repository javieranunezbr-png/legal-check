require('dotenv').config();
const fs   = require('fs');
const path = require('path');
const pool = require('./db');

const MIGRATIONS_DIR = path.join(__dirname, '../../migrations');

async function run() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS _migraciones (
        id         SERIAL PRIMARY KEY,
        archivo    VARCHAR(255) UNIQUE NOT NULL,
        ejecutado_en TIMESTAMP DEFAULT NOW()
      )
    `);

    const { rows: ejecutadas } = await client.query(
      'SELECT archivo FROM _migraciones ORDER BY archivo'
    );
    const ejecutadasSet = new Set(ejecutadas.map(r => r.archivo));

    const archivos = fs.readdirSync(MIGRATIONS_DIR)
      .filter(f => f.endsWith('.sql'))
      .sort();

    for (const archivo of archivos) {
      if (ejecutadasSet.has(archivo)) {
        console.log(`  ✓ ${archivo} (ya ejecutada)`);
        continue;
      }

      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, archivo), 'utf8');
      await client.query('BEGIN');
      await client.query(sql);
      await client.query(
        'INSERT INTO _migraciones (archivo) VALUES ($1)',
        [archivo]
      );
      await client.query('COMMIT');
      console.log(`  → ${archivo} ejecutada`);
    }

    console.log('\nMigraciones completadas.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error en migración:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
