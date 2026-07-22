const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/', (req, res) => {
  const drivers = db.prepare('SELECT * FROM drivers WHERE company_id = ? ORDER BY name').all(req.user.companyId);
  const trucks = db.prepare('SELECT id, code, status, driver_id FROM trucks WHERE company_id = ?').all(req.user.companyId);
  res.json(drivers.map((d) => {
    const truck = trucks.find((t) => t.driver_id === d.id);
    return {
      id: d.id, name: d.name, phone: d.phone,
      truckCode: truck ? truck.code : null,
      truckStatus: truck ? truck.status : null,
    };
  }));
});

router.post('/', (req, res) => {
  const { name, phone } = req.body || {};
  if (!name) return res.status(400).json({ error: 'El nombre del conductor es requerido.' });
  const id = db.prepare('INSERT INTO drivers (company_id, name, phone) VALUES (?, ?, ?)')
    .run(req.user.companyId, name, phone || null).lastInsertRowid;
  res.status(201).json({ id, name, phone, truckCode: null, truckStatus: null });
});

router.delete('/:id', (req, res) => {
  const d = db.prepare('SELECT * FROM drivers WHERE id = ? AND company_id = ?').get(req.params.id, req.user.companyId);
  if (!d) return res.status(404).json({ error: 'Conductor no encontrado.' });
  db.prepare('UPDATE trucks SET driver_id = NULL WHERE driver_id = ?').run(d.id);
  db.prepare('DELETE FROM drivers WHERE id = ?').run(d.id);
  res.json({ ok: true });
});

module.exports = router;
