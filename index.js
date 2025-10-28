const express = require('express');
const cors = require('cors');
const path = require('path');

// Swagger
const { swaggerUi, swaggerSpec } = require('./swagger');

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Servir el frontend desde la carpeta /interfaz
app.use(express.static(path.join(__dirname, 'interfaz')));

// ✅ Ruta principal: mostrar tu tienda (index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'interfaz', 'index.html'));
});

// ✅ Rutas API
const categoriasRoutes = require('./routes/categorias');
const productosRoutes = require('./routes/productos');
const imagenesRoutes = require('./routes/imagenes');
const authRoutes = require('./routes/routes.js');

app.use('/categorias', categoriasRoutes);
app.use('/productos', productosRoutes);
app.use('/imagenes', imagenesRoutes);
app.use('/auth', authRoutes);

// ✅ Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ✅ Puerto dinámico para Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
  console.log(`📘 Swagger Docs disponibles en /api-docs`);
});
