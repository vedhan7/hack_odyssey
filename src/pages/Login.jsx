import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Building2, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [role, setRole] = useState('institution'); // 'institution' or 'student'
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we just returned from Google OAuth redirect
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) handlePostLogin(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) handlePostLogin(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handlePostLogin = async (userId) => {
    const intendedRole = localStorage.getItem('certchain_intended_role') || 'student';
    
    // Update role if they requested Institution
    if (intendedRole === 'institution') {
      await supabase.from('profiles').update({ role: 'institution' }).eq('id', userId).eq('role', 'student');
      localStorage.removeItem('certchain_intended_role');
    }

    // Fetch final role to route
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).single();
    
    if (profile?.role === 'admin') {
      navigate('/admin');
    } else if (profile?.role === 'institution' || intendedRole === 'institution') {
      navigate('/institution');
    } else {
      navigate('/profile');
    }
  };

  const handleGoogleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Save role so our App router knows where to send them after Google Auth returns
    localStorage.setItem('certchain_intended_role', role);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      
      if (error) throw error;
    } catch (error) {
      toast.error(error.message || "Failed to sign in with Google");
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-16 px-4 flex justify-center items-center min-h-[80vh]">
      <div className="glass-card w-full max-w-md p-8 rounded-2xl relative overflow-hidden">
        {/* Decorative corner glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent/20 rounded-full blur-2xl"></div>
        
        <h2 className="text-3xl font-bold text-center mb-8">Access Portal</h2>
        
        {/* Role Selector */}
        <div className="flex bg-surface p-1 rounded-xl mb-8 border border-slate-700">
          <button
            onClick={() => setRole('institution')}
            className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all ${
              role === 'institution' ? 'bg-accent text-white shadow-md' : 'text-muted hover:text-white hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Institution
          </button>
          <button
            onClick={() => setRole('student')}
            className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all ${
              role === 'student' ? 'bg-accent text-white shadow-md' : 'text-muted hover:text-white hover:bg-slate-800'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            Student
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleGoogleLogin} className="space-y-6">
          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white text-bg hover:bg-slate-200 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="animate-spin h-5 w-5 border-2 border-bg border-t-transparent rounded-full" />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </>
            )}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-slate-700 text-center">
          <p className="text-sm text-muted">Protected by Supabase JWT Authentication</p>
        </div>
      </div>
    </div>
  );
}
