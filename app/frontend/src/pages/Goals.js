"import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { Plus, Check, Trash2, ChevronDown, ChevronUp, Target, Calendar } from 'lucide-react';
import Navbar from '../components/Navbar';

const CATEGORIES = ['personal', 'health', 'career', 'relationships', 'learning', 'finance', 'other'];
const CATEGORY_COLORS = {
  personal: 'bg-primary/10 text-primary',
  health: 'bg-secondary/10 text-secondary',
  career: 'bg-accent/10 text-foreground',
  relationships: 'bg-error/10 text-error',
  learning: 'bg-muted/10 text-muted',
  finance: 'bg-success/10 text-success',
  other: 'bg-surface-highlight text-muted',
};

export default function Goals() {
  const { authAxios } = useAuth();
  const [goals, setGoals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('personal');
  const [targetDate, setTargetDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('active');

  useEffect(() => { loadGoals(); }, []);

  const loadGoals = async () => {
    try {
      const res = await authAxios.get('/api/goals');
      setGoals(res.data.goals || []);
    } catch (e) {}
  };

  const createGoal = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      const res = await authAxios.post('/api/goals', { title, description, category, target_date: targetDate || null });
      setGoals(prev => [res.data, ...prev]);
      setTitle(''); setDescription(''); setTargetDate(''); setCategory('personal');
      setShowForm(false);
      toast.success('Goal created.');
    } catch (e) { toast.error('Could not create goal.'); }
    finally { setSaving(false); }
  };

  const toggleComplete = async (goal) => {
    try {
      const updated = await authAxios.put(`/api/goals/${goal.id}`, { completed: !goal.completed });
      setGoals(prev => prev.map(g => g.id === goal.id ? updated.data : g));
      toast.success(goal.completed ? 'Goal reopened.' : 'Goal completed!');
    } catch (e) { toast.error('Update failed.'); }
  };

  const updateProgress = async (goal, progress) => {
    try {
      const updated = await authAxios.put(`/api/goals/${goal.id}`, { progress });
      setGoals(prev => prev.map(g => g.id === goal.id ? updated.data : g));
    } catch (e) {}
  };

  const deleteGoal = async (id) => {
    try {
      await authAxios.delete(`/api/goals/${id}`);
      setGoals(prev => prev.filter(g => g.id !== id));
      toast.success('Goal removed.');
    } catch (e) { toast.error('Could not delete goal.'); }
  };

  const filtered = goals.filter(g => filter === 'all' ? true : filter === 'active' ? !g.completed : g.completed);

  return (
    <div className=\"min-h-screen bg-background\">
      <Navbar />
      <div className=\"max-w-3xl mx-auto px-6 py-12 pt-28\">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className=\"flex items-end justify-between mb-10\">
            <div>
              <p className=\"text-xs font-body uppercase tracking-widest text-muted mb-1\">Accountability</p>
              <h1 className=\"font-heading text-4xl font-light text-foreground\">
                Your <em className=\"font-semibold text-primary\">Intentions</em>
              </h1>
            </div>
            <button
              data-testid=\"add-goal-btn\"
              onClick={() => setShowForm(!showForm)}
              className=\"flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-5 py-2.5 font-body text-sm font-medium hover:opacity-90 transition-all\"
            >
              <Plus size={16} />
              New goal
            </button>
          </div>

          {/* Add form */}
          <AnimatePresence>
            {showForm && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={createGoal}
                className=\"mb-8 bg-surface border border-border rounded-3xl p-6 overflow-hidden\"
              >
                <h3 className=\"font-heading text-lg font-semibold text-foreground mb-4\">Set an intention</h3>
                <div className=\"space-y-4\">
                  <input
                    data-testid=\"goal-title-input\"
                    type=\"text\"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder=\"What do you want to achieve?\"
                    required
                    className=\"w-full bg-transparent border-b-2 border-border focus:border-primary outline-none py-2 font-body text-foreground placeholder-muted/50 text-base transition-colors\"
                  />
                  <textarea
                    data-testid=\"goal-description-input\"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder=\"Why does this matter to you? (optional)\"
                    rows={2}
                    className=\"w-full bg-surface-highlight border border-border/50 rounded-xl p-3 font-body text-foreground placeholder-muted/50 text-sm resize-none focus:border-primary focus:outline-none transition-colors\"
                  />
                  <div className=\"flex gap-3 flex-wrap\">
                    <select
                      data-testid=\"goal-category-select\"
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className=\"bg-surface-highlight border border-border rounded-xl px-3 py-2 font-body text-sm text-foreground focus:border-primary focus:outline-none\"
                    >
                      {CATEGORIES.map(c => (
                        <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                      ))}
                    </select>
                    <input
                      type=\"date\"
                      value={targetDate}
                      onChange={e => setTargetDate(e.target.value)}
                      className=\"bg-surface-highlight border border-border rounded-xl px-3 py-2 font-body text-sm text-foreground focus:border-primary focus:outline-none\"
                    />
                  </div>
                  <div className=\"flex gap-3 justify-end\">
                    <button type=\"button\" onClick={() => setShowForm(false)} className=\"font-body text-sm text-muted hover:text-foreground transition-colors px-4 py-2\">
                      Cancel
                    </button>
                    <button
                      data-testid=\"save-goal-btn\"
                      type=\"submit\"
                      disabled={saving}
                      className=\"bg-primary text-primary-foreground rounded-full px-6 py-2 text-sm font-medium hover:opacity-90 transition-all disabled:opacity-60\"
                    >
                      {saving ? 'Saving...' : 'Set intention'}
                    </button>
                  </div>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Filter */}
          <div className=\"flex gap-2 mb-6\">
            {['active', 'completed', 'all'].map(f => (
              <button
                key={f}
                data-testid={`filter-${f}-btn`}
                onClick={() => setFilter(f)}
                className={`rounded-full px-4 py-1.5 text-sm font-body font-medium transition-all ${
                  filter === f ? 'bg-primary text-primary-foreground' : 'bg-surface text-muted hover:text-foreground border border-border'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Goals list */}
          <div className=\"space-y-4\">
            {filtered.length === 0 && (
              <div className=\"text-center py-12\">
                <Target size={32} className=\"text-muted mx-auto mb-3\" strokeWidth={1} />
                <p className=\"font-body text-muted\">
                  {filter === 'completed' ? 'No completed goals yet.' : 'No active goals. Set your first intention.'}
                </p>
              </div>
            )}
            <AnimatePresence>
              {filtered.map(goal => (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className=\"bg-surface/60 border border-border/60 rounded-2xl p-5 hover:border-primary/20 transition-all\"
                >
                  <div className=\"flex items-start gap-4\">
                    <button
                      data-testid={`complete-goal-${goal.id}`}
                      onClick={() => toggleComplete(goal)}
                      className={`mt-0.5 w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                        goal.completed
                          ? 'bg-success border-success text-white'
                          : 'border-border hover:border-primary'
                      }`}
                    >
                      {goal.completed && <Check size={12} strokeWidth={3} />}
                    </button>
                    <div className=\"flex-1 min-w-0\">
                      <div className=\"flex items-center gap-2 flex-wrap\">
                        <h3 className={`font-body font-medium text-base ${goal.completed ? 'line-through text-muted' : 'text-foreground'}`}>
                          {goal.title}
                        </h3>
                        <span className={`text-xs font-body px-2.5 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[goal.category] || CATEGORY_COLORS.other}`}>
                          {goal.category}
                        </span>
                      </div>
                      {goal.description && (
                        <p className=\"font-body text-sm text-muted mt-1 leading-relaxed\">{goal.description}</p>
                      )}
                      {goal.target_date && (
                        <div className=\"flex items-center gap-1 mt-2 text-xs text-muted font-body\">
                          <Calendar size={12} />
                          By {new Date(goal.target_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      )}
                      {/* Progress bar */}
                      {!goal.completed && (
                        <div className=\"mt-3\">
                          <div className=\"flex items-center gap-2\">
                            <input
                              type=\"range\"
                              min={0}
                              max={100}
                              value={goal.progress || 0}
                              onChange={e => updateProgress(goal, parseInt(e.target.value))}
                              className=\"flex-1 h-1.5 appearance-none cursor-pointer\"
                              style={{ accentColor: 'var(--color-primary)' }}
                            />
                            <span className=\"text-xs font-body text-muted w-8 text-right\">{goal.progress || 0}%</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <button
                      data-testid={`delete-goal-${goal.id}`}
                      onClick={() => deleteGoal(goal.id)}
                      className=\"text-muted/40 hover:text-error transition-colors flex-shrink-0\"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
"
