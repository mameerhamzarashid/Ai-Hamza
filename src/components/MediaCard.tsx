import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Download, Share2, Maximize2, X, Sparkles, Film, Image as ImageIcon, 
  Check, Copy, Play, RefreshCw, Eye
} from 'lucide-react';

interface MediaCardProps {
  mediaUrl: string;
  mediaType: 'image' | 'video';
  prompt: string;
  style?: string;
  aspectRatio?: string;
  onRegenerate?: () => void;
}

export const MediaCard: React.FC<MediaCardProps> = ({
  mediaUrl,
  mediaType,
  prompt,
  style = 'Cinematic 8K',
  aspectRatio = '16:9',
  onRegenerate,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [showLightbox, setShowLightbox] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const handleDownload = async () => {
    try {
      const response = await fetch(mediaUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `cygnus-ai-${mediaType}-${Date.now()}.${mediaType === 'video' ? 'mp4' : 'jpg'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch {
      // Fallback direct open
      window.open(mediaUrl, '_blank');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `CYGNUS AI Generated ${mediaType.toUpperCase()}`,
          text: `Check out this AI ${mediaType} created with CYGNUS AI: "${prompt}"`,
          url: mediaUrl,
        });
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      } catch (err) {
        console.log('Share error:', err);
      }
    } else {
      navigator.clipboard.writeText(mediaUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="mt-3 bg-slate-950/90 border border-slate-800/90 hover:border-cyan-500/40 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl transition-all">
      {/* Media Header */}
      <div className="px-3 py-2 bg-slate-900/80 border-b border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-mono">
          {mediaType === 'video' ? (
            <Film className="w-3.5 h-3.5 text-indigo-400" />
          ) : (
            <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
          )}
          <span className="font-bold text-white uppercase text-[10px]">
            CYGNUS AI {mediaType}
          </span>
          <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
            {style}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {onRegenerate && (
            <button
              onClick={onRegenerate}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition-colors"
              title="Regenerate"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={() => setShowLightbox(true)}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Expand Fullscreen"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Image/Video Stage */}
      <div className="relative group bg-slate-950 flex items-center justify-center min-h-[220px]">
        {/* Loading Shimmer State */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 p-6 space-y-3 z-10">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            <div className="text-[11px] font-mono text-cyan-400 animate-pulse flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Rendering high-resolution AI {mediaType}...</span>
            </div>
            <div className="w-48 bg-slate-900 rounded-full h-1 overflow-hidden border border-slate-800">
              <div className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full w-full animate-pulse" />
            </div>
          </div>
        )}

        <img
          src={mediaUrl}
          alt={prompt}
          referrerPolicy="no-referrer"
          onLoad={() => setIsLoading(false)}
          onError={() => setIsLoading(false)}
          className={`w-full max-h-96 object-cover transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
        />

        {/* Video Overlay Play Indicator */}
        {mediaType === 'video' && !isLoading && (
          <div 
            onClick={() => setShowLightbox(true)}
            className="absolute inset-0 flex items-center justify-center bg-slate-950/30 group-hover:bg-slate-950/40 transition-colors cursor-pointer"
          >
            <div className="p-3.5 rounded-full bg-indigo-600/90 text-white border border-indigo-400/50 shadow-2xl backdrop-blur-md group-hover:scale-110 transition-transform">
              <Play className="w-6 h-6 fill-current ml-0.5" />
            </div>
          </div>
        )}
      </div>

      {/* Prompt Label */}
      <div className="p-3 bg-slate-900/60 border-t border-slate-800/80 space-y-2">
        <p className="text-xs text-slate-300 italic line-clamp-2 leading-relaxed">
          "{prompt}"
        </p>

        {/* Media Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleDownload}
            className="flex-1 py-1.5 px-3 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-cyan-600/20 active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>

          <button
            onClick={handleShare}
            className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs flex items-center gap-1.5 transition-colors border border-slate-700"
            title="Share media"
          >
            {shared || copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">{shared ? 'Shared' : 'Copied'}</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Lightbox Overlay */}
      <AnimatePresence>
        {showLightbox && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-2xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-4xl max-h-[90vh] w-full flex flex-col items-center justify-center space-y-4"
            >
              <button
                onClick={() => setShowLightbox(false)}
                className="absolute top-2 right-2 p-2 rounded-full bg-slate-900 border border-slate-700 text-slate-300 hover:text-white z-20"
              >
                <X className="w-5 h-5" />
              </button>

              <img
                src={mediaUrl}
                alt={prompt}
                referrerPolicy="no-referrer"
                className="max-w-full max-h-[75vh] object-contain rounded-2xl border border-slate-800 shadow-2xl"
              />

              <div className="text-center space-y-1">
                <p className="text-xs text-slate-300 max-w-xl mx-auto italic">"{prompt}"</p>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    onClick={handleDownload}
                    className="px-4 py-2 bg-cyan-600 text-white rounded-xl font-bold text-xs flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Original</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
