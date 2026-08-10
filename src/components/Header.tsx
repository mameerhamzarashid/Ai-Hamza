import React from 'react';
import { Sun, Moon, Plus, History, Smartphone, Monitor, Sparkles } from 'lucide-react';
import { UserSettings } from '../types';
import { CygnusLogo } from './CygnusLogo';

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
    <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 text-slate-100 transition-colors">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between">
        {/* Left: Menu/History Button & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleHistoryDrawer}
            className="p-2 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all"
            title="Session History"
          >
            <History className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <CygnusLogo size="sm" showText={false} />
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-white tracking-widest font-sans uppercase">
                {settings.assistantName || 'CYGNUS AI'}
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                ULTRA 3.6
              </span>
            </div>
          </div>
        </div>

        {/* Right: New Chat & Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onNewChat}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20 active:scale-95"
            title="Start New Session"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">New Session</span>
          </button>

          <button
            onClick={onToggleMobileFrame}
            className="p-2 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-slate-900 transition-colors"
            title={isMobileFrame ? 'Switch to Full Width Desktop' : 'Switch to Mobile Frame'}
          >
            {isMobileFrame ? (
              <Monitor className="w-4 h-4" />
            ) : (
              <Smartphone className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-slate-900 transition-colors"
            title="Toggle Theme Mode"
          >
            {settings.theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-400" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
