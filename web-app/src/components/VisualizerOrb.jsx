import React, { useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Microphone, StopCircle, Sparkle, Lightning } from '@phosphor-icons/react';

export function VisualizerOrb({ isCallActive, status, micVolume, aiVolume, ai1State, ai2State, onToggleCall }) {
  // Motion physics values
  const rawMic = useMotionValue(0);
  const rawAi = useMotionValue(0);

  // Spring damping to prevent clipping/jitter (stiffness: 120, damping: 20)
  const springConfig = { stiffness: 120, damping: 20, mass: 0.5 };
  const smoothMic = useSpring(rawMic, springConfig);
  const smoothAi = useSpring(rawAi, springConfig);

  // Map 0..1 volume to scale and glow factors
  const micScale = useTransform(smoothMic, [0, 1], [1, 1.55]);
  const aiScale = useTransform(smoothAi, [0, 1], [1, 1.75]);
  const ringScale = useTransform(smoothAi, [0, 1], [1, 2.3]);

  useEffect(() => {
    rawMic.set(micVolume);
    rawAi.set(aiVolume);
  }, [micVolume, aiVolume, rawMic, rawAi]);

  // Determine glow color theme based on active state & perpendicular dual-AI workbench
  const getGlowTheme = () => {
    if (ai1State === 'listening_and_searching') {
      return {
        core: 'from-emerald-500 via-teal-500 to-cyan-600 shadow-[inset_0_4px_12px_rgba(255,255,255,0.6),inset_0_-6px_12px_rgba(0,0,0,0.5),0_0_90px_rgba(16,185,129,0.8)]',
        ring1: 'border-emerald-400/60 bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 shadow-[0_0_30px_rgba(16,185,129,0.3)]',
        ring2: 'border-teal-400/40 bg-cyan-500/10',
        pulse: 'from-emerald-400/40 via-teal-300/20 to-transparent'
      };
    }
    if (status === 'speaking' || ai2State === 'synthesizing' || ai2State === 'speaking') {
      return {
        core: 'from-pink-500 via-purple-600 to-indigo-600 shadow-[inset_0_4px_12px_rgba(255,255,255,0.6),inset_0_-6px_12px_rgba(0,0,0,0.5),0_0_110px_rgba(236,72,153,0.85)]',
        ring1: 'border-pink-400/60 bg-gradient-to-tr from-purple-500/20 to-pink-500/10 shadow-[0_0_40px_rgba(236,72,153,0.4)]',
        ring2: 'border-indigo-400/40 bg-pink-500/10',
        pulse: 'from-pink-400/40 via-purple-400/20 to-transparent'
      };
    }
    if (status === 'listening') {
      return {
        core: 'from-rose-500 via-red-500 to-amber-500 shadow-[inset_0_4px_12px_rgba(255,255,255,0.6),inset_0_-6px_12px_rgba(0,0,0,0.5),0_0_90px_rgba(239,68,68,0.75)]',
        ring1: 'border-rose-400/50 bg-gradient-to-tr from-red-500/15 to-orange-500/10 shadow-[0_0_30px_rgba(239,68,68,0.3)]',
        ring2: 'border-amber-400/30 bg-rose-500/10',
        pulse: 'from-rose-500/40 via-orange-400/20 to-transparent'
      };
    }
    if (status === 'ready') {
      return {
        core: 'from-teal-500 via-emerald-600 to-cyan-600 shadow-[inset_0_4px_12px_rgba(255,255,255,0.5),inset_0_-6px_12px_rgba(0,0,0,0.5),0_0_70px_rgba(20,184,166,0.5)]',
        ring1: 'border-teal-400/40 bg-emerald-500/10',
        ring2: 'border-cyan-400/20 bg-teal-500/5',
        pulse: 'from-teal-400/20 to-transparent'
      };
    }
    return {
      core: 'from-slate-700 via-slate-800 to-slate-900 shadow-[inset_0_4px_12px_rgba(255,255,255,0.2),inset_0_-6px_12px_rgba(0,0,0,0.6),0_0_40px_rgba(30,41,59,0.6)]',
      ring1: 'border-slate-600/40 bg-slate-700/10',
      ring2: 'border-slate-700/30 bg-slate-800/5',
      pulse: 'from-slate-700/20 to-transparent'
    };
  };

  const theme = getGlowTheme();

  return (
    <div className="relative flex flex-col items-center justify-center py-12 min-h-[420px] select-none w-full">
      {/* Outer ambient Aurora field (Vibrant multi-color blur) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <motion.div
          animate={{ scale: isCallActive ? [1, 1.25, 1] : 1, opacity: isCallActive ? 0.7 : 0.25 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="w-[480px] h-[480px] rounded-full bg-gradient-to-tr from-violet-600/25 via-pink-600/20 to-cyan-500/20 blur-[100px]" 
        />
      </div>

      {/* Visualizer Orb Container */}
      <div className="relative flex items-center justify-center w-72 h-72">
        {/* Outer Ripple Ring 2 (AI frequency driven) */}
        <motion.div
          style={{ scale: ringScale }}
          className={`absolute inset-0 rounded-full border-2 transition-all duration-700 pointer-events-none ${theme.ring2}`}
        />

        {/* Outer Ripple Ring 1 (AI frequency driven) */}
        <motion.div
          style={{ scale: aiScale }}
          className={`absolute inset-6 rounded-full border-2 transition-all duration-700 pointer-events-none ${theme.ring1}`}
        />

        {/* Mic Pulse Inner Ring (Mic frequency driven) */}
        <motion.div
          style={{ scale: micScale }}
          className={`absolute inset-12 rounded-full bg-gradient-to-br transition-all duration-500 pointer-events-none blur-md ${theme.pulse}`}
        />

        {/* Core Frosted Claymorphic Sphere & Interactive Button */}
        <motion.button
          onClick={onToggleCall}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label={isCallActive ? "Stop voice session" : "Start voice session"}
          className={`relative z-10 w-44 h-44 rounded-full flex flex-col items-center justify-center cursor-pointer transition-all duration-500 bg-gradient-to-br ${theme.core} border-2 border-white/30 hover:border-white/60 focus:outline-none focus:ring-4 focus:ring-violet-500/50 animate-float`}
        >
          {/* Top light highlight reflection for 3D Clay look */}
          <div className="absolute top-3 left-6 right-6 h-10 rounded-t-full bg-gradient-to-b from-white/45 to-transparent pointer-events-none" />
          
          {/* Bottom shadow curve for depth */}
          <div className="absolute bottom-2 left-6 right-6 h-8 rounded-b-full bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

          {/* Center Icon */}
          <div className="z-10 flex flex-col items-center justify-center gap-2 text-white drop-shadow-lg">
            {isCallActive ? (
              <>
                <StopCircle size={48} weight="fill" className="text-white animate-pulse" />
                <span className="text-xs font-black tracking-widest uppercase font-mono bg-black/30 px-3 py-1 rounded-full border border-white/20">End Call</span>
              </>
            ) : (
              <>
                <Microphone size={46} weight="duotone" className="text-white/95" />
                <span className="text-xs font-black tracking-widest uppercase font-mono bg-black/30 px-3 py-1 rounded-full border border-white/20 text-white/95">Start Call</span>
              </>
            )}
          </div>

          {/* Floating particle accent when AI is speaking */}
          {status === 'speaking' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-amber-300 flex items-center justify-center shadow-[0_0_16px_#06b6d4] border border-white/60"
            >
              <Sparkle size={18} weight="fill" className="text-slate-950 animate-spin" style={{ animationDuration: '4s' }} />
            </motion.div>
          )}

          {/* Lightning accent when AI #1 is pre-searching */}
          {ai1State === 'listening_and_searching' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute -bottom-2 -left-2 w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-300 flex items-center justify-center shadow-[0_0_16px_#10b981] border border-white/60"
            >
              <Lightning size={18} weight="fill" className="text-slate-950 animate-bounce" />
            </motion.div>
          )}
        </motion.button>
      </div>

      {/* Subtitle instructions (Vibrant Glass Pill) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 text-xs sm:text-sm font-bold text-slate-200 flex items-center gap-3 px-6 py-2.5 rounded-full clay-card border border-white/15 shadow-lg backdrop-blur-xl"
      >
        {status === 'speaking' ? (
          <>
            <span className="w-2.5 h-2.5 rounded-full bg-pink-400 animate-ping shadow-[0_0_8px_#ec4899]" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-violet-300">Charon is responding... (Speak anytime to barge in)</span>
          </>
        ) : status === 'listening' ? (
          <>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300">Listening to your voice... (AI #1 real-time analysis)</span>
          </>
        ) : status === 'ready' ? (
          <>
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span>Tap the glowing 3D orb above to start conversation</span>
          </>
        ) : (
          <span>Connect API Key to unlock dual-AI voice engine</span>
        )}
      </motion.div>
    </div>
  );
}
