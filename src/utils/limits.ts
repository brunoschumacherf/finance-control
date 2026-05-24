import type { Expense, Limit } from '../types';
import { getExpenseMonth } from './month';

export type LimitWithUsage = Limit & { gasto: number; restante: number; excedido: boolean; excedente: number };

export const computeLimitsWithUsage = (limits: Limit[], expenses: Expense[]): LimitWithUsage[] =>
  limits.map((limit) => {
    const gasto = expenses
      .filter((expense) => expense.keyword === limit.keyword)
      .reduce((sum, expense) => sum + expense.valor, 0);
    const excedido = gasto > limit.limite;
    return {
      ...limit,
      gasto,
      restante: limit.limite - gasto,
      excedido,
      excedente: excedido ? gasto - limit.limite : 0
    };
  });

export const getSpentByCategory = (expenses: Expense[], keyword: string, monthKey?: string): number =>
  expenses
    .filter(
      (expense) =>
        expense.keyword === keyword && (!monthKey || getExpenseMonth(expense) === monthKey)
    )
    .reduce((sum, expense) => sum + expense.valor, 0);
