const getBerlinHour = (date: Date): number => {
  const hourPart = new Intl.DateTimeFormat('de', {
    hour: '2-digit',
    hour12: false,
    timeZone: 'Europe/Berlin',
  })
    .formatToParts(date)
    .find((part) => part.type === 'hour');

  return hourPart ? parseInt(hourPart.value, 10) : date.getHours();
};

export const getGreetingForDate = (date: Date): string => {
  const hour = getBerlinHour(date);
  return hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
};

export const useGreeting = () => {
  const greeting = getGreetingForDate(new Date());
  return { greeting };
};
