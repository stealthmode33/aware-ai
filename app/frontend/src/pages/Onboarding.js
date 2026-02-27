"import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const VALUES_OPTIONS = [
  \"Honesty\", \"Compassion\", \"Growth\", \"Loyalty\", \"Courage\",
  \"Family\", \"Creativity\", \"Freedom\", \"Justice\", \"Wisdom\",
  \"Humility\", \"Resilience\", \"Kindness\", \"Integrity\", \"Purpose\",
  \"Balance\", \"Adventure\", \"Community\", \"Spirituality\", \"Achievement\",
];

const PERSONALITY_OPTIONS = [
  \"Introspective & thoughtful\",
  \"Action-oriented & decisive\",
  \"Empathetic & people-focused\",
  \"Analytical & logical\",
  \"Creative & imaginative\",
  \"Pragmatic & grounded\",
];

const steps = [
  { title: \"What do you stand for?\", subtitle: \"Choose the values that feel most like you (pick 3–7).\" },
  { title: \"How would you describe yourself?\", subtitle: \"Pick what resonates most deeply.\" },
  { title: \"Tell your conscience about you.\", subtitle: \"A little context goes a long way.\" },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [selectedValues, setSelectedValues] = useState([]);
  const [selectedPersonality, setSelectedPersonality] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const { authAxios, refreshUser } = useAuth();
  const navigate = useNavigate();

  const toggleValue = (v) => {
    setSelectedValues(prev =>
      prev.includes(v) ? prev.filter(x => x !== v) : prev.length < 7 ? [...prev, v] : prev
    );
  };

  const canNext = () => {
    if (step === 0) return selectedValues.length >= 3;
    if (step === 1) return !!selectedPersonality;
    return true;
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      await authAxios.post('/api/values', {
        values: selectedValues,
        personality: selectedPersonality,
        description,
      });
      await refreshUser();
      toast.success(\"Your conscience is ready.\");
      navigate('/chat', { replace: true });
    } catch (e) {
      toast.error('Something went wrong saving your values.');
    } finally {
      setLoading(false);
    }
  };

  const pageVariants = {
    enter: { opacity: 0, x: 40 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -40 },
  };

  return (
    <div className=\"min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12\">
      {/* Progress */}
      <div className=\"w-full max-w-lg mb-12\">
        <div className=\"flex gap-2\">
          {steps.map((_, i) => (
            <div
              key={i}
              className=\"h-1 flex-1 rounded-full transition-all duration-500\"
              style={{ background: i <= step ? 'var(--color-primary)' : 'var(--color-border)' }}
            />
          ))}
        </div>
        <p className=\"text-sm text-muted font-body mt-3\">{step + 1} of {steps.length}</p>
      </div>

      <AnimatePresence mode=\"wait\">
        <motion.div
          key={step}
          variants={pageVariants}
          initial=\"enter\"
          animate=\"center\"
          exit=\"exit\"
          transition={{ duration: 0.4, ease: \"easeInOut\" }}
          className=\"w-full max-w-lg\"
        >
          <h2 className=\"font-heading text-3xl md:text-4xl font-light text-foreground mb-2\">
            {steps[step].title}
          </h2>
          <p className=\"font-body text-muted mb-8\">{steps[step].subtitle}</p>

          {step === 0 && (
            <div className=\"flex flex-wrap gap-3\">
              {VALUES_OPTIONS.map(v => (
                <button
                  key={v}
                  data-testid={`value-${v.toLowerCase()}`}
                  onClick={() => toggleValue(v)}
                  className={`rounded-full px-5 py-2.5 font-body text-sm font-medium border transition-all duration-200 ${
                    selectedValues.includes(v)
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm scale-105'
                      : 'bg-surface border-border text-foreground hover:border-primary/50'
                  }`}
                >
                  {v}
                </button>
              ))}
              {selectedValues.length > 0 && (
                <p className=\"w-full mt-2 text-sm text-muted font-body\">
                  Selected: {selectedValues.join(', ')}
                </p>
              )}
            </div>
          )}

          {step === 1 && (
            <div className=\"space-y-3\">
              {PERSONALITY_OPTIONS.map(p => (
                <button
                  key={p}
                  data-testid={`personality-${p.split(' ')[0].toLowerCase()}`}
                  onClick={() => setSelectedPersonality(p)}
                  className={`w-full text-left rounded-2xl px-6 py-4 font-body border transition-all duration-200 ${
                    selectedPersonality === p
                      ? 'bg-primary/10 border-primary text-foreground'
                      : 'bg-surface border-border text-foreground hover:border-primary/40'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div>
              <textarea
                data-testid=\"description-input\"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder=\"What's going on in your life right now? What are you hoping your conscience helps you with? (optional but powerful)\"
                rows={6}
                className=\"w-full bg-surface border border-border rounded-2xl p-5 font-body text-foreground placeholder-muted/50 focus:border-primary focus:outline-none resize-none text-base leading-relaxed transition-colors\"
              />
              <p className=\"text-sm text-muted font-body mt-3\">This is just for your conscience. It won't be shared.</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className=\"flex items-center gap-4 mt-12 w-full max-w-lg\">
        {step > 0 && (
          <button
            onClick={() => setStep(s => s - 1)}
            className=\"flex items-center gap-2 font-body text-muted hover:text-foreground transition-colors\"
          >
            <ChevronLeft size={18} />
            Back
          </button>
        )}
        <div className=\"flex-1\" />
        {step < steps.length - 1 ? (
          <button
            data-testid=\"onboarding-next-btn\"
            onClick={() => setStep(s => s + 1)}
            disabled={!canNext()}
            className=\"flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-8 py-3 font-medium font-body hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed\"
          >
            Continue
            <ChevronRight size={18} />
          </button>
        ) : (
          <button
            data-testid=\"onboarding-finish-btn\"
            onClick={handleFinish}
            disabled={loading}
            className=\"flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-8 py-3 font-medium font-body hover:opacity-90 transition-all disabled:opacity-60\"
          >
            {loading ? 'Creating your conscience...' : 'Meet your conscience'}
            <ChevronRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
"
