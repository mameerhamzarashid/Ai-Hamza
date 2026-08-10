import React, { useState } from 'react';
import { 
  Wrench, Globe, Mail, MessageSquare, Calendar, FileText, 
  Folder, Monitor, Table, ExternalLink, Search, Sparkles, X, Terminal 
} from 'lucide-react';
import { ToolItem, WhatsAppDraft } from '../types';

interface ToolsViewProps {
  tools: ToolItem[];
  onOpenWhatsAppModal: (draft: WhatsAppDraft) => void;
}

export const ToolsView: React.FC<ToolsViewProps> = ({
  tools,
  onOpenWhatsAppModal,
}) => {
  const [selectedTool, setSelectedTool] = useState<ToolItem | null>(null);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showWebSearchModal, setShowWebSearchModal] = useState(false);

  // Web search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<{ summary: string; sources: any[] } | null>(null);

  const getToolIcon = (iconName: string) => {
    switch (iconName) {
      case 'Globe': return <Globe className="w-4 h-4 text-emerald-400" />;
      case 'MessageSquare': return <MessageSquare className="w-4 h-4 text-emerald-400" />;
      case 'Mail': return <Mail className="w-4 h-4 text-emerald-400" />;
      case 'Calendar': return <Calendar className="w-4 h-4 text-emerald-400" />;
      case 'FileText': return <FileText className="w-4 h-4 text-emerald-400" />;
      case 'Folder': return <Folder className="w-4 h-4 text-emerald-400" />;
      case 'Monitor': return <Monitor className="w-4 h-4 text-emerald-400" />;
      case 'Table': return <Table className="w-4 h-4 text-emerald-400" />;
      default: return <Wrench className="w-4 h-4 text-slate-400" />;
    }
  };

  const handleToolClick = (tool: ToolItem) => {
    setSelectedTool(tool);
    if (tool.id === 'whatsapp') {
      onOpenWhatsAppModal({
        id: 'draft-tool-test',
        recipientName: 'Ali',
        messageText: 'Assalam-o-Alaikum Ali, meeting shaam 5 baje confirm hai.',
        status: 'draft',
        createdAt: new Date().toISOString(),
      });
    } else if (tool.id === 'web_search') {
      setShowWebSearchModal(true);
    } else {
      setShowConnectModal(true);
    }
  };

  const handleRunWebSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchResult(null);
    try {
      const res = await fetch('/api/web-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });
      const data = await res.json();
      setSearchResult(data);
    } catch {
      setSearchResult({
        summary: '[SYS_ERR] Failed to execute web intelligence search.',
        sources: [],
      });
    }
    setIsSearching(false);
  };

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200 font-sans">
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2 font-mono">
          <Wrench className="w-5 h-5 text-emerald-400" />
          SYSTEM_CAPABILITIES
        </h2>
        <p className="text-xs text-slate-400 font-mono">
          Native integrations and tools enabled in Hamza AI
        </p>
      </div>

      {/* Tools List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-sans">
        {tools.map((tool) => {
          const isConnected = tool.status === 'connected';
          return (
            <div
              key={tool.id}
              className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/30 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2 font-mono">
                  <div className="w-8 h-8 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center">
                    {getToolIcon(tool.iconName)}
                  </div>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase flex items-center gap-1 ${
                      isConnected
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-950 text-slate-400 border border-slate-800'
                    }`}
                  >
                    {isConnected ? 'ONLINE' : 'READY'}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-white flex items-center gap-1.5 font-mono">
                  {tool.name}
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {tool.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between font-mono">
                <span className="text-[9px] text-slate-500 uppercase font-bold">
                  [{tool.category}]
                </span>

                <button
                  onClick={() => handleToolClick(tool)}
                  className="text-xs font-bold text-emerald-400 hover:underline"
                >
                  {tool.id === 'web_search' || tool.id === 'whatsapp' ? 'OPEN TOOL' : 'INFO'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Modal */}
      {showConnectModal && selectedTool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-emerald-500/30 w-full max-w-md rounded-2xl shadow-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 font-mono">
              <div className="flex items-center gap-2">
                {getToolIcon(selectedTool.iconName)}
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  {selectedTool.name}
                </h3>
              </div>
              <button
                onClick={() => setShowConnectModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {selectedTool.description}
            </p>

            <div className="flex justify-end pt-2 font-mono">
              <button
                onClick={() => setShowConnectModal(false)}
                className="px-3 py-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white rounded-xl"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Web Research Modal */}
      {showWebSearchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-emerald-500/30 w-full max-w-lg rounded-2xl shadow-2xl p-4 space-y-3 font-sans">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 font-mono">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  WEB_INTELLIGENCE_SEARCH
                </h3>
              </div>
              <button
                onClick={() => setShowWebSearchModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search live web..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  onKeyDown={(e) => e.key === 'Enter' && handleRunWebSearch()}
                />
                <button
                  onClick={handleRunWebSearch}
                  disabled={isSearching || !searchQuery.trim()}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs rounded-xl flex items-center gap-1 disabled:opacity-50"
                >
                  <Search className="w-3.5 h-3.5" />
                  {isSearching ? '...' : 'SEARCH'}
                </button>
              </div>

              {isSearching && (
                <div className="p-3 bg-slate-950 rounded-xl text-center text-xs text-emerald-400 font-mono flex items-center justify-center gap-2 border border-slate-800">
                  <Sparkles className="w-4 h-4 animate-spin text-emerald-400" />
                  <span>SEARCHING WEB INTEL VIA GEMINI...</span>
                </div>
              )}

              {searchResult && (
                <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-2 text-xs">
                  <p className="text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                    {searchResult.summary}
                  </p>

                  {searchResult.sources && searchResult.sources.length > 0 && (
                    <div className="pt-2 border-t border-slate-800 space-y-1 font-mono">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">
                        SOURCES
                      </p>
                      {searchResult.sources.map((s, i) => (
                        <a
                          key={i}
                          href={s.uri}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-emerald-400 hover:underline block truncate flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3 shrink-0" />
                          {s.title}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
