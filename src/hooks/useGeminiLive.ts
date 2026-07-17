import { useRef, useState, useCallback, useEffect } from 'react';
import { ConnectionState, MessageItem, ToolExecutionData } from '../types';
import confetti from 'canvas-confetti';

export interface UseGeminiLiveProps {
  apiKey: string;
  onPlayAudioChunk: (base64: string) => void;
  onStopPlayback: () => void;
}

export interface UseGeminiLiveReturn {
  connectionState: ConnectionState;
  messages: MessageItem[];
  connect: (key?: string) => void;
  disconnect: () => void;
  sendAudioChunk: (base64Pcm: string) => void;
  clearMessages: () => void;
}

export function useGeminiLive({ apiKey, onPlayAudioChunk, onStopPlayback }: UseGeminiLiveProps): UseGeminiLiveReturn {
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [messages, setMessages] = useState<MessageItem[]>([]);
  
  const wsRef = useRef<WebSocket | null>(null);
  const activeBubbleRef = useRef<{ id: string; role: 'user' | 'ai'; text: string } | null>(null);

  const addMessage = useCallback((message: Omit<MessageItem, 'id' | 'timestamp'>) => {
    const newItem: MessageItem = {
      ...message,
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newItem]);
    return newItem.id;
  }, []);

  const updateToolMessage = useCallback((callId: string, updates: Partial<ToolExecutionData>) => {
    setMessages(prev => prev.map(msg => {
      if (msg.role === 'tool' && msg.toolData?.callId === callId) {
        return {
          ...msg,
          toolData: {
            ...msg.toolData,
            ...updates
          }
        };
      }
      return msg;
    }));
  }, []);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    onStopPlayback();
    setConnectionState('disconnected');
    activeBubbleRef.current = null;
  }, [onStopPlayback]);

  const handleToolCalls = useCallback(async (functionCalls: any[]) => {
    const responses = [];

    for (const call of functionCalls) {
      const args = call.args || {};
      const callId = call.id;
      const toolName = call.name;

      addMessage({
        role: 'tool',
        toolData: {
          callId,
          name: toolName,
          status: 'querying',
          args,
          timestamp: new Date()
        }
      });

      let endpoint = '';
      if (toolName === 'book_meeting') {
        endpoint = 'http://127.0.0.1:5000/api/book_meeting';
      } else if (toolName === 'check_availability') {
        endpoint = 'http://127.0.0.1:5000/api/check_availability';
      }

      try {
        let resultText = '';
        if (endpoint) {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(args)
          });
          const data = await res.json();
          resultText = data.result || 'Executed successfully.';
        } else {
          resultText = `Simulated local execution of ${toolName}.`;
        }

        updateToolMessage(callId, {
          status: 'success',
          result: resultText
        });

        if (toolName === 'book_meeting') {
          try {
            confetti({
              particleCount: 110,
              spread: 80,
              origin: { y: 0.65 },
              colors: ['#3b82f6', '#10b981', '#6366f1', '#f59e0b']
            });
          } catch (e) {
            // ignore confetti issues
          }
        }

        responses.push({
          id: callId,
          name: toolName,
          response: { output: resultText }
        });
      } catch (err: any) {
        console.error(`Tool error (${toolName}):`, err);
        const errorMsg = `Error connecting to local Python API (${endpoint || toolName}). Ensure api_server.py is running on port 5000.`;
        
        updateToolMessage(callId, {
          status: 'error',
          result: errorMsg
        });

        responses.push({
          id: callId,
          name: toolName,
          response: { output: errorMsg }
        });
      }
    }

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        toolResponse: { functionResponses: responses }
      }));
    }
  }, [addMessage, updateToolMessage]);

  const connect = useCallback((overrideKey?: string) => {
    const key = overrideKey || apiKey;
    if (!key) {
      alert('Gemini API Key is required.');
      return;
    }

    disconnect();
    setConnectionState('connecting');
    addMessage({
      role: 'system',
      text: 'Initializing connection to Google Gemini Live API...'
    });

    const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${key}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnectionState('ready');
      addMessage({
        role: 'system',
        text: 'System ready. Tap the glowing microphone to start speaking.'
      });

      const currentDate = new Date().toString();
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
      const systemPrompt = `You are Charon, a professional, intelligent, and natural AI Calling Assistant for NovaVoice. 
CRITICAL CONTEXT: The current exact date and time is ${currentDate}. The user is in the ${timeZone} timezone. 
Always check availability first using check_availability before booking a meeting to prevent double-booking. When checking availability or booking a meeting, strictly format all date and time strings to valid ISO 8601 strings complete with offset for the user's timezone (${timeZone}). Keep your spoken responses concise, warm, and natural.`;

      ws.send(JSON.stringify({
        setup: {
          model: 'models/gemini-3.1-flash-live-preview',
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Charon' }
              }
            }
          },
          systemInstruction: { parts: [{ text: systemPrompt }] },
          tools: [{
            functionDeclarations: [
              {
                name: 'check_availability',
                description: "Checks the user's Google Calendar for busy slots on a specific date.",
                parameters: {
                  type: 'OBJECT',
                  properties: {
                    date: { type: 'STRING', description: 'ISO 8601 date to check (e.g., 2026-07-17T00:00:00+05:30)' }
                  },
                  required: ['date']
                }
              },
              {
                name: 'book_meeting',
                description: 'Schedules and books a 30-minute meeting slot on Google Calendar.',
                parameters: {
                  type: 'OBJECT',
                  properties: {
                    title: { type: 'STRING', description: 'Meeting title or topic' },
                    date_time: { type: 'STRING', description: 'ISO 8601 date and start time (e.g., 2026-07-17T14:30:00+05:30)' },
                    guest_email: { type: 'STRING', description: 'Guest email address or name' }
                  },
                  required: ['title', 'date_time', 'guest_email']
                }
              }
            ]
          }]
        }
      }));
    };

    ws.onmessage = async (event) => {
      try {
        const rawText = typeof event.data === 'string' ? event.data : await event.data.text();
        const msg = JSON.parse(rawText);

        if (msg.toolCall) {
          handleToolCalls(msg.toolCall.functionCalls || []);
        }

        if (msg.serverContent) {
          const content = msg.serverContent;

          if (content.interrupted) {
            onStopPlayback();
            setConnectionState('listening');
            activeBubbleRef.current = null;
          }

          if (content.inputTranscription?.text) {
            const chunkText = content.inputTranscription.text;
            if (activeBubbleRef.current && activeBubbleRef.current.role === 'user') {
              activeBubbleRef.current.text += chunkText;
              const id = activeBubbleRef.current.id;
              const text = activeBubbleRef.current.text;
              setMessages(prev => prev.map(m => m.id === id ? { ...m, text } : m));
            } else {
              const id = addMessage({ role: 'user', text: chunkText });
              activeBubbleRef.current = { id, role: 'user', text: chunkText };
            }
          }

          if (content.outputTranscription?.text) {
            setConnectionState('speaking');
            const chunkText = content.outputTranscription.text;
            if (activeBubbleRef.current && activeBubbleRef.current.role === 'ai') {
              activeBubbleRef.current.text += chunkText;
              const id = activeBubbleRef.current.id;
              const text = activeBubbleRef.current.text;
              setMessages(prev => prev.map(m => m.id === id ? { ...m, text } : m));
            } else {
              const id = addMessage({ role: 'ai', text: chunkText });
              activeBubbleRef.current = { id, role: 'ai', text: chunkText };
            }
          }

          if (content.modelTurn?.parts) {
            for (const part of content.modelTurn.parts) {
              if (part.inlineData?.data) {
                setConnectionState('speaking');
                onPlayAudioChunk(part.inlineData.data);
              }
            }
          }

          if (content.turnComplete) {
            setConnectionState('listening');
            activeBubbleRef.current = null;
          }
        }
      } catch (err) {
        console.error('WebSocket message parsing error:', err);
      }
    };

    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
      addMessage({
        role: 'system',
        text: 'Connection error encountered. Check your API key or network status.'
      });
      setConnectionState('disconnected');
    };

    ws.onclose = () => {
      setConnectionState('disconnected');
      activeBubbleRef.current = null;
      onStopPlayback();
    };
  }, [apiKey, disconnect, addMessage, handleToolCalls, onPlayAudioChunk, onStopPlayback]);

  const sendAudioChunk = useCallback((base64Pcm: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        realtimeInput: {
          audio: {
            mimeType: 'audio/pcm;rate=16000',
            data: base64Pcm
          }
        }
      }));
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    activeBubbleRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return {
    connectionState,
    messages,
    connect,
    disconnect,
    sendAudioChunk,
    clearMessages
  };
}
