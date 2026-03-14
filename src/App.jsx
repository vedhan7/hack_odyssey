import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layout & Components
import Navbar from './components/Navbar';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import InstitutionPortal from './pages/InstitutionPortal';
import StudentWallet from './pages/StudentWallet';
import VerifyPortal from './pages/VerifyPortal';
import BlockExplorer from './pages/BlockExplorer';
import AdminPanel from './pages/AdminPanel';

import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      {/* Toast notifications handler */}
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#f8fafc',
            border: '1px solid #334155'
          }
        }} 
      />
      
      {/* Main App Container */}
      <div className="min-h-screen bg-bg text-text font-sans flex flex-col selection:bg-accent selection:text-white">
        
        {/* Persistent Navigation */}
        <Navbar />

        {/* Global Routing */}
        <main className="flex-1 flex flex-col relative">
          {/* Subtle background glow effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-accent-glow rounded-full mix-blend-screen filter blur-[150px] opacity-10 pointer-events-none -z-10"></div>
          
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            
            {/* Portals - Protected */}
            <Route 
              path="/institution" 
              element={
                <ProtectedRoute>
                  <InstitutionPortal />
                </ProtectedRoute>
              } 
            />
            <Route path="/profile" element={<StudentWallet />} />
            <Route path="/verify" element={<VerifyPortal />} />
            <Route path="/explorer" element={<BlockExplorer />} />
            
            {/* Admin - Protected */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminPanel />
                </ProtectedRoute>
              } 
            />
            
            {/* 404 Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        
        {/* Footer */}
        <footer className="py-8 text-center text-sm text-muted border-t border-slate-800">
          <p>Hack Odyssey 3.0 • Built with ⛓️ Polygon, Pinata & Supabase</p>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
