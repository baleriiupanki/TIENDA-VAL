const express = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../db'); // tu conexión MySQL con promisePool

const router = express.Router();

const SECRET_KEY = 'mi_secreto_ultra_seguro'; // mejor guardarlo en un .env en producción

// Ruta para registrar usuario con contraseña MD5
router.post('/register', async (req, res) => {
  const { usuario, password } = req.body;

  if (!usuario || !password) {
    return res.status(400).json({ message: 'Usuario y contraseña son requeridos' });
  }

  try {
    // Verificar si usuario ya existe
    const [existing] = await pool.query('SELECT id FROM usuarios WHERE usuario = ?', [usuario]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'El usuario ya existe' });
    }

    // Insertar usuario, la contraseña se guarda con MD5 en SQL
    await pool.query('INSERT INTO usuarios (usuario, password) VALUES (?, MD5(?))', [usuario, password]);

    res.status(201).json({ message: 'Usuario registrado con éxito' });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Ruta para login con contraseña MD5
router.post('/login', async (req, res) => {
  const { usuario, password } = req.body;

  if (!usuario || !password) {
    return res.status(400).json({ message: 'Usuario y contraseña son requeridos' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT * FROM usuarios WHERE usuario = ? AND password = MD5(?)',
      [usuario, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
    }

    const user = rows[0];
    const token = jwt.sign({ id: user.id, usuario: user.usuario }, SECRET_KEY, { expiresIn: '1h' });

    res.json({ message: 'Login exitoso', token });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

module.exports = router;
