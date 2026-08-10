import React from 'react';
import { Terminal, Sun, Moon, Plus, History, Smartphone, Monitor, ShieldCheck } from 'lucide-react';
import { UserSettings } from '../types';

interface HeaderProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings) => void;
  isMobileFrame: boolean;
  onToggleMobileFrame: () => void;
  onNewChat: () => void;
  onToggleHistoryDrawer: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  onUpdateSettings,
  isMobileFrame,
  onToggleMobileFrame,
  onNewChat,
  onToggleHistoryDrawer,
}) => {
  const toggleTheme = () => {
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
    onUpdateSettings({ ...settings, theme: nextTheme });
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-emerald-500/20 text-slate-100 transition-colors">
      <div className="max-w-3xl mx-auto px-4 py-2.5 flex items-center justify-between">
        {/* Left: Menu/History Button & Brand */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onToggleHistoryDrawer}
            className="p-2 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-slate-900 border border-transparent hover:border-emerald-500/30 transition-all"
            title="Session History"
          >
            <History className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shadow-xs shadow-emerald-500/20">
              <Terminal className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-xs font-bold text-white tracking-wider font-mono uppercase">
                {settings.assistantName || 'HAMZA AI'}
              </h1>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                ONLINE
              </span>
            </div>
          </div>
        </div>

        {/* Right: New Chat & Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onNewChat}
            className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 active:scale-95"
            title="Start New Session"
          >
            <Plus className="w-3 h-3 stroke-[3]" />
            <span className="hidden sm:inline">NEW SESSION</span>
          </button>

          <button
            onClick={onToggleMobileFrame}
            className="p-2 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-slate-900 transition-colors"
            title={isMobileFrame ? 'Switch to Full Width' : 'Switch to Console View'}
          >
            {isMobileFrame ? (
              <Monitor className="w-4 h-4" />
            ) : (
              <Smartphone className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-slate-900 transition-colors"
            title="Toggle Theme Mode"
          >
            {settings.theme === 'dark' ? (
              <Sun className="w-4 h-4 text-emerald-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-400" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
