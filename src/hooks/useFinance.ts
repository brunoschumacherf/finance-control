import { collection, doc, onSnapshot, orderBy, query, Timestamp } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import { db } from '../firebase';
import { ensureConfig } from '../services/financeService';
import type { Config, Expense, Income, Limit } from '../types';
import { computeLimitsWithUsage, type LimitWithUsage } from '../utils/limits';

const toDate = (value: unknown): Date => (value instanceof Timestamp ? value.toDate() : new Date());

export type FinanceState = {
  config: Config;
  expenses: Expense[];
  incomes: Income[];
  limits: Limit[];
  limitsWithUsage: LimitWithUsage[];
  loading: boolean;
  totalGasto: number;
  totalRecebido: number;
  limiteMaisUsado?: LimitWithUsage;
};

export const useFinance = (): FinanceState => {
  const [config, setConfig] = useState<Config>({ saldo: 0, rendaMensal: 0 });
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [limits, setLimits] = useState<Limit[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    void ensureConfig();
    const unsubscribeConfig = onSnapshot(doc(db, 'config', 'main'), (snapshot) => {
      if (snapshot.exists()) setConfig(snapshot.data() as Config);
    });
    const unsubscribeExpenses = onSnapshot(query(collection(db, 'expenses'), orderBy('createdAt', 'desc')), (snapshot) => {
      setExpenses(
        snapshot.docs.map((item) => ({
          id: item.id,
          ...(item.data() as Omit<Expense, 'id' | 'createdAt'>),
          createdAt: toDate(item.data().createdAt)
        }))
      );
      setLoading(false);
    });
    const unsubscribeIncomes = onSnapshot(query(collection(db, 'incomes'), orderBy('createdAt', 'desc')), (snapshot) => {
      setIncomes(
        snapshot.docs.map((item) => ({
          id: item.id,
          ...(item.data() as Omit<Income, 'id' | 'createdAt'>),
          createdAt: toDate(item.data().createdAt)
        }))
      );
    });
    const unsubscribeLimits = onSnapshot(query(collection(db, 'limits'), orderBy('keyword')), (snapshot) => {
      setLimits(snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<Limit, 'id'>) })));
    });
    return () => {
      unsubscribeConfig();
      unsubscribeExpenses();
      unsubscribeIncomes();
      unsubscribeLimits();
    };
  }, []);

  const limitsWithUsage = useMemo(() => computeLimitsWithUsage(limits, expenses), [limits, expenses]);
  const totalGasto = useMemo<number>(() => expenses.reduce((sum, item) => sum + item.valor, 0), [expenses]);
  const totalRecebido = useMemo<number>(() => incomes.reduce((sum, item) => sum + item.valor, 0), [incomes]);
  const limiteMaisUsado = useMemo(
    () =>
      [...limitsWithUsage]
        .filter((limit) => limit.limite > 0 && limit.gasto > 0)
        .sort((a, b) => b.gasto / b.limite - a.gasto / a.limite)[0],
    [limitsWithUsage]
  );

  return { config, expenses, incomes, limits, limitsWithUsage, loading, totalGasto, totalRecebido, limiteMaisUsado };
};
