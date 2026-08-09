import React, { useState } from 'react';
import { 
  Wrench, Globe, Mail, MessageSquare, Calendar, FileText, 
  Folder, Monitor, Table, CheckCircle2, AlertCircle, ExternalLink, Search, Sparkles, X 
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

  // Web search tool state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<{ summary: string; sources: any[] } | null>(null);

  const getToolIcon = (iconName: string) => {
    switch (iconName) {
      case 'Globe': return <Globe className="w-5 h-5 text-teal-400" />;
      case 'MessageSquare': return <MessageSquare className="w-5 h-5 text-emerald-400" />;
      case 'Mail': return <Mail className="w-5 h-5 text-sky-400" />;
      case 'Calendar': return <Calendar className="w-5 h-5 text-indigo-400" />;
      case 'FileText': return <FileText className="w-5 h-5 text-amber-400" />;
      case 'Folder': return <Folder className="w-5 h-5 text-blue-400" />;
      case 'Monitor': return <Monitor className="w-5 h-5 text-rose-400" />;
      case 'Table': return <Table className="w-5 h-5 text-emerald-400" />;
      default: return <Wrench className="w-5 h-5 text-slate-400" />;
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
        summary: 'Error running web search.',
        sources: [],
      });
    }
    setIsSearching(false);
  };

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <Wrench className="w-5 h-5 text-emerald-400" />
          Assistant Tools & Integrations
        </h2>
        <p className="text-xs text-slate-400">
          Capabilities and external bridges supported by Hamza AI
        </p>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {tools.map((tool) => {
          const isConnected = tool.status === 'connected';
          return (
            <div
              key={tool.id}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center">
                    {getToolIcon(tool.iconName)}
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1 ${
                      isConnected
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isConnected ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        Connected
                      </>
                    ) : (
                      'Not Connected'
                    )}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  {tool.name}
                  {tool.badge && (
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded">
                      {tool.badge}
                    </span>
                  )}
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {tool.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                  {tool.category}
                </span>

                <button
                  onClick={() => handleToolClick(tool)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all ${
                    isConnected
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                  }`}
                >
                  {isConnected ? 'Launch Tool' : 'Connect'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Connect Integration Explanation Modal */}
      {showConnectModal && selectedTool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                {getToolIcon(selectedTool.iconName)}
                <h3 className="text-sm font-bold text-white">
                  Connect {selectedTool.name}
                </h3>
              </div>
              <button
                onClick={() => setShowConnectModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl flex items-start gap-2 text-amber-300">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                <span>
                  Hamza AI does not fake tool connections. Real OAuth2 / API keys are required to execute actions directly on third-party servers.
                </span>
              </div>

              <p>
                <b>Tool Architecture:</b> {selectedTool.description}.
              </p>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-400 space-y-1">
                <p className="text-slate-200 font-bold">Required Environment Variables:</p>
                <p>• {selectedTool.id.toUpperCase()}_API_KEY</p>
                <p>• {selectedTool.id.toUpperCase()}_OAUTH_CLIENT_ID</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowConnectModal(false)}
                className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Web Research Tool Modal */}
      {showWebSearchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-teal-400" />
                <h3 className="text-sm font-bold text-white">Gemini Web Research Tool</h3>
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
                  placeholder="e.g. Latest news about AI mobile agents 2026"
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                  onKeyDown={(e) => e.key === 'Enter' && handleRunWebSearch()}
                />
                <button
                  onClick={handleRunWebSearch}
                  disabled={isSearching || !searchQuery.trim()}
                  className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Search className="w-3.5 h-3.5" />
                  {isSearching ? 'Searching...' : 'Search'}
                </button>
              </div>

              {isSearching && (
                <div className="p-4 bg-slate-950 rounded-xl text-center text-xs text-teal-400 animate-pulse flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Fetching grounded research via Gemini...</span>
                </div>
              )}

              {searchResult && (
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3 text-xs">
                  <h4 className="font-bold text-white uppercase text-[10px] tracking-wider text-teal-400">
                    Research Summary
                  </h4>
                  <p className="text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                    {searchResult.summary}
                  </p>

                  {searchResult.sources && searchResult.sources.length > 0 && (
                    <div className="pt-2 border-t border-slate-800/80 space-y-1">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase">
                        Sources
                      </p>
                      {searchResult.sources.map((s, i) => (
                        <a
                          key={i}
                          href={s.uri}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-teal-400 hover:underline block truncate flex items-center gap-1"
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
