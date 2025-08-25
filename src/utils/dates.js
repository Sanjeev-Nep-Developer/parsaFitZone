import dayjs from 'dayjs';

export const addDays = (date, days) => dayjs(date).add(days, 'day').toDate();
export const addMonths = (date, months) => dayjs(date).add(months, 'month').toDate();

export const daysBetween = (from, to) => {
  return dayjs(to).startOf('day').diff(dayjs(from).startOf('day'), 'day');
};

export const daysRemaining = (expiry) => {
  const today = dayjs().startOf('day');
  return dayjs(expiry).startOf('day').diff(today, 'day');
};

export const clampMonths = (m) => {
  const n = parseInt(m, 10);
  if (isNaN(n) || n < 1) return 1;
  if (n > 12) return 12;
  return n;
};
