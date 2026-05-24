import { BarChart3, CreditCard, Gauge, History, Wallet } from 'lucide-react';
import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { MonthSelector } from '../context/FinanceContext';

const links = [
  { to: '/', label: 'Dashboard', icon: Gauge },
  { to: '/gastos', label: 'Gastos', icon: CreditCard },
  { to: '/limites', label: 'Limites', icon: BarChart3 },
  { to: '/historico', label: 'Histórico', icon: History }
];

type LayoutProps = { children: ReactNode };

export const Layout = ({ children }: LayoutProps): JSX.Element => (
  <div className="min-h-screen">
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo"><Wallet size={22} /></div>
        <div>
          <p className="font-bold tracking-tight">Finance Control</p>
          <p className="text-xs text-zinc-400">controle pessoal</p>
        </div>
      </div>
      <nav className="sidebar-nav">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
          >
            <Icon size={18} />
            <span className="hidden md:inline">{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
    <main className="main-content">
      <MonthSelector />
      {children}
    </main>
  </div>
);
