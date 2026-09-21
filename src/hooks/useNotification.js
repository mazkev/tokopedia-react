import { useState, useCallback } from 'react';

export function useNotification() {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((message) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  }, []);

  return {
    notifications,
    addNotification,
  };
}

export default useNotification;
