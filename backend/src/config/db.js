const { Pool } = require('pg');
const dns = require('dns');

// Railway resuelve *.railway.internal solo por IPv6. Evitamos que Node
// reordene a IPv4 y rompa el handshake.
dns.setDefaultResultOrder('verbatim');

const esProduccion = process.env.NODE_ENV === 'production';

if (esProduccion && !process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL no está definida. Configúrala en Railway → Variables.');
  process.exit(1);
}

// Railway Postgres requiere SSL incluso en la red interna.
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
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
