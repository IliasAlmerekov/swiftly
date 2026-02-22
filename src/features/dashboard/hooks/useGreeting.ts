export const useGreeting = () => {
  const now = new Date();
  const hour = new Intl.DateTimeFormat('de', {
    hour: '2-digit',
    hour12: false,
    timeZone: 'Europe/Berlin',
  })
    .formatToParts(now)
    .find((p) => p.type === 'hour');
  const h = hour ? parseInt(hour.value, 10) : now.getHours();
  const greeting = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';

  return { greeting };
};
