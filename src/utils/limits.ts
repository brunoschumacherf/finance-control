import type { Expense, Limit } from '../types';

export type LimitWithUsage = Limit & { gasto: number; restante: number };

export const computeLimitsWithUsage = (limits: Limit[], expenses: Expense[]): LimitWithUsage[] =>
  limits.map((limit) => {
    const gasto = expenses
      .filter((expense) => expense.keyword === limit.keyword)
      .reduce((sum, expense) => sum + expense.valor, 0);
    return {
      ...limit,
      gasto,
      restante: Math.max(0, limit.limite - gasto)
    };
  });

export const getSpentByCategory = (expenses: Expense[], keyword: string): number =>
  expenses.filter((expense) => expense.keyword === keyword).reduce((sum, expense) => sum + expense.valor, 0);
