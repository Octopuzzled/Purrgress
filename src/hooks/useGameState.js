import { useEffect, useState } from 'react';
import { loadState, saveState } from '../lib/state.js';

/** Spielstand laden und bei jeder Änderung in localStorage speichern. */
export function useGameState() {
  const [state, setState] = useState(loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  return [state, setState];
}
