import React from 'react';
import { Search, Globe, ExternalLink } from 'lucide-react';
import { SearchSource } from '../types';

interface WebSearchCardProps {
  query?: string;
  summary?: string;
  sources?: SearchSource[];
}

export const WebSearchCard: React.FC<WebSearchCardProps> = ({ query, summary, sources = [] }) => {
  return (
    <div className="bg-slate-950/90 border border-emerald-500/30 rounded-2xl p-3.5 space-y-2.5 text-left shadow-md font-sans">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800 font-mono">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Search className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
            [WEB_RESEARCH_GROUNDED]
          </span>
        </div>
      </div>

      {query && (
        <div className="text-xs font-mono text-slate-400">
          Query: <span className="text-emerald-400 font-bold">"{query}"</span>
        </div>
      )}

      {summary && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
          {summary}
        </div>
      )}

      {sources.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Globe className="w-3 h-3 text-emerald-400" /> VERIFIED SOURCES:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {sources.map((src, idx) => (
              <a
                key={idx}
                href={src.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/30 px-2.5 py-1 rounded-lg text-[11px] text-emerald-400 hover:text-emerald-300 font-mono flex items-center gap-1 transition-all"
              >
                <span className="truncate max-w-[180px]">{src.title}</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
