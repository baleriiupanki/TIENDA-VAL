const express = require('express');
const router = express.Router();
const db = require('../db');

/**
 * @swagger
 * tags:
 *   name: Productos
 *   description: Gestión de productos en la tienda
 */

/**
 * @swagger
 * /productos:
 *   get:
 *     summary: Obtener todos los productos con su categoría
 *     tags: [Productos]
 *     parameters:
 *       - in: query
 *         name: categoria
 *         required: false
 *         schema:
 *           type: string
 *         description: Filtrar productos por categoría
 *     responses:
 *       200:
 *         description: Lista de productos obtenida correctamente
 *         content:
 *           application/json:
 *             example:
 *               - id: 1
 *                 nombre: "Laptop Gamer"
 *                 precio: 3500
 *                 categoria: "Computadoras"
 *               - id: 2
 *                 nombre: "Teclado Mecánico"
 *                 precio: 150
 *                 categoria: "Accesorios"
 */
router.get('/', async (req, res) => {
  const { categoria } = req.query;
  try {
    let query = `
      SELECT p.id, p.nombre, p.precio, c.nombre AS categoria
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
    `;
    const params = [];

    if (categoria) {
      query += ' WHERE c.nombre = ?';
      params.push(categoria);
    }

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /productos:
 *   post:
 *     summary: Crear un nuevo producto
 *     tags: [Productos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Nuevo producto"
 *               precio:
 *                 type: number
 *                 example: 299.99
 *               categoria_id:
 *                 type: integer
 *                 example: 1
 *               descripcion:
 *                 type: string
 *                 example: "Descripción del producto"
 *     responses:
 *       200:
 *         description: Producto creado exitosamente
 *         content:
 *           application/json:
 *             example:
 *               id: 3
 *               nombre: "Nuevo producto"
 *               precio: 299.99
 *               categoria_id: 1
 *               descripcion: "Descripción del producto"
 */
router.post('/', async (req, res) => {
  const { nombre, precio, categoria_id, descripcion } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO productos (nombre, precio, categoria_id, descripcion) VALUES (?, ?, ?, ?)',
      [nombre, precio, categoria_id, descripcion]
    );
    res.json({ id: result.insertId, nombre, precio, categoria_id, descripcion });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /productos/{id}:
 *   put:
 *     summary: Actualizar un producto
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Producto actualizado"
 *               precio:
 *                 type: number
 *                 example: 349.99
 *               categoria_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Producto actualizado exitosamente
 *         content:
 *           application/json:
 *             example:
 *               id: 3
 *               nombre: "Producto actualizado"
 *               precio: 349.99
 *               categoria_id: 1
 */
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, precio, categoria_id } = req.body;
  try {
    await db.query(
      'UPDATE productos SET nombre = ?, precio = ?, categoria_id = ? WHERE id = ?',
      [nombre, precio, categoria_id, id]
    );
    res.json({ id, nombre, precio, categoria_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /productos/{id}:
 *   delete:
 *     summary: Eliminar un producto
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto a eliminar
 *     responses:
 *       200:
 *         description: Producto eliminado correctamente
 *         content:
 *           application/json:
 *             example:
 *               mensaje: "Producto eliminado"
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM productos WHERE id = ?', [id]);
    res.json({ mensaje: 'Producto eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /productos/{id}:
 *   get:
 *     summary: Obtener un producto por ID, con descripción e imágenes
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Producto encontrado
 *         content:
 *           application/json:
 *             example:
 *               id: 1
 *               nombre: "Laptop Gamer"
 *               precio: 3500
 *               descripcion: "Descripción del producto"
 *               categoria: "Computadoras"
 *               imagenes:
 *                 - id: 1
 *                   url: "https://miapi.com/img/producto1.jpg"
 *       404:
 *         description: Producto no encontrado
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [productos] = await db.query(`
      SELECT p.id, p.nombre, p.precio, p.descripcion, c.nombre AS categoria
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE p.id = ?
    `, [id]);

    if (productos.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const producto = productos[0];
    const [imagenes] = await db.query('SELECT * FROM imagenes_productos WHERE producto_id = ?', [id]);
    producto.imagenes = imagenes;

    res.json(producto);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
