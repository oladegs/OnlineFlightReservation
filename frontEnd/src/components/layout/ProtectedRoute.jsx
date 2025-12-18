import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';

const ProtectedRoute = () => {
  const { isAuthenticated, status } = useAuth();

  if (status === 'loading') {
    return (
      <div className="page-state">
        <div className="spinner" />
        <p>Preparing your workspace…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

