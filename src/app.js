const express = require('express');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const userRoutes = require('./userRoutes');
const checkoutRoutes = require('./checkoutRoutes');

const app = express();
app.use(bodyParser.json());

// Endpoint de Health Check
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Configuração do Swagger (exemplo, ajuste conforme seu projeto)
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Checkout API',
      version: '1.0.0',
    },
  },
  apis: ['./src/routes/*.js'], // Ajuste o caminho para seus arquivos de rota
};
const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Registra as rotas da aplicação
app.use('/api/users', userRoutes);
app.use('/api/checkout', checkoutRoutes);

module.exports = app;