import { useEffect, useState } from 'react';
import * as Network from 'expo-network';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const update = (connected: boolean | null) => {
      if (!cancelled) setIsOnline(connected ?? true);
    };

    const check = () =>
      Network.getNetworkStateAsync().then((s) => update(s.isConnected));

    // Seed immediately
    check();

    // Native listener for instant updates on real devices
    const sub = Network.addNetworkStateListener((s) => update(s.isConnected));

    // Poll every 2s as fallback — catches simulator gaps
    const interval = setInterval(check, 2000);

    return () => {
      cancelled = true;
      sub.remove();
      clearInterval(interval);
    };
  }, []);

  return { isOnline, isOffline: !isOnline };
}
