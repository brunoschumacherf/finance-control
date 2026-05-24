export type MonthKey = `${number}-${string}`;

export const getMonthKey = (date: Date = new Date()): MonthKey => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
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

export const isSameMonth = (date: Date, monthKey: string): boolean =>
  getMonthKey(date) === monthKey;

export const formatMonthLabel = (monthKey: string): string => {
  const { year, month } = parseMonthKey(monthKey);
  const date = new Date(year, month - 1, 1);
  return new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(date);
};

export const isCurrentMonth = (monthKey: string): boolean => getMonthKey() === monthKey;

export const getExpenseMonth = (expense: { mes?: string; createdAt: Date }): MonthKey =>
  (expense.mes ?? getMonthKey(expense.createdAt)) as MonthKey;

export const getIncomeMonth = (income: { mes?: string; createdAt: Date }): MonthKey =>
  (income.mes ?? getMonthKey(income.createdAt)) as MonthKey;
