import { useState, useCallback, useEffect } from 'react';
import { useAudioVisualizer } from './hooks/useAudioVisualizer';
import { useGeminiLive } from './hooks/useGeminiLive';
import { Header } from './components/Header';
import { AuroraOrb } from './components/AuroraOrb';
import { AgentConsole } from './components/AgentConsole';
import { SetupPortal } from './components/SetupPortal';

export default function App() {
  const [apiKey, setApiKey] = useState<string>('');
  const [isSetupOpen, setIsSetupOpen] = useState<boolean>(false);
  const [isCallActive, setIsCallActive] = useState<boolean>(false);

  const audioVisualizer = useAudioVisualizer();

  const handlePlayAudioChunk = useCallback((base64: string) => {
    audioVisualizer.playAudioBase64(base64);
  }, [audioVisualizer]);

  const handleStopPlayback = useCallback(() => {
    audioVisualizer.stopAllPlayback();
  }, [audioVisualizer]);

  const geminiLive = useGeminiLive({
    apiKey,
    onPlayAudioChunk: handlePlayAudioChunk,
    onStopPlayback: handleStopPlayback
  });

  // Check if key exists in sessionStorage or show setup modal on initial load
  useEffect(() => {
    const savedKey = sessionStorage.getItem('gemini_live_api_key');
    if (savedKey) {
      setApiKey(savedKey);
    } else {
      setIsSetupOpen(true);
    }
  }, []);

  const handleConnectPortal = (key: string) => {
    sessionStorage.setItem('gemini_live_api_key', key);
    setApiKey(key);
    setIsSetupOpen(false);
    geminiLive.connect(key);
  };

  const handleDisconnect = () => {
    if (isCallActive) {
      audioVisualizer.stopMicrophone();
      setIsCallActive(false);
    }
    geminiLive.disconnect();
  };

  const handleToggleCall = async () => {
    if (geminiLive.connectionState === 'disconnected') {
      if (!apiKey) {
        setIsSetupOpen(true);
        return;
      }
      geminiLive.connect(apiKey);
      return;
    }

    if (isCallActive) {
      audioVisualizer.stopMicrophone();
      setIsCallActive(false);
    } else {
      const started = await audioVisualizer.startMicrophone((pcmChunk) => {
        geminiLive.sendAudioChunk(pcmChunk);
      });
      if (started) {
        setIsCallActive(true);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between bg-slate-950 text-slate-100 relative overflow-hidden selection:bg-blue-500 selection:text-white">
      {/* Setup Frosted Glass Modal */}
      <SetupPortal
        isOpen={isSetupOpen}
        defaultApiKey={apiKey}
        onConnect={handleConnectPortal}
      />

      {/* Top Header Navigation Bar */}
      <Header
        connectionState={geminiLive.connectionState}
        onDisconnect={handleDisconnect}
        onOpenSetup={() => setIsSetupOpen(true)}
      />

      {/* Main Center Aurora & Voice Orb Area */}
      <main className="w-full max-w-5xl mx-auto px-4 flex-1 flex flex-col items-center justify-center z-10">
        <AuroraOrb
          connectionState={geminiLive.connectionState}
          micLevel={audioVisualizer.micLevel}
          aiLevel={audioVisualizer.aiLevel}
          isCallActive={isCallActive}
          onToggleCall={handleToggleCall}
        />

        {/* Activity & Transcript Console */}
        <AgentConsole
          messages={geminiLive.messages}
          onClear={geminiLive.clearMessages}
        />
      </main>

      {/* Footer / System Status Bar */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-4 flex items-center justify-between text-xs text-slate-500 border-t border-slate-900 z-10">
        <div className="flex items-center gap-2">
          <span>NovaVoice AI Assistant v2.0</span>
          <span>•</span>
          <span>Google Calendar Tool Protocol</span>
        </div>
        <div>
          <span>Powered by Google DeepMind & Gemini Live</span>
        </div>
      </footer>
    </div>
  );
}
