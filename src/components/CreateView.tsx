import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Image as ImageIcon, Film, Sparkles, Download, MessageSquare, 
  Copy, RefreshCw, Wand2, Check, ArrowRight, Play, Ratio
} from 'lucide-react';
import { CygnusLogo } from './CygnusLogo';
import { MediaCard } from './MediaCard';
import { NavTab } from '../types';

interface CreateViewProps {
  onSendToChat: (prompt: string) => void;
  onNavigate: (tab: NavTab) => void;
}

export const CreateView: React.FC<CreateViewProps> = ({ onSendToChat, onNavigate }) => {
  const [activeMode, setActiveMode] = useState<'image' | 'video'>('image');
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('Cyberpunk Futuristic');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedAsset, setGeneratedAsset] = useState<{
    type: 'image' | 'video';
    url: string;
    prompt: string;
    aspectRatio: string;
    style: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const styleOptions = [
    'Cyberpunk Futuristic',
    'Cinematic 8K',
    'Photorealistic Ultra',
    'Minimalist Vector Art',
    'Anime / Manga Concept',
    '3D Octane Render',
  ];

  const aspectRatios = ['1:1', '16:9', '9:16', '4:3'];

  const samplePrompts = [
    'A futuristic glowing Cygnus constellation AI agent core floating over a neon metropolis',
    'Minimalist dark mode dashboard design for CYGNUS AI with sleek glassmorphism panels',
    'Cyberpunk hacker workstation with holographic cyan data streams and glass displays',
    'Abstract cinematic fluid wave in metallic cyan, indigo, and violet colors',
  ];

  const gallerySamples = [
    {
      id: 'gallery-1',
      title: 'Cygnus AI Core',
      type: 'image' as const,
      url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      prompt: 'Glowing Cygnus AI agent core in dark neon obsidian theme',
      style: 'Cyberpunk Futuristic',
    },
    {
      id: 'gallery-2',
      title: 'Neon Orbit',
      type: 'image' as const,
      url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=800&q=80',
      prompt: 'Abstract holographic sphere in dark space backdrop',
      style: '3D Octane Render',
    },
    {
      id: 'gallery-3',
      title: 'Cyber Grid Motion',
      type: 'video' as const,
      url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
      prompt: 'Cinematic video sequence of data grid streaming in high speed',
      style: 'Cinematic 8K',
    },
  ];

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setProgress(15);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return 90;
        return prev + 15;
      });
    }, 200);

    try {
      const endpoint = activeMode === 'video' ? '/api/generate-video' : '/api/generate-image';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, style, aspectRatio }),
      });
      const data = (await response.json()) as any;

      clearInterval(interval);
      setProgress(100);
      setIsGenerating(false);

      if (data.url) {
        setGeneratedAsset({
          type: activeMode,
          url: data.url,
          prompt,
          aspectRatio,
          style,
        });
      }
    } catch (err) {
      clearInterval(interval);
      setIsGenerating(false);
      // Fallback Pollinations direct
      const seed = Math.floor(Math.random() * 100000);
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt + ', ' + style)}?width=1024&height=1024&seed=${seed}&nologo=true&model=flux`;
      setGeneratedAsset({
        type: activeMode,
        url,
        prompt,
        aspectRatio,
        style,
      });
    }
  };

  const handleCopyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-purple-950/60 via-indigo-950/60 to-slate-900 border border-purple-500/20 shadow-xl">
        <div className="flex items-center gap-3">
          <CygnusLogo size="md" />
          <div>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              <span>CYGNUS Studio</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                AI Generation
              </span>
            </h1>
            <p className="text-xs text-slate-400">Generate high-resolution images & AI video clips</p>
          </div>
        </div>

        {/* Mode Switcher Buttons */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveMode('image')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeMode === 'image'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Image</span>
          </button>
          <button
            onClick={() => setActiveMode('video')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeMode === 'video'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Video</span>
          </button>
        </div>
      </div>

      {/* Main Studio Controls */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-xl space-y-4">
        {/* Prompt Textarea */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Wand2 className="w-3.5 h-3.5 text-purple-400" />
              <span>Prompt Description</span>
            </label>
            <span className="text-[10px] text-slate-500 font-mono">Detailed prompts work best</span>
          </div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            placeholder={
              activeMode === 'image'
                ? 'e.g. Glowing Cygnus AI mark in dark space nebula, 8k resolution, cinematic lighting...'
                : 'e.g. Cinematic slow motion video of cyan data stream flowing through obsidian cyber core...'
            }
            className="w-full bg-slate-950/90 border border-slate-800 focus:border-purple-500/60 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none resize-none transition-colors"
          />
        </div>

        {/* Sample Prompt Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[10px] text-slate-500 uppercase font-mono shrink-0">Try:</span>
          {samplePrompts.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setPrompt(s)}
              className="px-2.5 py-1 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-purple-500/40 text-[11px] text-slate-400 hover:text-purple-300 whitespace-nowrap transition-all"
            >
              {s.slice(0, 32)}...
            </button>
          ))}
        </div>

        {/* Configurations (Style & Aspect Ratio) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
          {/* Style Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-400">Visual Aesthetic / Style</label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500/50"
            >
              {styleOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Aspect Ratio */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
              <span>Aspect Ratio</span>
              <Ratio className="w-3 h-3 text-slate-500" />
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {aspectRatios.map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setAspectRatio(ratio)}
                  className={`py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                    aspectRatio === ratio
                      ? 'bg-purple-600/30 text-purple-300 border border-purple-500/50'
                      : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Generate Action Button */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={handleGenerate}
          disabled={!prompt.trim() || isGenerating}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-600/20"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Generating {activeMode.toUpperCase()} ({progress}%)...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate {activeMode === 'image' ? 'Image' : 'Video'} with CYGNUS AI</span>
            </>
          )}
        </motion.button>

        {/* Progress Bar during generation */}
        {isGenerating && (
          <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
            <motion.div
              className="bg-gradient-to-r from-purple-500 to-cyan-400 h-full rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: 'easeInOut' }}
            />
          </div>
        )}
      </div>

      {/* Generated Result Card */}
      <AnimatePresence>
        {generatedAsset && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-3"
          >
            <MediaCard
              mediaUrl={generatedAsset.url}
              mediaType={generatedAsset.type}
              prompt={generatedAsset.prompt}
              style={generatedAsset.style}
              aspectRatio={generatedAsset.aspectRatio}
              onRegenerate={handleGenerate}
            />

            <div className="flex items-center justify-end">
              <button
                onClick={() => {
                  onSendToChat(`I generated a ${generatedAsset.type} with prompt: "${generatedAsset.prompt}". Can you analyze or refine this concept?`);
                  onNavigate('chat');
                }}
                className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-medium text-xs flex items-center gap-1.5 transition-colors border border-slate-700"
              >
                <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                <span>Discuss in Chat</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gallery Inspiration Grid */}
      <div className="space-y-3 pt-4 border-t border-slate-800/80">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
          Cygnus Creation Showcase
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {gallerySamples.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                setPrompt(item.prompt);
                setActiveMode(item.type);
              }}
              className="group cursor-pointer rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/40 overflow-hidden transition-all"
            >
              <div className="relative h-28 overflow-hidden">
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-slate-950/80 text-[9px] font-mono text-purple-300 border border-purple-500/30">
                  {item.type}
                </div>
              </div>
              <div className="p-2.5">
                <h4 className="text-xs font-bold text-slate-200 group-hover:text-purple-300 transition-colors">
                  {item.title}
                </h4>
                <p className="text-[10px] text-slate-500 truncate mt-0.5">{item.prompt}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
