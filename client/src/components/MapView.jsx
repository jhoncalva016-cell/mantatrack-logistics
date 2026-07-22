import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { statusMeta } from '../lib/status';
import 'leaflet/dist/leaflet.css';

function truckIcon(status) {
  const meta = statusMeta(status);
  const html = `
    <div style="
      width:30px;height:30px;border-radius:9999px;
      background:${meta.dot};
      display:flex;align-items:center;justify-content:center;
      box-shadow:0 2px 6px rgba(16,24,38,0.35);
      border:2px solid white;
    ">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 16V6a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v10" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M14 9h4l3 3v4h-7V9Z" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>`;
  return L.divIcon({ html, className: '', iconSize: [30, 30], iconAnchor: [15, 15] });
}

export default function MapView({ trucks, center, height = 460, focusTruckId = null, trail = null }) {
  const mapCenter = center || { lat: -0.9677, lng: -80.7089 };

  return (
    <div style={{ height }} className="rounded-xl2 overflow-hidden border border-black/5">
      <MapContainer
        center={[mapCenter.lat, mapCenter.lng]}
        zoom={11}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {trail && trail.length > 1 && (
          <Polyline positions={trail.map((p) => [p.lat, p.lng])} pathOptions={{ color: '#1D6FA5', weight: 3, opacity: 0.7 }} />
        )}
        {trucks.map((t) => (
          <Marker key={t.id} position={[t.lat, t.lng]} icon={truckIcon(t.status)}>
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{t.code}</p>
                <p className="text-ink-900/60">{statusMeta(t.status).label}</p>
                {t.destination && <p className="text-ink-900/60">Destino: {t.destination}</p>}
                {typeof t.speedKmh === 'number' && <p className="text-ink-900/60">{t.speedKmh} km/h</p>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
