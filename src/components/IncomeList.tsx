import { useState } from 'react';
import toast from 'react-hot-toast';
import type { Income } from '../types';
import { deleteIncome, updateIncome } from '../services/financeService';
import { formatCurrency, formatDate } from '../utils/format';
import { ItemActions } from './ItemActions';

type IncomeListProps = { incomes: Income[] };

type EditForm = { valor: string; descricao: string };

export const IncomeList = ({ incomes }: IncomeListProps): JSX.Element => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EditForm>({ valor: '', descricao: '' });
  const [saving, setSaving] = useState(false);

  const startEdit = (income: Income): void => {
    setEditingId(income.id ?? null);
    setForm({ valor: String(income.valor), descricao: income.descricao });
  };

  const cancelEdit = (): void => {
    setEditingId(null);
    setForm({ valor: '', descricao: '' });
  };

  const saveEdit = async (income: Income): Promise<void> => {
    if (!income.id) return;
    setSaving(true);
    try {
      await updateIncome(income.id, {
        valor: Number(form.valor),
        descricao: form.descricao,
        mes: income.mes
      });
      toast.success('Receita atualizada');
      cancelEdit();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar receita');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (income: Income): Promise<void> => {
    if (!income.id || !confirm('Excluir esta receita?')) return;
    try {
      await deleteIncome(income.id);
      toast.success('Receita excluída');
      if (editingId === income.id) cancelEdit();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao excluir receita');
    }
  };

  if (incomes.length === 0) {
    return <div className="empty-state">Nenhuma receita cadastrada.</div>;
  }

  return (
    <div className="space-y-2">
      {incomes.map((income) => {
        const isEditing = editingId === income.id;

        if (isEditing) {
          return (
            <div key={income.id} className="list-item-edit">
              <div className="form-grid-2">
                <input className="input-field" placeholder="Valor" type="number" min="0" step="0.01" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} />
                <input className="input-field" placeholder="Descrição" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
              </div>
              <div className="flex justify-end">
                <ItemActions editing onCancel={cancelEdit} onSave={() => void saveEdit(income)} saving={saving} onEdit={() => {}} onDelete={() => {}} />
              </div>
            </div>
          );
        }

        return (
          <div key={income.id} className="list-item">
            <div className="min-w-0 flex-1">
              <p className="list-item-title">Receita</p>
              <p className="list-item-meta">
                {income.descricao || 'Sem descrição'} · {formatDate(income.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <strong className="text-base font-bold text-emerald-300">+{formatCurrency(income.valor)}</strong>
              <ItemActions onEdit={() => startEdit(income)} onDelete={() => void remove(income)} />
            </div>
          </div>
        );
      })}
    </div>
  );
};
