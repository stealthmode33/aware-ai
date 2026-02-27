"import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { Send, Plus, MessageSquare, Menu, X } from 'lucide-react';
import Navbar from '../components/Navbar';

function TypingIndicator() {
  return (
    <div className=\"flex items-center gap-1 py-4 px-0\">
      <span className=\"text-sm font-body text-muted italic mr-2\">thinking</span>
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className=\"w-1.5 h-1.5 rounded-full bg-muted typing-dot\"
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>
  );
}

function MessageBlock({ msg, userName }) {
  const isUser = msg.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`py-6 border-b border-border/30 ${isUser ? '' : ''}`}
    >
      <div className=\"flex items-start gap-4 max-w-2xl mx-auto\">
        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-heading font-semibold mt-1 ${
          isUser ? 'bg-surface-highlight text-foreground' : 'bg-primary/15 text-primary'
        }`}>
          {isUser ? userName?.[0]?.toUpperCase() || 'Y' : 'C'}
        </div>
        <div className=\"flex-1 min-w-0\">
          <p className={`font-body text-xs font-medium mb-2 tracking-wide uppercase ${isUser ? 'text-muted' : 'text-primary'}`}>
            {isUser ? 'You' : 'Your Conscience'}
          </p>
          <div className={`font-body leading-relaxed text-base whitespace-pre-wrap ${
            isUser ? 'text-foreground' : 'text-foreground/90'
          } ${!isUser ? 'italic' : ''}`}>
            {msg.content}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Chat() {
  const { user, authAxios } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const loadConversations = async () => {
    try {
      const res = await authAxios.get('/api/chat/conversations');
      setConversations(res.data.conversations || []);
    } catch (e) {}
  };

  const loadSession = async (sid) => {
    try {
      const res = await authAxios.get(`/api/chat/history/${sid}`);
      setMessages(res.data.messages || []);
      setSessionId(sid);
      setSidebarOpen(false);
    } catch (e) { toast.error('Could not load conversation.'); }
  };

  const startNew = () => {
    setMessages([]);
    setSessionId(null);
    setSidebarOpen(false);
    inputRef.current?.focus();
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', content: input.trim(), id: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await authAxios.post('/api/chat/message', {
        message: userMsg.content,
        session_id: sessionId,
      });
      setSessionId(res.data.session_id);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: res.data.response,
        id: Date.now() + 1,
      }]);
      loadConversations();
    } catch (e) {
      toast.error('Your conscience is unavailable right now. Try again.');
      setMessages(prev => prev.filter(m => m.id !== userMsg.id));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=\"min-h-screen bg-background flex\">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className=\"fixed inset-y-0 left-0 z-40 w-72 bg-surface border-r border-border flex flex-col\"
          >
            <div className=\"flex items-center justify-between p-5 border-b border-border\">
              <span className=\"font-heading text-lg font-semibold text-foreground\">Conversations</span>
              <button onClick={() => setSidebarOpen(false)} className=\"text-muted hover:text-foreground\">
                <X size={20} />
              </button>
            </div>
            <div className=\"p-3\">
              <button
                data-testid=\"new-conversation-btn\"
                onClick={startNew}
                className=\"w-full flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-body font-medium bg-primary/10 text-primary hover:bg-primary/15 transition-colors\"
              >
                <Plus size={16} />
                New conversation
              </button>
            </div>
            <div className=\"flex-1 overflow-y-auto p-3 space-y-1\">
              {conversations.map(c => (
                <button
                  key={c.session_id}
                  onClick={() => loadSession(c.session_id)}
                  className={`w-full text-left rounded-xl px-4 py-3 text-sm font-body transition-colors ${
                    sessionId === c.session_id
                      ? 'bg-primary/10 text-foreground'
                      : 'hover:bg-surface-highlight text-muted hover:text-foreground'
                  }`}
                >
                  <div className=\"truncate font-medium\">{c.last_message || 'New conversation'}</div>
                  <div className=\"text-xs text-muted mt-0.5\">
                    {c.updated_at ? new Date(c.updated_at).toLocaleDateString() : ''}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {sidebarOpen && (
        <div className=\"fixed inset-0 z-30 bg-foreground/10\" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className=\"flex-1 flex flex-col min-h-screen\">
        <Navbar />

        {/* Chat header */}
        <div className=\"sticky top-16 z-20 bg-background/80 glass border-b border-border/40\">
          <div className=\"max-w-2xl mx-auto px-6 py-3 flex items-center gap-3\">
            <button
              data-testid=\"sidebar-toggle-btn\"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className=\"text-muted hover:text-foreground transition-colors\"
            >
              <Menu size={20} />
            </button>
            <div className=\"w-px h-4 bg-border\" />
            <div className=\"w-2.5 h-2.5 rounded-full bg-secondary animate-pulse-soft\" />
            <span className=\"font-body text-sm text-muted\">Your conscience is here</span>
            <div className=\"flex-1\" />
            <button
              data-testid=\"new-chat-btn\"
              onClick={startNew}
              className=\"flex items-center gap-1.5 text-sm font-body text-muted hover:text-primary transition-colors\"
            >
              <Plus size={15} />
              New
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className=\"flex-1 overflow-y-auto\">
          <div className=\"max-w-2xl mx-auto px-6 pb-32\">
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className=\"text-center pt-24 pb-12\"
              >
                <div className=\"w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6\">
                  <MessageSquare size={28} className=\"text-primary\" strokeWidth={1.5} />
                </div>
                <h2 className=\"font-heading text-3xl font-light text-foreground mb-3\">
                  Hello, {user?.name?.split(' ')[0]}.
                </h2>
                <p className=\"font-body text-muted text-lg max-w-sm mx-auto leading-relaxed\">
                  What's on your mind today? I'm here, and I'm listening.
                </p>
                <div className=\"mt-8 flex flex-wrap gap-3 justify-center\">
                  {[
                    \"How am I really doing?\",
                    \"I need to make a hard decision.\",
                    \"I'm struggling with something.\",
                    \"Reflect on my week with me.\",
                  ].map(prompt => (
                    <button
                      key={prompt}
                      onClick={() => { setInput(prompt); inputRef.current?.focus(); }}
                      className=\"bg-surface border border-border rounded-full px-4 py-2 text-sm font-body text-muted hover:text-foreground hover:border-primary/40 transition-all\"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {messages.map((msg, i) => (
              <MessageBlock key={msg.id || i} msg={msg} userName={user?.name} />
            ))}

            {loading && (
              <div className=\"py-6 border-b border-border/30\">
                <div className=\"flex items-start gap-4 max-w-2xl mx-auto\">
                  <div className=\"w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-heading font-semibold mt-1 bg-primary/15 text-primary\">
                    C
                  </div>
                  <TypingIndicator />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className=\"fixed bottom-0 left-0 right-0 bg-background/90 glass border-t border-border/40 py-4 px-6\">
          <form onSubmit={sendMessage} className=\"max-w-2xl mx-auto\">
            <div className=\"flex items-end gap-3 bg-surface border border-border rounded-2xl px-5 py-3 focus-within:border-primary transition-colors\">
              <textarea
                ref={inputRef}
                data-testid=\"chat-input\"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(e); }
                }}
                placeholder=\"Speak your mind...\"
                rows={1}
                className=\"flex-1 bg-transparent font-body text-foreground placeholder-muted/50 resize-none focus:outline-none text-base leading-relaxed\"
                style={{ maxHeight: '120px', overflowY: 'auto' }}
              />
              <button
                data-testid=\"send-message-btn\"
                type=\"submit\"
                disabled={!input.trim() || loading}
                className=\"w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0\"
              >
                <Send size={16} />
              </button>
            </div>
            <p className=\"text-xs text-muted/60 font-body text-center mt-2\">
              Press Enter to send &bull; Shift+Enter for new line
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
"
