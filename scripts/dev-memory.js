// Runs the API against a throw-away in-memory MongoDB (no MongoDB installation needed).
// Data is seeded at start-up and lost when the process stops. Run with: npm run dev:memory
const { MongoMemoryServer } = require('mongodb-memory-server');

(async () => {
  const mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri('srb');
  const mongoose = require('mongoose');
  const start = require('../src/server');
  await start();
  await require('./seed')();

  const stop = async () => { await mongoose.disconnect(); await mongod.stop(); process.exit(0); };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
})().catch(err => { console.error(err); process.exit(1); });
