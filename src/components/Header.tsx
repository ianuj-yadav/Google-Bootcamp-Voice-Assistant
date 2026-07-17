import { motion } from 'motion/react';
import { ConnectionState } from '../types';
import { Sparkles, Power, Settings, Radio } from 'lucide-react';

export interface HeaderProps {
  connectionState: ConnectionState;
  onDisconnect: () => void;
  onOpenSetup: () => void;
}

export function Header({ connectionState, onDisconnect, onOpenSetup }: HeaderProps) {
  const getStatusInfo = () => {
    switch (connectionState) {
      case 'listening':
        return {
          label: 'Listening...',
          badgeBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          dotBg: 'bg-emerald-400 shadow-[0_0_12px_#10b981]',
          pulse: true
        };
      case 'speaking':
        return {
          label: 'Agent Speaking...',
          badgeBg: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
          dotBg: 'bg-blue-400 shadow-[0_0_12px_#3b82f6]',
          pulse: true
        };
      case 'ready':
        return {
          label: 'Ready to Call',
          badgeBg: 'bg-slate-800/80 border-slate-700 text-slate-300',
          dotBg: 'bg-slate-400',
          pulse: false
        };
      case 'connecting':
        return {
          label: 'Connecting...',
          badgeBg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          dotBg: 'bg-amber-400 animate-pulse',
          pulse: true
        };
      case 'disconnected':
      default:
        return {
          label: 'Disconnected',
          badgeBg: 'bg-slate-900/80 border-slate-800 text-slate-400',
          dotBg: 'bg-slate-600',
          pulse: false
        };
    }
  };

  const status = getStatusInfo();

  return (
    <header className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between z-20">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3">
        <motion.div
          whileHover={{ rotate: 180 }}
          transition={{ duration: 0.6, type: 'spring' }}
          className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 border border-blue-400/30"
        >
          <Sparkles className="w-5 h-5 text-white" />
        </motion.div>
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>NovaVoice</span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-400 border border-blue-500/25 font-semibold">
              LIVE
            </span>
          </h1>
          <p className="text-xs text-slate-400 hidden sm:block">
            Gemini 3.1 Flash Preview + Calendar Agent
          </p>
        </div>
      </div>

      {/* Live Status Pill & Action Buttons */}
      <div className="flex items-center gap-3">
        <motion.div
          layout
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs sm:text-sm font-medium transition-all duration-300 ${status.badgeBg}`}
          role="status"
          aria-live="polite"
        >
          <span className={`w-2 h-2 rounded-full ${status.dotBg} ${status.pulse ? 'animate-ping' : ''}`} />
          <span className={`w-2 h-2 rounded-full ${status.dotBg} -ml-4`} />
          <span className="ml-1.5">{status.label}</span>
        </motion.div>

        {connectionState !== 'disconnected' ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.94 }}
            onClick={onDisconnect}
            aria-label="Disconnect current session"
            title="Disconnect session"
            className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-rose-500/20 border border-slate-700/80 hover:border-rose-500/40 text-slate-300 hover:text-rose-400 transition-colors cursor-pointer"
          >
            <Power className="w-4 h-4" />
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.94 }}
            onClick={onOpenSetup}
            aria-label="Open setup portal"
            title="Configure API key"
            className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-blue-500/20 border border-slate-700/80 hover:border-blue-500/40 text-slate-300 hover:text-blue-400 transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4" />
          </motion.button>
        )}
      </div>
    </header>
  );
}
