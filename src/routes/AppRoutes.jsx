import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import NotFoundPage from '../components/NotFoundPage';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Clients from '../pages/Clients';
import Tasks from '../pages/Tasks';
import Invoices from '../pages/Invoices';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
\        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="clients" element={<Clients />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path='invoices' element={<Invoices />} />
      </Route>
      
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;