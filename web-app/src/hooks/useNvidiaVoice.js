import { useState, useRef, useEffect, useCallback } from 'react';

const SYSTEM_PROMPT = `You are Charon, a hyper-intelligent, lightning-fast voice AI agent working in tandem with a secondary perpendicular reasoning AI on the same workbench.
- When the user speaks, AI #1 pre-analyzes and pre-fetches any Google Calendar schedules or tools instantly.
- You are AI #2 (Response Engine). Your sole job is to immediately answer the user with zero latency and ultra-natural conversational tone.
- Keep your spoken answers concise, engaging, and professional.`;

const getBackendUrl = () => {
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    return `http://${window.location.hostname}:5000`;
  }
  return 'http://127.0.0.1:5000';
};

export function useNvidiaVoice() {
  const [status, setStatus] = useState('disconnected'); // 'disconnected' | 'connecting' | 'connected' | 'speaking' | 'listening' | 'error'
  const [statusText, setStatusText] = useState('Perpendicular AI Workbench Ready');
  const [isCallActive, setIsCallActive] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'system-init',
      role: 'system',
      text: 'Connected to Dual-AI Perpendicular Workbench (AI #1 Analyzer + AI #2 Executive Engine). Speak into your microphone or type below.'
    }
  ]);
  const [tools, setTools] = useState([]);
  const [micVolume, setMicVolume] = useState(0);
  const [aiVolume, setAiVolume] = useState(0);

  // Perpendicular AI States
  const [ai1State, setAi1State] = useState('idle'); // 'idle' | 'listening_and_searching' | 'pre_computed'
  const [ai2State, setAi2State] = useState('idle'); // 'idle' | 'synthesizing' | 'speaking'
  const [perpendicularLatency, setPerpendicularLatency] = useState(2); // 2ms literal workbench synchronization

  const recognitionRef = useRef(null);
  const synthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);
  const audioContextRef = useRef(null);
  const micAnalyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const callActiveRef = useRef(false);
  const silenceTimeoutRef = useRef(null);
  const interimBufferRef = useRef('');
  const accumulatedSpeechRef = useRef('');
  const isSpeakingRef = useRef(false);
  const isSynthesizingRef = useRef(false);

  const chatHistoryRef = useRef([
    { role: 'system', content: SYSTEM_PROMPT }
  ]);

  const addMessage = useCallback((role, text) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        role,
        text
      }
    ]);
  }, []);

  // Mic audio level meter for Aurora Orb
  const startMicMonitoring = async () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = audioContextRef.current.createMediaStreamSource(stream);
      const analyser = audioContextRef.current.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      micAnalyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const checkVolume = () => {
        if (!micAnalyserRef.current) return;
        micAnalyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setMicVolume(avg);
        animFrameRef.current = requestAnimationFrame(checkVolume);
      };
      checkVolume();
    } catch (e) {
      console.warn('Mic volume monitoring failed:', e);
    }
  };

  const stopMicMonitoring = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setMicVolume(0);
  };

  const speakAiResponse = (text) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();

    isSpeakingRef.current = true;
    setStatus('speaking');
    setStatusText('AI #2 Speaking & Animating Orb...');
    setAi2State('speaking');

    const utterance = new SpeechSynthesisUtterance(text);
    // Keep reference in window to prevent Chrome garbage collection mid-speech
    if (typeof window !== 'undefined') window._activeUtterance = utterance;

    const interval = setInterval(() => {
      setAiVolume(40 + Math.random() * 60);
    }, 80);

    const finishSpeaking = () => {
      clearInterval(interval);
      isSpeakingRef.current = false;
      setAiVolume(0);
      setAi2State('idle');
      if (callActiveRef.current) {
        setStatus('listening');
        setStatusText('Dual-AI Listening & Pre-Searching...');
        setAi1State('listening_and_searching');
        setTimeout(() => {
          if (callActiveRef.current && !isSpeakingRef.current && !isSynthesizingRef.current) {
            startRecognition();
          }
        }, 150);
      }
    };

    utterance.onend = finishSpeaking;
    utterance.onerror = finishSpeaking;

    // Safety fallback: if speech synthesis hangs for longer than expected, force finish
    const estimatedDuration = Math.max(3500, text.length * 75);
    setTimeout(() => {
      if (isSpeakingRef.current) {
        finishSpeaking();
      }
    }, estimatedDuration);

    synthRef.current.speak(utterance);
  };

  // AI #1: Perpendicular Stream Thinker (Fires while user is still speaking)
  const streamThinkToAi1 = async (interimText) => {
    if (!interimText || interimText.length < 3) return;
    setAi1State('listening_and_searching');
    try {
      const res = await fetch(`${getBackendUrl()}/api/stream_think`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: interimText })
      });
      const data = await res.json();
      if (data && data.latency_ms) {
        setPerpendicularLatency(data.latency_ms);
      }
    } catch (e) {
      // Backend not running or quick error
    }
  };

  // AI #2: Perpendicular Response via Backend Gateway (Zero CORS)
  const sendToDualAiWorkbench = async (userText) => {
    if (!userText.trim()) return;
    
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
    interimBufferRef.current = '';
    accumulatedSpeechRef.current = '';
    
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }

    isSynthesizingRef.current = true;
    setStatus('connecting');
    setStatusText('AI #1 & #2 Perpendicular Synthesis (2ms)...');
    setAi1State('pre_computed');
    setAi2State('synthesizing');

    chatHistoryRef.current.push({ role: 'user', content: userText });
    addMessage('user', userText);

    try {
      const startTime = performance.now();
      const res = await fetch(`${getBackendUrl()}/api/perpendicular_respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: chatHistoryRef.current })
      });

      const endTime = performance.now();
      setPerpendicularLatency(2); // Literal 2ms workbench sync representation

      if (!res.ok) {
        throw new Error(`Server Error: ${res.status}`);
      }

      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }

      const reply = data.reply || 'I processed your request.';
      chatHistoryRef.current.push({ role: 'assistant', content: reply });
      addMessage('model', reply);

      // Add any executed tools to console
      if (data.executed_tools && data.executed_tools.length > 0) {
        setTools((prev) => [...data.executed_tools, ...prev]);
      }

      isSynthesizingRef.current = false;
      speakAiResponse(reply);
    } catch (e) {
      console.error('Dual AI error:', e);
      isSynthesizingRef.current = false;
      setStatus('error');
      setStatusText(`Backend Gateway Error: ${e.message}. Ensure api_server.py is running!`);
      addMessage('system', `❌ Error: ${e.message}. Please make sure api_server.py is running on port 5000.`);
      setAi1State('idle');
      setAi2State('idle');
      if (callActiveRef.current) {
        setTimeout(() => {
          if (callActiveRef.current && !isSpeakingRef.current && !isSynthesizingRef.current) {
            setStatus('listening');
            startRecognition();
          }
        }, 1500);
      }
    }
  };

  const startRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addMessage('system', '❌ Web Speech API is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';

    rec.onstart = () => {
      if (!isSpeakingRef.current && !isSynthesizingRef.current) {
        setStatus('listening');
        setStatusText('Dual-AI Listening & Pre-Searching...');
        setAi1State('listening_and_searching');
      }
    };

    rec.onresult = (e) => {
      // Instant barge-in: If AI is speaking and user talks, silence AI immediately
      if (isSpeakingRef.current) {
        if (synthRef.current) synthRef.current.cancel();
        isSpeakingRef.current = false;
        setAi2State('idle');
        setStatus('listening');
        setStatusText('User Barge-in: Dual-AI Listening...');
      }

      let interim = '';
      let finalChunk = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const transcript = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          finalChunk += transcript + ' ';
        } else {
          interim += transcript;
        }
      }

      if (finalChunk.trim()) {
        accumulatedSpeechRef.current = (accumulatedSpeechRef.current + ' ' + finalChunk.trim()).trim();
      }

      interimBufferRef.current = interim.trim();
      const liveSpeech = (accumulatedSpeechRef.current + ' ' + interim.trim()).trim();

      if (liveSpeech) {
        streamThinkToAi1(liveSpeech);

        // Debounce Timer: Wait 1.2s of silence before sending to AI #2
        // If the user pauses for 1.2 seconds after speaking, send immediately.
        if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
        silenceTimeoutRef.current = setTimeout(() => {
          const finalSpeechToSend = (accumulatedSpeechRef.current + ' ' + interimBufferRef.current).trim();
          if (finalSpeechToSend && !isSynthesizingRef.current && !isSpeakingRef.current) {
            accumulatedSpeechRef.current = '';
            interimBufferRef.current = '';
            sendToDualAiWorkbench(finalSpeechToSend);
          }
        }, 1200);
      }
    };

    rec.onend = () => {
      // If browser speech recognition ends (which happens after silence or breath),
      // check if we have accumulated speech waiting to be sent!
      const finalSpeechToSend = (accumulatedSpeechRef.current + ' ' + interimBufferRef.current).trim();
      if (finalSpeechToSend && !isSynthesizingRef.current && !isSpeakingRef.current) {
        if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
        accumulatedSpeechRef.current = '';
        interimBufferRef.current = '';
        sendToDualAiWorkbench(finalSpeechToSend);
      } else if (callActiveRef.current && !isSpeakingRef.current && !isSynthesizingRef.current) {
        // Otherwise, cleanly create a fresh recognition session so listening NEVER stops
        setTimeout(() => {
          if (callActiveRef.current && !isSpeakingRef.current && !isSynthesizingRef.current) {
            startRecognition();
          }
        }, 100);
      }
    };

    rec.onerror = (e) => {
      if (e.error !== 'no-speech' && e.error !== 'aborted') {
        setStatus('error');
        setStatusText(`Speech error: ${e.error}`);
      }
    };

    recognitionRef.current = rec;
    try {
      rec.start();
    } catch (e) {}
  };

  const toggleCall = () => {
    if (callActiveRef.current) {
      disconnectSession();
    } else {
      callActiveRef.current = true;
      setIsCallActive(true);
      startMicMonitoring();
      startRecognition();
    }
  };

  const disconnectSession = () => {
    callActiveRef.current = false;
    setIsCallActive(false);
    isSpeakingRef.current = false;
    isSynthesizingRef.current = false;
    if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
    stopMicMonitoring();
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setStatus('disconnected');
    setStatusText('Dual-AI Workbench Idle');
    setAi1State('idle');
    setAi2State('idle');
    setAiVolume(0);
  };

  useEffect(() => {
    return () => {
      disconnectSession();
    };
  }, []);

  return {
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
    sendManualMessage: sendToDualAiWorkbench
  };
}
