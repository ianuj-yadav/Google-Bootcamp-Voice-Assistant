import { motion } from 'motion/react';
import { ConnectionState } from '../types';
import { Mic, MicOff, PhoneCall, Sparkles } from 'lucide-react';

export interface AuroraOrbProps {
  connectionState: ConnectionState;
  micLevel: number; // Smoothed mic scale e.g. 1.0 to 1.25
  aiLevel: number;  // Smoothed ai scale e.g. 1.0 to 1.8
  isCallActive: boolean;
  onToggleCall: () => void;
}

export function AuroraOrb({
  connectionState,
  micLevel,
  aiLevel,
  isCallActive,
  onToggleCall
}: AuroraOrbProps) {
  const isSpeaking = connectionState === 'speaking';
  const isListening = connectionState === 'listening';
  const isReady = connectionState === 'ready' || connectionState === 'connecting';

  // Determine scale target: when speaking, use aiLevel; when listening, use micLevel
  const activeScale = isSpeaking ? aiLevel : isListening ? micLevel : 1.0;

  return (
    <div className="relative flex flex-col items-center justify-center my-8 sm:my-12 select-none">
      {/* Ambient Aurora Gradient Background */}
      <div className="aurora-bg" />

      {/* Multi-layered frequency glow rings */}
      <div className="relative flex items-center justify-center w-64 h-64 sm:w-72 sm:h-72">
        {/* Outer AI Glow Ring */}
        <motion.div
          animate={{
            scale: isSpeaking ? [activeScale * 0.95, activeScale * 1.15, activeScale * 1.05] : 1,
            opacity: isSpeaking ? 0.6 : 0,
            rotate: isSpeaking ? 360 : 0
          }}
          transition={{
            scale: { type: 'spring', damping: 15, stiffness: 120 },
            rotate: { duration: 20, repeat: Infinity, ease: 'linear' }
          }}
          className="absolute inset-0 rounded-full border-2 border-blue-400/40 bg-gradient-to-tr from-blue-500/10 via-indigo-500/15 to-purple-500/10 blur-md pointer-events-none"
        />

        {/* Middle Pulse Ring */}
        <motion.div
          animate={{
            scale: isCallActive ? activeScale * 1.08 : 1,
            opacity: isSpeaking ? 0.8 : isListening ? 0.5 : 0.15
          }}
          transition={{ type: 'spring', damping: 20, stiffness: 250 }}
          className="absolute inset-4 rounded-full border border-blue-300/30 bg-blue-500/5 backdrop-blur-sm pointer-events-none"
        />

        {/* Inner Mic Activity Ring */}
        <motion.div
          animate={{
            scale: isListening ? micLevel * 1.06 : 1,
            opacity: isListening && micLevel > 1.02 ? 0.9 : 0.2
          }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="absolute inset-8 rounded-full border border-emerald-400/50 bg-emerald-500/10 pointer-events-none"
        />

        {/* Frosted Glass Core Orb Button */}
        <motion.button
          onClick={onToggleCall}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.94 }}
          animate={{
            scale: isCallActive ? activeScale : 1
          }}
          transition={{ type: 'spring', damping: 18, stiffness: 300 }}
          aria-label={isCallActive ? 'Stop microphone and end call' : 'Start microphone and begin call'}
          aria-pressed={isCallActive}
          className={`relative z-10 w-36 h-36 sm:w-40 sm:h-40 rounded-full flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors duration-500 shadow-2xl ${
            isSpeaking
              ? 'bg-gradient-to-tr from-blue-600/90 via-indigo-600/90 to-purple-600/90 text-white shadow-blue-500/40 border-2 border-blue-300/60'
              : isListening
              ? 'bg-gradient-to-tr from-emerald-600/90 to-teal-600/90 text-white shadow-emerald-500/40 border-2 border-emerald-300/60'
              : 'glass-panel text-slate-200 hover:text-white border border-white/20 hover:border-blue-400/50 shadow-black/60'
          }`}
        >
          {/* Subtle inner shine */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />

          {/* Icon */}
          <div className="relative z-10">
            {isSpeaking ? (
              <Sparkles className="w-10 h-10 animate-spin text-blue-200" style={{ animationDuration: '6s' }} />
            ) : isCallActive ? (
              <Mic className="w-10 h-10 text-white" />
            ) : (
              <PhoneCall className="w-10 h-10 text-blue-400" />
            )}
          </div>

          {/* Label */}
          <span className="relative z-10 text-xs font-semibold tracking-wider uppercase mt-1">
            {isSpeaking ? 'Speaking' : isCallActive ? 'Listening' : 'Tap to Call'}
          </span>
        </motion.button>
      </div>

      {/* Helper Subtext */}
      <motion.p
        key={connectionState}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xs sm:text-sm text-slate-400 mt-2 text-center max-w-sm px-4 font-medium"
      >
        {isSpeaking
          ? 'Charon is responding in 24kHz ultra-low latency audio...'
          : isListening
          ? 'Microphone active. Ask to check or book your Google Calendar.'
          : isReady
          ? 'Tap the glowing orb to initialize bidirectional voice stream.'
          : 'Connect your API key using the setup portal above.'}
      </motion.p>
    </div>
  );
}
