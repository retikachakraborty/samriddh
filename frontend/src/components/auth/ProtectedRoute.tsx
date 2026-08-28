import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const ProtectedRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-ivory-100 flex flex-col items-center justify-center p-6">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-2 border-forest-900/10 border-t-gold-500 animate-spin" />
          <div className="absolute w-8 h-8 rounded-full bg-forest-900 flex items-center justify-center text-gold-400 text-xs font-serif font-bold">
            ✦
          </div>
        </div>
        <p className="mt-4 text-xs uppercase tracking-[0.2em] text-forest-700 font-medium">
          Loading intelligence environment...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? <>{children}</> : null;
};
