import { useMemo } from 'react';

export const useGreeting = () => {
  const greeting = useMemo(() => {
    const now = new Date();
    const hour = new Intl.DateTimeFormat('de', {
      hour: '2-digit',
      hour12: false,
      timeZone: 'Europe/Berlin',
    })
      .formatToParts(now)
      .find((p) => p.type === 'hour');
    const h = hour ? parseInt(hour.value, 10) : now.getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  return { greeting };
};
