import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth.js';

const RoleGate = ({ roles, children }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!roles.includes(user?.role)) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return children;
};

export default RoleGate;


