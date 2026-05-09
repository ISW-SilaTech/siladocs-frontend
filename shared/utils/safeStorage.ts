export const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window === 'undefined') return null;
      return localStorage.getItem(key);
    } catch (error) {
      console.warn(`Failed to access localStorage.getItem('${key}'):`, error);
      return null;
    }
  },

  setItem: (key: string, value: string): void => {
    try {
      if (typeof window === 'undefined') return;
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn(`Failed to access localStorage.setItem('${key}'):`, error);
    }
  },

  removeItem: (key: string): void => {
    try {
      if (typeof window === 'undefined') return;
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to access localStorage.removeItem('${key}'):`, error);
    }
  },
};
