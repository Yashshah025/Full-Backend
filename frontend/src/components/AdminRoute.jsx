import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loader from './Loader';

export default function AdminRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader fullPage />;
  }

  return user && user.role === 'admin' ? <Outlet /> : <Navigate to="/" replace />;
}
