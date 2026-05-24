import { FormEvent, useState } from 'react';
import toast from 'react-hot-toast';
import { addExpense } from '../services/financeService';
import { useFinance } from '../hooks/useFinance';

const warnToastStyle = {
  background: 'rgb(69 26 3 / 0.95)',
  color: '#fef3c7',
  border: '1px solid rgb(245 158 11 / 0.5)',
  borderRadius: '1rem',
  padding: '12px 16px'
};

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
      const { usedVariados, createdCategory, limitExceeded } = await addExpense({
        keyword,
        valor: Number(valor),
        descricao,
        mes: selectedMonth
      });
      setKeyword('');
      setValor('');
      setDescricao('');

      if (limitExceeded) {
        toast('Gasto salvo, mas o limite da categoria foi excedido', {
          icon: '⚠️',
          style: warnToastStyle,
          duration: 5000
        });
      } else if (createdCategory) {
        toast.success('Categoria variados criada e gasto adicionado');
      } else if (usedVariados) {
        toast.success('Gasto adicionado em variados');
      } else {
        toast.success('Gasto adicionado');
      }
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
        <input className="input-field" placeholder="Categoria (vazio = variados)" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
        <input className="input-field" placeholder="Valor" type="number" min="0" step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} />
        <input className="input-field" placeholder="Descrição" value={descricao} onChange={(e) => setDescricao(e.target.value)} />
      </div>
      <button disabled={loading} type="submit" className="btn-primary mt-4">
        {loading ? 'Salvando...' : 'Salvar gasto'}
      </button>
    </form>
  );
};
