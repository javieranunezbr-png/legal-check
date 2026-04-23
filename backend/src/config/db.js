const { Pool } = require('pg');
const dns = require('dns');

// Railway resuelve postgres.railway.internal solo por IPv6.
// Sin esto, Node reordena a IPv4 y el handshake se cae.
dns.setDefaultResultOrder('verbatim');

const esProduccion = process.env.NODE_ENV === 'production';

// Soporta tanto DATABASE_URL (una conexión string) como variables individuales PG*
// que Railway proporciona automáticamente.
const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: false,
      connectionTimeoutMillis: 10000,
    }
  : {
      host:     process.env.PGHOST || process.env.DB_HOST,
      port:     parseInt(process.env.PGPORT || process.env.DB_PORT || '5432'),
      database: process.env.PGDATABASE || process.env.DB_NAME,
      user:     process.env.PGUSER || process.env.DB_USER,
      password: process.env.POSTGRES_PASSWORD || process.env.DB_PASSWORD,
      connectionTimeoutMillis: 10000,
    };

if (esProduccion && !poolConfig.host && !poolConfig.connectionString) {
  console.error('ERROR: No se encontraron credenciales de base de datos (DATABASE_URL o PGHOST)');
  process.exit(1);
}

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('Error inesperado en cliente PostgreSQL:', err);
  process.exit(-1);
});

module.exports = pool;
