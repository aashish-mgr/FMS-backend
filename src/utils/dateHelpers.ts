// Small date-range helpers for the dashboard/report modules described in the
// SRS (today / this week / this month / this year KPI cards). Not used yet
// by auth or income, but scaffolded here since those modules will need it.

export const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export const startOfWeek = () => {
  const d = startOfToday();
  const day = d.getDay(); // 0 = Sunday
  d.setDate(d.getDate() - day);
  return d;
};

export const startOfMonth = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
};

export const startOfYear = () => {
  const d = new Date();
  return new Date(d.getFullYear(), 0, 1);
};
