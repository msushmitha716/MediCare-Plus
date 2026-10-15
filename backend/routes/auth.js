const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const wrap = require('../utils/wrap');
const audit = require('../utils/audit');

router.post('/login', wrap(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
  const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  const u = rows[0];
  if (!u || !(await bcrypt.compare(password, u.password_hash)))
    return res.status(401).json({ error: 'Invalid email or password' });
  const token = jwt.sign({ id: u.id, name: u.name, role: u.role }, process.env.JWT_SECRET, { expiresIn: '8h' });
  await audit(u.id, 'LOGIN', 'user', u.id);
  res.json({ token, user: { id: u.id, name: u.name, email: u.email, role: u.role } });
}));

module.exports = router;