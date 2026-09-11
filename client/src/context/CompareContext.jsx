import { createContext, useContext, useEffect, useState } from 'react';

const CompareContext = createContext(null);
const STORAGE_KEY = 'compareProductIds';
const MAX_COMPARE = 4;

export function CompareProvider({ children }) {
  const [ids, setIds] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }, [ids]);

  function toggle(id) {
    setIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= MAX_COMPARE) return prev; // silently ignore past the cap
      return [...prev, id];
    });
  }

  function clear() {
    setIds([]);
  }

  function isSelected(id) {
    return ids.includes(id);
  }

  return (
    <CompareContext.Provider value={{ ids, toggle, clear, isSelected, maxCompare: MAX_COMPARE }}>
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error('useCompare must be used within CompareProvider');
  return ctx;
}
