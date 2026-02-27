"import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare, Target, Activity, Brain, ArrowRight, TrendingUp } from 'lucide-react';
import Navbar from '../components/Navbar';

const moodLabels = ['', 'Rough', 'Low', 'Difficult', 'Okay', 'Neutral', 'Decent', 'Good', 'Great', 'Wonderful', 'Radiant'];

function MoodBar({ value, max = 10 }) {
  return (
    <div className=\"flex items-center gap-2\">
      <div className=\"flex-1 h-2 bg-surface-highlight rounded-full overflow-hidden\">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(value / max) * 100}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full mood-${value}`}
        />
      </div>
      <span className=\"text-sm font-body text-muted w-8 text-right\">{value}</span>
    </div>
  );
}

export default function Dashboard() {
  const { user, authAxios } = useAuth();
  const navigate = useNavigate();
  const [checkins, setCheckins] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    Promise.all([
      authAxios.get('/api/checkins'),
      authAxios.get('/api/goals'),
    ]).then(([ci, g]) => {
      setCheckins(ci.data.checkins || []);
      setGoals(g.data.goals || []);
    }).finally(() => setLoadingData(false));
  }, []);

  const recentCheckins = checkins.slice(0, 7);
  const avgMood = recentCheckins.length
    ? Math.round(recentCheckins.reduce((s, c) => s + c.mood, 0) / recentCheckins.length * 10) / 10
    : null;
  const activeGoals = goals.filter(g => !g.completed).length;
  const completedGoals = goals.filter(g => g.completed).length;
  const latestCheckin = checkins[0];

  const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
  const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

  return (
    <div className=\"min-h-screen bg-background\">
      <Navbar />
      <div className=\"max-w-6xl mx-auto px-6 py-12 pt-28\">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className=\"mb-12\"
        >
          <h1 className=\"font-heading text-4xl md:text-5xl font-light text-foreground mb-2\">
            Good {getTimeOfDay()}, <em className=\"font-semibold text-primary\">{user?.name?.split(' ')[0]}</em>.
          </h1>
          <p className=\"font-body text-muted text-lg\">
            {latestCheckin
              ? `Your last check-in: ${moodLabels[latestCheckin.mood]} (${new Date(latestCheckin.timestamp).toLocaleDateString()})`
              : \"You haven't checked in yet today. How are you feeling?\"}
          </p>
        </motion.div>

        {/* Bento Grid */}
        <motion.div
          variants={stagger}
          initial=\"hidden\"
          animate=\"show\"
          className=\"grid grid-cols-1 md:grid-cols-3 gap-6\"
        >
          {/* Mood overview - large */}
          <motion.div
            variants={fadeUp}
            className=\"md:col-span-2 bg-surface/60 border border-border/60 rounded-3xl p-8 hover:border-primary/20 transition-all\"
          >
            <div className=\"flex items-center justify-between mb-6\">
              <div>
                <p className=\"text-xs font-body uppercase tracking-widest text-muted mb-1\">Mood History</p>
                <h3 className=\"font-heading text-2xl font-semibold text-foreground\">
                  {avgMood !== null ? `Avg. ${avgMood}/10` : 'No check-ins yet'}
                </h3>
              </div>
              <div className=\"w-10 h-10 rounded-2xl bg-accent/20 flex items-center justify-center\">
                <Activity size={20} className=\"text-accent\" strokeWidth={1.5} />
              </div>
            </div>

            {recentCheckins.length > 0 ? (
              <div className=\"space-y-3\">
                {recentCheckins.map(ci => (
                  <div key={ci.id}>
                    <div className=\"flex justify-between text-xs font-body text-muted mb-1\">
                      <span>{moodLabels[ci.mood]}</span>
                      <span>{new Date(ci.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                    <MoodBar value={ci.mood} />
                  </div>
                ))}
              </div>
            ) : (
              <div className=\"text-center py-6\">
                <p className=\"font-body text-muted\">Start tracking how you feel each day.</p>
                <button
                  data-testid=\"checkin-prompt-btn\"
                  onClick={() => navigate('/checkin')}
                  className=\"mt-4 bg-primary/10 text-primary rounded-full px-5 py-2 text-sm font-body font-medium hover:bg-primary/15 transition-colors\"
                >
                  Check in now
                </button>
              </div>
            )}
          </motion.div>

          {/* Quick actions - small */}
          <motion.div variants={fadeUp} className=\"space-y-4\">
            {[
              { icon: MessageSquare, label: 'Talk to your conscience', sub: 'Open conversation', path: '/chat', color: 'text-primary', bg: 'bg-primary/10' },
              { icon: Target, label: 'Your goals', sub: `${activeGoals} active`, path: '/goals', color: 'text-secondary', bg: 'bg-secondary/10' },
              { icon: Activity, label: 'Daily check-in', sub: latestCheckin ? 'Update today' : 'Start now', path: '/checkin', color: 'text-accent', bg: 'bg-accent/10' },
              { icon: Brain, label: 'Moral dilemma', sub: 'Get perspective', path: '/dilemma', color: 'text-muted', bg: 'bg-surface-highlight' },
            ].map(item => (
              <motion.button
                key={item.label}
                data-testid={`dashboard-${item.label.split(' ')[0].toLowerCase()}-btn`}
                onClick={() => navigate(item.path)}
                whileHover={{ scale: 1.02 }}
                className=\"w-full flex items-center gap-4 bg-surface/60 border border-border/60 rounded-2xl p-4 hover:border-primary/20 transition-all text-left\"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.bg}`}>
                  <item.icon size={18} className={item.color} strokeWidth={1.5} />
                </div>
                <div>
                  <p className=\"font-body text-sm font-medium text-foreground\">{item.label}</p>
                  <p className=\"font-body text-xs text-muted\">{item.sub}</p>
                </div>
                <ArrowRight size={16} className=\"text-muted ml-auto\" />
              </motion.button>
            ))}
          </motion.div>

          {/* Goals summary */}
          <motion.div
            variants={fadeUp}
            className=\"bg-surface/60 border border-border/60 rounded-3xl p-8 hover:border-secondary/20 transition-all\"
          >
            <div className=\"flex items-center justify-between mb-5\">
              <p className=\"text-xs font-body uppercase tracking-widest text-muted\">Goals</p>
              <TrendingUp size={18} className=\"text-secondary\" strokeWidth={1.5} />
            </div>
            <div className=\"flex items-end gap-4 mb-4\">
              <span className=\"font-heading text-5xl font-light text-foreground\">{activeGoals}</span>
              <span className=\"font-body text-muted mb-2\">active</span>
              {completedGoals > 0 && (
                <span className=\"font-body text-sm text-secondary font-medium mb-2\">{completedGoals} done</span>
              )}
            </div>
            {goals.slice(0, 3).map(g => (
              <div key={g.id} className=\"flex items-center gap-3 py-2 border-b border-border/30 last:border-0\">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${g.completed ? 'bg-success' : 'bg-primary'}`} />
                <span className={`font-body text-sm flex-1 truncate ${g.completed ? 'line-through text-muted' : 'text-foreground'}`}>
                  {g.title}
                </span>
              </div>
            ))}
            {goals.length === 0 && (
              <p className=\"font-body text-muted text-sm\">Set your first intention.</p>
            )}
            <button
              onClick={() => navigate('/goals')}
              className=\"mt-4 text-sm font-body text-secondary hover:text-foreground transition-colors flex items-center gap-1\"
            >
              All goals <ArrowRight size={14} />
            </button>
          </motion.div>

          {/* Today's reflection prompt */}
          <motion.div
            variants={fadeUp}
            className=\"md:col-span-2 bg-primary/5 border border-primary/20 rounded-3xl p-8\"
          >
            <p className=\"text-xs font-body uppercase tracking-widest text-primary/70 mb-3\">Today's reflection</p>
            <p className=\"font-heading text-xl font-light italic text-foreground leading-relaxed\">
              \"{getDailyPrompt()}\"
            </p>
            <button
              data-testid=\"reflect-now-btn\"
              onClick={() => navigate('/chat')}
              className=\"mt-5 flex items-center gap-2 text-sm font-body text-primary hover:text-foreground transition-colors\"
            >
              Reflect on this <ArrowRight size={14} />
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

const reflectionPrompts = [
  \"What is one thing I'm avoiding that I know I should face?\",
  \"Am I acting in alignment with my values today?\",
  \"What would my best self do differently right now?\",
  \"What am I grateful for that I've been taking for granted?\",
  \"Where am I being too hard on myself, and where not hard enough?\",
  \"What decision am I postponing, and why?\",
  \"Who in my life deserves more of my attention and care?\",
  \"What would I regret not doing a year from now?\",
];

function getDailyPrompt() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  return reflectionPrompts[dayOfYear % reflectionPrompts.length];
}
"
