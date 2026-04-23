const { Pool } = require('pg');

const esProduccion = process.env.NODE_ENV === 'production';

if (esProduccion && !process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL no está definida. Configúrala en Railway → Variables.');
  process.exit(1);
}

// Railway interno (railway.internal) no usa SSL; URLs públicas sí lo requieren
const sslConfig = process.env.DATABASE_URL?.includes('railway.internal')
  ? false
  : { rejectUnauthorized: false }

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: sslConfig,
    })
  : new Pool({
      host:     process.env.DB_HOST,
      port:     process.env.DB_PORT,
      database: process.env.DB_NAME,
      user:     process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

pool.on('error', (err) => {
  console.error('Error inesperado en cliente PostgreSQL:', err);
  process.exit(-1);
});

module.exports = pool;
