const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * @swagger
 * tags:
 *   name: Imágenes
 *   description: Gestión de imágenes de productos
 */

/**
 * @swagger
 * /imagenes:
 *   get:
 *     summary: Obtener imágenes de un producto mediante query param
 *     tags: [Imágenes]
 *     parameters:
 *       - in: query
 *         name: producto_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto para obtener sus imágenes
 *     responses:
 *       200:
 *         description: Lista de imágenes obtenida correctamente
 *         content:
 *           application/json:
 *             example:
 *               - id: 1
 *                 url: "https://miapi.com/img/producto1.jpg"
 *                 producto_id: 1
 *               - id: 2
 *                 url: "https://miapi.com/img/producto2.jpg"
 *                 producto_id: 1
 *       400:
 *         description: Falta el parámetro producto_id
 */
router.get('/', async (req, res) => {
  const { producto_id } = req.query;

  if (!producto_id) {
    return res.status(400).json({ error: 'Falta el parámetro producto_id' });
  }

  try {
    const [rows] = await db.query(
      'SELECT * FROM imagenes_productos WHERE producto_id = ?',
      [producto_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /imagenes:
 *   post:
 *     summary: Agregar imagen a un producto
 *     tags: [Imágenes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *                 example: "https://miapi.com/img/nueva_imagen.jpg"
 *               producto_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Imagen agregada exitosamente
 *         content:
 *           application/json:
 *             example:
 *               id: 3
 *               url: "https://miapi.com/img/nueva_imagen.jpg"
 *               producto_id: 1
 */
router.post('/', async (req, res) => {
  const { url, producto_id } = req.body;

  try {
    const [result] = await db.query(
      'INSERT INTO imagenes_productos (url, producto_id) VALUES (?, ?)',
      [url, producto_id]
    );
    res.json({ id: result.insertId, url, producto_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /imagenes/{id}:
 *   delete:
 *     summary: Eliminar imagen de un producto
 *     tags: [Imágenes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la imagen a eliminar
 *     responses:
 *       200:
 *         description: Imagen eliminada correctamente
 *         content:
 *           application/json:
 *             example:
 *               mensaje: "Imagen eliminada"
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await db.query('DELETE FROM imagenes_productos WHERE id = ?', [id]);
    res.json({ mensaje: 'Imagen eliminada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
