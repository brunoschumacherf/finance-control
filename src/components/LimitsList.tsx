import type { Limit } from '../types';
import { formatCurrency } from '../utils/format';

type LimitsListProps = { limits: Limit[] };

export const LimitsList = ({ limits }: LimitsListProps): JSX.Element => {
  if (limits.length === 0) {
    return <div className="empty-state">Nenhum limite cadastrado.</div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {limits.map((limit) => {
        const used = limit.limite - limit.restante;
        const percent = Math.min(100, Math.round((used / limit.limite) * 100));

        return (
          <div key={limit.id} className="limit-card">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-bold capitalize tracking-tight">{limit.keyword}</h3>
              <span className="rounded-full bg-purple-500/15 px-2.5 py-0.5 text-xs font-medium text-purple-300">
                {percent}% usado
              </span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${percent}%` }} />
            </div>
            <div className="mt-4 flex justify-between gap-4 text-sm">
              <span className="text-zinc-400">
                Restante: <b className="text-white">{formatCurrency(limit.restante)}</b>
              </span>
              <span className="text-zinc-500">Limite: {formatCurrency(limit.limite)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
