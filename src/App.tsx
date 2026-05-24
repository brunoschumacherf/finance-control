import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Gastos } from './pages/Gastos';
import { Historico } from './pages/Historico';
import { Limites } from './pages/Limites';

const toastStyle = {
  background: 'rgb(24 24 27 / 0.95)',
  color: '#fff',
  border: '1px solid rgb(255 255 255 / 0.1)',
  borderRadius: '1rem',
  padding: '12px 16px',
  backdropFilter: 'blur(12px)',
  boxShadow: '0 8px 32px rgb(0 0 0 / 0.35)'
};

export const App = (): JSX.Element => (
  <BrowserRouter>
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/gastos" element={<Gastos />} />
        <Route path="/limites" element={<Limites />} />
        <Route path="/historico" element={<Historico />} />
      </Routes>
    </Layout>
    <Toaster
      position="top-right"
      toastOptions={{
        style: toastStyle,
        success: { iconTheme: { primary: '#7c3aed', secondary: '#fff' } },
        error: { iconTheme: { primary: '#f87171', secondary: '#fff' } }
      }}
    />
  </BrowserRouter>
);
