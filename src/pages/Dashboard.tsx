import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Bar, BarChart, XAxis, YAxis, CartesianGrid } from 'recharts';
import { BalanceCard } from '../components/BalanceCard';
import { DashboardCards } from '../components/DashboardCards';
import { LimitsList } from '../components/LimitsList';
import { Skeleton } from '../components/Skeleton';
import { useFinance } from '../hooks/useFinance';

const CHART_COLORS = ['#7c3aed', '#a78bfa', '#6d28d9', '#c4b5fd', '#5b21b6', '#ddd6fe'];
const AXIS_STYLE = { fill: '#71717a', fontSize: 12 };
const GRID_STYLE = { stroke: 'rgba(255,255,255,0.06)', strokeDasharray: '4 4' };

const ChartTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }): JSX.Element | null => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-zinc-900/95 px-3 py-2 text-sm shadow-card backdrop-blur-xl">
      <p className="mb-1 font-medium capitalize text-white">{label ?? payload[0].name}</p>
      <p className="text-purple-300">R$ {payload[0].value.toFixed(2)}</p>
    </div>
  );
};

export const Dashboard = (): JSX.Element => {
  const { config, expenses, limits, loading, totalGasto, totalRecebido, limiteMaisUsado } = useFinance();
  const byCategory = limits.map((limit) => ({
    name: limit.keyword,
    gasto: limit.limite - limit.restante,
    restante: limit.restante
  }));

  if (loading) {
    return (
      <div className="grid gap-4">
        <Skeleton />
        <Skeleton />
        <Skeleton />
      </div>
    );
  }

  return (
    <div className="page">
      <BalanceCard saldo={config.saldo} rendaMensal={config.rendaMensal} />
      <DashboardCards
        totalGasto={totalGasto}
        totalRecebido={totalRecebido}
        categorias={limits.length}
        limiteMaisUsado={limiteMaisUsado}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="chart-card">
          <h2 className="card-title mb-5">Gastos por categoria</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={byCategory}
                  dataKey="gasto"
                  nameKey="name"
                  outerRadius={100}
                  innerRadius={48}
                  paddingAngle={3}
                  stroke="transparent"
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                >
                  {byCategory.map((_, index) => (
                    <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="chart-card">
          <h2 className="card-title mb-5">Uso dos limites</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byCategory} barSize={28}>
                <CartesianGrid vertical={false} stroke={GRID_STYLE.stroke} strokeDasharray={GRID_STYLE.strokeDasharray} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={AXIS_STYLE} />
                <YAxis axisLine={false} tickLine={false} tick={AXIS_STYLE} width={48} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(124,58,237,0.08)' }} />
                <Bar dataKey="gasto" fill="#7c3aed" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <LimitsList limits={limits} />
      <p className="meta-text">Total de registros de gastos: {expenses.length}</p>
    </div>
  );
};
