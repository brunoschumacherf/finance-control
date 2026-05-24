import { useState } from 'react';
import toast from 'react-hot-toast';
import type { Expense } from '../types';
import { deleteExpense, updateExpense } from '../services/financeService';
import { formatCurrency, formatDate } from '../utils/format';
import { ItemActions } from './ItemActions';

type ExpenseListProps = { expenses: Expense[] };

type EditForm = { keyword: string; valor: string; descricao: string };

export const ExpenseList = ({ expenses }: ExpenseListProps): JSX.Element => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EditForm>({ keyword: '', valor: '', descricao: '' });
  const [saving, setSaving] = useState(false);

  const startEdit = (expense: Expense): void => {
    setEditingId(expense.id ?? null);
    setForm({
      keyword: expense.keyword === 'variados' ? '' : expense.keyword,
      valor: String(expense.valor),
      descricao: expense.descricao
    });
  };

  const cancelEdit = (): void => {
    setEditingId(null);
    setForm({ keyword: '', valor: '', descricao: '' });
  };

  const saveEdit = async (expense: Expense): Promise<void> => {
    if (!expense.id) return;
    setSaving(true);
    try {
      await updateExpense(expense.id, {
        keyword: form.keyword,
        valor: Number(form.valor),
        descricao: form.descricao,
        mes: expense.mes
      });
      toast.success('Gasto atualizado');
      cancelEdit();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar gasto');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (expense: Expense): Promise<void> => {
    if (!expense.id || !confirm('Excluir este gasto?')) return;
    try {
      await deleteExpense(expense.id);
      toast.success('Gasto excluído');
      if (editingId === expense.id) cancelEdit();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao excluir gasto');
    }
  };

  if (expenses.length === 0) {
    return <div className="empty-state">Nenhum gasto cadastrado.</div>;
  }

  return (
    <div className="space-y-2">
      {expenses.map((expense) => {
        const isEditing = editingId === expense.id;

        if (isEditing) {
          return (
            <div key={expense.id} className="list-item-edit">
              <div className="form-grid-3">
                <input className="input-field" placeholder="Categoria (vazio = variados)" value={form.keyword} onChange={(e) => setForm({ ...form, keyword: e.target.value })} />
                <input className="input-field" placeholder="Valor" type="number" min="0" step="0.01" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} />
                <input className="input-field" placeholder="Descrição" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
              </div>
              <div className="flex justify-end">
                <ItemActions editing onCancel={cancelEdit} onSave={() => void saveEdit(expense)} saving={saving} onEdit={() => {}} onDelete={() => {}} />
              </div>
            </div>
          );
        }

        return (
          <div key={expense.id} className="list-item">
            <div className="min-w-0 flex-1">
              <p className="list-item-title">{expense.keyword}</p>
              <p className="list-item-meta">
                {expense.descricao || 'Sem descrição'} · {formatDate(expense.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <strong className="list-item-value">-{formatCurrency(expense.valor)}</strong>
              <ItemActions onEdit={() => startEdit(expense)} onDelete={() => void remove(expense)} />
            </div>
          </div>
        );
      })}
    </div>
  );
};
