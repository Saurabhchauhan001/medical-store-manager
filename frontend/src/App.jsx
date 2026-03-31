import { Navigate, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Suppliers from './pages/Suppliers';
import Alerts from './pages/Alerts';
import AppShell from './components/AppShell';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppShell />}>
        <Route index element={<Dashboard />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="suppliers" element={<Suppliers />} />
        <Route path="alerts" element={<Alerts />} />
      </Route>

      <Route path="/app" element={<Navigate to="/" replace />} />
      <Route path="/app/inventory" element={<Navigate to="/inventory" replace />} />
      <Route path="/app/suppliers" element={<Navigate to="/suppliers" replace />} />
      <Route path="/app/alerts" element={<Navigate to="/alerts" replace />} />
      <Route path="/reports" element={<Navigate to="/" replace />} />
      <Route path="/app/reports" element={<Navigate to="/" replace />} />
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
