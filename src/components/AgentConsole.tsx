import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageItem } from '../types';
import { ToolCard } from './ToolCard';
import { Terminal, Sparkles, User, ShieldAlert, Trash2 } from 'lucide-react';

export interface AgentConsoleProps {
  messages: MessageItem[];
  onClear: () => void;
}

export function AgentConsole({ messages, onClear }: AgentConsoleProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="w-full max-w-3xl mx-auto my-6 z-10">
      {/* Console Header Bar */}
      <div className="flex items-center justify-between px-5 py-3 rounded-t-2xl glass-card border-b border-white/10 text-slate-300">
        <div className="flex items-center gap-2.5">
          <Terminal className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-bold tracking-wider uppercase text-slate-200">
            Live Agent Activity & Transcript Console
          </span>
          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-400 font-mono">
            {messages.length} events
          </span>
        </div>

        {messages.length > 0 && (
          <button
            onClick={onClear}
            aria-label="Clear transcript console"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-slate-800 text-xs text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Console Scrollable Body */}
      <div
        ref={containerRef}
        role="log"
        aria-live="polite"
        aria-relevant="additions text"
        className="h-80 sm:h-96 overflow-y-auto p-4 sm:p-6 rounded-b-2xl glass-panel border-t-0 space-y-4 shadow-2xl"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 gap-2">
            <Sparkles className="w-8 h-8 text-slate-600 animate-pulse" />
            <p className="text-sm font-medium text-slate-400">Activity Console Standby</p>
            <p className="text-xs max-w-xs text-slate-500">
              When you connect and speak with Charon, real-time voice transcripts and Google Calendar API executions will appear here.
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', damping: 24, stiffness: 350 }}
                className="w-full flex flex-col"
              >
                {msg.role === 'tool' && msg.toolData ? (
                  <ToolCard toolData={msg.toolData} />
                ) : msg.role === 'system' ? (
                  <div className="mx-auto my-1 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400 italic flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-blue-400" />
                    <span>{msg.text}</span>
                  </div>
                ) : (
                  <div
                    className={`flex items-start gap-3 max-w-[85%] ${
                      msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'
                    }`}
                  >
                    {/* Avatar icon */}
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                        msg.role === 'user'
                          ? 'bg-slate-800 border-slate-700 text-slate-300'
                          : 'bg-blue-600/30 border-blue-500/40 text-blue-400 shadow-lg shadow-blue-500/10'
                      }`}
                    >
                      {msg.role === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`p-3.5 sm:p-4 rounded-2xl text-sm leading-relaxed shadow-md font-sans ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-br from-slate-800 to-slate-900 text-slate-100 border border-slate-700/80 rounded-tr-sm'
                          : 'bg-gradient-to-br from-blue-950/40 via-slate-900/80 to-indigo-950/40 text-blue-100 border border-blue-500/25 rounded-tl-sm'
                      }`}
                    >
                      <div className="text-[10px] font-semibold tracking-wider uppercase mb-1 opacity-60 flex items-center justify-between gap-4">
                        <span>{msg.role === 'user' ? 'You (Audio Input)' : 'Charon (AI Agent)'}</span>
                        <span>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                      </div>
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
