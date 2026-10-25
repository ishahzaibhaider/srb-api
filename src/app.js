// app.js builds the Express application (no listening here; see server.js)
const path = require('path');
const express = require('express');
const logger = require('./middleware/logger');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');
const healthRoutes = require('./routes/health.routes');
const apiRoutes = require('./routes');
const { createGraphQLMiddleware } = require('./graphql');

async function createApp() {
  const app = express();

  app.use(logger);
  app.use(express.json());
  app.use(express.static(path.join(__dirname, '..', 'public'))); // board.html, admin.html

  app.use('/health', healthRoutes);
  app.use('/api/v1', apiRoutes);
  app.use('/graphql', await createGraphQLMiddleware());

  app.use(notFound);     // unknown routes
  app.use(errorHandler); // must be last
  return app;
}

module.exports = createApp;
