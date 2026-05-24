import { ExpenseList } from '../components/ExpenseList';
import { useFinance } from '../hooks/useFinance';

export const Historico = (): JSX.Element => {
  const { monthExpenses, monthLabel } = useFinance();

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Histórico</h1>
        <p className="page-subtitle capitalize">Gastos de {monthLabel}</p>
      </header>
      <ExpenseList expenses={monthExpenses} />
    </div>
  );
};
