import { AddLimit } from '../components/AddLimit';
import { LimitsList } from '../components/LimitsList';
import { useFinance } from '../hooks/useFinance';

export const Limites = (): JSX.Element => {
  const { limitsWithUsage } = useFinance();

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Limites</h1>
        <p className="page-subtitle">Crie limites por categoria e acompanhe o restante.</p>
      </header>
      <AddLimit />
      <LimitsList limits={limitsWithUsage} />
    </div>
  );
};
