import React from 'react';
import { 
  Settings, User, Languages, Palette, Bell, ShieldAlert, 
  Brain, Wrench, Info, Check, RefreshCw 
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
  const handleChange = (key: keyof UserSettings, value: any) => {
    onUpdateSettings({
      ...settings,
      [key]: value,
    });
  };

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-emerald-400" />
          Assistant Settings
        </h2>
        <p className="text-xs text-slate-400">
          Customize Hamza AI personality, language, and privacy controls
        </p>
      </div>

      {/* Identity & Names */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <User className="w-4 h-4 text-emerald-400" />
          Profile & Identity
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">
              Your Name
            </label>
            <input
              type="text"
              value={settings.userName}
              onChange={(e) => handleChange('userName', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">
              Assistant Name
            </label>
            <input
              type="text"
              value={settings.assistantName}
              onChange={(e) => handleChange('assistantName', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Language & Behavior */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Languages className="w-4 h-4 text-teal-400" />
          Language & Response Preference
        </h3>

        <div>
          <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">
            Default Language
          </label>
          <select
            value={settings.language}
            onChange={(e) => handleChange('language', e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="roman_urdu">Roman Urdu (Default - Mix English)</option>
            <option value="english">English</option>
            <option value="urdu">Urdu Script</option>
          </select>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Palette className="w-4 h-4 text-amber-400" />
          Theme & Display
        </h3>

        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'dark', label: 'Dark Mode' },
            { id: 'light', label: 'Light Mode' },
            { id: 'system', label: 'System' },
          ].map((themeOpt) => (
            <button
              key={themeOpt.id}
              onClick={() => handleChange('theme', themeOpt.id)}
              className={`p-2.5 rounded-xl border text-xs font-medium text-center transition-all ${
                settings.theme === themeOpt.id
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-950 text-slate-400 border-slate-800'
              }`}
            >
              {themeOpt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Security & Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          Security & Actions
        </h3>

        <div className="space-y-2">
          <label className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer">
            <div>
              <span className="text-xs font-semibold text-white block">Action Confirmations</span>
              <span className="text-[10px] text-slate-400">
                Confirm before preparing external drafts or clearing tasks
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.confirmImportantActions}
              onChange={(e) => handleChange('confirmImportantActions', e.target.checked)}
              className="w-4 h-4 text-emerald-500 rounded border-slate-700 focus:ring-emerald-500"
            />
          </label>

          <label className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer">
            <div>
              <span className="text-xs font-semibold text-white block">Notifications</span>
              <span className="text-[10px] text-slate-400">
                Show task reminder toasts and action alerts
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.notificationsEnabled}
              onChange={(e) => handleChange('notificationsEnabled', e.target.checked)}
              className="w-4 h-4 text-emerald-500 rounded border-slate-700 focus:ring-emerald-500"
            />
          </label>
        </div>
      </div>

      {/* Shortcuts */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={() => onNavigate('memory')}
          className="p-3 bg-slate-900 border border-slate-800 rounded-2xl hover:border-indigo-500/40 text-left transition-all"
        >
          <Brain className="w-5 h-5 text-indigo-400 mb-1" />
          <span className="text-xs font-bold text-white block">Manage Memory</span>
          <span className="text-[10px] text-slate-400">View saved user context</span>
        </button>

        <button
          onClick={() => onNavigate('tools')}
          className="p-3 bg-slate-900 border border-slate-800 rounded-2xl hover:border-emerald-500/40 text-left transition-all"
        >
          <Wrench className="w-5 h-5 text-emerald-400 mb-1" />
          <span className="text-xs font-bold text-white block">Connected Tools</span>
          <span className="text-[10px] text-slate-400">Check API bridges</span>
        </button>
      </div>

      {/* About & Data Reset */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-teal-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              About Hamza AI
            </h3>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            v1.0.0 Pro
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Hamza AI is a mobile-first Personal AI Assistant supporting Roman Urdu & English natural language understanding, smart task management, local context memory, and preview drafts. Powered by server-side <b>Gemini 3.6 Flash</b>.
        </p>

        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => {
              if (confirm('Are you sure you want to reset all tasks, memories, and chat history to defaults?')) {
                onResetAllData();
              }
            }}
            className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 p-1"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset Local App Data
          </button>
        </div>
      </div>
    </div>
  );
};
