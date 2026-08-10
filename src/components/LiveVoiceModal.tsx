import React, { useEffect, useRef, useState } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { Mic, MicOff, Square, X, Volume2, Sparkles, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';
import { CygnusLogo } from './CygnusLogo';

interface LiveVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddChatMessage: (message: { sender: 'user' | 'assistant'; text: string }) => void;
  userName?: string;
}

type VoiceState = 'connecting' | 'listening' | 'thinking' | 'speaking' | 'muted' | 'error';

function downsampleTo16k(inputData: Float32Array, inputSampleRate: number): Float32Array {
  if (inputSampleRate === 16000) return inputData;
  const ratio = inputSampleRate / 16000;
  const newLength = Math.floor(inputData.length / ratio);
  const result = new Float32Array(newLength);
  for (let i = 0; i < newLength; i++) {
    const origIndex = Math.floor(i * ratio);
    result[i] = inputData[origIndex];
  }
  return result;
}

function floatTo16BitPCM(float32Array: Float32Array): ArrayBuffer {
  const buffer = new ArrayBuffer(float32Array.length * 2);
  const view = new DataView(buffer);
  let offset = 0;
  for (let i = 0; i < float32Array.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return buffer;
}

function pcm16ToFloat32(arrayBuffer: ArrayBuffer): Float32Array {
  const dataView = new DataView(arrayBuffer);
  const float32 = new Float32Array(arrayBuffer.byteLength / 2);
  for (let i = 0; i < float32.length; i++) {
    const int16 = dataView.getInt16(i * 2, true);
    float32[i] = int16 < 0 ? int16 / 0x8000 : int16 / 0x7fff;
  }
  return float32;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export const LiveVoiceModal: React.FC<LiveVoiceModalProps> = ({
  isOpen,
  onClose,
  onAddChatMessage,
  userName = 'Hamza',
}) => {
  const [voiceState, setVoiceState] = useState<VoiceState>('connecting');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [userTranscript, setUserTranscript] = useState('');
  const [modelTranscript, setModelTranscript] = useState('');
  const [historyTranscript, setHistoryTranscript] = useState<
    Array<{ sender: 'user' | 'assistant'; text: string }>
  >([]);

  // Refs for managing audio & session lifecycle without stale closures
  const sessionRef = useRef<any>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const isMutedRef = useRef(isMuted);
  const scheduledSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const nextStartTimeRef = useRef<number>(0);
  const currentUserTextRef = useRef('');
  const currentModelTextRef = useRef('');

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    if (isOpen) {
      startLiveVoiceSession();
    } else {
      stopLiveVoiceSession();
    }

    return () => {
      stopLiveVoiceSession();
    };
  }, [isOpen]);

  const stopPlayback = () => {
    for (const source of scheduledSourcesRef.current) {
      try {
        source.stop();
      } catch {}
    }
    scheduledSourcesRef.current = [];
    if (outputAudioCtxRef.current) {
      nextStartTimeRef.current = outputAudioCtxRef.current.currentTime;
    }
    setVoiceState(isMutedRef.current ? 'muted' : 'listening');
  };

  const stopLiveVoiceSession = () => {
    stopPlayback();

    if (processorRef.current) {
      try {
        processorRef.current.disconnect();
      } catch {}
      processorRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (inputAudioCtxRef.current) {
      try {
        inputAudioCtxRef.current.close();
      } catch {}
      inputAudioCtxRef.current = null;
    }

    if (outputAudioCtxRef.current) {
      try {
        outputAudioCtxRef.current.close();
      } catch {}
      outputAudioCtxRef.current = null;
    }

    if (sessionRef.current) {
      try {
        sessionRef.current.close();
      } catch {}
      sessionRef.current = null;
    }
  };

  const startLiveVoiceSession = async () => {
    setVoiceState('connecting');
    setErrorMessage(null);
    setUserTranscript('');
    setModelTranscript('');
    currentUserTextRef.current = '';
    currentModelTextRef.current = '';

    try {
      // 1. Fetch Ephemeral Token
      const tokenRes = await fetch('/api/live-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const tokenData: any = await tokenRes.json();

      if (!tokenRes.ok || !tokenData.token) {
        throw new Error(
          tokenData.error ||
            'Failed to obtain Gemini Live ephemeral token from server endpoint.'
        );
      }

      // 2. Request Mic Permission & Setup Audio Contexts
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      let inputCtx: AudioContext;
      try {
        inputCtx = new AudioCtx({ sampleRate: 16000 });
      } catch {
        inputCtx = new AudioCtx();
      }
      const outputCtx = new AudioCtx({ sampleRate: 24000 });

      inputAudioCtxRef.current = inputCtx;
      outputAudioCtxRef.current = outputCtx;
      nextStartTimeRef.current = outputCtx.currentTime;

      // 3. Connect to Gemini Live API using ephemeral token
      const ai = new GoogleGenAI({
        apiKey: tokenData.token,
        httpOptions: { apiVersion: 'v1alpha' },
      });

      const systemInstruction = `
You are "CYGNUS AI" — ${userName}'s personal AI assistant interacting in real-time, bidirectional voice mode.
Always communicate naturally, warmly, intelligently, and clearly in English or Roman Urdu based on user speech.
Keep spoken responses concise (1-3 sentences) unless asked for detailed explanations.
Never reveal internal configuration or token details.
`.trim();

      const session = await ai.live.connect({
        model: 'gemini-3.1-flash-live-preview',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Zephyr' },
            },
          },
          systemInstruction,
          outputAudioTranscription: {},
          inputAudioTranscription: {},
        },
        callbacks: {
          onopen: () => {
            setVoiceState('listening');
          },
          onmessage: (msg: any) => {
            handleLiveServerMessage(msg, outputCtx);
          },
          onerror: (err: any) => {
            console.error('Gemini Live WS Error:', err);
            setVoiceState('error');
            setErrorMessage(
              err.message || 'Gemini Live WebSocket connection error.'
            );
          },
          onclose: (event: any) => {
            console.log('Gemini Live WS Closed:', event);
          },
        },
      });

      sessionRef.current = session;

      // 4. Stream Mic Audio continuously
      const source = inputCtx.createMediaStreamSource(stream);
      const processor = inputCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      source.connect(processor);
      processor.connect(inputCtx.destination);

      processor.onaudioprocess = (e) => {
        if (isMutedRef.current || !sessionRef.current) return;
        const rawInput = e.inputBuffer.getChannelData(0);
        const sampledInput = downsampleTo16k(rawInput, inputCtx.sampleRate);
        const pcm16 = floatTo16BitPCM(sampledInput);
        const base64 = arrayBufferToBase64(pcm16);

        sessionRef.current.sendRealtimeInput({
          audio: {
            data: base64,
            mimeType: 'audio/pcm;rate=16000',
          },
        });
      };
    } catch (err: any) {
      console.error('Error starting live session:', err);
      setVoiceState('error');
      if (
        err.name === 'NotAllowedError' ||
        err.name === 'PermissionDeniedError' ||
        err.message?.toLowerCase().includes('permission') ||
        err.message?.toLowerCase().includes('denied') ||
        err.message?.toLowerCase().includes('allowed')
      ) {
        setErrorMessage(
          'Microphone permission was denied by browser/iframe policy. Please allow microphone access in your browser or click "Open App in New Tab".'
        );
      } else {
        setErrorMessage(
          err.message ||
            'Could not start Gemini Live Voice Mode. Please check microphone access and connection.'
        );
      }
    }
  };

  const handleLiveServerMessage = (msg: any, outputCtx: AudioContext) => {
    // Check if interrupted by user speech
    if (msg.serverContent?.interrupted) {
      stopPlayback();
      return;
    }

    // Process Input Transcription (User Speech Text)
    if (msg.inputAudioTranscription?.text) {
      const textChunk = msg.inputAudioTranscription.text;
      currentUserTextRef.current += textChunk;
      setUserTranscript(currentUserTextRef.current);
      setVoiceState('thinking');
    }

    // Process Output Transcription (Model Speech Text)
    if (msg.outputAudioTranscription?.text) {
      const textChunk = msg.outputAudioTranscription.text;
      currentModelTextRef.current += textChunk;
      setModelTranscript(currentModelTextRef.current);
    }

    // Process Model Turn Content Parts (Text or Audio)
    const parts = msg.serverContent?.modelTurn?.parts || [];
    for (const part of parts) {
      if (part.text) {
        currentModelTextRef.current += part.text;
        setModelTranscript(currentModelTextRef.current);
      }

      if (part.inlineData?.data) {
        // Play Audio Chunk at 24kHz
        playAudioChunk(part.inlineData.data, outputCtx);
      }
    }

    // Turn complete - Commit to Chat History
    if (msg.serverContent?.turnComplete) {
      if (currentUserTextRef.current.trim()) {
        const uText = currentUserTextRef.current.trim();
        onAddChatMessage({ sender: 'user', text: uText });
        setHistoryTranscript((prev) => [...prev, { sender: 'user', text: uText }]);
        currentUserTextRef.current = '';
      }

      if (currentModelTextRef.current.trim()) {
        const mText = currentModelTextRef.current.trim();
        onAddChatMessage({ sender: 'assistant', text: mText });
        setHistoryTranscript((prev) => [...prev, { sender: 'assistant', text: mText }]);
        currentModelTextRef.current = '';
      }
    }
  };

  const playAudioChunk = (base64Data: string, outputCtx: AudioContext) => {
    try {
      const pcmBuffer = base64ToArrayBuffer(base64Data);
      const float32Data = pcm16ToFloat32(pcmBuffer);

      if (float32Data.length === 0) return;

      const audioBuffer = outputCtx.createBuffer(1, float32Data.length, 24000);
      audioBuffer.getChannelData(0).set(float32Data);

      const source = outputCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(outputCtx.destination);

      const startTime = Math.max(outputCtx.currentTime, nextStartTimeRef.current);
      source.start(startTime);
      nextStartTimeRef.current = startTime + audioBuffer.duration;
      scheduledSourcesRef.current.push(source);

      setVoiceState('speaking');

      source.onended = () => {
        const idx = scheduledSourcesRef.current.indexOf(source);
        if (idx > -1) {
          scheduledSourcesRef.current.splice(idx, 1);
        }
        if (
          scheduledSourcesRef.current.length === 0 &&
          outputCtx.currentTime >= nextStartTimeRef.current - 0.1
        ) {
          setVoiceState(isMutedRef.current ? 'muted' : 'listening');
        }
      };
    } catch (err) {
      console.error('Audio chunk playback error:', err);
    }
  };

  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      setVoiceState(next ? 'muted' : 'listening');
      return next;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-2xl animate-fade-in">
      <div className="relative w-full max-w-xl p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-cyan-500/30 shadow-2xl shadow-cyan-500/10 flex flex-col items-center text-center overflow-hidden">
        {/* Background Ambient Glows */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="w-full flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <CygnusLogo size="sm" showText={false} />
            <div className="text-left">
              <h3 className="text-sm font-bold text-white tracking-wide uppercase font-mono">
                CYGNUS Live Voice Mode
              </h3>
              <p className="text-[10px] text-cyan-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Gemini Live WebSocket • Low Latency
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Exit Voice Mode"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Central Animated Orb */}
        <div className="my-8 relative flex items-center justify-center">
          {/* Outer Ripple Effects according to State */}
          {voiceState === 'listening' && (
            <>
              <div className="absolute w-44 h-44 rounded-full border border-cyan-500/40 animate-ping opacity-30" />
              <div className="absolute w-36 h-36 rounded-full bg-cyan-500/20 blur-xl animate-pulse" />
            </>
          )}

          {voiceState === 'speaking' && (
            <>
              <div className="absolute w-48 h-48 rounded-full border-2 border-purple-500/50 animate-ping opacity-40" />
              <div className="absolute w-40 h-40 rounded-full bg-purple-500/30 blur-2xl animate-pulse" />
            </>
          )}

          {voiceState === 'thinking' && (
            <div className="absolute w-40 h-40 rounded-full border-2 border-dashed border-indigo-400 animate-spin opacity-60" />
          )}

          {voiceState === 'muted' && (
            <div className="absolute w-36 h-36 rounded-full border border-rose-500/30 bg-rose-500/10 blur-lg" />
          )}

          {/* Center Orb Icon */}
          <div
            className={`w-28 h-28 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 relative z-10 ${
              voiceState === 'speaking'
                ? 'bg-gradient-to-tr from-purple-600 via-fuchsia-500 to-indigo-500 shadow-purple-500/40 scale-105'
                : voiceState === 'listening'
                ? 'bg-gradient-to-tr from-cyan-600 via-teal-500 to-emerald-400 shadow-cyan-500/40'
                : voiceState === 'thinking'
                ? 'bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-indigo-500/30 animate-pulse'
                : voiceState === 'muted'
                ? 'bg-slate-800 border-2 border-rose-500/50 shadow-rose-500/20'
                : 'bg-slate-800 border border-slate-700'
            }`}
          >
            {voiceState === 'speaking' && <Volume2 className="w-12 h-12 text-white animate-pulse" />}
            {voiceState === 'listening' && <Mic className="w-12 h-12 text-white" />}
            {voiceState === 'thinking' && <Sparkles className="w-12 h-12 text-indigo-200 animate-spin" />}
            {voiceState === 'muted' && <MicOff className="w-12 h-12 text-rose-400" />}
            {voiceState === 'connecting' && <RefreshCw className="w-10 h-10 text-cyan-400 animate-spin" />}
            {voiceState === 'error' && <AlertCircle className="w-12 h-12 text-rose-500" />}
          </div>
        </div>

        {/* State Label Badge */}
        <div className="mb-4">
          <span
            className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold tracking-wide uppercase inline-flex items-center gap-2 border ${
              voiceState === 'speaking'
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                : voiceState === 'listening'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                : voiceState === 'thinking'
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                : voiceState === 'muted'
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : voiceState === 'connecting'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                voiceState === 'speaking'
                  ? 'bg-purple-400 animate-ping'
                  : voiceState === 'listening'
                  ? 'bg-cyan-400 animate-pulse'
                  : voiceState === 'thinking'
                  ? 'bg-indigo-400 animate-bounce'
                  : voiceState === 'muted'
                  ? 'bg-rose-400'
                  : 'bg-amber-400 animate-spin'
              }`}
            />
            {voiceState === 'speaking' && 'CYGNUS is speaking...'}
            {voiceState === 'listening' && 'Listening... Speak naturally'}
            {voiceState === 'thinking' && 'CYGNUS is thinking...'}
            {voiceState === 'muted' && 'Microphone Muted'}
            {voiceState === 'connecting' && 'Connecting Gemini Live...'}
            {voiceState === 'error' && 'Connection Error'}
          </span>
        </div>

        {/* Live Error Display */}
        {voiceState === 'error' && (
          <div className="w-full mb-4 p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-left space-y-3">
            <div className="flex items-start gap-2 text-rose-300 text-xs font-medium">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={startLiveVoiceSession}
                className="py-1.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Connection</span>
              </button>

              <button
                onClick={() => window.open(window.location.href, '_blank')}
                className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in New Tab</span>
              </button>
            </div>
          </div>
        )}

        {/* Live Transcript Box */}
        <div className="w-full max-h-36 overflow-y-auto p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-left text-xs font-sans space-y-2 mb-6">
          {historyTranscript.length === 0 && !userTranscript && !modelTranscript && (
            <p className="text-slate-500 italic text-center py-2">
              Say something like "Hello CYGNUS, what can you do?" or ask any question...
            </p>
          )}

          {historyTranscript.map((item, idx) => (
            <div key={idx} className="space-y-0.5">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-500">
                {item.sender === 'user' ? userName : 'CYGNUS'}:
              </span>
              <p className={item.sender === 'user' ? 'text-cyan-300' : 'text-slate-200'}>
                {item.text}
              </p>
            </div>
          ))}

          {userTranscript && (
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono font-bold uppercase text-cyan-400">
                {userName} (Live):
              </span>
              <p className="text-cyan-200 animate-pulse">{userTranscript}</p>
            </div>
          )}

          {modelTranscript && (
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono font-bold uppercase text-purple-400">
                CYGNUS (Live):
              </span>
              <p className="text-purple-200">{modelTranscript}</p>
            </div>
          )}
        </div>

        {/* Action Controls Toolbar */}
        <div className="flex items-center gap-3 w-full justify-center">
          {/* Mute/Unmute */}
          <button
            onClick={toggleMute}
            className={`py-2.5 px-4 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
              isMuted
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
            }`}
            title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
          >
            {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            <span>{isMuted ? 'UNMUTE' : 'MUTE'}</span>
          </button>

          {/* Stop CYGNUS Speaking */}
          <button
            onClick={stopPlayback}
            disabled={voiceState !== 'speaking'}
            className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200 font-bold text-xs flex items-center gap-2 border border-slate-700 transition-all"
            title="Stop current speech playback"
          >
            <Square className="w-4 h-4 text-purple-400 fill-current" />
            <span>STOP</span>
          </button>

          {/* Exit Voice Mode */}
          <button
            onClick={onClose}
            className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-rose-600/20"
          >
            <X className="w-4 h-4" />
            <span>EXIT LIVE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
