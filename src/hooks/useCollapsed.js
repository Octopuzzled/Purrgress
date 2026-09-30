import { useCallback, useState } from 'react';

const KEY = 'purrgress-ui-v1';

function read() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY) || 'null');
    return new Set(Array.isArray(data && data.collapsed) ? data.collapsed : []);
  } catch {
    return new Set();
  }
}

/** Welche Abschnitte eingeklappt sind – gilt nur für dieses Gerät und wird nicht abgeglichen. */
export function useCollapsed() {
  const [collapsed, setCollapsed] = useState(read);

  const toggle = useCallback((id) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem(KEY, JSON.stringify({ collapsed: [...next] }));
      } catch {
        /* ohne Speicher gilt es bis zum Neuladen */
      }
      return next;
    });
  }, []);

  return { isCollapsed: (id) => collapsed.has(id), toggle };
}
