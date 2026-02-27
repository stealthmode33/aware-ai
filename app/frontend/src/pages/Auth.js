"import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

const authBg = \"https://images.unsplash.com/photo-1768466589335-d99fcd671ac6?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzOTB8MHwxfHNlYXJjaHwzfHxhYnN0cmFjdCUyMHdhcm0lMjBvcmdhbmljJTIwc2hhcGVzJTIwdGV4dHVyZXxlbnwwfHx8fDE3NzIyMjY4NzV8MA&ixlib=rb-4.1.0&q=85&w=1200\";

export default function Auth() {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let user;
      if (mode === 'login') {
        user = await login(email, password);
      } else {
        if (!name.trim()) { toast.error('Please enter your name'); setLoading(false); return; }
        user = await register(name, email, password);
      }
      navigate(user.onboarded ? '/chat' : '/onboarding', { replace: true });
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=\"min-h-screen bg-background flex\">
      {/* Left panel - image */}
      <div className=\"hidden lg:flex flex-1 relative overflow-hidden\">
        <img src={authBg} alt=\"\" className=\"absolute inset-0 w-full h-full object-cover opacity-60\" />
        <div className=\"absolute inset-0 bg-foreground/20\" />
        <div className=\"relative z-10 flex flex-col justify-end p-12\">
          <blockquote className=\"font-heading text-3xl font-light text-white/90 italic leading-relaxed max-w-md\">
            \"The quieter you become,<br />the more you can hear.\"
          </blockquote>
          <p className=\"font-body text-white/50 text-sm mt-3\">— Ram Dass</p>
        </div>
      </div>

      {/* Right panel - form */}
      <div className=\"flex-1 flex flex-col justify-center px-8 py-12 max-w-lg mx-auto w-full\">
        <button
          onClick={() => navigate('/')}
          className=\"flex items-center gap-2 text-muted hover:text-foreground font-body text-sm mb-12 transition-colors w-fit\"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className=\"font-heading text-4xl font-light text-foreground mb-2\">
            {mode === 'login' ? 'Welcome back.' : 'Begin here.'}
          </h1>
          <p className=\"font-body text-muted mb-10\">
            {mode === 'login'
              ? 'Your conscience has been waiting.'
              : 'A few moments to start your inner journey.'}
          </p>

          <form onSubmit={handleSubmit} className=\"space-y-8\" data-testid=\"auth-form\">
            <AnimatePresence mode=\"wait\">
              {mode === 'signup' && (
                <motion.div
                  key=\"name-field\"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className=\"overflow-hidden\"
                >
                  <label className=\"block text-sm font-medium text-muted mb-2 font-body tracking-wide uppercase\">
                    Your name
                  </label>
                  <input
                    data-testid=\"name-input\"
                    type=\"text\"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder=\"How you'd like to be known\"
                    className=\"w-full bg-transparent border-b-2 border-border focus:border-primary outline-none py-3 text-lg font-body text-foreground placeholder-muted/50 transition-colors\"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className=\"block text-sm font-medium text-muted mb-2 font-body tracking-wide uppercase\">
                Email
              </label>
              <input
                data-testid=\"email-input\"
                type=\"email\"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder=\"your@email.com\"
                required
                className=\"w-full bg-transparent border-b-2 border-border focus:border-primary outline-none py-3 text-lg font-body text-foreground placeholder-muted/50 transition-colors\"
              />
            </div>

            <div>
              <label className=\"block text-sm font-medium text-muted mb-2 font-body tracking-wide uppercase\">
                Password
              </label>
              <div className=\"relative\">
                <input
                  data-testid=\"password-input\"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder=\"••••••••\"
                  required
                  className=\"w-full bg-transparent border-b-2 border-border focus:border-primary outline-none py-3 text-lg font-body text-foreground placeholder-muted/50 transition-colors pr-10\"
                />
                <button
                  type=\"button\"
                  onClick={() => setShowPass(!showPass)}
                  className=\"absolute right-0 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors\"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              data-testid=\"auth-submit-btn\"
              type=\"submit\"
              disabled={loading}
              className=\"w-full bg-primary text-primary-foreground rounded-full py-4 text-lg font-medium hover:opacity-90 transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed\"
            >
              {loading ? (
                <span className=\"flex items-center justify-center gap-2\">
                  <span className=\"w-2 h-2 rounded-full bg-primary-foreground/70 typing-dot\" />
                  <span className=\"w-2 h-2 rounded-full bg-primary-foreground/70 typing-dot\" />
                  <span className=\"w-2 h-2 rounded-full bg-primary-foreground/70 typing-dot\" />
                </span>
              ) : (
                mode === 'login' ? 'Sign in' : 'Create account'
              )}
            </button>
          </form>

          <p className=\"font-body text-muted text-center mt-8\">
            {mode === 'login' ? \"Don't have an account? \" : \"Already have an account? \"}
            <button
              data-testid=\"auth-toggle-btn\"
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className=\"text-primary hover:text-foreground font-medium transition-colors underline underline-offset-2\"
            >
              {mode === 'login' ? 'Create one' : 'Sign in'}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
"
