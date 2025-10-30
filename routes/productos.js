const express = require('express');
const router = express.Router();
const pool = require('../conexion');

/**
 * @swagger
 * tags:
 *   name: Productos
 *   description: Gestión de productos en la tienda
 */

// === Obtener productos ===
router.get('/', async (req, res) => {
  const { categoria } = req.query;
  try {
    let query = `
      SELECT p.id, p.nombre, p.precio, p.descripcion, c.nombre AS categoria
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
    `;
    const params = [];

    if (categoria) {
      query += ' WHERE c.nombre = $1';
      params.push(categoria);
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === Crear producto ===
router.post('/', async (req, res) => {
  const { nombre, precio, categoria_id, descripcion } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO productos (nombre, precio, categoria_id, descripcion) VALUES ($1, $2, $3, $4) RETURNING id',
      [nombre, precio, categoria_id, descripcion]
    );
    res.json({ id: result.rows[0].id, nombre, precio, categoria_id, descripcion });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === Actualizar producto ===
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, precio, categoria_id } = req.body;
  try {
    await pool.query(
      'UPDATE productos SET nombre = $1, precio = $2, categoria_id = $3 WHERE id = $4',
      [nombre, precio, categoria_id, id]
    );
    res.json({ id, nombre, precio, categoria_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === Eliminar producto ===
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM productos WHERE id = $1', [id]);
    res.json({ mensaje: 'Producto eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === Obtener producto por ID (con imágenes) ===
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const producto = await pool.query(`
      SELECT p.id, p.nombre, p.precio, p.descripcion, c.nombre AS categoria
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE p.id = $1
    `, [id]);

    if (producto.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const imagenes = await pool.query('SELECT * FROM imagenes_productos WHERE producto_id = $1', [id]);
    producto.rows[0].imagenes = imagenes.rows;

    res.json(producto.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
