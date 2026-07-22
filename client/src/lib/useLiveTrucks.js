import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import api, { API_URL } from '../api/client';

export function useLiveTrucks() {
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);

  const refresh = useCallback(async () => {
    const { data } = await api.get('/trucks');
    setTrucks(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const socket = io(API_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('trucks:update', (updates) => {
      setTrucks((prev) => {
        const byId = new Map(prev.map((t) => [t.id, t]));
        for (const u of updates) {
          const existing = byId.get(u.id);
          if (existing) byId.set(u.id, { ...existing, ...u });
        }
        return Array.from(byId.values());
      });
    });

    return () => socket.disconnect();
  }, [refresh]);

  return { trucks, loading, refresh };
}
