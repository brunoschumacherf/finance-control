import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  Timestamp,
  updateDoc,
  setDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Config, Expense, Income, Limit } from '../types';
import { normalizeKeyword } from '../utils/format';
import { getExpenseMonth, getMonthKey } from '../utils/month';

const configRef = doc(db, 'config', 'main');
const limitsRef = collection(db, 'limits');
const expensesRef = collection(db, 'expenses');
const incomesRef = collection(db, 'incomes');

const toDate = (value: unknown): Date => (value instanceof Timestamp ? value.toDate() : new Date());

const getMonthlySpent = (expenses: Expense[], keyword: string, monthKey: string): number =>
  expenses
    .filter((expense) => expense.keyword === keyword && getExpenseMonth(expense) === monthKey)
    .reduce((sum, expense) => sum + expense.valor, 0);

export const ensureConfig = async (): Promise<void> => {
  const snapshot = await getDoc(configRef);
  if (!snapshot.exists()) await setDoc(configRef, { saldo: 0, rendaMensal: 0 });
};

export const addExpense = async (payload: Omit<Expense, 'id' | 'createdAt'>): Promise<void> => {
  const keyword = normalizeKeyword(payload.keyword);
  const valor = Number(payload.valor);
  const mes = payload.mes ?? getMonthKey();
  if (!keyword || valor <= 0) throw new Error('Preencha categoria e valor corretamente');

  await runTransaction(db, async (transaction) => {
    const configSnap = await transaction.get(configRef);
    if (!configSnap.exists()) transaction.set(configRef, { saldo: 0, rendaMensal: 0 });

    const limitQuery = query(limitsRef);
    const limitDocs = await getDocs(limitQuery);
    const limitDoc = limitDocs.docs.find((item) => item.data().keyword === keyword);

    if (!limitDoc) throw new Error('Limite não encontrado para essa categoria');

    const limitData = limitDoc.data() as Omit<Limit, 'id'>;
    const expensesSnap = await getDocs(query(expensesRef, orderBy('createdAt', 'desc')));
    const expenses = expensesSnap.docs.map((item) => ({
      id: item.id,
      ...(item.data() as Omit<Expense, 'id' | 'createdAt'>),
      createdAt: toDate(item.data().createdAt)
    }));
    const gastoNoMes = getMonthlySpent(expenses, keyword, mes);

    if (gastoNoMes + valor > limitData.limite) throw new Error('Limite do mês excedido para essa categoria');

    const expenseDoc = doc(expensesRef);
    transaction.set(expenseDoc, {
      keyword,
      valor,
      descricao: payload.descricao.trim(),
      mes,
      createdAt: serverTimestamp()
    });
    transaction.update(configRef, { saldo: increment(-valor) });
  });
};

export const addIncome = async (payload: Omit<Income, 'id' | 'createdAt'>): Promise<void> => {
  const valor = Number(payload.valor);
  const mes = payload.mes ?? getMonthKey();
  if (valor <= 0) throw new Error('Informe um valor válido');
  await ensureConfig();
  await addDoc(incomesRef, { valor, descricao: payload.descricao.trim(), mes, createdAt: serverTimestamp() });
  await updateDoc(configRef, { saldo: increment(valor), rendaMensal: increment(valor) });
};

export const createLimit = async (payload: Omit<Limit, 'id' | 'restante'>): Promise<void> => {
  const keyword = normalizeKeyword(payload.keyword);
  const limite = Number(payload.limite);
  if (!keyword || limite <= 0) throw new Error('Preencha categoria e limite corretamente');
  await addDoc(limitsRef, { keyword, limite, restante: limite });
};

export const getExpenses = async (): Promise<Expense[]> => {
  const snapshot = await getDocs(query(expensesRef, orderBy('createdAt', 'desc')));
  return snapshot.docs.map((item) => ({
    id: item.id,
    ...(item.data() as Omit<Expense, 'id' | 'createdAt'>),
    createdAt: toDate(item.data().createdAt)
  }));
};

export const getLimits = async (): Promise<Limit[]> => {
  const snapshot = await getDocs(query(limitsRef, orderBy('keyword')));
  return snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<Limit, 'id'>) }));
};

export const getIncomes = async (): Promise<Income[]> => {
  const snapshot = await getDocs(query(incomesRef, orderBy('createdAt', 'desc')));
  return snapshot.docs.map((item) => ({
    id: item.id,
    ...(item.data() as Omit<Income, 'id' | 'createdAt'>),
    createdAt: toDate(item.data().createdAt)
  }));
};

export const getBalance = async (): Promise<Config> => {
  await ensureConfig();
  const snapshot = await getDoc(configRef);
  return snapshot.data() as Config;
};
