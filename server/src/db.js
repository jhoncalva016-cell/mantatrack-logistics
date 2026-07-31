const path = require('path');
   const fs = require('fs');
   const bcrypt = require('bcryptjs');
   const Database = require('better-sqlite3');

   const DATA_DIR = path.join(__dirname, '..', 'data');
   if (!fs.existsSync(DATA_DIR)) {
     fs.mkdirSync(DATA_DIR, { recursive: true });
   }

   const DB_PATH = path.join(DATA_DIR, 'mantatrack.sqlite');
   const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS companies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  city TEXT DEFAULT 'Manta, Ecuador',
  plan_key TEXT DEFAULT 'profesional',
  plan_name TEXT DEFAULT 'Plan Profesional',
  plan_renews_at TEXT DEFAULT '2026-08-15',
  plan_usage_pct INTEGER DEFAULT 75,
  plan_max_vehicles INTEGER DEFAULT 20,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS maintenance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL REFERENCES companies(id),
  truck_id INTEGER NOT NULL REFERENCES trucks(id),
  type TEXT NOT NULL,
  description TEXT,
  scheduled_date TEXT,
  status TEXT DEFAULT 'pendiente',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL REFERENCES companies(id),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS drivers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL REFERENCES companies(id),
  name TEXT NOT NULL,
  phone TEXT
);

CREATE TABLE IF NOT EXISTS trucks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL REFERENCES companies(id),
  code TEXT NOT NULL,
  plate TEXT,
  driver_id INTEGER REFERENCES drivers(id),
  destination TEXT,
  eta TEXT,
  status TEXT DEFAULT 'en_ruta',
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  route_index INTEGER DEFAULT 0,
  route_dir INTEGER DEFAULT 1,
  route_key TEXT DEFAULT 'ruta1',
  speed_kmh REAL DEFAULT 0,
  fuel_pct REAL DEFAULT 100,
  stopped_since TEXT,
  tracking_token TEXT UNIQUE,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS route_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  truck_id INTEGER NOT NULL REFERENCES trucks(id),
  date TEXT NOT NULL,
  origin TEXT,
  destination TEXT,
  distance_km REAL,
  duration_min INTEGER,
  fuel_gal REAL,
  driver_name TEXT
);

