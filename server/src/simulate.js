const db = require('./db');
const ROUTES = require('./routes-geo');

const DESTS = {
  ruta1: 'Aeropuerto Mariscal Sucre',
  ruta2: 'Sangolquí',
  ruta3: 'Cumbayá',
  ruta4: 'Calderón',
};

function haversineKm(a, b) {
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

function tick(io) {
  const trucks = db.prepare('SELECT * FROM trucks').all();
  const updateStmt = db.prepare(`UPDATE trucks SET lat=?, lng=?, route_index=?, route_dir=?, speed_kmh=?, fuel_pct=?, status=?, stopped_since=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`);
  const insertAlert = db.prepare(`INSERT INTO alerts (company_id, truck_id, type, severity, message, location) VALUES (?, ?, ?, ?, ?, ?)`);
  const insertHist = db.prepare(`INSERT INTO route_history (truck_id, date, origin, destination, distance_km, duration_min, fuel_gal, driver_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);

  const changed = [];

  for (const t of trucks) {
    if (t.status === 'entregado') continue;

    const pts = ROUTES[t.route_key];
    if (!pts) continue;

    // Camiones "detenidos" ocasionalmente reanudan marcha
    if (t.status === 'detenido') {
      if (Math.random() < 0.15) {
        updateStmt.run(t.lat, t.lng, t.route_index, t.route_dir, 35 + Math.random() * 15, t.fuel_pct, 'en_ruta', null, t.id);
        changed.push(t.id);
      }
      continue;
    }

    // Pequeña probabilidad de generar eventos aleatorios
    const roll = Math.random();
    let nextStatus = t.status === 'desvio' ? 'desvio' : 'en_ruta';

    if (roll < 0.02 && t.status !== 'desvio') {
      nextStatus = 'detenido';
      const driver = t.driver_id ? db.prepare('SELECT name FROM drivers WHERE id=?').get(t.driver_id) : null;
      updateStmt.run(t.lat, t.lng, t.route_index, t.route_dir, 0, t.fuel_pct, nextStatus, new Date().toISOString(), t.id);
      insertAlert.run(t.company_id, t.id, 'detencion', 'medium', `${t.code} lleva detenido sin reportar movimiento.`, DESTS[t.route_key] || t.destination);
      changed.push(t.id);
      continue;
    }

    // Avanza a lo largo de la ruta
    let idx = t.route_index + t.route_dir;
    let dir = t.route_dir;
    if (idx >= pts.length) { idx = pts.length - 2; dir = -1; }
    if (idx < 0) { idx = 1; dir = 1; }

    const from = { lat: t.lat, lng: t.lng };
    const to = pts[idx];
    const distStep = haversineKm(from, to);
    const speed = 30 + Math.random() * 30;
    const fuel = Math.max(5, t.fuel_pct - distStep * 0.35);

    // Camión llega al final de su ruta: se marca entregado y registra historial
    const reachedEnd = (dir === 1 && idx === pts.length - 1);
    if (reachedEnd && Math.random() < 0.3) {
      updateStmt.run(to.lat, to.lng, idx, dir, 0, fuel, 'entregado', null, t.id);
      const driver = t.driver_id ? db.prepare('SELECT name FROM drivers WHERE id=?').get(t.driver_id) : null;
      insertHist.run(
        t.id, new Date().toISOString().slice(0, 10), 'Manta', DESTS[t.route_key] || t.destination,
        Math.round(20 + Math.random() * 30), Math.round(40 + Math.random() * 40),
        Number((4 + Math.random() * 6).toFixed(1)), driver ? driver.name : 'N/D'
      );
      changed.push(t.id);
      continue;
    }

    if (fuel < 15 && t.fuel_pct >= 15) {
      insertAlert.run(t.company_id, t.id, 'combustible', 'low', `${t.code} tiene nivel de combustible por debajo del 15%.`, DESTS[t.route_key] || t.destination);
    }

    updateStmt.run(to.lat, to.lng, idx, dir, speed, fuel, nextStatus, null, t.id);
    changed.push(t.id);
  }

  if (changed.length && io) {
    const rows = db.prepare(`SELECT * FROM trucks WHERE id IN (${changed.map(() => '?').join(',')})`).all(...changed);
    io.emit('trucks:update', rows.map(t => ({
      id: t.id, code: t.code, lat: t.lat, lng: t.lng, status: t.status,
      speedKmh: Math.round(t.speed_kmh), fuelPct: Math.round(t.fuel_pct), updatedAt: t.updated_at,
    })));
  }
}

function startSimulation(io, intervalMs = 4000) {
  setInterval(() => {
    try { tick(io); } catch (err) { console.error('Error en simulación:', err.message); }
  }, intervalMs);
  console.log(`Simulación de flota iniciada (cada ${intervalMs / 1000}s).`);
}

module.exports = { startSimulation };
