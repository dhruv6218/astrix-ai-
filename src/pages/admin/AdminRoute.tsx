import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AdminLogin } from './AdminLogin';
import { AdminDashboard } from './AdminDashboard';
import { Loader2 } from 'lucide-react';

export const AdminRoute: React.FC = () => {
  const { isAdmin, isInitializing } = useAuth();

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
      </div>
    );
  }

  return isAdmin ? <AdminDashboard /> : <AdminLogin />;
};
