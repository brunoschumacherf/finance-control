import { Wallet } from 'lucide-react';
import { formatCurrency } from '../utils/format';

type BalanceCardProps = { saldo: number; rendaMensal: number };

export const BalanceCard = ({ saldo, rendaMensal }: BalanceCardProps): JSX.Element => (
  <section className="card-hero">
    <div className="card-hero-glow" />
    <div className="relative flex items-center justify-between">
      <p className="text-sm font-medium text-purple-100/80">Saldo atual</p>
      <Wallet className="text-purple-200/70" size={22} />
    </div>
    <h1 className="relative mt-4 text-4xl font-black tracking-tight md:text-5xl">{formatCurrency(saldo)}</h1>
    <p className="relative mt-4 text-sm text-purple-100/70">
      Renda mensal registrada: <span className="font-semibold text-white">{formatCurrency(rendaMensal)}</span>
    </p>
  </section>
);
