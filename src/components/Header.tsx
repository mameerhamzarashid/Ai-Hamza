import React from 'react';
import { Sun, Moon, Sparkles, Smartphone, Monitor } from 'lucide-react';
import { UserSettings } from '../types';

interface HeaderProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings) => void;
  isMobileFrame: boolean;
  onToggleMobileFrame: () => void;
  unreadCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  onUpdateSettings,
  isMobileFrame,
  onToggleMobileFrame,
}) => {
  const toggleTheme = () => {
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
    onUpdateSettings({ ...settings, theme: nextTheme });
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-800 text-slate-100 transition-colors">
      {/* Mobile top status bar simulation */}
      <div className="px-4 py-1 text-[11px] text-slate-400 flex items-center justify-between border-b border-slate-800/40">
        <div className="flex items-center gap-1.5 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>HAMZA AI v1.0 • ONLINE</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400 text-[10px]">
          <span>Roman Urdu / EN</span>
          <span>⚡ 100%</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-2.5 flex items-center justify-between">
        {/* Logo & Status */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
              {settings.assistantName || 'Hamza AI'}
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                PRO
              </span>
            </h1>
            <p className="text-xs text-slate-400">Personal Mobile Assistant</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Mobile frame preview toggle button */}
          <button
            onClick={onToggleMobileFrame}
            title={isMobileFrame ? 'Switch to Full Width View' : 'Switch to Mobile Frame'}
            className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-all text-xs flex items-center gap-1 border border-slate-700/50"
          >
            {isMobileFrame ? (
              <>
                <Monitor className="w-4 h-4 text-teal-400" />
                <span className="hidden sm:inline">Desktop</span>
              </>
            ) : (
              <>
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">Mobile</span>
              </>
            )}
          </button>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-all border border-slate-700/50"
            title="Toggle theme"
          >
            {settings.theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-400" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
