const express = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../conexion');
const crypto = require('crypto');

const router = express.Router();
const SECRET_KEY = 'mi_secreto_ultra_seguro'; // guárdalo en .env en producción

// === Registrar usuario ===
router.post('/register', async (req, res) => {
  const { usuario, password } = req.body;

  if (!usuario || !password) {
    return res.status(400).json({ message: 'Usuario y contraseña son requeridos' });
  }

  try {
    const existing = await pool.query('SELECT id FROM usuarios WHERE usuario = $1', [usuario]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'El usuario ya existe' });
    }

    const md5Pass = crypto.createHash('md5').update(password).digest('hex');
    await pool.query('INSERT INTO usuarios (usuario, password) VALUES ($1, $2)', [usuario, md5Pass]);

    res.status(201).json({ message: 'Usuario registrado con éxito' });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// === Login ===
router.post('/login', async (req, res) => {
  const { usuario, password } = req.body;

  if (!usuario || !password) {
    return res.status(400).json({ message: 'Usuario y contraseña son requeridos' });
  }

  try {
    const md5Pass = crypto.createHash('md5').update(password).digest('hex');
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE usuario = $1 AND password = $2',
      [usuario, md5Pass]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
    }

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, usuario: user.usuario }, SECRET_KEY, { expiresIn: '1h' });

    res.json({ message: 'Login exitoso', token });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

module.exports = router;
