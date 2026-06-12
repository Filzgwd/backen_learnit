const { Pool } = require('pg');

let poolConfig;

if (process.env.DATABASE_URL) {
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
    // keep TCP connection alive to help with cloud DBs that may drop idle sockets
    keepAlive: true,
  };
} else {
  poolConfig = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
    keepAlive: true,
  };
}

const pool = new Pool(poolConfig);

// Log errors from the pool to avoid unhandled exceptions crashing the process
pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
});

module.exports = pool;