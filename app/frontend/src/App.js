"import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from 'sonner';

import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Onboarding from './pages/Onboarding';
import Chat from './pages/Chat';
import Dashboard from './pages/Dashboard';
import Goals from './pages/Goals';
import CheckIn from './pages/CheckIn';
import Dilemma from './pages/Dilemma';
import Profile from './pages/Profile';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className=\"min-h-screen flex items-center justify-center bg-background\">
      <div className=\"flex gap-2 items-center\">
        <span className=\"w-2 h-2 rounded-full bg-primary typing-dot\" />
        <span className=\"w-2 h-2 rounded-full bg-primary typing-dot\" />
        <span className=\"w-2 h-2 rounded-full bg-primary typing-dot\" />
      </div>
    </div>
  );
  if (!user) return <Navigate to=\"/auth\" replace />;
  if (!user.onboarded && window.location.pathname !== '/onboarding') {
    return <Navigate to=\"/onboarding\" replace />;
  }
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to={user.onboarded ? '/chat' : '/onboarding'} replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path=\"/\" element={<Landing />} />
      <Route path=\"/auth\" element={<PublicRoute><Auth /></PublicRoute>} />
      <Route path=\"/onboarding\" element={<PrivateRoute><Onboarding /></PrivateRoute>} />
      <Route path=\"/chat\" element={<PrivateRoute><Chat /></PrivateRoute>} />
      <Route path=\"/dashboard\" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path=\"/goals\" element={<PrivateRoute><Goals /></PrivateRoute>} />
      <Route path=\"/checkin\" element={<PrivateRoute><CheckIn /></PrivateRoute>} />
      <Route path=\"/dilemma\" element={<PrivateRoute><Dilemma /></PrivateRoute>} />
      <Route path=\"/profile\" element={<PrivateRoute><Profile /></PrivateRoute>} />
      <Route path=\"*\" element={<Navigate to=\"/\" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position=\"top-center\"
          toastOptions={{
            style: {
              background: 'var(--color-surface)',
              color: 'var(--color-foreground)',
              border: '1px solid var(--color-border)',
              fontFamily: 'Outfit, sans-serif',
              borderRadius: '1rem',
            },
          }}
        />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
"
