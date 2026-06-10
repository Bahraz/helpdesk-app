exports.formatDate = (inputDate) => {
  const date = new Date(inputDate);

  const now = new Date();

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const startOfDate = new Date(date);
  startOfDate.setHours(0, 0, 0, 0);

  const diffTime = startOfToday - startOfDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  const time = date.toLocaleTimeString('pl-PL', {
    hour: '2-digit',
    minute: '2-digit'
  });

  if (diffDays === 0) return `Dziś ${time}`;
  if (diffDays === 1) return `Wczoraj ${time}`;
  if (diffDays === 2) return `Przedwczoraj ${time}`;

  return `${date.toLocaleDateString('pl-PL')} ${time}`;
};