import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import ProtectedRoute from './ProtectedRoute';

export default function AdminRoute({ children }) {
  const { user } = useAuthStore();
  return <ProtectedRoute>{user?.role === 'admin' ? children : <Navigate to="/dashboard" replace />}</ProtectedRoute>;
}
