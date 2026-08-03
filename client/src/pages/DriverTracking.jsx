import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../api/client';
import Logo from '../components/Logo';

export default function DriverTracking() {
  const { token } = useParams();
  const [truck, setTruck] = useState(null);
  const [error, setError] = useState('');
  const [sharing, setSharing] = useState(false);
  const [lastSent, setLastSent] = useState(null);
  const [locationError, setLocationError] = useState('');
  const watchIdRef = useRef(null);

  useEffect(() => {
    axios.get(`${API_URL}/api/tracking/${token}`)
      .then((res) => setTruck(res.data))
      .catch(() => setError('Este enlace no es válido o el camión ya no existe.'));
  }, [token]);

  function startSharing() {
    if (!navigator.geolocation) {
      setLocationError('Este navegador no soporta GPS. Prueba con Chrome o Safari actualizados.');
      return;
    }
    setLocationError('');
    setSharing(true);

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude, speed } = position.coords;
        const speedKmh = speed && speed > 0 ? Math.round(speed * 3.6) : 0;
        setLastSent(new Date());
        try {
          await axios.post(`${API_URL}/api/tracking/${token}/location`, {
            lat: latitude, lng: longitude, speedKmh,
          });
        } catch (err) {
          // si falla un envío puntual, seguimos intentando con la siguiente posición
        }
      },
      (err) => {
        setLocationError('No se pudo acceder al GPS: ' + (err.message || 'permiso denegado.'));
        setSharing(false);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );
  }

  function stopSharing() {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setSharing(false);
  }

  useEffect(() => () => stopSharing(), []);

  return (
    <div className="min-h-screen bg-[#0F1826] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <Logo size={40} />
          <div className="leading-tight text-white text-left">
            <p className="font-display font-bold text-base tracking-tight">CALGUY TRACK</p>
            <p className="text-[10px] tracking-[0.2em]" style={{ color: '#F5A623' }}>LOGISTICS</p>
          </div>
        </div>

        <div className="bg-white rounded-xl2 shadow-2xl p-6">
          {error && <p className="text-sm text-alertred text-center">{error}</p>}

          {truck && !error && (
            <>
              <p className="text-xs text-ink-900/40 uppercase tracking-wide text-center mb-1">Modo conductor</p>
              <h1 className="text-xl font-display font-bold text-ink-900 text-center mb-1">{truck.code}</h1>
              <p className="text-sm text-ink-900/60 text-center mb-6">
                {truck.plate && `${truck.plate} · `}{truck.model || 'Vehículo'}
              </p>

              {!sharing ? (
                <button
                  onClick={startSharing}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm rounded-lg py-3.5 transition-colors"
                >
                  Iniciar seguimiento en este teléfono
                </button>
              ) : (
                <>
                  <div className="flex items-center justify-center gap-2 text-alertgreen text-sm font-semibold mb-3">
                    <span className="w-2 h-2 rounded-full bg-alertgreen animate-pulse" />
                    Compartiendo ubicación en vivo
                  </div>
                  {lastSent && (
                    <p className="text-xs text-ink-900/40 text-center mb-4">
                      Última actualización: {lastSent.toLocaleTimeString('es-EC')}
                    </p>
                  )}
                  <button
                    onClick={stopSharing}
                    className="w-full border border-black/10 hover:bg-black/[0.03] text-ink-900 font-semibold text-sm rounded-lg py-3.5 transition-colors"
                  >
                    Detener seguimiento
                  </button>
                </>
              )}

              {locationError && (
                <p className="text-xs text-alertred bg-alertred/10 rounded-lg px-3 py-2 mt-4">{locationError}</p>
              )}

              <p className="text-xs text-ink-900/40 text-center mt-5">
                Mantén esta página abierta y la pantalla encendida mientras conduces para que la ubicación
                se siga actualizando. Al cerrar la pestaña o apagar la pantalla, el envío se detiene.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
