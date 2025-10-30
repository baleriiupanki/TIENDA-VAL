// conexion.js
const { Pool } = require('pg');
require('dotenv').config();

// Render entrega la URL de la base de datos completa (DATABASE_URL)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Necesario para Render Cloud PostgreSQL
  },
});

// Evento informativo
pool.on('connect', () => {
  console.log('✅ Conectado correctamente a PostgreSQL (Render Cloud)');
});

pool.on('error', (err) => {
  console.error('❌ Error inesperado en PostgreSQL:', err);
  process.exit(-1);
});

module.exports = pool;
