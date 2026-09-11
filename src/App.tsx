import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import { useAuth } from './store/auth';
import Books from './pages/Books';
import Checkout from './pages/Checkout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Me from './pages/Me';
import Members from './pages/Members';
import Register from './pages/Register';
import Settings from './pages/Settings';

const qc = new QueryClient();

function Guard({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          {/* Kiosk publik tanpa login */}
          <Route path="/register" element={<Layout><Register /></Layout>} />
          <Route path="/" element={<Guard><Dashboard /></Guard>} />
          <Route path="/members" element={<Guard><Members /></Guard>} />
          <Route path="/books" element={<Guard><Books /></Guard>} />
          <Route path="/checkout" element={<Guard><Checkout /></Guard>} />
          <Route path="/me" element={<Guard><Me /></Guard>} />
          <Route path="/settings" element={<Guard><Settings /></Guard>} />
          <Route path="*" element={<p style={{ padding: 24 }}>Halaman tidak ditemukan. <a href="/">Kembali</a></p>} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
