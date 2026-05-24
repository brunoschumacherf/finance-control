import { FormEvent, useState } from 'react';
import toast from 'react-hot-toast';
import { useFinance } from '../hooks/useFinance';
import { addExpense } from '../services/financeService';

export const AddExpense = (): JSX.Element => {
  const { selectedMonth, monthLabel } = useFinance();
  const [keyword, setKeyword] = useState<string>('');
  const [valor, setValor] = useState<string>('');
  const [descricao, setDescricao] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const submit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setLoading(true);
    try {
      await addExpense({ keyword, valor: Number(valor), descricao, mes: selectedMonth });
      setKeyword('');
      setValor('');
      setDescricao('');
      toast.success('Gasto adicionado');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao adicionar gasto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="card-elevated card-body">
      <h2 className="card-title mb-1">Adicionar gasto</h2>
      <p className="mb-4 text-sm capitalize text-zinc-400">Mês: {monthLabel}</p>
      <div className="form-grid-3">
        <input className="input-field" placeholder="Categoria" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
        <input className="input-field" placeholder="Valor" type="number" min="0" step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} />
        <input className="input-field" placeholder="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
      </div>
      <button disabled={loading} type="submit" className="btn-primary mt-4">
        {loading ? 'Salvando...' : 'Salvar gasto'}
      </button>
    </form>
  );
};
