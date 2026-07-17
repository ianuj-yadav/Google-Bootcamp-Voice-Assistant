import React from 'react';
import { motion } from 'motion/react';
import { Waveform, Plugs, Sparkle } from '@phosphor-icons/react';

export function Header({ status, statusText, onDisconnect }) {
  const getStatusColor = () => {
    switch (status) {
      case 'listening':
        return 'bg-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.9)] animate-pulse';
      case 'speaking':
        return 'bg-pink-500 shadow-[0_0_16px_rgba(236,72,153,0.9)] animate-pulse';
      case 'ready':
        return 'bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.8)]';
      case 'connecting':
      case 'thinking':
        return 'bg-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.8)] animate-bounce';
      default:
        return 'bg-slate-600';
    }
  };

  const getStatusBorder = () => {
    switch (status) {
      case 'listening':
        return 'border-emerald-400/50 bg-gradient-to-r from-emerald-950/40 to-teal-950/40 text-emerald-300 shadow-[0_4px_12px_rgba(16,185,129,0.2)]';
      case 'speaking':
        return 'border-pink-500/50 bg-gradient-to-r from-pink-950/40 to-purple-950/40 text-pink-300 shadow-[0_4px_12px_rgba(236,72,153,0.2)]';
      case 'ready':
        return 'border-cyan-400/50 bg-gradient-to-r from-cyan-950/40 to-blue-950/40 text-cyan-300 shadow-[0_4px_12px_rgba(6,182,212,0.2)]';
      case 'connecting':
      case 'thinking':
        return 'border-amber-400/50 bg-gradient-to-r from-amber-950/40 to-yellow-950/40 text-amber-300 shadow-[0_4px_12px_rgba(245,158,11,0.2)]';
      default:
        return 'border-slate-700/60 bg-slate-900/60 text-slate-400';
    }
  };

  return (
    <header className="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between z-20">
      {/* Brand & Logo */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="flex items-center gap-4"
      >
        <div className="w-12 h-12 rounded-2xl clay-card flex items-center justify-center border border-violet-400/40 shadow-[0_8px_20px_rgba(139,92,246,0.25)] group hover:scale-105 transition-transform">
          <Waveform size={26} className="text-transparent bg-clip-text bg-gradient-to-tr from-cyan-400 via-violet-400 to-pink-400" weight="bold" />
        </div>
        <div>
          <div className="flex items-center gap-2.5">
            <span className="font-black text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300">NovaVoice Pro</span>
            <span className="text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 text-white shadow-[0_2px_8px_rgba(139,92,246,0.4)] flex items-center gap-1">
              <Sparkle weight="fill" size={12} className="animate-spin" style={{ animationDuration: '4s' }} />
              Dual-AI Perpendicular
            </span>
          </div>
          <p className="text-xs font-medium text-slate-400 hidden sm:block">AI #1 Real-Time Stream Analyzer &bull; AI #2 Executive Response Engine</p>
        </div>
      </motion.div>

      {/* Status indicator & actions */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="flex items-center gap-3.5"
      >
        {/* Status Pill */}
        <div className={`flex items-center gap-2.5 px-4 py-2 rounded-2xl border text-xs font-bold transition-all duration-300 backdrop-blur-md ${getStatusBorder()}`}>
          <span className={`w-2.5 h-2.5 rounded-full ${getStatusColor()}`} />
          <span className="tracking-wide uppercase">{statusText}</span>
        </div>

        {/* Disconnect Control */}
        {status !== 'disconnected' && status !== 'ready' && (
          <button
            onClick={onDisconnect}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl clay-btn border border-rose-500/40 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold transition-all shadow-[0_4px_16px_rgba(244,63,94,0.3)] cursor-pointer"
            title="End session"
          >
            <Plugs size={16} weight="bold" />
            <span className="hidden md:inline">End Call</span>
          </button>
        )}
      </motion.div>
    </header>
  );
}
