import React, { useState, useEffect, useRef, FormEvent, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";
import { Send, Plus, MessageSquare, Menu, X } from "lucide-react";
import Navbar from "../components/Navbar";

interface Message {
  role: "user" | "assistant";
  content: string;
  id?: number;
}

interface Conversation {
  session_id: string;
  last_message?: string;
  updated_at?: string;
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 py-4 px-0">
      <span className="text-sm font-body text-muted italic mr-2">
        thinking
      </span>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-muted"
          style={{ animationDelay: `${i * 0.2}s` }}
        />
      ))}
    </div>
  );
}

function MessageBlock({
  msg,
  userName,
}: {
  msg: Message;
  userName?: string;
}) {
  const isUser = msg.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="py-6 border-b border-border/30"
    >
      <div className="flex items-start gap-4 max-w-2xl mx-auto">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold mt-1 ${
            isUser
              ? "bg-surface-highlight text-foreground"
              : "bg-primary/15 text-primary"
          }`}
        >
          {isUser ? userName?.[0]?.toUpperCase() || "Y" : "C"}
        </div>

        <div className="flex-1 min-w-0">
          <p
            className={`text-xs font-medium mb-2 uppercase ${
              isUser ? "text-muted" : "text-primary"
            }`}
          >
            {isUser ? "You" : "Your Conscience"}
          </p>

          <div
            className={`leading-relaxed text-base whitespace-pre-wrap ${
              isUser ? "text-foreground" : "text-foreground/90 italic"
            }`}
          >
            {msg.content}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Chat() {
  const { user, authAxios } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const loadConversations = async () => {
    try {
      const res = await authAxios.get("/api/chat/conversations");
      setConversations(res.data.conversations || []);
    } catch {
      console.error("Failed to load conversations");
    }
  };

  const loadSession = async (sid: string) => {
    try {
      const res = await authAxios.get(`/api/chat/history/${sid}`);
      setMessages(res.data.messages || []);
      setSessionId(sid);
      setSidebarOpen(false);
    } catch {
      toast.error("Could not load conversation.");
    }
  };

  const startNew = () => {
    setMessages([]);
    setSessionId(null);
    setSidebarOpen(false);
    inputRef.current?.focus();
  };

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: Message = {
      role: "user",
      content: input.trim(),
      id: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await authAxios.post("/api/chat/message", {
        message: userMsg.content,
        session_id: sessionId,
      });

      setSessionId(res.data.session_id);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: res.data.response,
          id: Date.now() + 1,
        },
      ]);

      loadConversations();
    } catch {
      toast.error("Your conscience is unavailable right now. Try again.");
      setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
    } finally {
      setLoading(false);
    }
  };

  return <div>Your full JSX layout here (unchanged)</div>;
}
