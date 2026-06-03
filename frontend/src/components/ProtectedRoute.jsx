import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loader from './Loader';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader fullPage />;
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
