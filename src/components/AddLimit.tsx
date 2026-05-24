import { FormEvent, useState } from 'react';
import toast from 'react-hot-toast';
import { useFinance } from '../hooks/useFinance';
import { createLimit } from '../services/financeService';

export const AddLimit = (): JSX.Element => {
  const { selectedMonth, monthLabel } = useFinance();
  const [keyword, setKeyword] = useState<string>('');
  const [limite, setLimite] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const submit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setLoading(true);
    try {
      await createLimit({ keyword, limite: Number(limite), mes: selectedMonth });
      setKeyword('');
      setLimite('');
      toast.success('Limite criado');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao criar limite');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="card-elevated card-body">
      <h2 className="card-title mb-1">Criar limite</h2>
      <p className="mb-4 text-sm capitalize text-zinc-400">Mês: {monthLabel}</p>
      <div className="form-grid-2">
        <input className="input-field" placeholder="Categoria" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
        <input className="input-field" placeholder="Limite" type="number" min="0" step="0.01" value={limite} onChange={(e) => setLimite(e.target.value)} />
      </div>
      <button disabled={loading} type="submit" className="btn-primary mt-4">
        {loading ? 'Salvando...' : 'Criar limite'}
      </button>
    </form>
  );
};
