import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

import toast from 'react-hot-toast';

/**
 * Route Guard Component
 * Ensures only authenticated users can access specific pages.
 * Enforces role-based access if requiredRole is provided.
 */
const ProtectedRoute = ({ children, requiredRole }) => {
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async (currentSession) => {
      setSession(currentSession);
      if (currentSession) {
        const { data } = await supabase.from('profiles').select('role').eq('id', currentSession.user.id).single();
        setRole(data?.role || 'student');
      }
      setLoading(false);
    };

    // 1. Initial Check
    supabase.auth.getSession().then(({ data: { session } }) => {
      checkAuth(session);
    });

    // 2. Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      checkAuth(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="animate-spin h-8 w-8 border-4 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!session) {
    // Redirect to login but save the current location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && role !== requiredRole) {
    toast.error(`Access denied. Requires ${requiredRole} privileges.`);
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
