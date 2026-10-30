// Creates the one admin account (registration can only make students).
// Uses ADMIN_EMAIL and ADMIN_PASSWORD from .env. Run: npm run seed:admin
const mongoose = require('mongoose');
const { mongoUri, adminEmail, adminPassword } = require('../src/config/env');
const User = require('../src/models/User');

async function seedAdmin() {
  if (!adminPassword) throw new Error('Set ADMIN_PASSWORD in .env first');
  if (await User.exists({ email: adminEmail })) {
    console.log(`Admin ${adminEmail} already exists`);
    return;
  }
  await User.create({ name: 'System Admin', email: adminEmail, password: adminPassword, role: 'admin' });
  console.log(`Admin created: ${adminEmail}`);
}

if (require.main === module) {
  mongoose.connect(mongoUri)
    .then(seedAdmin)
    .then(() => mongoose.disconnect())
    .catch(err => { console.error(err.message); process.exit(1); });
}

module.exports = seedAdmin;
