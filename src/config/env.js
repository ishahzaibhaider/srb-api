// Reads settings from .env once, so the rest of the code never touches process.env directly
require('dotenv').config({ quiet: true });

module.exports = {
  port: Number(process.env.PORT) || 3000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/srb',
  adminKey: process.env.ADMIN_KEY || '',
  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpiresIn: '15m',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@srb.edu.pk',
  adminPassword: process.env.ADMIN_PASSWORD || ''
};
