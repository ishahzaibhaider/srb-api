// server.js connects to MongoDB, creates the HTTP server, attaches Socket.IO and listens
const http = require('http');
const { port, mongoUri } = require('./config/env');
const { connectDB } = require('./config/db');
const createApp = require('./app');
const { initSocket } = require('./realtime/socket');

async function start() {
  await connectDB(mongoUri);
  const app = await createApp();
  const server = http.createServer(app);
  initSocket(server);
  server.listen(port, () => {
    console.log(`srb-api listening on http://localhost:${port}`);
    console.log(`  REST     http://localhost:${port}/api/v1`);
    console.log(`  GraphQL  http://localhost:${port}/graphql`);
    console.log(`  Board    http://localhost:${port}/board.html?room=ROOM-01`);
  });
  return server;
}

if (require.main === module) {
  start().catch(err => {
    console.error('Failed to start:', err.message);
    process.exit(1);
  });
}

module.exports = start;
