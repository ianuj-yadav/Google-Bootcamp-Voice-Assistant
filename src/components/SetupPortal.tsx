import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { KeyRound, Eye, EyeOff, Sparkles, Mic, Volume2, ShieldCheck, ExternalLink, ArrowRight } from 'lucide-react';

export interface SetupPortalProps {
  isOpen: boolean;
  onConnect: (apiKey: string) => void;
  defaultApiKey?: string;
}

export function SetupPortal({ isOpen, onConnect, defaultApiKey = '' }: SetupPortalProps) {
  const [apiKey, setApiKey] = useState(defaultApiKey);
  const [showPassword, setShowPassword] = useState(false);
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
  const [audioReady, setAudioReady] = useState<boolean>(true);

  useEffect(() => {
    // Check initial mic permission status if supported
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'microphone' as PermissionName })
        .then(result => {
          setHasMicPermission(result.state === 'granted');
          result.onchange = () => {
            setHasMicPermission(result.state === 'granted');
          };
        })
        .catch(() => {
          setHasMicPermission(null);
        });
    }
  }, []);

  const handleTestMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasMicPermission(true);
      stream.getTracks().forEach(t => t.stop());
    } catch (e) {
      setHasMicPermission(false);
      alert('Microphone access was denied. Please allow microphone permissions in your browser settings to use voice calling.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      alert('Please enter a valid Gemini Live API Key.');
      return;
    }
    onConnect(apiKey.trim());
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="setup-portal-title"
        >
          {/* Subtle aurora glow behind modal */}
          <div className="absolute w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: 'spring', damping: 24, stiffness: 300 }}
            className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl glass-panel border border-white/12 shadow-2xl text-slate-100"
          >
            {/* Header badge */}
            <div className="flex items-center gap-2 px-3 py-1 mb-6 text-xs font-semibold tracking-wider uppercase bg-blue-500/20 text-blue-400 rounded-full w-fit border border-blue-500/30">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>Gemini 3.1 Live API</span>
            </div>

            <h2 id="setup-portal-title" className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
              Welcome to NovaVoice
            </h2>
            <p className="text-sm text-slate-300 mb-6 leading-relaxed">
              Experience ultra-low latency bidirectional AI calling with automated Google Calendar booking integration.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* API Key Input Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="apiKeyInput" className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-blue-400" />
                    Gemini API Key
                  </label>
                  <a
                    href="https://aistudio.google.com/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors underline decoration-blue-400/40 hover:decoration-blue-300"
                  >
                    <span>Get Key</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="relative flex items-center">
                  <input
                    id="apiKeyInput"
                    type={showPassword ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    required
                    autoFocus
                    className="w-full px-4 py-3.5 pr-12 text-sm bg-slate-900/80 border border-slate-700/80 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-white placeholder:text-slate-500 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide API key' : 'Show API key'}
                    className="absolute right-3.5 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Pre-flight Readiness Indicators */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  System Pre-Flight Check
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Mic className="w-4 h-4 text-slate-400" />
                    <span>Microphone Readiness</span>
                  </div>
                  {hasMicPermission === true ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                      Ready
                    </span>
                  ) : hasMicPermission === false ? (
                    <button
                      type="button"
                      onClick={handleTestMic}
                      className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-medium hover:bg-rose-500/20 transition-colors"
                    >
                      Denied (Click to Retry)
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleTestMic}
                      className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium hover:bg-blue-500/20 transition-colors"
                    >
                      Test Mic
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800/80">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Volume2 className="w-4 h-4 text-slate-400" />
                    <span>24kHz Audio Output</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                    WebAudio Ready
                  </span>
                </div>
              </div>

              {/* Submit / Connect CTA */}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                className="w-full py-4 px-6 rounded-xl font-semibold text-sm bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 flex items-center justify-center gap-2 border border-blue-400/30 transition-all cursor-pointer"
              >
                <span>Connect to Agent Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
