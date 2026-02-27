"import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { Smile, Zap, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';

const moodLabels = ['', 'Rough', 'Low', 'Difficult', 'Okay', 'Neutral', 'Decent', 'Good', 'Great', 'Wonderful', 'Radiant'];
const moodEmojis = ['', '😔', '😞', '😟', '😐', '😑', '🙂', '😊', '😄', '😁', '✨'];

export default function CheckIn() {
  const { authAxios } = useAuth();
  const navigate = useNavigate();
  const [mood, setMood] = useState(5);
  const [energy, setEnergy] = useState(5);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    authAxios.get('/api/checkins').then(res => setRecent((res.data.checkins || []).slice(0, 5))).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authAxios.post('/api/checkin', { mood, energy, note });
      setSaved(true);
      toast.success('Check-in saved.');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (e) {
      toast.error('Could not save check-in.');
    } finally {
      setSaving(false);
    }
  };

  if (saved) {
    return (
      <div className=\"min-h-screen bg-background flex items-center justify-center\">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className=\"text-center\"
        >
          <div className=\"text-6xl mb-4\">{moodEmojis[mood]}</div>
          <h2 className=\"font-heading text-3xl font-light text-foreground mb-2\">Noted.</h2>
          <p className=\"font-body text-muted\">Taking you back to your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className=\"min-h-screen bg-background\">
      <Navbar />
      <div className=\"max-w-xl mx-auto px-6 py-12 pt-28\">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <p className=\"text-xs font-body uppercase tracking-widest text-muted mb-2\">Daily ritual</p>
          <h1 className=\"font-heading text-4xl font-light text-foreground mb-2\">
            How are you <em className=\"font-semibold text-primary\">really?</em>
          </h1>
          <p className=\"font-body text-muted mb-10\">A moment of honest self-awareness changes everything.</p>

          <form onSubmit={handleSubmit} className=\"space-y-10\">
            {/* Mood */}
            <div>
              <div className=\"flex items-center justify-between mb-4\">
                <div className=\"flex items-center gap-2\">
                  <Smile size={18} className=\"text-primary\" strokeWidth={1.5} />
                  <label className=\"font-body font-medium text-foreground\">Mood</label>
                </div>
                <div className=\"flex items-center gap-2\">
                  <span className=\"text-2xl\">{moodEmojis[mood]}</span>
                  <span className=\"font-heading text-xl font-semibold text-primary\">{moodLabels[mood]}</span>
                </div>
              </div>
              <div className=\"relative\">
                <input
                  data-testid=\"mood-slider\"
                  type=\"range\"
                  min={1}
                  max={10}
                  value={mood}
                  onChange={e => setMood(parseInt(e.target.value))}
                  className=\"w-full h-2 appearance-none rounded-full cursor-pointer\"
                  style={{ accentColor: 'var(--color-primary)' }}
                />
                <div className=\"flex justify-between text-xs text-muted font-body mt-2\">
                  <span>Struggling</span>
                  <span>Thriving</span>
                </div>
              </div>
              <div className=\"flex justify-center gap-1 mt-3\">
                {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                  <button
                    key={n}
                    type=\"button\"
                    data-testid={`mood-${n}`}
                    onClick={() => setMood(n)}
                    className={`w-8 h-8 rounded-full text-xs font-body font-medium transition-all ${
                      mood === n ? 'bg-primary text-primary-foreground scale-110' : 'bg-surface text-muted hover:bg-surface-highlight'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Energy */}
            <div>
              <div className=\"flex items-center justify-between mb-4\">
                <div className=\"flex items-center gap-2\">
                  <Zap size={18} className=\"text-accent\" strokeWidth={1.5} />
                  <label className=\"font-body font-medium text-foreground\">Energy</label>
                </div>
                <span className=\"font-heading text-xl font-semibold text-accent\">{energy}/10</span>
              </div>
              <input
                data-testid=\"energy-slider\"
                type=\"range\"
                min={1}
                max={10}
                value={energy}
                onChange={e => setEnergy(parseInt(e.target.value))}
                className=\"w-full h-2 appearance-none rounded-full cursor-pointer\"
                style={{ accentColor: 'var(--color-accent)' }}
              />
              <div className=\"flex justify-between text-xs text-muted font-body mt-2\">
                <span>Drained</span>
                <span>Energized</span>
              </div>
            </div>

            {/* Note */}
            <div>
              <label className=\"font-body font-medium text-foreground block mb-3\">
                Anything you want to capture?
                <span className=\"text-muted text-sm ml-2\">(optional)</span>
              </label>
              <textarea
                data-testid=\"checkin-note\"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder=\"A thought, a feeling, something that happened today...\"
                rows={4}
                className=\"w-full bg-surface border border-border rounded-2xl p-4 font-body text-foreground placeholder-muted/50 resize-none focus:border-primary focus:outline-none transition-colors text-base leading-relaxed\"
              />
            </div>

            <button
              data-testid=\"checkin-submit-btn\"
              type=\"submit\"
              disabled={saving}
              className=\"w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-full py-4 text-lg font-medium hover:opacity-90 transition-all shadow-md disabled:opacity-60\"
            >
              {saving ? 'Saving...' : 'Save check-in'}
              <ArrowRight size={18} />
            </button>
          </form>

          {/* Recent check-ins */}
          {recent.length > 0 && (
            <div className=\"mt-12\">
              <h3 className=\"font-body text-sm uppercase tracking-widest text-muted mb-4\">Recent</h3>
              <div className=\"space-y-3\">
                {recent.map(ci => (
                  <div key={ci.id} className=\"flex items-center gap-4 bg-surface/50 border border-border/50 rounded-xl px-4 py-3\">
                    <span className=\"text-lg\">{moodEmojis[ci.mood]}</span>
                    <div>
                      <p className=\"font-body text-sm font-medium text-foreground\">{moodLabels[ci.mood]} — {ci.mood}/10</p>
                      <p className=\"font-body text-xs text-muted\">{new Date(ci.timestamp).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                    </div>
                    {ci.note && (
                      <p className=\"font-body text-sm text-muted ml-auto italic truncate max-w-32\">\"{ci.note}\"</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
"
