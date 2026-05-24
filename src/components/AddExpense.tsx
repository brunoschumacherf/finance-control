import { FormEvent, useState } from 'react';
import toast from 'react-hot-toast';
import { addExpense } from '../services/financeService';

export const AddExpense = (): JSX.Element => {
  const [keyword, setKeyword] = useState<string>('');
  const [valor, setValor] = useState<string>('');
  const [descricao, setDescricao] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const submit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setLoading(true);
    try {
      const { usedVariados, createdCategory } = await addExpense({ keyword, valor: Number(valor), descricao });
      setKeyword('');
      setValor('');
      setDescricao('');
      if (createdCategory) toast.success('Categoria variados criada e gasto adicionado');
      else if (usedVariados) toast.success('Gasto adicionado em variados');
      else toast.success('Gasto adicionado');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao adicionar gasto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="card-elevated card-body">
      <h2 className="card-title mb-4">Adicionar gasto</h2>
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
