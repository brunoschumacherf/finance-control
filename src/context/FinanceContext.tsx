import { collection, doc, onSnapshot, orderBy, query, Timestamp } from 'firebase/firestore';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { db } from '../firebase';
import { ensureConfig } from '../services/financeService';
import type { Config, Expense, Income, Limit } from '../types';
import { formatMonthLabel, getExpenseMonth, getIncomeMonth, getMonthKey, isCurrentMonth, shiftMonth } from '../utils/month';

const toDate = (value: unknown): Date => (value instanceof Timestamp ? value.toDate() : new Date());

export type LimitWithUsage = Limit & { gasto: number; restante: number };

export type FinanceState = {
  config: Config;
  expenses: Expense[];
  incomes: Income[];
  limits: Limit[];
  monthExpenses: Expense[];
  monthIncomes: Income[];
  limitsWithUsage: LimitWithUsage[];
  selectedMonth: string;
  monthLabel: string;
  isCurrentMonth: boolean;
  loading: boolean;
  totalGasto: number;
  totalRecebido: number;
  saldoMes: number;
  limiteMaisUsado?: LimitWithUsage;
  setSelectedMonth: (monthKey: string) => void;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  goToCurrentMonth: () => void;
};

const FinanceContext = createContext<FinanceState | null>(null);

const computeLimitsWithUsage = (limits: Limit[], expenses: Expense[]): LimitWithUsage[] =>
  limits.map((limit) => {
    const gasto = expenses
      .filter((expense) => expense.keyword === limit.keyword)
      .reduce((sum, expense) => sum + expense.valor, 0);
    const restante = Math.max(0, limit.limite - gasto);
    return { ...limit, gasto, restante };
  });

export const FinanceProvider = ({ children }: { children: ReactNode }): JSX.Element => {
  const [config, setConfig] = useState<Config>({ saldo: 0, rendaMensal: 0 });
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [limits, setLimits] = useState<Limit[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedMonth, setSelectedMonth] = useState<string>(getMonthKey());

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

  const monthExpenses = useMemo(
    () => expenses.filter((expense) => getExpenseMonth(expense) === selectedMonth),
    [expenses, selectedMonth]
  );

  const monthIncomes = useMemo(
    () => incomes.filter((income) => getIncomeMonth(income) === selectedMonth),
    [incomes, selectedMonth]
  );

  const limitsWithUsage = useMemo(
    () => computeLimitsWithUsage(limits, monthExpenses),
    [limits, monthExpenses]
  );

  const totalGasto = useMemo(() => monthExpenses.reduce((sum, item) => sum + item.valor, 0), [monthExpenses]);
  const totalRecebido = useMemo(() => monthIncomes.reduce((sum, item) => sum + item.valor, 0), [monthIncomes]);
  const saldoMes = totalRecebido - totalGasto;

  const limiteMaisUsado = useMemo(
    () =>
      [...limitsWithUsage]
        .filter((limit) => limit.limite > 0)
        .sort((a, b) => b.gasto / b.limite - a.gasto / a.limite)[0],
    [limitsWithUsage]
  );

  const value: FinanceState = {
    config,
    expenses,
    incomes,
    limits,
    monthExpenses,
    monthIncomes,
    limitsWithUsage,
    selectedMonth,
    monthLabel: formatMonthLabel(selectedMonth),
    isCurrentMonth: isCurrentMonth(selectedMonth),
    loading,
    totalGasto,
    totalRecebido,
    saldoMes,
    limiteMaisUsado,
    setSelectedMonth,
    goToPreviousMonth: () => setSelectedMonth(shiftMonth(selectedMonth, -1)),
    goToNextMonth: () => setSelectedMonth(shiftMonth(selectedMonth, 1)),
    goToCurrentMonth: () => setSelectedMonth(getMonthKey())
  };

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
};

export const useFinance = (): FinanceState => {
  const context = useContext(FinanceContext);
  if (!context) throw new Error('useFinance deve ser usado dentro de FinanceProvider');
  return context;
};

export const MonthSelector = (): JSX.Element => {
  const { monthLabel, isCurrentMonth, goToPreviousMonth, goToNextMonth, goToCurrentMonth } = useFinance();

  return (
    <div className="month-selector">
      <button type="button" onClick={goToPreviousMonth} className="month-selector-btn" aria-label="Mês anterior">
        <ChevronLeft size={18} />
      </button>
      <div className="month-selector-label">
        <p className="month-selector-title capitalize">{monthLabel}</p>
        {!isCurrentMonth && (
          <button type="button" onClick={goToCurrentMonth} className="month-selector-today">
            Ir para o mês atual
          </button>
        )}
      </div>
      <button type="button" onClick={goToNextMonth} className="month-selector-btn" aria-label="Próximo mês">
        <ChevronRight size={18} />
      </button>
    </div>
  );
};
