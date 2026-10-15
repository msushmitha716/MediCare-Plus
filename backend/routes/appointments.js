const router = require('express').Router();
const db = require('../config/db');
const wrap = require('../utils/wrap');
const audit = require('../utils/audit');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', wrap(async (req, res) => {
  let sql = `SELECT a.*, p.name AS patient_name, u.name AS doctor_name
             FROM appointments a
             JOIN patients p ON p.id = a.patient_id
             JOIN users u ON u.id = a.doctor_id`;
  const params = [];
  if (req.user.role === 'doctor') { sql += ' WHERE a.doctor_id = ?'; params.push(req.user.id); }
  sql += ' ORDER BY a.appointment_date';
  const [rows] = await db.query(sql, params);
  res.json(rows);
}));

router.post('/', authorize('admin', 'receptionist'), wrap(async (req, res) => {
  const { patient_id, doctor_id, appointment_date, notes } = req.body || {};
  if (!patient_id || !doctor_id || !appointment_date)
    return res.status(400).json({ error: 'patient_id, doctor_id and appointment_date are required' });
  const [d] = await db.query("SELECT id FROM users WHERE id=? AND role='doctor'", [doctor_id]);
  if (!d.length) return res.status(400).json({ error: 'Doctor not found' });
  const [p] = await db.query('SELECT id FROM patients WHERE id=?', [patient_id]);
  if (!p.length) return res.status(400).json({ error: 'Patient not found' });
  const [r] = await db.query(
    'INSERT INTO appointments (patient_id, doctor_id, appointment_date, notes) VALUES (?,?,?,?)',
    [patient_id, doctor_id, appointment_date, notes || null]);
  await audit(req.user.id, 'CREATE', 'appointment', r.insertId);
  res.status(201).json({ id: r.insertId });
}));

router.patch('/:id/status', wrap(async (req, res) => {
  const { status } = req.body || {};
  if (!['Scheduled', 'Completed', 'Cancelled'].includes(status))
    return res.status(400).json({ error: 'Invalid status' });
  const [r] = await db.query('UPDATE appointments SET status=? WHERE id=?', [status, req.params.id]);
  if (!r.affectedRows) return res.status(404).json({ error: 'Appointment not found' });
  await audit(req.user.id, 'UPDATE', 'appointment', req.params.id);
  res.json({ message: 'Status updated' });
}));

module.exports = router;
