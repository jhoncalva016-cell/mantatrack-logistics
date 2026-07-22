const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/', (req, res) => {
  const { truckId, from, to } = req.query;
  const trucks = db.prepare('SELECT id FROM trucks WHERE company_id = ?').all(req.user.companyId).map(t => t.id);
  if (!trucks.length) return res.json({ rows: [], stats: null });

  let query = `SELECT rh.*, t.code AS truck_code FROM route_history rh
               JOIN trucks t ON t.id = rh.truck_id
               WHERE rh.truck_id IN (${trucks.map(() => '?').join(',')})`;
  const params = [...trucks];

  if (truckId) { query += ' AND rh.truck_id = ?'; params.push(truckId); }
  if (from) { query += ' AND rh.date >= ?'; params.push(from); }
  if (to) { query += ' AND rh.date <= ?'; params.push(to); }
  query += ' ORDER BY rh.date DESC';

  const rows = db.prepare(query).all(...params);

  const stats = rows.reduce((acc, r) => ({
    trips: acc.trips + 1,
    distance: acc.distance + (r.distance_km || 0),
    duration: acc.duration + (r.duration_min || 0),
    fuel: acc.fuel + (r.fuel_gal || 0),
  }), { trips: 0, distance: 0, duration: 0, fuel: 0 });

  res.json({
    rows: rows.map(r => ({
      id: r.id, date: r.date, truckCode: r.truck_code, origin: r.origin, destination: r.destination,
      distanceKm: r.distance_km, durationMin: r.duration_min, fuelGal: r.fuel_gal, driverName: r.driver_name,
    })),
    stats,
  });
});

module.exports = router;
