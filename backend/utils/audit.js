// audit.js - writes one row to audit_logs
const db = require('../config/db');
module.exports = (userId, action, entity, entityId) =>
  db.query('INSERT INTO audit_logs (user_id, action, entity, entity_id) VALUES (?,?,?,?)',
    [userId, action, entity, entityId || null]);