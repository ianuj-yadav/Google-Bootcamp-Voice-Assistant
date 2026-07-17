import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PaperPlaneRight, Sparkle, Lightning, CalendarCheck } from '@phosphor-icons/react';

export function AgentConsole({ messages, tools, ai1State, ai2State, perpendicularLatency, onSendMessage }) {
  const [inputText, setInputText] = useState('');

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const quickPrompts = [
    "Check my availability for tomorrow",
    "Book a meeting with Alex next Monday at 10am",
    "What free slots do I have this Friday?"
  ];

  return (
    <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* LEFT & CENTER BENTO: Live Perpendicular Workbench & Transcript (8 Cols) */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        
        {/* Top Workbench Status Banner (Claymorphic + Vibrant Bento) */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="clay-card p-6 relative overflow-hidden bg-gradient-to-r from-violet-950/80 via-indigo-950/90 to-purple-950/80 border-2 border-violet-500/40"
        >
          {/* Subtle artistic doodle grid background */}
          <div className="absolute inset-0 bg-doodle opacity-20 pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-5 relative z-10">
            {/* AI #1 State: Perpendicular Converter & Pre-Search */}
            <div className="flex items-center gap-3.5">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs shadow-lg transition-all ${
                ai1State === 'listening_and_searching'
                  ? 'bg-gradient-to-tr from-emerald-400 via-teal-300 to-cyan-400 text-slate-950 scale-105 shadow-[0_0_20px_rgba(16,185,129,0.8)] animate-pulse'
                  : 'clay-btn bg-slate-800/90 text-emerald-400 border border-emerald-500/40'
              }`}>
                AI #1
              </div>
              <div>
                <div className="text-xs font-black tracking-wider uppercase text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Speech Intent &amp; Calendar Search
                </div>
                <div className="text-xs text-slate-200 font-bold">
                  {ai1State === 'listening_and_searching' ? '⚡ Pre-Searching Calendar & Stream Analysis...' : '🟢 AI #1 Synchronized'}
                </div>
              </div>
            </div>

            {/* Perpendicular Sync Badge (Literal 2ms Latency) */}
            <div className="clay-card bg-gradient-to-b from-slate-900/95 to-slate-950/95 border border-violet-500/50 px-5 py-2.5 rounded-2xl flex items-center gap-2.5 shadow-lg">
              <Lightning size={20} weight="fill" className="text-amber-400 animate-bounce" />
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-mono font-bold text-violet-300 uppercase tracking-widest">Workbench Sync</span>
                <span className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-pink-400 to-cyan-400">
                  {perpendicularLatency}ms LATENCY
                </span>
              </div>
            </div>

            {/* AI #2 State: Executive Response Engine */}
            <div className="flex items-center gap-3.5 sm:flex-row-reverse sm:text-right">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs shadow-lg transition-all ${
                ai2State === 'synthesizing' || ai2State === 'speaking'
                  ? 'bg-gradient-to-tr from-purple-500 via-pink-500 to-rose-500 text-white scale-105 shadow-[0_0_20px_rgba(236,72,153,0.8)] animate-bounce'
                  : 'clay-btn bg-slate-800/90 text-purple-400 border border-purple-500/40'
              }`}>
                AI #2
              </div>
              <div>
                <div className="text-xs font-black tracking-wider uppercase text-purple-400 flex items-center gap-1 sm:justify-end">
                  <Sparkle weight="fill" size={14} />
                  Executive Response Engine
                </div>
                <div className="text-xs text-slate-200 font-bold">
                  {ai2State === 'synthesizing' ? '🧠 Synthesizing Dual Response...' : ai2State === 'speaking' ? '🗣️ Speaking & Animating Orb...' : '🟣 Perpendicular Ready'}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Transcript Box (Claymorphic Puffy Cards) */}
        <div className="clay-card p-6 min-h-[420px] max-h-[540px] flex flex-col justify-between relative overflow-hidden">
          
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 animate-pulse shadow-[0_0_10px_#ec4899]" />
              <h3 className="text-sm font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300 uppercase">
                Perpendicular Conversation Feed
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-violet-300 px-3 py-1 rounded-full bg-violet-950/60 border border-violet-500/30">
              {messages.length} msgs
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin">
            <AnimatePresence initial={false}>
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                const isSystem = msg.role === 'system';

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className={`flex flex-col ${isUser ? 'items-end' : isSystem ? 'items-center' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-3xl px-6 py-4 shadow-xl relative transition-all ${
                        isUser
                          ? 'bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 text-white rounded-br-xs border border-violet-400/40 shadow-[0_12px_24px_rgba(124,97,212,0.35)]'
                          : isSystem
                          ? 'bg-slate-800/90 border border-slate-700/60 text-slate-300 text-xs py-2 px-4 text-center rounded-2xl font-mono'
                          : 'clay-card bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 text-slate-100 rounded-bl-xs border border-slate-700/80 shadow-[0_12px_32px_rgba(0,0,0,0.6)]'
                      }`}
                    >
                      {!isSystem && (
                        <div className={`text-[10px] font-black uppercase tracking-wider mb-1.5 flex items-center gap-2 ${
                          isUser ? 'text-violet-200' : 'text-emerald-400'
                        }`}>
                          <span>{isUser ? 'You (Voice & Text)' : 'Charon (Dual-AI Output)'}</span>
                          {!isUser && <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md font-mono border border-emerald-500/30">⚡ 2ms Sync</span>}
                        </div>
                      )}
                      <p className="text-sm leading-relaxed whitespace-pre-wrap font-semibold">
                        {msg.text}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Quick Action Chips */}
          <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 mr-1">Quick Suggestions:</span>
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => onSendMessage(prompt)}
                className="text-[11px] font-semibold bg-slate-800/80 hover:bg-violet-900/60 text-slate-200 hover:text-white px-3 py-1.5 rounded-xl border border-white/10 hover:border-violet-400/50 transition-all cursor-pointer active:scale-95"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Direct Bento Voice & Text Input Bar */}
          <form onSubmit={handleManualSubmit} className="mt-3 flex items-center gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type or speak directly to Charon (e.g. Check my availability for tomorrow)..."
                className="w-full bg-slate-950/95 text-slate-100 text-xs px-5 py-3.5 rounded-2xl border border-white/15 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/30 font-semibold placeholder:text-slate-500 transition-all shadow-inner"
              />
            </div>
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="clay-btn bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 text-white font-bold text-xs px-6 py-3.5 rounded-2xl flex items-center gap-2 shadow-[0_4px_16px_rgba(124,97,212,0.4)] transition-all cursor-pointer border border-violet-400/40"
            >
              <span>Send</span>
              <PaperPlaneRight weight="bold" className="text-sm" />
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT BENTO: Real-Time Tool Execution & Search Telemetry (4 Cols) */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="clay-card p-6 min-h-[420px] max-h-[540px] flex flex-col relative overflow-hidden">
          
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
            <div className="flex items-center gap-2">
              <CalendarCheck size={22} weight="duotone" className="text-cyan-400" />
              <h3 className="text-sm font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-violet-300 uppercase">
                Perpendicular Telemetry
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-cyan-300 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30">
              {tools.length} executed
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
            {tools.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-white/10 rounded-3xl bg-slate-950/50">
                <div className="w-14 h-14 rounded-2xl clay-card flex items-center justify-center text-3xl mb-3 shadow-inner border border-white/15 animate-bounce">
                  🗓️
                </div>
                <p className="text-xs font-black text-slate-200 mb-1.5 uppercase tracking-wide">No Calendar Actions Yet</p>
                <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                  As you speak, AI #1 pre-searches your calendar while AI #2 calls <code className="text-violet-400 font-bold">check_availability</code> or <code className="text-emerald-400 font-bold">book_meeting</code> directly in real time.
                </p>
              </div>
            ) : (
              tools.map((t, idx) => (
                <motion.div
                  key={t.toolCallId || idx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="clay-card p-4 text-xs space-y-2.5 border border-white/15 hover:border-violet-500/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-violet-300 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-violet-400 animate-ping" />
                      {t.toolName}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">2ms Workbench</span>
                  </div>
                  
                  <div className="bg-slate-950/90 p-3 rounded-xl border border-white/10 font-mono text-slate-300 overflow-x-auto text-[11px]">
                    <div className="text-slate-500 mb-1 text-[10px] font-bold">// Arguments</div>
                    {JSON.stringify(t.args, null, 2)}
                  </div>

                  {t.result && (
                    <div className="bg-gradient-to-r from-emerald-950/50 to-teal-950/50 border border-emerald-500/40 p-3 rounded-xl text-emerald-300 font-mono text-[11px]">
                      <div className="text-emerald-400 mb-1 text-[10px] font-bold">// AI #1 + #2 Instant Response</div>
                      {typeof t.result === 'object' ? JSON.stringify(t.result, null, 2) : t.result}
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
