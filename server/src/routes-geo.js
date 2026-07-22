// Puntos aproximados de rutas reales entre ciudades de Manabí, Ecuador.
// Se usan para simular el movimiento de los camiones sobre el mapa.

function interpolate(a, b, steps) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    pts.push({ lat: a.lat + (b.lat - a.lat) * t, lng: a.lng + (b.lng - a.lng) * t });
  }
  return pts;
}

const MANTA = { lat: -0.9677, lng: -80.7089 };
const PUERTO_MANTA = { lat: -0.9520, lng: -80.7280 };
const PORTOVIEJO = { lat: -1.0546, lng: -80.4525 };
const MONTECRISTI = { lat: -1.0500, lng: -80.6667 };
const JARAMIJO = { lat: -0.9500, lng: -80.6667 };

// Ruta 1: Manta <-> Puerto Manta
const ruta1 = [...interpolate(MANTA, PUERTO_MANTA, 6), ...interpolate(PUERTO_MANTA, MANTA, 6).slice(1)];

// Ruta 2: Manta <-> Portoviejo (vía Montecristi, como carretera real E30)
const ruta2 = [
  ...interpolate(MANTA, MONTECRISTI, 4),
  ...interpolate(MONTECRISTI, PORTOVIEJO, 6).slice(1),
  ...interpolate(PORTOVIEJO, MONTECRISTI, 6).slice(1),
  ...interpolate(MONTECRISTI, MANTA, 4).slice(1),
];

// Ruta 3: Manta <-> Montecristi
const ruta3 = [...interpolate(MANTA, MONTECRISTI, 6), ...interpolate(MONTECRISTI, MANTA, 6).slice(1)];

// Ruta 4: Manta <-> Jaramijó
const ruta4 = [...interpolate(MANTA, JARAMIJO, 6), ...interpolate(JARAMIJO, MANTA, 6).slice(1)];

module.exports = {
  MANTA, PUERTO_MANTA, PORTOVIEJO, MONTECRISTI, JARAMIJO,
  ruta1, ruta2, ruta3, ruta4,
};
