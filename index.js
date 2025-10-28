// ===============================
// 🌸 TIENDA DE VAL - Servidor API
// ===============================

require('dotenv').config(); // Para variables de entorno (opcional)
const express = require('express');
const cors = require('cors');
const path = require('path');

// === Swagger ===
const { swaggerUi, swaggerSpec } = require('./swagger');

const app = express();

// ===============================
// 🔐 CONFIGURACIÓN DE CORS
// ===============================

// Si tu frontend está desplegado en Netlify, Render o Vercel, pon su URL aquí:
const allowedOrigin = process.env.ALLOWED_ORIGIN || 'https://tienda-val.onrender.com'; // Cambia por tu URL real

app.use(cors({
  origin: allowedOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ===============================
// 🧱 Middlewares generales
// ===============================
app.use(express.json());

// ===============================
// 🌍 Filtro de IPs (tipo VPN)
app.use((req, res, next) => {
  let clientIP = req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress;

  // Si hay múltiples IPs (tras proxies), toma la primera
  if (clientIP && clientIP.includes(',')) {
    clientIP = clientIP.split(',')[0].trim();
  }

  const allowedIPs = [
    '45.232.149.130', // Ejemplo: IP del compañero
    '45.232.149.146',
    '45.232.149.145',
    '::1', // localhost
    '127.0.0.1'
  ];

  if (allowedIPs.includes(clientIP)) {
    next();
  } else {
    console.warn(`🚫 IP no autorizada: ${clientIP}`);
    res.status(403).json({ message: 'Acceso denegado: IP no permitida' });
  }
});

// ===============================
// 🖥️ Servir Frontend desde /interfaz
// ===============================
app.use(express.static(path.join(__dirname, 'interfaz')));

// Página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'interfaz', 'index.html'));
});

// ===============================
// 📘 Documentación Swagger
// ===============================
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ===============================
// 🧩 Rutas de la API
// ===============================
const categoriasRoutes = require('./routes/categorias');
const productosRoutes = require('./routes/productos');
const imagenesRoutes = require('./routes/imagenes');
const authRoutes = require('./routes/routes');

app.use('/categorias', categoriasRoutes);
app.use('/productos', productosRoutes);
app.use('/imagenes', imagenesRoutes);
app.use('/auth', authRoutes);

// ===============================
// 🚀 Servidor Render / Local
// ===============================
const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor TIENDA DE VAL corriendo en el puerto ${PORT}`);
  console.log(`📘 Swagger disponible en /api-docs`);
  console.log(`✅ CORS habilitado para: ${allowedOrigin}`);
});
