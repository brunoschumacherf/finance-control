import { ArrowDownCircle, ArrowUpCircle, ChartPie, Tags } from 'lucide-react';
import type { LimitWithUsage } from '../utils/limits';
import { formatCurrency } from '../utils/format';

type DashboardCardsProps = {
  totalGasto: number;
  totalRecebido: number;
  categorias: number;
  limiteMaisUsado?: LimitWithUsage;
};

const Card = ({ title, value, children }: { title: string; value: string; children: JSX.Element }): JSX.Element => (
  <div className="stat-card">
    <div className="stat-icon">{children}</div>
    <p className="stat-label">{title}</p>
    <strong className="stat-value">{value}</strong>
  </div>
);

export const DashboardCards = ({ totalGasto, totalRecebido, categorias, limiteMaisUsado }: DashboardCardsProps): JSX.Element => (
  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    <Card title="Total gasto" value={formatCurrency(totalGasto)}><ArrowDownCircle size={22} /></Card>
    <Card title="Total recebido" value={formatCurrency(totalRecebido)}><ArrowUpCircle size={22} /></Card>
    <Card title="Categorias" value={String(categorias)}><Tags size={22} /></Card>
    <Card title="Limite mais usado" value={limiteMaisUsado?.keyword ?? '—'}><ChartPie size={22} /></Card>
  </div>
);
