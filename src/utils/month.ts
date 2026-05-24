export type MonthKey = `${number}-${string}`;

export const CURRENT_MONTH: MonthKey = '2026-05';

export const getMonthKey = (date: Date = new Date()): MonthKey => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

export const resolveMonth = (mes?: string): MonthKey => {
  const value = mes?.trim();
  if (value) return value as MonthKey;
  return CURRENT_MONTH;
};

export const parseMonthKey = (monthKey: string): { year: number; month: number } => {
  const [year, month] = monthKey.split('-').map(Number);
  return { year, month };
};

export const shiftMonth = (monthKey: string, delta: number): MonthKey => {
  const { year, month } = parseMonthKey(monthKey);
  const date = new Date(year, month - 1 + delta, 1);
  return getMonthKey(date);
};

export const formatMonthLabel = (monthKey: string): string => {
  const { year, month } = parseMonthKey(monthKey);
  const date = new Date(year, month - 1, 1);
  return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(date);
};

export const formatMonthShort = (monthKey: string): string => {
  const { year, month } = parseMonthKey(monthKey);
  return `${String(month).padStart(2, '0')}/${String(year).slice(-2)}`;
};

export const isCurrentMonth = (monthKey: string): boolean => CURRENT_MONTH === monthKey;

export const getExpenseMonth = (expense: { mes?: string }): MonthKey => resolveMonth(expense.mes);

export const getIncomeMonth = (income: { mes?: string }): MonthKey => resolveMonth(income.mes);

export const getLimitMonth = (limit: { mes?: string }): MonthKey => resolveMonth(limit.mes);

export const filterByMonth = <T extends { mes?: string }>(items: T[], monthKey: string): T[] =>
  items.filter((item) => resolveMonth(item.mes) === monthKey);

export const filterLimitsByMonth = <T extends { mes?: string }>(limits: T[], monthKey: string): T[] =>
  limits.filter((limit) => resolveMonth(limit.mes) === monthKey);
