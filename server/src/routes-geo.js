// Puntos aproximados de rutas reales dentro del Distrito Metropolitano de Quito, Ecuador.
// Se usan para simular el movimiento de los camiones sobre el mapa.

function interpolate(a, b, steps) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    pts.push({ lat: a.lat + (b.lat - a.lat) * t, lng: a.lng + (b.lng - a.lng) * t });
  }
  return pts;
}

const QUITO = { lat: -0.1807, lng: -78.4678 };
const AEROPUERTO = { lat: -0.1292, lng: -78.3575 };
const CUMBAYA = { lat: -0.2038, lng: -78.4325 };
const SANGOLQUI = { lat: -0.3325, lng: -78.4508 };
const CALDERON = { lat: -0.1167, lng: -78.4333 };

// Ruta 1: Quito (Centro/Norte) <-> Aeropuerto Internacional Mariscal Sucre (Tababela)
const ruta1 = [...interpolate(QUITO, AEROPUERTO, 6), ...interpolate(AEROPUERTO, QUITO, 6).slice(1)];

// Ruta 2: Quito <-> Sangolquí (Valle de Los Chillos), vía Av. General Rumiñahui
const ruta2 = [
  ...interpolate(QUITO, CUMBAYA, 3),
  ...interpolate(CUMBAYA, SANGOLQUI, 6).slice(1),
  ...interpolate(SANGOLQUI, CUMBAYA, 6).slice(1),
  ...interpolate(CUMBAYA, QUITO, 3).slice(1),
];

// Ruta 3: Quito <-> Cumbayá (Valle de Tumbaco), vía Ruta Viva
const ruta3 = [...interpolate(QUITO, CUMBAYA, 6), ...interpolate(CUMBAYA, QUITO, 6).slice(1)];

// Ruta 4: Quito <-> Calderón (norte del DMQ)
const ruta4 = [...interpolate(QUITO, CALDERON, 6), ...interpolate(CALDERON, QUITO, 6).slice(1)];

module.exports = {
  QUITO, AEROPUERTO, CUMBAYA, SANGOLQUI, CALDERON,
  ruta1, ruta2, ruta3, ruta4,
};
