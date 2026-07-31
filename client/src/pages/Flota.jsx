import { useState } from 'react';
import { useLiveTrucks } from '../lib/useLiveTrucks';
import FleetTable from '../components/FleetTable';
import TruckDetailPanel from '../components/TruckDetailPanel';

export default function Flota() {
  const { trucks, loading } = useLiveTrucks();
  const [detailTruck, setDetailTruck] = useState(null);

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6">
      <h1 className="text-xl font-display font-bold text-ink-900 mb-1">Flota</h1>
      <p className="text-sm text-ink-900/50 mb-5">Listado completo de camiones, conductores y estado actual.</p>

      {!loading && <FleetTable trucks={trucks} onSelect={setDetailTruck} selectedId={detailTruck?.id} />}

      <TruckDetailPanel truck={detailTruck} onClose={() => setDetailTruck(null)} />
    </div>
  );
}
