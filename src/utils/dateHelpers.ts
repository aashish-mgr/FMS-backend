
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

export interface DateRange {
  gte: Date;
  lte: Date;
}

export function endOfToday(): Date {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}
export interface DateRange {
  gte: Date;
  lte: Date;
}
export function rangeFrom(start: Date): DateRange {
  return { gte: start, lte: endOfToday() };
}



// export function rangeFrom(start: Date): DateRange {
//   return { gte: start, lte: endOfToday() };
// }