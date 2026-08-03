const express = require('express');
const { nanoid } = require('nanoid');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

const STATUS_LABEL = {
  en_ruta: 'En ruta',
  detenido: 'Detenido',
  entregado: 'Entregado',
  desvio: 'Desvío de ruta',
  sin_senal: 'Esperando GPS',
};

function serializeTruck(t) {
  const driver = t.driver_id ? db.prepare('SELECT name, phone FROM drivers WHERE id = ?').get(t.driver_id) : null;
  return {
    id: t.id,
    code: t.code,
    plate: t.plate,
    model: t.model,
    driver: driver ? driver.name : '—',
    driverPhone: driver ? driver.phone : null,
    destination: t.destination,
    eta: t.eta,
    status: t.status,
    statusLabel: STATUS_LABEL[t.status] || t.status,
    lat: t.lat,
    lng: t.lng,
    speedKmh: Math.round(t.speed_kmh),
    fuelPct: Math.round(t.fuel_pct),
    trackingMode: t.tracking_mode || 'simulado',
    trackingToken: t.tracking_token,
    updatedAt: t.updated_at,
  };
}

router.get('/', (req, res) => {
  const trucks = db.prepare('SELECT * FROM trucks WHERE company_id = ? ORDER BY code').all(req.user.companyId);
  res.json(trucks.map(serializeTruck));
});

router.get('/summary', (req, res) => {
  const companyId = req.user.companyId;
  const trucks = db.prepare('SELECT * FROM trucks WHERE company_id = ?').all(companyId);
  const activeCount = trucks.filter(t => t.status !== 'entregado').length;
  const delivered = trucks.filter(t => t.status === 'entregado').length;
  const onTimePct = trucks.length ? Math.round(((trucks.length - trucks.filter(t => t.status === 'desvio').length) / trucks.length) * 100) : 100;
  const activeAlerts = db.prepare("SELECT COUNT(*) c FROM alerts WHERE company_id = ? AND resolved = 0").get(companyId).c;
  const fuelSavings = (trucks.length * 6.1).toFixed(0);

  const truckIds = trucks.map(t => t.id);
  const today = new Date().toISOString().slice(0, 10);
  let todayStats = { distance: 0, duration: 0, fuel: 0, trips: 0 };
  if (truckIds.length) {
    const rows = db.prepare(`SELECT * FROM route_history WHERE truck_id IN (${truckIds.map(() => '?').join(',')}) AND date = ?`).all(...truckIds, today);
    todayStats = rows.reduce((acc, r) => ({
      distance: acc.distance + (r.distance_km || 0),
      duration: acc.duration + (r.duration_min || 0),
      fuel: acc.fuel + (r.fuel_gal || 0),
      trips: acc.trips + 1,
    }), todayStats);
  }
  if (!todayStats.trips && truckIds.length) {
    const recent = db.prepare(`SELECT * FROM route_history WHERE truck_id IN (${truckIds.map(() => '?').join(',')}) ORDER BY date DESC LIMIT 6`).all(...truckIds);
    todayStats = recent.reduce((acc, r) => ({
      distance: acc.distance + (r.distance_km || 0),
      duration: acc.duration + (r.duration_min || 0),
      fuel: acc.fuel + (r.fuel_gal || 0),
      trips: acc.trips + 1,
    }), { distance: 0, duration: 0, fuel: 0, trips: 0 });
  }

  res.json({
    activeTrucks: activeCount,
    deliveredToday: delivered,
    onTimePct,
    activeAlerts,
    fuelSavingsUsd: Number(fuelSavings),
    distanceTodayKm: Math.round(todayStats.distance),
    movingTimeTodayMin: Math.round(todayStats.duration),
    fuelTodayGal: Number(todayStats.fuel.toFixed(1)),
    center: { lat: -0.1807, lng: -78.4678 },
  });
});

router.get('/:id', (req, res) => {
  const t = db.prepare('SELECT * FROM trucks WHERE id = ? AND company_id = ?').get(req.params.id, req.user.companyId);
  if (!t) return res.status(404).json({ error: 'Camión no encontrado.' });
  res.json(serializeTruck(t));
});

router.post('/', (req, res) => {
  const { code, plate, model, driverName, driverPhone, destination, eta, trackingMode } = req.body || {};
  if (!code) return res.status(400).json({ error: 'El código del camión es requerido.' });

  let driverId = null;
  if (driverName) {
    const existing = db.prepare('SELECT id FROM drivers WHERE company_id = ? AND name = ?').get(req.user.companyId, driverName);
    if (existing) {
      driverId = existing.id;
      if (driverPhone) db.prepare('UPDATE drivers SET phone = ? WHERE id = ?').run(driverPhone, driverId);
    } else {
      driverId = db.prepare('INSERT INTO drivers (company_id, name, phone) VALUES (?, ?, ?)').run(req.user.companyId, driverName, driverPhone || null).lastInsertRowid;
    }
  }

  const mode = trackingMode === 'real' ? 'real' : 'simulado';
  const center = { lat: -0.1807, lng: -78.4678 };
  const initialStatus = mode === 'real' ? 'sin_senal' : 'en_ruta';

  const id = db.prepare(`INSERT INTO trucks
    (company_id, code, plate, model, driver_id, destination, eta, status, lat, lng, route_key, tracking_token, fuel_pct, tracking_mode)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ruta1', ?, ?, ?)`)
    .run(req.user.companyId, code, plate || null, model || null, driverId, destination || null, eta || null, initialStatus, center.lat, center.lng, nanoid(12), 80, mode).lastInsertRowid;

  const t = db.prepare('SELECT * FROM trucks WHERE id = ?').get(id);
  res.status(201).json(serializeTruck(t));
});

router.patch('/:id', (req, res) => {
  const t = db.prepare('SELECT * FROM trucks WHERE id = ? AND company_id = ?').get(req.params.id, req.user.companyId);
  if (!t) return res.status(404).json({ error: 'Camión no encontrado.' });

  const fields = ['destination', 'eta', 'status', 'plate', 'model'];
  const updates = [];
  const values = [];
  for (const f of fields) {
    if (req.body[f] !== undefined) {
      updates.push(`${f} = ?`);
      values.push(req.body[f]);
    }
  }
  if (req.body.driverId !== undefined) {
    updates.push('driver_id = ?');
    values.push(req.body.driverId || null);
  }
  if (updates.length) {
    values.push(t.id);
    db.prepare(`UPDATE trucks SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(...values);
  }
  const updated = db.prepare('SELECT * FROM trucks WHERE id = ?').get(t.id);
  res.json(serializeTruck(updated));
});

router.delete('/:id', (req, res) => {
  const t = db.prepare('SELECT * FROM trucks WHERE id = ? AND company_id = ?').get(req.params.id, req.user.companyId);
  if (!t) return res.status(404).json({ error: 'Camión no encontrado.' });
  db.prepare('DELETE FROM alerts WHERE truck_id = ?').run(t.id);
  db.prepare('DELETE FROM route_history WHERE truck_id = ?').run(t.id);
  db.prepare('DELETE FROM trucks WHERE id = ?').run(t.id);
  res.json({ ok: true });
});

module.exports = router;
