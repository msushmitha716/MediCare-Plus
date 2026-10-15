require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../config/db');

const users = [
  ['System Admin', 'admin@medicare.com', 'Admin@123', 'admin'],
  ['Dr. Rao', 'doctor@medicare.com', 'Doctor@123', 'doctor'],
  ['Front Desk', 'reception@medicare.com', 'Reception@123', 'receptionist']
];

(async () => {
  for (const [name, email, pw, role] of users) {
    const hash = await bcrypt.hash(pw, 10);
    await db.query(
      `INSERT INTO users (name, email, password_hash, role) VALUES (?,?,?,?)
       ON DUPLICATE KEY UPDATE name = VALUES(name)`, [name, email, hash, role]);
  }
  console.log('Seed complete');
  await db.end();
})();