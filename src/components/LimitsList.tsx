import { useState } from 'react';
import toast from 'react-hot-toast';
import { deleteLimit, updateLimit } from '../services/financeService';
import type { LimitWithUsage } from '../utils/limits';
import { formatCurrency } from '../utils/format';
import { ItemActions } from './ItemActions';

type LimitsListProps = { limits: LimitWithUsage[] };

type EditForm = { keyword: string; limite: string };

export const LimitsList = ({ limits }: LimitsListProps): JSX.Element => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EditForm>({ keyword: '', limite: '' });
  const [saving, setSaving] = useState(false);

  const startEdit = (limit: LimitWithUsage): void => {
    setEditingId(limit.id ?? null);
    setForm({ keyword: limit.keyword, limite: String(limit.limite) });
  };

  const cancelEdit = (): void => {
    setEditingId(null);
    setForm({ keyword: '', limite: '' });
  };

  const saveEdit = async (limit: LimitWithUsage): Promise<void> => {
    if (!limit.id) return;
    setSaving(true);
    try {
      await updateLimit(limit.id, {
        keyword: form.keyword,
        limite: Number(form.limite),
        mes: limit.mes
      });
      toast.success('Limite atualizado');
      cancelEdit();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar limite');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (limit: LimitWithUsage): Promise<void> => {
    if (!limit.id || !confirm('Excluir este limite?')) return;
    try {
      await deleteLimit(limit.id);
      toast.success('Limite excluído');
      if (editingId === limit.id) cancelEdit();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao excluir limite');
    }
  };

  if (limits.length === 0) {
    return <div className="empty-state">Nenhum limite cadastrado.</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {limits.map((limit) => {
        const percent = limit.limite > 0 ? Math.round((limit.gasto / limit.limite) * 100) : 0;
        const barWidth = limit.excedido ? 100 : Math.min(100, percent);
        const isEditing = editingId === limit.id;

        if (isEditing) {
          return (
            <div key={limit.id} className="list-item-edit">
              <div className="form-grid-2">
                <input className="input-field" placeholder="Categoria" value={form.keyword} onChange={(e) => setForm({ ...form, keyword: e.target.value })} />
                <input className="input-field" placeholder="Limite" type="number" min="0" step="0.01" value={form.limite} onChange={(e) => setForm({ ...form, limite: e.target.value })} />
              </div>
              <div className="flex justify-end">
                <ItemActions editing onCancel={cancelEdit} onSave={() => void saveEdit(limit)} saving={saving} onEdit={() => {}} onDelete={() => {}} />
              </div>
            </div>
          );
        }

        return (
          <div key={limit.id} className={`limit-card ${limit.excedido ? 'limit-card-warning' : ''}`}>
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg font-bold capitalize tracking-tight">{limit.keyword}</h3>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${limit.excedido ? 'limit-badge-warning' : 'bg-purple-500/15 text-purple-300'}`}>
                  {limit.excedido ? `Excedido · ${percent}%` : `${percent}% usado`}
                </span>
                <ItemActions onEdit={() => startEdit(limit)} onDelete={() => void remove(limit)} />
              </div>
            </div>
            <div className="progress-track">
              <div className={`progress-fill ${limit.excedido ? 'progress-fill-warning' : ''}`} style={{ width: `${barWidth}%` }} />
            </div>
            <div className="mt-4 flex flex-wrap justify-between gap-x-4 gap-y-1 text-sm">
              <span className="text-zinc-400">
                Gasto: <b className={limit.excedido ? 'text-amber-300' : 'text-white'}>{formatCurrency(limit.gasto)}</b>
              </span>
              {limit.excedido ? (
                <span className="text-amber-400/90">
                  Acima do limite: <b className="text-amber-300">{formatCurrency(limit.excedente)}</b>
                </span>
              ) : (
                <span className="text-zinc-400">
                  Restante: <b className="text-white">{formatCurrency(limit.restante)}</b>
                </span>
              )}
              <span className="text-zinc-500">Limite: {formatCurrency(limit.limite)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
