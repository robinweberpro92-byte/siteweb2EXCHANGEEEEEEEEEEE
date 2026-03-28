import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ExchangePage from './pages/ExchangePage';
import TransactionsPage from './pages/TransactionsPage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/exchange" element={<ExchangePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/secure-access" element={<AdminPage />} />
        <Route path="/market" element={<Navigate to="/" replace />} />
        <Route path="/dashboard" element={<Navigate to="/transactions" replace />} />
        <Route path="/admin" element={<NotFoundPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
