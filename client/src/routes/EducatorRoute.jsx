import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import ProtectedRoute from './ProtectedRoute';

export default function EducatorRoute({ children }) {
  const { user } = useAuthStore();
  const fallback = user?.role === 'admin' ? '/admin' : '/dashboard';
  return <ProtectedRoute>{user?.role === 'educator' ? children : <Navigate to={fallback} replace />}</ProtectedRoute>;
}
