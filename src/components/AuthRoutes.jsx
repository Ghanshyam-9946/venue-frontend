import { Navigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const ProtectedRoute = ({ children, requiredRole, allowFirstLogin = false }) => {
  const { user, isAuthenticated, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (user?.isFirstLogin && !allowFirstLogin) {
    return <Navigate to="/force-change-password" replace />;
  }

  if (requiredRole === 'admin' && !['admin', 'superadmin'].includes(user.role)) {
    return <Navigate to="/" replace />; 
  } else if (requiredRole && requiredRole !== 'admin' && user.role !== requiredRole) {
    return <Navigate to="/" replace />; 
  }

  return children;
};

export const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
     return (
        <div className="flex justify-center items-center h-screen bg-slate-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
        </div>
      );
  }

  if (isAuthenticated) {
    const from = location.state?.from?.pathname || '/';
    return <Navigate to={from} replace />;
  }

  return children;
};
