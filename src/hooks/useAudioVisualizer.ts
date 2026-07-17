import { useEffect, useRef, useState, useCallback } from 'react';

export interface AudioVisualizerState {
  micLevel: number; // Smoothed scale factor 1.0 -> ~1.25
  aiLevel: number;  // Smoothed scale factor 1.0 -> ~1.8
  micBins: Uint8Array;
  aiBins: Uint8Array;
  isMicActive: boolean;
  startMicrophone: (onAudioChunk: (base64Pcm: string) => void) => Promise<boolean>;
  stopMicrophone: () => void;
  playAudioBase64: (base64: string, onStart?: () => void, onEnded?: () => void) => void;
  stopAllPlayback: () => void;
}

export function useAudioVisualizer(): AudioVisualizerState {
  const [micLevel, setMicLevel] = useState<number>(1.0);
  const [aiLevel, setAiLevel] = useState<number>(1.0);
  const [isMicActive, setIsMicActive] = useState<boolean>(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const micAnalyserRef = useRef<AnalyserNode | null>(null);
  const aiAnalyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const nextPlayTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  // Raw bin arrays kept in refs to avoid React re-render thrashing
  const micBinsRef = useRef<Uint8Array>(new Uint8Array(128));
  const aiBinsRef = useRef<Uint8Array>(new Uint8Array(128));

  // Smoothed levels for lerp interpolation
  const smoothedMicRef = useRef<number>(1.0);
  const smoothedAiRef = useRef<number>(1.0);

  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx({ sampleRate: 16000 });
      audioContextRef.current = ctx;
      nextPlayTimeRef.current = ctx.currentTime;

      const micAnalyser = ctx.createAnalyser();
      micAnalyser.fftSize = 256;
      micAnalyser.smoothingTimeConstant = 0.8;
      micAnalyserRef.current = micAnalyser;

      const aiAnalyser = ctx.createAnalyser();
      aiAnalyser.fftSize = 256;
      aiAnalyser.smoothingTimeConstant = 0.85;
      aiAnalyserRef.current = aiAnalyser;

      aiAnalyser.connect(ctx.destination);
    } else if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  }, []);

  const float32ToBase64 = (float32Array: Float32Array): string => {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < float32Array.length; i++) {
      let s = Math.max(-1, Math.min(1, float32Array[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const startMicrophone = useCallback(async (onAudioChunk: (base64Pcm: string) => void): Promise<boolean> => {
    try {
      initAudioContext();
      const ctx = audioContextRef.current!;

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
      });
      mediaStreamRef.current = stream;

      const source = ctx.createMediaStreamSource(stream);
      if (micAnalyserRef.current) {
        source.connect(micAnalyserRef.current);
      }

      const processor = ctx.createScriptProcessor(1024, 1, 1);
      processor.onaudioprocess = (e) => {
        const float32Data = e.inputBuffer.getChannelData(0);
        onAudioChunk(float32ToBase64(float32Data));
      };

      source.connect(processor);
      processor.connect(ctx.destination);
      scriptProcessorRef.current = processor;

      setIsMicActive(true);
      return true;
    } catch (err) {
      console.error('Failed to access microphone:', err);
      setIsMicActive(false);
      return false;
    }
  }, [initAudioContext]);

  const stopMicrophone = useCallback(() => {
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }
    setIsMicActive(false);
  }, []);

  const stopAllPlayback = useCallback(() => {
    activeSourcesRef.current.forEach(source => {
      try {
        source.stop();
        source.disconnect();
      } catch (e) {
        // Source might have already ended
      }
    });
    activeSourcesRef.current = [];
    if (audioContextRef.current) {
      nextPlayTimeRef.current = audioContextRef.current.currentTime;
    }
  }, []);

  const playAudioBase64 = useCallback((base64: string, onStart?: () => void, onEnded?: () => void) => {
    initAudioContext();
    const ctx = audioContextRef.current;
    if (!ctx || !aiAnalyserRef.current) return;

    try {
      const binary = atob(base64);
      const buffer = new ArrayBuffer(binary.length);
      const view = new DataView(buffer);
      for (let i = 0; i < binary.length; i++) {
        view.setUint8(i, binary.charCodeAt(i));
      }

      const int16Array = new Int16Array(buffer);
      const audioBuffer = ctx.createBuffer(1, int16Array.length, 24000);
      const channelData = audioBuffer.getChannelData(0);

      for (let i = 0; i < int16Array.length; i++) {
        channelData[i] = int16Array[i] / 32768.0;
      }

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(aiAnalyserRef.current);

      const startTime = Math.max(ctx.currentTime, nextPlayTimeRef.current);
      source.start(startTime);
      nextPlayTimeRef.current = startTime + audioBuffer.duration;

      activeSourcesRef.current.push(source);

      if (onStart && startTime <= ctx.currentTime + 0.05) {
        onStart();
      } else if (onStart) {
        setTimeout(onStart, (startTime - ctx.currentTime) * 1000);
      }

      source.onended = () => {
        activeSourcesRef.current = activeSourcesRef.current.filter(s => s !== source);
        if (onEnded && activeSourcesRef.current.length === 0) {
          onEnded();
        }
      };
    } catch (e) {
      console.error('Error playing audio chunk:', e);
    }
  }, [initAudioContext]);

  // Animation frame loop with lerp exponential smoothing
  useEffect(() => {
    let isRunning = true;

    const renderLoop = () => {
      if (!isRunning) return;

      let targetMic = 1.0;
      let targetAi = 1.0;

      if (micAnalyserRef.current && isMicActive) {
        const data = new Uint8Array(micAnalyserRef.current.frequencyBinCount);
        micAnalyserRef.current.getByteFrequencyData(data);
        micBinsRef.current = data;
        const vol = data.reduce((a, b) => a + b, 0) / data.length;
        targetMic = 1.0 + (vol / 255) * 0.18;
      }

      if (aiAnalyserRef.current) {
        const data = new Uint8Array(aiAnalyserRef.current.frequencyBinCount);
        aiAnalyserRef.current.getByteFrequencyData(data);
        aiBinsRef.current = data;
        const vol = data.reduce((a, b) => a + b, 0) / data.length;
        targetAi = 1.0 + (vol / 255) * 0.85;
      }

      // Lerp damping equation: current += (target - current) * dampingFactor
      // Smooths out abrupt spikes and prevents jitter/clipping
      smoothedMicRef.current += (targetMic - smoothedMicRef.current) * 0.18;
      smoothedAiRef.current += (targetAi - smoothedAiRef.current) * 0.14;

      setMicLevel(Number(smoothedMicRef.current.toFixed(3)));
      setAiLevel(Number(smoothedAiRef.current.toFixed(3)));

      animationFrameRef.current = requestAnimationFrame(renderLoop);
    };

    animationFrameRef.current = requestAnimationFrame(renderLoop);

    return () => {
      isRunning = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isMicActive]);

  useEffect(() => {
    return () => {
      stopMicrophone();
      stopAllPlayback();
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, [stopMicrophone, stopAllPlayback]);

  return {
    micLevel,
    aiLevel,
    micBins: micBinsRef.current,
    aiBins: aiBinsRef.current,
    isMicActive,
    startMicrophone,
    stopMicrophone,
    playAudioBase64,
    stopAllPlayback,
  };
}
