import { Wallet } from 'lucide-react';
import { formatCurrency } from '../utils/format';

type BalanceCardProps = {
  saldo: number;
  totalRecebido: number;
  saldoMes: number;
  monthLabel: string;
};

export const BalanceCard = ({ saldo, totalRecebido, saldoMes, monthLabel }: BalanceCardProps): JSX.Element => (
  <section className="card-hero">
    <div className="card-hero-glow" />
    <div className="relative flex items-center justify-between">
      <p className="text-sm font-medium text-purple-100/80">Saldo total</p>
      <Wallet className="text-purple-200/70" size={22} />
    </div>
    <h1 className="relative mt-4 text-4xl font-black tracking-tight md:text-5xl">{formatCurrency(saldo)}</h1>
    <div className="relative mt-4 grid gap-2 text-sm text-purple-100/70 sm:grid-cols-2">
      <p>
        Recebido em <span className="capitalize">{monthLabel}</span>:{' '}
        <span className="font-semibold text-white">{formatCurrency(totalRecebido)}</span>
      </p>
      <p>
        Saldo do mês:{' '}
        <span className={`font-semibold ${saldoMes >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
          {formatCurrency(saldoMes)}
        </span>
      </p>
    </div>
  </section>
);