CREATE TABLE IF NOT EXISTS alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL REFERENCES companies(id),
  truck_id INTEGER NOT NULL REFERENCES trucks(id),
  type TEXT NOT NULL,
  severity TEXT NOT NULL,
  message TEXT NOT NULL,
  location TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  resolved INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_id INTEGER NOT NULL REFERENCES companies(id),
  kind TEXT NOT NULL,
  range_start TEXT,
  range_end TEXT,
  file_name TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`);

// Migración simple para bases de datos ya existentes (agrega columnas nuevas si faltan)
function tryAddColumn(table, columnDef) {
  try { db.exec(`ALTER TABLE ${table} ADD COLUMN ${columnDef}`); } catch (err) { /* ya existe */ }
}
tryAddColumn('companies', "plan_key TEXT DEFAULT 'profesional'");
tryAddColumn('companies', 'plan_max_vehicles INTEGER DEFAULT 20');

function seedIfEmpty() {
  const companyCount = db.prepare('SELECT COUNT(*) c FROM companies').get().c;
  if (companyCount > 0) return;

  const insertCompany = db.prepare('INSERT INTO companies (name, city) VALUES (?, ?)');
  const companyId = insertCompany.run('Manta Logistics S.A.', 'Manta, Manabí').lastInsertRowid;

  const passwordHash = bcrypt.hashSync('mantatrack2026', 10);
  db.prepare(`INSERT INTO users (company_id, name, email, password_hash, role)
              VALUES (?, ?, ?, ?, ?)`)
    .run(companyId, 'Administrador MantaTrack', 'admin@mantatrack.ec', passwordHash, 'admin');

  const insertDriver = db.prepare('INSERT INTO drivers (company_id, name, phone) VALUES (?, ?, ?)');
  const drivers = {
    'F. Cedeño': insertDriver.run(companyId, 'F. Cedeño', '0991234567').lastInsertRowid,
    'R. Loor': insertDriver.run(companyId, 'R. Loor', '0987654321').lastInsertRowid,
    'M. Ponce': insertDriver.run(companyId, 'M. Ponce', '0976543210').lastInsertRowid,
    'J. Moreira': insertDriver.run(companyId, 'J. Moreira', '0965432109').lastInsertRowid,
    'A. García': insertDriver.run(companyId, 'A. García', '0954321098').lastInsertRowid,
  };

  const { nanoid } = require('nanoid');
  const insertTruck = db.prepare(`
    INSERT INTO trucks (company_id, code, plate, driver_id, destination, eta, status, lat, lng, route_index, route_dir, route_key, speed_kmh, fuel_pct, tracking_token)
    VALUES (@company_id, @code, @plate, @driver_id, @destination, @eta, @status, @lat, @lng, @route_index, @route_dir, @route_key, @speed_kmh, @fuel_pct, @tracking_token)
  `);

  const trucks = [
    { code: 'CAM-01', plate: 'ABC-1234', driver: 'F. Cedeño', destination: 'Puerto Manta', eta: '14:30', status: 'en_ruta', route_key: 'ruta1', route_index: 2, speed_kmh: 46 },
    { code: 'CAM-04', plate: 'ABC-4321', driver: 'R. Loor', destination: 'Portoviejo', eta: '--', status: 'detenido', route_key: 'ruta2', route_index: 5, speed_kmh: 0 },
    { code: 'CAM-03', plate: 'ABC-3344', driver: 'M. Ponce', destination: 'Montecristi', eta: 'Entregado', status: 'entregado', route_key: 'ruta3', route_index: 8, speed_kmh: 0 },
    { code: 'CAM-06', plate: 'ABC-6677', driver: 'J. Moreira', destination: 'Portoviejo', eta: '15:10', status: 'desvio', route_key: 'ruta2', route_index: 3, speed_kmh: 38 },
    { code: 'CAM-07', plate: 'ABC-7788', driver: 'A. García', destination: 'Manta', eta: '16:00', status: 'en_ruta', route_key: 'ruta1', route_index: 6, speed_kmh: 52 },
    { code: 'CAM-02', plate: 'ABC-2233', driver: 'F. Cedeño', destination: 'Jaramijó', eta: '13:45', status: 'en_ruta', route_key: 'ruta4', route_index: 1, speed_kmh: 41 },
    { code: 'CAM-05', plate: 'ABC-5566', driver: 'R. Loor', destination: 'Montecristi', eta: '17:20', status: 'en_ruta', route_key: 'ruta3', route_index: 2, speed_kmh: 44 },
    { code: 'CAM-08', plate: 'ABC-8899', driver: 'M. Ponce', destination: 'Manta', eta: '12:10', status: 'entregado', route_key: 'ruta4', route_index: 9, speed_kmh: 0 },
  ];

  const ROUTES = require('./routes-geo');
  for (const t of trucks) {
    const pts = ROUTES[t.route_key];
    const p = pts[Math.min(t.route_index, pts.length - 1)];
    insertTruck.run({
      company_id: companyId,
      code: t.code,
      plate: t.plate,
      driver_id: drivers[t.driver],
      destination: t.destination,
      eta: t.eta,
      status: t.status,
      lat: p.lat,
      lng: p.lng,
      route_index: t.route_index,
      route_dir: 1,
      route_key: t.route_key,
      speed_kmh: t.speed_kmh,
      fuel_pct: 55 + Math.random() * 40,
      tracking_token: nanoid(12),
    });
  }

  // Seed some route history
  const insertHist = db.prepare(`INSERT INTO route_history
    (truck_id, date, origin, destination, distance_km, duration_min, fuel_gal, driver_name)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
  const truck1 = db.prepare("SELECT id FROM trucks WHERE code='CAM-01'").get().id;
  const histRows = [
    [truck1, '2026-07-10', 'Manta', 'Puerto Manta', 38, 38, 6.2, 'F. Cedeño'],
    [truck1, '2026-07-09', 'Manta', 'Portoviejo', 46, 65, 9.8, 'F. Cedeño'],
    [truck1, '2026-07-08', 'Portoviejo', 'Manta', 40, 57, 8.1, 'F. Cedeño'],
  ];
  for (const row of histRows) insertHist.run(...row);

  // Seed alerts
  const insertAlert = db.prepare(`INSERT INTO alerts (company_id, truck_id, type, severity, message, location)
    VALUES (?, ?, ?, ?, ?, ?)`);
  const camByCode = (code) => db.prepare('SELECT id FROM trucks WHERE code=?').get(code).id;
  insertAlert.run(companyId, camByCode('CAM-06'), 'desvio', 'high', 'El camión se desvió de la ruta establecida.', 'Portoviejo');
  insertAlert.run(companyId, camByCode('CAM-04'), 'detencion', 'medium', 'Lleva 12 minutos detenido sin reportar movimiento.', 'Vía Manta - Montecristi');
  insertAlert.run(companyId, camByCode('CAM-02'), 'combustible', 'low', 'Nivel de combustible por debajo del 15%.', 'Manta');

  const insertMaint = db.prepare(`INSERT INTO maintenance (company_id, truck_id, type, description, scheduled_date, status)
    VALUES (?, ?, ?, ?, ?, ?)`);
  insertMaint.run(companyId, camByCode('CAM-04'), 'Cambio de aceite', 'Mantenimiento preventivo cada 5,000 km.', '2026-07-25', 'pendiente');
  insertMaint.run(companyId, camByCode('CAM-02'), 'Revisión de frenos', 'Reportado por el conductor, ruido al frenar.', '2026-07-23', 'pendiente');
  insertMaint.run(companyId, camByCode('CAM-08'), 'Cambio de llantas', 'Desgaste en llantas traseras.', '2026-07-10', 'completado');

  console.log('Base de datos inicializada con datos de ejemplo.');
  console.log('Usuario demo: admin@mantatrack.ec / mantatrack2026');
}

seedIfEmpty();

module.exports = db;
