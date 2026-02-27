"import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { User, Heart, LogOut, Edit2, Check } from 'lucide-react';
import Navbar from '../components/Navbar';

const VALUES_OPTIONS = [
  \"Honesty\", \"Compassion\", \"Growth\", \"Loyalty\", \"Courage\",
  \"Family\", \"Creativity\", \"Freedom\", \"Justice\", \"Wisdom\",
  \"Humility\", \"Resilience\", \"Kindness\", \"Integrity\", \"Purpose\",
  \"Balance\", \"Adventure\", \"Community\", \"Spirituality\", \"Achievement\",
];

export default function Profile() {
  const { user, authAxios, logout, refreshUser } = useAuth();
  const [values, setValues] = useState([]);
  const [personality, setPersonality] = useState('');
  const [description, setDescription] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedValues, setSelectedValues] = useState([]);

  useEffect(() => {
    authAxios.get('/api/values').then(res => {
      const d = res.data;
      setValues(d.values || []);
      setSelectedValues(d.values || []);
      setPersonality(d.personality || '');
      setDescription(d.description || '');
    }).catch(() => {});
  }, []);

  const toggleValue = (v) => {
    setSelectedValues(prev =>
      prev.includes(v) ? prev.filter(x => x !== v) : prev.length < 7 ? [...prev, v] : prev
    );
  };

  const saveValues = async () => {
    setSaving(true);
    try {
      await authAxios.post('/api/values', { values: selectedValues, personality, description });
      setValues(selectedValues);
      await refreshUser();
      setEditing(false);
      toast.success('Values updated.');
    } catch (e) {
      toast.error('Could not save values.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <div className=\"min-h-screen bg-background\">
      <Navbar />
      <div className=\"max-w-2xl mx-auto px-6 py-12 pt-28\">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          {/* Profile header */}
          <div className=\"flex items-center gap-5 mb-12\">
            <div className=\"w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center\">
              <span className=\"font-heading text-2xl font-semibold text-primary\">
                {user?.name?.[0]?.toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className=\"font-heading text-3xl font-light text-foreground\">{user?.name}</h1>
              <p className=\"font-body text-muted text-sm mt-0.5\">{user?.email}</p>
            </div>
          </div>

          {/* Values section */}
          <div className=\"bg-surface/60 border border-border/60 rounded-3xl p-8 mb-6\">
            <div className=\"flex items-center justify-between mb-6\">
              <div className=\"flex items-center gap-2\">
                <Heart size={18} className=\"text-primary\" strokeWidth={1.5} />
                <h2 className=\"font-heading text-xl font-semibold text-foreground\">Your Values</h2>
              </div>
              <button
                data-testid=\"edit-values-btn\"
                onClick={() => { setEditing(!editing); setSelectedValues(values); }}
                className=\"flex items-center gap-1.5 text-sm font-body text-muted hover:text-primary transition-colors\"
              >
                <Edit2 size={14} />
                {editing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {editing ? (
              <div>
                <div className=\"flex flex-wrap gap-2 mb-4\">
                  {VALUES_OPTIONS.map(v => (
                    <button
                      key={v}
                      onClick={() => toggleValue(v)}
                      className={`rounded-full px-4 py-2 font-body text-sm font-medium border transition-all ${
                        selectedValues.includes(v)
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background border-border text-foreground hover:border-primary/50'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
                <div className=\"mt-4 space-y-3\">
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder=\"A bit about yourself (optional)\"
                    rows={3}
                    className=\"w-full bg-background border border-border rounded-xl p-3 font-body text-foreground placeholder-muted/50 text-sm resize-none focus:border-primary focus:outline-none\"
                  />
                </div>
                <button
                  data-testid=\"save-values-btn\"
                  onClick={saveValues}
                  disabled={saving}
                  className=\"mt-4 flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-6 py-2.5 text-sm font-medium hover:opacity-90 transition-all disabled:opacity-60\"
                >
                  <Check size={14} />
                  {saving ? 'Saving...' : 'Save values'}
                </button>
              </div>
            ) : (
              <div>
                {values.length > 0 ? (
                  <div className=\"flex flex-wrap gap-2\">
                    {values.map(v => (
                      <span key={v} className=\"bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-body font-medium\">
                        {v}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className=\"font-body text-muted text-sm\">No values set yet.</p>
                )}
                {description && (
                  <p className=\"font-body text-muted text-sm mt-4 italic leading-relaxed\">\"{description}\"</p>
                )}
              </div>
            )}
          </div>

          {/* Account section */}
          <div className=\"bg-surface/60 border border-border/60 rounded-3xl p-8 mb-6\">
            <div className=\"flex items-center gap-2 mb-4\">
              <User size={18} className=\"text-muted\" strokeWidth={1.5} />
              <h2 className=\"font-heading text-xl font-semibold text-foreground\">Account</h2>
            </div>
            <div className=\"space-y-3\">
              <div className=\"flex justify-between items-center py-2 border-b border-border/50\">
                <span className=\"font-body text-sm text-muted\">Name</span>
                <span className=\"font-body text-sm text-foreground\">{user?.name}</span>
              </div>
              <div className=\"flex justify-between items-center py-2\">
                <span className=\"font-body text-sm text-muted\">Email</span>
                <span className=\"font-body text-sm text-foreground\">{user?.email}</span>
              </div>
            </div>
          </div>

          {/* Sign out */}
          <button
            data-testid=\"logout-btn\"
            onClick={handleLogout}
            className=\"w-full flex items-center justify-center gap-2 bg-surface border border-border rounded-full py-3.5 font-body text-sm font-medium text-muted hover:text-error hover:border-error/40 transition-all\"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </motion.div>
      </div>
    </div>
  );
}
"
