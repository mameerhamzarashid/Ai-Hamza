import React, { useState } from 'react';
import { 
  Settings, User, Globe, MessageSquare, Shield, 
  Trash2, AlertTriangle, Check, Terminal, Moon, Sun, Smartphone
} from 'lucide-react';
import { UserSettings, NavTab } from '../types';

interface SettingsViewProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings) => void;
  onNavigate: (tab: NavTab) => void;
  onResetAllData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onNavigate,
  onResetAllData,
}) => {
  const [userName, setUserName] = useState(settings.userName);
  const [assistantName, setAssistantName] = useState(settings.assistantName);
  const [language, setLanguage] = useState(settings.language);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    onUpdateSettings({
      ...settings,
      userName,
      assistantName,
      language,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const toggleTheme = () => {
    onUpdateSettings({
      ...settings,
      theme: settings.theme === 'dark' ? 'light' : 'dark',
    });
  };

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200 font-sans">
      {/* Top Header */}
      <div>
        <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2 font-mono">
          <Settings className="w-5 h-5 text-emerald-400" />
          SYSTEM_CONFIG
        </h2>
        <p className="text-xs text-slate-400 font-mono">
          Manage assistant profile & system options
        </p>
      </div>

      {/* Settings Form Card */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 font-mono">
        <div className="space-y-3">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              USER_NAME
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              ASSISTANT_NAME
            </label>
            <div className="relative">
              <Terminal className="w-4 h-4 absolute left-3 top-2.5 text-emerald-400" />
              <input
                type="text"
                value={assistantName}
                onChange={(e) => setAssistantName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              PREFERRED_LANGUAGE
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Roman Urdu">Roman Urdu + English</option>
                <option value="English">English Only</option>
                <option value="Urdu">Urdu Script</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-800">
            <div>
              <h4 className="text-xs font-bold text-white">THEME_MODE</h4>
              <p className="text-[10px] text-slate-400">Dark cyber vs crisp light</p>
            </div>
            <button
              onClick={toggleTheme}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-cyan-400 flex items-center gap-1.5"
            >
              {settings.theme === 'dark' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
              {settings.theme.toUpperCase()}
            </button>
          </div>

          {/* PWA & Mobile Integration Details */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-cyan-400" />
                <div>
                  <h4 className="text-xs font-bold text-white">PWA_APP_SHELL</h4>
                  <p className="text-[10px] text-slate-400">Standalone PWA & offline cache ready</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                ACTIVE
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <div>Display: <span className="text-cyan-300">Standalone</span></div>
              <div>SW Status: <span className="text-cyan-300 font-bold">Registered</span></div>
              <div>Offline Cache: <span className="text-cyan-300">Enabled</span></div>
              <div>Platform: <span className="text-cyan-300">Android / Mobile</span></div>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <Check className="w-4 h-4" /> CONFIG_SAVED
            </span>
          )}
          <button
            onClick={handleSave}
            className="ml-auto px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition-all"
          >
            SAVE CONFIG
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-rose-500/30 space-y-2 font-mono">
        <h4 className="text-xs font-bold text-rose-400 flex items-center gap-1.5 uppercase">
          <AlertTriangle className="w-4 h-4" /> DANGER_ZONE
        </h4>
        <p className="text-[11px] text-slate-400">
          Wipe all tasks, saved memory, and local conversation history from storage.
        </p>

        {showConfirmReset ? (
          <div className="p-3 bg-slate-950 border border-rose-500/40 rounded-xl space-y-2 text-xs">
            <p className="font-bold text-rose-400">
              [CONFIRM_PURGE] All local data will be permanently wiped. Proceed?
            </p>
            <div className="flex gap-2">
              <button
                onClick={onResetAllData}
                className="px-3 py-1 bg-rose-500 text-white font-bold rounded-lg text-xs hover:bg-rose-600"
              >
                YES, PURGE ALL DATA
              </button>
              <button
                onClick={() => setShowConfirmReset(false)}
                className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs"
              >
                CANCEL
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowConfirmReset(true)}
            className="px-3 py-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            WIPE ALL LOCAL DATA
          </button>
        )}
      </div>
    </div>
  );
};
