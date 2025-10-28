// index.js
const express = require('express');
const cors = require('cors');

// NUEVO: importar Swagger
const { swaggerUi, swaggerSpec } = require('./swagger');

const app = express();
app.use(cors());
app.use(express.json());

// Usar Swagger UI en la ruta /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Importar rutas existentes
const categoriasRoutes = require('./routes/categorias');
const productosRoutes = require('./routes/productos');
const imagenesRoutes = require('./routes/imagenes');
const authRoutes = require('./routes/routes.js');

// Usar rutas con prefijos
app.use('/categorias', categoriasRoutes);
app.use('/productos', productosRoutes);
app.use('/imagenes', imagenesRoutes);
app.use('/auth', authRoutes);

app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
  console.log('Documentación de la API en http://localhost:3000/api-docs');
});
