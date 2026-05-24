import { FormEvent, useState } from 'react';
import toast from 'react-hot-toast';
import { useFinance } from '../hooks/useFinance';
import { addIncome } from '../services/financeService';

export const AddIncome = (): JSX.Element => {
  const { selectedMonth, monthLabel } = useFinance();
  const [valor, setValor] = useState<string>('');
  const [descricao, setDescricao] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const submit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setLoading(true);
    try {
      await addIncome({ valor: Number(valor), descricao, mes: selectedMonth });
      setValor('');
      setDescricao('');
      toast.success('Saldo adicionado');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao adicionar saldo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="card-elevated card-body">
      <h2 className="card-title mb-1">Adicionar saldo</h2>
      <p className="mb-4 text-sm capitalize text-zinc-400">Mês: {monthLabel}</p>
      <div className="form-grid-2">
        <input className="input-field" placeholder="Valor" type="number" min="0" step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} />
        <input className="input-field" placeholder="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
      </div>
      <button disabled={loading} type="submit" className="btn-success mt-4">
        {loading ? 'Salvando...' : 'Adicionar saldo'}
      </button>
    </form>
  );
};
