// conexion.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: 'localhost',
  user: 'postgres',
  password: 'valery123', // ⚠️ Usa tu contraseña
  database: 'tienda',
  port: 5432,
});

pool.connect()
  .then(() => console.log('✅ Conectado a PostgreSQL (pgAdmin local)'))
  .catch(err => console.error('❌ Error de conexión:', err));

module.exports = pool;
