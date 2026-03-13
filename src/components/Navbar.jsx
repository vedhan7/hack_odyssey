// src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Menu, X, LogIn } from 'lucide-react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Verify', path: '/verify' },
    { name: 'Explorer', path: '/explorer' },
    { name: 'Admin', path: '/admin' },
  ];

  return (
    <header className={`fixed w-full top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-bg/80 backdrop-blur-md border-b border-surface' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-accent/10 p-2 rounded-xl group-hover:bg-accent/20 transition-colors">
              <ShieldCheck className="w-6 h-6 text-accent" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">Cert<span className="text-accent">Chain</span></span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-white ${location.pathname === link.path ? 'text-white' : 'text-muted'}`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/login" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-surface hover:bg-slate-800 border border-slate-700 hover:border-accent transition-all rounded-lg">
              <LogIn className="w-4 h-4" />
              Portal Login
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-muted hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-surface border-b border-slate-800 absolute w-full px-4 pt-2 pb-4 space-y-1 shadow-xl">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="block px-3 py-2 rounded-md text-base font-medium text-text hover:bg-slate-800"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <Link
            to="/login"
            className="flex items-center gap-2 w-full mt-4 px-3 py-2 text-base font-medium text-white bg-accent hover:bg-accent-glow rounded-md"
            onClick={() => setMobileMenuOpen(false)}
          >
            <LogIn className="w-5 h-5" />
            Portal Login
          </Link>
        </div>
      )}
    </header>
  );
}
