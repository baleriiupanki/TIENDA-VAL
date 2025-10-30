// conexion.js
const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
const sslEnabled = process.env.DATABASE_SSL === 'true';

const pool = new Pool({
  connectionString,
  ssl: sslEnabled ? { rejectUnauthorized: false } : false,
});

pool.connect()
  .then(() => console.log('✅ Conectado correctamente a PostgreSQL (Render Cloud)'))
  .catch(err => console.error('❌ Error al conectar con PostgreSQL:', err));

module.exports = pool;
