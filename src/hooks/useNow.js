import { useState, useEffect } from 'react';

export function useNow(interval) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    setNow(Date.now());
    if (!interval) return undefined;
    const iv = setInterval(() => setNow(Date.now()), interval);
    return () => clearInterval(iv);
  }, [interval]);
  return now;
}
