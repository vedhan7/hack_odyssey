import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { LogIn, Building2, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [role, setRole] = useState('institution'); // 'institution' or 'student'
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleMagicLink = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email");
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/${role === 'institution' ? 'institution' : 'profile'}`
        }
      });
      
      if (error) throw error;
      toast.success("Magic link sent! Check your email.");
    } catch (error) {
      toast.error(error.message || "Failed to send magic link");
    } finally {
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
        <form onSubmit={handleMagicLink} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-muted mb-2">Work Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
              placeholder={role === 'institution' ? "admin@university.edu" : "student@college.edu"}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-white text-bg hover:bg-slate-200 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="animate-spin h-5 w-5 border-2 border-bg border-t-transparent rounded-full" />
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Send Magic Link
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
