import { AddExpense } from '../components/AddExpense';
import { AddIncome } from '../components/AddIncome';
import { ExpenseList } from '../components/ExpenseList';
import { useFinance } from '../hooks/useFinance';

export const Gastos = (): JSX.Element => {
  const { expenses } = useFinance();

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Gastos</h1>
        <p className="page-subtitle">Adicione gastos e saldo recebido.</p>
      </header>
      <div className="grid gap-4 lg:grid-cols-2">
        <AddExpense />
        <AddIncome />
      </div>
      <ExpenseList expenses={expenses} />
    </div>
  );
};
