"import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquare, LayoutDashboard, Target, Activity, Scale, User, Menu, X } from 'lucide-react';

const navItems = [
  { path: '/chat', icon: MessageSquare, label: 'Conscience' },
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/goals', icon: Target, label: 'Goals' },
  { path: '/checkin', icon: Activity, label: 'Check-in' },
  { path: '/dilemma', icon: Scale, label: 'Dilemmas' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop nav - pill */}
      <nav className=\"hidden md:block fixed top-6 left-1/2 -translate-x-1/2 z-50\">
        <div className=\"glass bg-surface/80 border border-border/60 shadow-lg rounded-full px-3 py-2 flex items-center gap-1\">
          <span
            className=\"font-heading font-semibold text-base text-foreground px-3 cursor-pointer\"
            onClick={() => navigate('/chat')}
          >
            IV
          </span>
          <div className=\"w-px h-4 bg-border mx-1\" />
          {navItems.map(item => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                data-testid={`nav-${item.label.toLowerCase()}-btn`}
                onClick={() => navigate(item.path)}
                className={`relative flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-body font-medium transition-all duration-200 ${
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted hover:text-foreground hover:bg-surface-highlight'
                }`}
              >
                <item.icon size={15} strokeWidth={active ? 2 : 1.5} />
                <span className=\"hidden lg:inline\">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile nav */}
      <nav className=\"md:hidden fixed top-0 left-0 right-0 z-50 bg-background/90 glass border-b border-border/40\">
        <div className=\"flex items-center justify-between px-5 py-4\">
          <span
            className=\"font-heading font-semibold text-lg text-foreground cursor-pointer\"
            onClick={() => navigate('/chat')}
          >
            InnerVoice
          </span>
          <button onClick={() => setMobileOpen(!mobileOpen)} className=\"text-muted hover:text-foreground transition-colors\">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className=\"border-t border-border/40 bg-background/95\"
          >
            {navItems.map(item => {
              const active = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  data-testid={`mobile-nav-${item.label.toLowerCase()}-btn`}
                  onClick={() => { navigate(item.path); setMobileOpen(false); }}
                  className={`w-full flex items-center gap-3 px-6 py-4 text-left font-body text-base border-b border-border/30 last:border-0 transition-colors ${
                    active ? 'text-primary bg-primary/5' : 'text-foreground hover:bg-surface/50'
                  }`}
                >
                  <item.icon size={18} strokeWidth={1.5} />
                  {item.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </nav>

      {/* Spacer for fixed nav */}
      <div className=\"h-16 md:hidden\" />
    </>
  );
}
"
