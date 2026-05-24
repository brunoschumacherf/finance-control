import { ExpenseList } from '../components/ExpenseList';
import { useFinance } from '../hooks/useFinance';

export const Historico = (): JSX.Element => {
  const { expenses } = useFinance();

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Histórico</h1>
        <p className="page-subtitle">Todos os gastos salvos no Firestore.</p>
      </header>
      <ExpenseList expenses={expenses} />
    </div>
  );
};
