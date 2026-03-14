import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { LogIn, ShieldCheck, Lock, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Hardcoded credentials
const VALID_EMAIL = 'vedhanmail@gmail.com';
const VALID_PASSWORD = 'vedhan1234';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      if (email === VALID_EMAIL && password === VALID_PASSWORD) {
        localStorage.setItem('certchain_session', JSON.stringify({
          email: VALID_EMAIL,
          role: 'admin',
          loggedIn: true,
          loginTime: Date.now()
        }));
        toast.success('Welcome back, Admin!');
        navigate('/admin');
      } else {
        toast.error('Invalid email or password');
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div className="pt-28 pb-16 px-4 flex justify-center items-center min-h-[85vh]">
      <div className="w-full max-w-md relative">
        
        {/* Floating glow orbs */}
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-accent/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-16 -right-16 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        {/* Card */}
        <div className="glass-card p-10 rounded-3xl relative overflow-hidden border border-slate-700/50 shadow-2xl shadow-accent/5">
          
          {/* Top accent stripe */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent"></div>
          
          {/* Shield icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-purple-500/20 border border-accent/30 flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-accent" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Admin Portal
          </h2>
          <p className="text-center text-muted text-sm mb-8">Sign in to access the certificate management system</p>
          
          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-accent transition-colors" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface/80 border border-slate-700 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/20 focus:bg-surface transition-all"
                placeholder="Email address"
                required
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-accent transition-colors" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface/80 border border-slate-700 rounded-xl pl-11 pr-4 py-3.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/20 focus:bg-surface transition-all"
                placeholder="Password"
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-accent to-blue-500 hover:from-accent/90 hover:to-blue-500/90 text-white py-3.5 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-accent/25 hover:shadow-accent/40 hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-slate-700/50 text-center">
            <p className="text-xs text-slate-500">🔒 Secured with JWT Authentication</p>
          </div>
        </div>
      </div>
    </div>
  );
}
