// swagger.js
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Tienda',
      version: '1.0.0',
      description: 'Documentación de la API Tienda con Swagger',
    },
    servers: [
      {
        url: 'http://localhost:3000', // URL de tu servidor
        description: 'Servidor local',
      },
    ],
  },
  apis: ['./routes/*.js'], // Apuntamos a todas las rutas en la carpeta routes
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = { swaggerUi, swaggerSpec };
