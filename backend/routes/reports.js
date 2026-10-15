const router = require('express').Router();
const db = require('../config/db');
const wrap = require('../utils/wrap');
const { authenticate, authorize } = require('../middleware/auth');

const count = async (sql) => (await db.query(sql))[0][0].c;

router.get('/summary', authenticate, authorize('admin'), wrap(async (req, res) => {
  res.json({
    patients: await count('SELECT COUNT(*) c FROM patients'),
    doctors: await count("SELECT COUNT(*) c FROM users WHERE role='doctor'"),
    appointments: await count('SELECT COUNT(*) c FROM appointments'),
    scheduled: await count("SELECT COUNT(*) c FROM appointments WHERE status='Scheduled'"),
    prescriptions: await count('SELECT COUNT(*) c FROM prescriptions')
  });
}));

module.exports = router;