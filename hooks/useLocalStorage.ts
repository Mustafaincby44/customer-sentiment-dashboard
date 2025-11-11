import { useState, useEffect } from 'react';

// This custom hook manages state in React and synchronizes it with the browser's localStorage.
// The key fix is separating the state update from the localStorage write operation.
function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  // 1. Initialize state from localStorage or initialValue.
  // This runs only once on the initial render.
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  // 2. Use a side effect (useEffect) to update localStorage whenever the state changes.
  // This hook runs after the component renders, ensuring `storedValue` is always up-to-date.
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);

  // 3. Return the state and the original React state setter function.
  // By returning `setStoredValue` directly, we allow React to correctly handle
  // functional updates (e.g., setProjects(prev => ...)), which solves the "stale state" bug.
  // The previous implementation had a custom setter that captured stale state.
  return [storedValue, setStoredValue];
}

export { useLocalStorage };
