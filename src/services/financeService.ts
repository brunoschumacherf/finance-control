import {
  addDoc,
  collection,
  deleteDoc,
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
import { getSpentByCategory } from '../utils/limits';
import { getLimitMonth, resolveMonth } from '../utils/month';

const configRef = doc(db, 'config', 'main');
const limitsRef = collection(db, 'limits');
const expensesRef = collection(db, 'expenses');
const incomesRef = collection(db, 'incomes');

const VARIEDADOS_CATEGORY = 'variados';
const DEFAULT_VARIEDADOS_LIMIT = 500;

const toDate = (value: unknown): Date => (value instanceof Timestamp ? value.toDate() : new Date());

const findLimitForMonth = (docs: { id: string; data: () => Record<string, unknown> }[], keyword: string, mes: string) =>
  docs.find((item) => item.data().keyword === keyword && getLimitMonth(item.data() as Limit) === mes);

export const ensureConfig = async (): Promise<void> => {
  const snapshot = await getDoc(configRef);
  if (!snapshot.exists()) await setDoc(configRef, { saldo: 0, rendaMensal: 0 });
};

export const addExpense = async (payload: Omit<Expense, 'id' | 'createdAt'>): Promise<{ usedVariados: boolean; createdCategory: boolean; limitExceeded: boolean }> => {
  const rawKeyword = payload.keyword.trim();
  const valor = Number(payload.valor);
  const mes = resolveMonth(payload.mes);
  const useVariados = !rawKeyword;
  const keyword = useVariados ? VARIEDADOS_CATEGORY : normalizeKeyword(rawKeyword);

  if (valor <= 0) throw new Error('Informe um valor válido');
  if (!useVariados && !keyword) throw new Error('Categoria inválida');

  let createdCategory = false;
  let limitExceeded = false;

  await runTransaction(db, async (transaction) => {
    const configSnap = await transaction.get(configRef);
    if (!configSnap.exists()) transaction.set(configRef, { saldo: 0, rendaMensal: 0 });

    const limitDocs = await getDocs(query(limitsRef));
    const limitDoc = findLimitForMonth(limitDocs.docs, keyword, mes);
    let limitId: string;

    if (!limitDoc) {
      if (!useVariados) throw new Error('Categoria não encontrada para este mês. Crie o limite em Limites.');

      const limite = Math.max(valor, DEFAULT_VARIEDADOS_LIMIT);
      const newLimitRef = doc(limitsRef);
      limitId = newLimitRef.id;
      transaction.set(newLimitRef, { keyword, limite, restante: limite, mes });
      createdCategory = true;
    } else {
      const limitData = limitDoc.data() as Omit<Limit, 'id'>;
      const expensesSnap = await getDocs(query(expensesRef, orderBy('createdAt', 'desc')));
      const expenses = expensesSnap.docs.map((item) => ({
        id: item.id,
        ...(item.data() as Omit<Expense, 'id' | 'createdAt'>),
        createdAt: toDate(item.data().createdAt)
      }));
      const gastoAtual = getSpentByCategory(expenses, keyword, mes);
      limitExceeded = gastoAtual + valor > limitData.limite;
      limitId = limitDoc.id;
    }

    const expenseDoc = doc(expensesRef);
    transaction.set(expenseDoc, {
      keyword,
      valor,
      descricao: payload.descricao.trim(),
      mes,
      createdAt: serverTimestamp()
    });
    transaction.update(doc(db, 'limits', limitId), { restante: increment(-valor) });
    transaction.update(configRef, { saldo: increment(-valor) });
  });

  return { usedVariados: useVariados, createdCategory, limitExceeded };
};

export const addIncome = async (payload: Omit<Income, 'id' | 'createdAt'>): Promise<void> => {
  const valor = Number(payload.valor);
  const mes = resolveMonth(payload.mes);
  if (valor <= 0) throw new Error('Informe um valor válido');
  await ensureConfig();
  await addDoc(incomesRef, { valor, descricao: payload.descricao.trim(), mes, createdAt: serverTimestamp() });
  await updateDoc(configRef, { saldo: increment(valor), rendaMensal: increment(valor) });
};

export const createLimit = async (payload: Omit<Limit, 'id' | 'restante'>): Promise<void> => {
  const keyword = normalizeKeyword(payload.keyword);
  const limite = Number(payload.limite);
  const mes = resolveMonth(payload.mes);
  if (!keyword || limite <= 0) throw new Error('Preencha categoria e limite corretamente');

  const existing = await getDocs(query(limitsRef));
  const duplicate = existing.docs.some(
    (item) => item.data().keyword === keyword && getLimitMonth(item.data() as Limit) === mes
  );
  if (duplicate) throw new Error('Já existe limite para esta categoria neste mês');

  await addDoc(limitsRef, { keyword, limite, restante: limite, mes });
};

export const updateExpense = async (id: string, payload: Omit<Expense, 'id' | 'createdAt'>): Promise<void> => {
  const expenseRef = doc(db, 'expenses', id);
  const snapshot = await getDoc(expenseRef);
  if (!snapshot.exists()) throw new Error('Gasto não encontrado');

  const old = snapshot.data() as Omit<Expense, 'id'>;
  const rawKeyword = payload.keyword.trim();
  const keyword = rawKeyword ? normalizeKeyword(rawKeyword) : VARIEDADOS_CATEGORY;
  const valor = Number(payload.valor);
  const mes = resolveMonth(payload.mes);

  if (valor <= 0) throw new Error('Informe um valor válido');

  await updateDoc(expenseRef, {
    keyword,
    valor,
    descricao: payload.descricao.trim(),
    mes
  });

  const diff = valor - old.valor;
  if (diff !== 0) await updateDoc(configRef, { saldo: increment(-diff) });
};

export const deleteExpense = async (id: string): Promise<void> => {
  const expenseRef = doc(db, 'expenses', id);
  const snapshot = await getDoc(expenseRef);
  if (!snapshot.exists()) throw new Error('Gasto não encontrado');

  const { valor } = snapshot.data() as Expense;
  await deleteDoc(expenseRef);
  await updateDoc(configRef, { saldo: increment(valor) });
};

export const updateIncome = async (id: string, payload: Omit<Income, 'id' | 'createdAt'>): Promise<void> => {
  const incomeRef = doc(db, 'incomes', id);
  const snapshot = await getDoc(incomeRef);
  if (!snapshot.exists()) throw new Error('Receita não encontrada');

  const old = snapshot.data() as Omit<Income, 'id'>;
  const valor = Number(payload.valor);
  const mes = resolveMonth(payload.mes);

  if (valor <= 0) throw new Error('Informe um valor válido');

  await updateDoc(incomeRef, {
    valor,
    descricao: payload.descricao.trim(),
    mes
  });

  const diff = valor - old.valor;
  if (diff !== 0) await updateDoc(configRef, { saldo: increment(diff), rendaMensal: increment(diff) });
};

export const deleteIncome = async (id: string): Promise<void> => {
  const incomeRef = doc(db, 'incomes', id);
  const snapshot = await getDoc(incomeRef);
  if (!snapshot.exists()) throw new Error('Receita não encontrada');

  const { valor } = snapshot.data() as Income;
  await deleteDoc(incomeRef);
  await updateDoc(configRef, { saldo: increment(-valor), rendaMensal: increment(-valor) });
};

export const updateLimit = async (id: string, payload: Omit<Limit, 'id' | 'restante'>): Promise<void> => {
  const keyword = normalizeKeyword(payload.keyword);
  const limite = Number(payload.limite);
  const mes = resolveMonth(payload.mes);

  if (!keyword || limite <= 0) throw new Error('Preencha categoria e limite corretamente');

  const existing = await getDocs(query(limitsRef));
  const duplicate = existing.docs.some(
    (item) => item.id !== id && item.data().keyword === keyword && getLimitMonth(item.data() as Limit) === mes
  );
  if (duplicate) throw new Error('Já existe limite para esta categoria neste mês');

  await updateDoc(doc(db, 'limits', id), { keyword, limite, mes });
};

export const deleteLimit = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'limits', id));
};

export const getExpenses = async (): Promise<Expense[]> => {
  const snapshot = await getDocs(query(expensesRef, orderBy('createdAt', 'desc')));
  return snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<Expense, 'id' | 'createdAt'>), createdAt: toDate(item.data().createdAt) }));
};

export const getLimits = async (): Promise<Limit[]> => {
  const snapshot = await getDocs(query(limitsRef, orderBy('keyword')));
  return snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<Limit, 'id'>) }));
};

export const getIncomes = async (): Promise<Income[]> => {
  const snapshot = await getDocs(query(incomesRef, orderBy('createdAt', 'desc')));
  return snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<Income, 'id' | 'createdAt'>), createdAt: toDate(item.data().createdAt) }));
};

export const getBalance = async (): Promise<Config> => {
  await ensureConfig();
  const snapshot = await getDoc(configRef);
  return snapshot.data() as Config;
};
