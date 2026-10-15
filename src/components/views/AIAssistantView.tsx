import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  RefreshCw,
  ArrowRight,
  BookOpen,
  Calendar,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const AIAssistantView: React.FC = () => {
  const { profile, tasks, goals, generateAIScheduleAndExportDocx, isSolvingSchedule } = useApp();
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: `Welcome to Chronos Assistant. I am calibrated for your ${profile.role} workflow. I can help analyze your schedule, break down complex objectives into manageable focus chunks, explain concepts, or optimize your daily routine.\n\nHow can I help you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const promptSuggestions = [
    'Help me prioritize today\'s tasks for maximum impact',
    'Structure an optimal focus timetable and export as DOCX to Google Drive',
    'Break down a large project into 45-minute focus intervals',
    'Audit my schedule for potential fatigue and propose recovery breaks',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputQuery;
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
          roleContext: profile.role,
          userGoals: goals.map((g) => g.title),
          activeTasks: tasks.map((t) => t.title),
        }),
      });

      const data = await res.json();
      if (data.success && data.result) {
        const assistantMsg: Message = {
          id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          role: 'assistant',
          content: data.result.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        throw new Error(data.error || 'Failed to generate response.');
      }
    } catch (err: any) {
      const errorMsg: Message = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        role: 'assistant',
        content: 'Unable to connect right now. Please try again in a moment.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[520px] glass-card rounded-3xl border border-[var(--theme-border)] overflow-hidden">
      {/* Top Header */}
      <div className="p-4 border-b border-[var(--theme-border)] bg-black/5 dark:bg-black/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-xl bg-[var(--theme-accent-subtle)] text-[var(--theme-accent-light)] border border-[var(--theme-accent)]/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-editorial font-bold text-[var(--theme-text)]">
              Chronos Assistant
            </h3>
            <span className="text-[10px] text-[var(--theme-text-muted)] block capitalize">
              {profile.role} Context • Planning &amp; Reasoning
            </span>
          </div>
        </div>

        <button
          onClick={async () => {
            setIsExporting(true);
            const res = await generateAIScheduleAndExportDocx('both');
            setIsExporting(false);
            if (res.webViewLink) {
              window.open(res.webViewLink, '_blank');
            } else if (res.message) {
              alert(res.message);
            }
          }}
          disabled={isExporting || isSolvingSchedule}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--theme-accent)]/40 bg-[var(--theme-accent-subtle)] hover:bg-[var(--theme-accent)]/20 text-xs font-semibold text-[var(--theme-accent-light)] transition-colors cursor-pointer disabled:opacity-50"
          title="Ask AI to schedule and export as DOCX to Google Drive"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{isExporting ? 'Exporting...' : 'Export Schedule (DOCX)'}</span>
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-2xl ${
              msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs border ${
                msg.role === 'user'
                  ? 'bg-neutral-800 border-neutral-700 text-white'
                  : 'bg-[var(--theme-accent-subtle)] border-[var(--theme-accent)]/30 text-[var(--theme-accent-light)]'
              }`}
            >
              {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>

            <div
              className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[var(--theme-accent)] text-neutral-950 font-medium rounded-tr-none shadow-md'
                  : 'glass-card border-[var(--theme-border)] text-white/90 rounded-tl-none space-y-2'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
              <div className="text-[10px] opacity-60 text-right font-mono mt-1">
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 max-w-xl mr-auto">
            <div className="w-7 h-7 rounded-xl bg-[var(--theme-accent-subtle)] border border-[var(--theme-accent)]/30 text-[var(--theme-accent-light)] flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="glass-card p-3 rounded-2xl border border-[var(--theme-border)] text-xs text-[var(--theme-text-muted)] flex items-center gap-2">
              <RefreshCw className="w-3 h-3 animate-spin text-[var(--theme-accent)]" />
              <span>Thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts */}
      <div className="px-4 py-2 border-t border-[var(--theme-border)] bg-black/20 flex items-center gap-2 overflow-x-auto">
        <span className="text-[10px] font-semibold text-[var(--theme-text-muted)] uppercase shrink-0">
          Suggestions:
        </span>
        {promptSuggestions.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            className="text-[11px] px-3 py-1 rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 text-[var(--theme-text)] hover:text-white shrink-0 transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input box */}
      <div className="p-4 border-t border-[var(--theme-border)] bg-black/30">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask Chronos about your schedule, deadlines, or concepts..."
            className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-black/40 border border-white/10 rounded-2xl focus:outline-none focus:border-[var(--theme-accent)] text-white"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            className="px-4 py-2.5 rounded-2xl bg-[var(--theme-accent)] hover:opacity-90 text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition-opacity disabled:opacity-50 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
