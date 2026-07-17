import React from 'react';
import { useNvidiaVoice } from './hooks/useNvidiaVoice';
import { Header } from './components/Header';
import { VisualizerOrb } from './components/VisualizerOrb';
import { AgentConsole } from './components/AgentConsole';

export function App() {
  const {
    status,
    statusText,
    isCallActive,
    messages,
    tools,
    micVolume,
    aiVolume,
    ai1State,
    ai2State,
    perpendicularLatency,
    toggleCall,
    disconnectSession,
    sendManualMessage
  } = useNvidiaVoice();

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[var(--bg-obsidian)] text-slate-100 relative selection:bg-blue-500/30 selection:text-blue-200 overflow-x-hidden">
      {/* Top Header */}
      <Header
        status={status}
        statusText={statusText}
        onDisconnect={disconnectSession}
      />

      {/* Main Spatial Workspace */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 flex flex-col items-center justify-between gap-6 z-10">
        {/* Interactive Centerpiece: Visualizer Orb */}
        <VisualizerOrb
          isCallActive={isCallActive}
          status={status}
          micVolume={micVolume}
          aiVolume={aiVolume}
          ai1State={ai1State}
          ai2State={ai2State}
          onToggleCall={toggleCall}
        />

        {/* Live Dual-AI Perpendicular Console & Bento Telemetry */}
        <AgentConsole
          messages={messages}
          tools={tools}
          ai1State={ai1State}
          ai2State={ai2State}
          perpendicularLatency={perpendicularLatency}
          onSendMessage={sendManualMessage}
        />
      </main>

      {/* Footer info */}
      <footer className="w-full py-4 text-center text-xs font-mono text-slate-500 z-10 border-t border-slate-900/60 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>NovaVoice Pro &mdash; Dual-AI Perpendicular Voice Assistant & Executive Workbench</span>
          <span>Google Calendar API Gateway (api_server.py : Port 5000)</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
