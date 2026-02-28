"import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Heart, Compass, BookOpen } from 'lucide-react';

const heroImg = \"https://images.unsplash.com/photo-1764002932319-85550b761715?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwyfHxjYWxtJTIwcGVhY2VmdWwlMjBsYW5kc2NhcGUlMjBuYXR1cmUlMjBtb3JuaW5nfGVufDB8fHx8MTc3MjIyNjg3NXww&ixlib=rb-4.1.0&q=85&w=1600\";

const features = [
  { icon: Heart, label: \"Daily Check-ins\", desc: \"Track your mood and energy with gentle rituals.\" },
  { icon: Compass, label: \"Moral Clarity\", desc: \"Navigate life's dilemmas with multi-perspective guidance.\" },
  { icon: BookOpen, label: \"Goal Accountability\", desc: \"Set intentions and be held gently to them.\" },
  { icon: Sparkles, label: \"Values Alignment\", desc: \"Decisions rooted in who you truly are.\" },
];

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: \"easeOut\" } },
};

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className=\"min-h-screen bg-background overflow-x-hidden\">
      {/* Nav */}
      <nav className=\"fixed top-6 left-1/2 -translate-x-1/2 z-50\">
        <div className=\"glass bg-surface/80 border border-border/60 shadow-lg rounded-full px-6 py-3 flex items-center gap-8\">
          <span className=\"font-heading font-semibold text-lg text-foreground\">InnerVoice</span>
          <div className=\"hidden md:flex items-center gap-6 text-sm text-muted\">
            <a href=\"#features\" className=\"hover:text-foreground transition-colors\">Features</a>
            <a href=\"#why\" className=\"hover:text-foreground transition-colors\">Why it works</a>
          </div>
          <button
            data-testid=\"nav-signin-btn\"
            onClick={() => navigate('/auth')}
            className=\"bg-primary text-primary-foreground rounded-full px-5 py-2 text-sm font-medium hover:opacity-90 transition-all shadow-sm\"
          >
            Begin
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className=\"relative min-h-screen flex flex-col items-center justify-center pt-24 pb-16 px-6\">
        {/* Background image */}
        <div className=\"absolute inset-0 overflow-hidden\">
          <img
            src={heroImg}
            alt=\"\"
            className=\"w-full h-full object-cover opacity-20\"
          />
          <div
            className=\"absolute inset-0\"
            style={{ background: \"linear-gradient(180deg, rgba(253,252,248,0) 0%, #FDFCF8 70%)\" }}
          />
        </div>

        {/* Warm glow */}
        <div
          className=\"absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none\"
          style={{ background: \"radial-gradient(circle, rgba(228,176,74,0.12) 0%, transparent 70%)\" }}
        />

        <motion.div
          className=\"relative z-10 text-center max-w-3xl mx-auto\"
          variants={staggerContainer}
          initial=\"hidden\"
          animate=\"show\"
        >
          <motion.div variants={fadeUp} className=\"mb-6\">
            <span className=\"inline-flex items-center gap-2 bg-surface border border-border rounded-full px-4 py-2 text-sm text-muted font-body\">
              <span className=\"w-2 h-2 rounded-full bg-primary animate-pulse-soft\" />
              Powered by your values
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className=\"font-heading text-6xl md:text-8xl font-light tracking-tight leading-none text-foreground mb-6\"
          >
            The voice you've<br />
            <em className=\"font-semibold text-primary\">always had.</em>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className=\"font-body text-lg md:text-xl text-muted leading-relaxed max-w-xl mx-auto mb-10\"
          >
            InnerVoice is your AI conscience — warm, non-judgmental, deeply human.
            It reflects your values back to you when you need clarity the most.
          </motion.p>

          <motion.div variants={fadeUp} className=\"flex flex-col sm:flex-row items-center justify-center gap-4\">
            <button
              data-testid=\"hero-cta-btn\"
              onClick={() => navigate('/auth')}
              className=\"group flex items-center gap-3 bg-primary text-primary-foreground rounded-full px-8 py-4 text-lg font-medium hover:opacity-90 transition-all shadow-md hover:shadow-lg\"
            >
              Start listening to yourself
              <ArrowRight size={18} className=\"group-hover:translate-x-1 transition-transform\" />
            </button>
            <button
              onClick={() => navigate('/auth')}
              className=\"text-muted hover:text-foreground font-body text-base transition-colors underline underline-offset-4\"
            >
              I already have an account
            </button>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className=\"absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2\"
        >
          <span className=\"text-xs text-muted font-body tracking-widest uppercase\">Explore</span>
          <div className=\"w-px h-8 bg-gradient-to-b from-muted to-transparent\" />
        </motion.div>
      </section>

      {/* Features */}
      <section id=\"features\" className=\"py-24 px-6 max-w-6xl mx-auto\">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className=\"mb-16 text-center\"
        >
          <h2 className=\"font-heading text-4xl md:text-5xl font-light text-foreground mb-4\">
            More than a chatbot.<br />
            <em className=\"font-semibold\">A companion.</em>
          </h2>
          <p className=\"text-muted font-body text-lg max-w-xl mx-auto\">
            Built around the way humans actually think and feel.
          </p>
        </motion.div>

        <div className=\"grid grid-cols-1 md:grid-cols-2 gap-6\">
          {features.map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className=\"group bg-surface/60 border border-border/60 rounded-3xl p-8 hover:border-primary/30 hover:-translate-y-1 transition-all duration-300\"
            >
              <div className=\"w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-5\">
                <f.icon size={22} className=\"text-primary\" strokeWidth={1.5} />
              </div>
              <h3 className=\"font-heading text-xl font-semibold text-foreground mb-2\">{f.label}</h3>
              <p className=\"font-body text-muted leading-relaxed\">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why it works */}
      <section id=\"why\" className=\"py-24 px-6 bg-surface/50\">
        <div className=\"max-w-4xl mx-auto\">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className=\"grid md:grid-cols-2 gap-12 items-center\"
          >
            <div>
              <h2 className=\"font-heading text-4xl font-light text-foreground mb-6\">
                Why does it feel<br />
                <em className=\"font-semibold text-primary\">so human?</em>
              </h2>
              <p className=\"font-body text-muted text-lg leading-relaxed mb-4\">
                Because it is trained on your values, not ours. Before your first conversation, InnerVoice learns what matters most to you — your principles, your personality, your aspirations.
              </p>
              <p className=\"font-body text-muted text-lg leading-relaxed\">
                Every response is shaped by who you told it you are. That's why it doesn't feel like talking to an AI. It feels like talking to yourself.
              </p>
            </div>
            <div className=\"space-y-4\">
              {[\"Your values define every response\", \"Remembers your history and growth\", \"Holds you accountable without judgment\", \"Available at 3am, during the hard nights\"].map((item, i) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className=\"flex items-center gap-3 bg-background border border-border rounded-2xl px-5 py-4\"
                >
                  <span className=\"w-2 h-2 rounded-full bg-primary flex-shrink-0\" />
                  <span className=\"font-body text-foreground\">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className=\"py-24 px-6 text-center\">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className=\"max-w-2xl mx-auto\"
        >
          <h2 className=\"font-heading text-5xl font-light text-foreground mb-6\">
            Ready to hear<br />
            <em className=\"font-semibold text-primary\">your own voice?</em>
          </h2>
          <button
            data-testid=\"footer-cta-btn\"
            onClick={() => navigate('/auth')}
            className=\"group flex items-center gap-3 mx-auto bg-primary text-primary-foreground rounded-full px-10 py-4 text-lg font-medium hover:opacity-90 transition-all shadow-md hover:shadow-lg\"
          >
            Begin your journey
            <ArrowRight size={18} className=\"group-hover:translate-x-1 transition-transform\" />
          </button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className=\"py-8 px-6 border-t border-border/40 text-center\">
        <p className=\"font-body text-sm text-muted\">
          InnerVoice &mdash; Your conscience, amplified.
        </p>
      </footer>
    </div>
  );
}
"
