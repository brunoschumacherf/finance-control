import { AddLimit } from '../components/AddLimit';
import { LimitsList } from '../components/LimitsList';
import { useFinance } from '../hooks/useFinance';

export const Limites = (): JSX.Element => {
  const { limitsWithUsage, monthLabel } = useFinance();

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Limites</h1>
        <p className="page-subtitle capitalize">Uso dos limites em {monthLabel}</p>
      </header>
      <AddLimit />
      <LimitsList limits={limitsWithUsage} />
    </div>
  );
};
