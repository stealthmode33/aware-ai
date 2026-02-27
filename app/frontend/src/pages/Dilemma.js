"import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { Scale, Send, ChevronDown, ChevronUp } from 'lucide-react';
import Navbar from '../components/Navbar';

const exampleDilemmas = [
  \"My friend asked me to lie to their partner to cover for them. I want to be loyal, but I believe in honesty.\",
  \"I have a job offer that pays more but requires me to compromise on values I care about.\",
  \"I found out a colleague is doing something unethical, but reporting them could hurt their family.\",
];

function AnalysisBlock({ text }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className=\"bg-primary/5 border border-primary/15 rounded-3xl p-8\"
    >
      <div className=\"flex items-center gap-2 mb-4\">
        <div className=\"w-2 h-2 rounded-full bg-primary animate-pulse-soft\" />
        <span className=\"font-body text-xs uppercase tracking-widest text-primary/70\">Your conscience speaks</span>
      </div>
      <div className=\"font-body text-foreground/90 leading-[1.9] text-base italic whitespace-pre-wrap\">
        {text}
      </div>
    </motion.div>
  );
}

export default function Dilemma() {
  const { authAxios } = useAuth();
  const [dilemma, setDilemma] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    authAxios.get('/api/dilemmas').then(res => setHistory(res.data.dilemmas || [])).catch(() => {});
  }, []);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!dilemma.trim()) return;
    setLoading(true);
    setAnalysis(null);
    try {
      const res = await authAxios.post('/api/dilemma/analyze', { dilemma });
      setAnalysis(res.data.analysis);
      setHistory(prev => [{ id: res.data.id, dilemma, analysis: res.data.analysis, timestamp: new Date().toISOString() }, ...prev]);
    } catch (e) {
      toast.error('Could not analyze your dilemma. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=\"min-h-screen bg-background\">
      <Navbar />
      <div className=\"max-w-2xl mx-auto px-6 py-12 pt-28\">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className=\"flex items-center gap-3 mb-2\">
            <Scale size={22} className=\"text-primary\" strokeWidth={1.5} />
            <p className=\"text-xs font-body uppercase tracking-widest text-muted\">Moral clarity</p>
          </div>
          <h1 className=\"font-heading text-4xl font-light text-foreground mb-2\">
            Facing a <em className=\"font-semibold text-primary\">dilemma?</em>
          </h1>
          <p className=\"font-body text-muted mb-8 leading-relaxed\">
            Sometimes the right path isn't clear. Share what you're wrestling with, and your conscience will help you see it from all sides.
          </p>

          <form onSubmit={handleAnalyze} className=\"mb-8\">
            <textarea
              data-testid=\"dilemma-input\"
              value={dilemma}
              onChange={e => setDilemma(e.target.value)}
              placeholder=\"Describe the situation you're facing. What's the dilemma? Who's involved? What are you struggling to decide?\"
              rows={6}
              className=\"w-full bg-surface border border-border rounded-2xl p-5 font-body text-foreground placeholder-muted/50 resize-none focus:border-primary focus:outline-none transition-colors text-base leading-relaxed mb-4\"
            />

            {/* Example prompts */}
            {!dilemma && (
              <div className=\"mb-4\">
                <p className=\"font-body text-xs text-muted uppercase tracking-widest mb-3\">Example dilemmas</p>
                <div className=\"space-y-2\">
                  {exampleDilemmas.map((ex, i) => (
                    <button
                      key={i}
                      type=\"button\"
                      onClick={() => setDilemma(ex)}
                      className=\"w-full text-left text-sm font-body text-muted bg-surface/50 border border-border/50 rounded-xl px-4 py-3 hover:border-primary/30 hover:text-foreground transition-all\"
                    >
                      \"{ex}\"
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              data-testid=\"analyze-dilemma-btn\"
              type=\"submit\"
              disabled={!dilemma.trim() || loading}
              className=\"w-full flex items-center justify-center gap-3 bg-primary text-primary-foreground rounded-full py-4 text-lg font-medium hover:opacity-90 transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed\"
            >
              {loading ? (
                <>
                  <span className=\"w-2 h-2 rounded-full bg-primary-foreground/70 typing-dot\" />
                  <span className=\"w-2 h-2 rounded-full bg-primary-foreground/70 typing-dot\" />
                  <span className=\"w-2 h-2 rounded-full bg-primary-foreground/70 typing-dot\" />
                </>
              ) : (
                <>
                  <Send size={18} />
                  Ask your conscience
                </>
              )}
            </button>
          </form>

          {/* Analysis result */}
          <AnimatePresence>
            {analysis && <AnalysisBlock text={analysis} />}
          </AnimatePresence>

          {/* History */}
          {history.length > 0 && (
            <div className=\"mt-12\">
              <button
                data-testid=\"toggle-history-btn\"
                onClick={() => setShowHistory(!showHistory)}
                className=\"flex items-center gap-2 font-body text-sm text-muted hover:text-foreground transition-colors mb-4\"
              >
                {showHistory ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                Past dilemmas ({history.length})
              </button>
              <AnimatePresence>
                {showHistory && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className=\"space-y-4 overflow-hidden\"
                  >
                    {history.map(item => (
                      <div key={item.id} className=\"bg-surface/50 border border-border/50 rounded-2xl p-5\">
                        <p className=\"font-body text-sm font-medium text-foreground mb-2 line-clamp-2\">\"{item.dilemma}\"</p>
                        <p className=\"font-body text-xs text-muted mb-3\">
                          {new Date(item.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        <p className=\"font-body text-sm text-muted/80 italic line-clamp-3\">{item.analysis}</p>
                        <button
                          onClick={() => { setDilemma(item.dilemma); setAnalysis(item.analysis); setShowHistory(false); window.scrollTo(0, 0); }}
                          className=\"mt-3 text-xs font-body text-primary hover:text-foreground transition-colors\"
                        >
                          View full analysis
                        </button>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
"
