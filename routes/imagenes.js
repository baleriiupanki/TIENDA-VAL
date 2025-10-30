const express = require('express');
const router = express.Router();
const pool = require('../conexion');

/**
 * @swagger
 * tags:
 *   name: Imágenes
 *   description: Gestión de imágenes de productos
 */

// === Obtener imágenes de un producto ===
router.get('/', async (req, res) => {
  const { producto_id } = req.query;

  if (!producto_id) {
    return res.status(400).json({ error: 'Falta el parámetro producto_id' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM imagenes_productos WHERE producto_id = $1',
      [producto_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === Agregar imagen a un producto ===
router.post('/', async (req, res) => {
  const { url, producto_id } = req.body;

  try {
    const result = await pool.query(
      'INSERT INTO imagenes_productos (url, producto_id) VALUES ($1, $2) RETURNING id',
      [url, producto_id]
    );
    res.json({ id: result.rows[0].id, url, producto_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === Eliminar imagen ===
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM imagenes_productos WHERE id = $1', [id]);
    res.json({ mensaje: 'Imagen eliminada correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
