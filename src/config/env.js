// Reads settings from .env once, so the rest of the code never touches process.env directly
require('dotenv').config({ quiet: true });

module.exports = {
  port: Number(process.env.PORT) || 3000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/srb',
  adminKey: process.env.ADMIN_KEY || ''
};
