import React from 'react';
import { MessageSquare, CheckSquare, Brain, Wrench, Settings } from 'lucide-react';
import { NavTab } from '../types';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  pendingTasksCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  pendingTasksCount,
}) => {
  const tabs: { id: NavTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'chat', label: 'Console', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'tasks', label: 'Tasks', icon: <CheckSquare className="w-4 h-4" />, badge: pendingTasksCount },
    { id: 'memory', label: 'Memory', icon: <Brain className="w-4 h-4" /> },
    { id: 'tools', label: 'Tools', icon: <Wrench className="w-4 h-4" /> },
    { id: 'settings', label: 'Config', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-emerald-500/20 backdrop-blur-xl pb-safe">
      <div className="max-w-md mx-auto px-3 py-2 flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-150 font-mono ${
                isActive
                  ? 'text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/30 shadow-xs shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-emerald-300 hover:bg-slate-900/60'
              }`}
            >
              <div className="relative">
                {tab.icon}
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-2.5 bg-emerald-400 text-slate-950 text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs font-mono">
                    {tab.badge > 9 ? '9+' : tab.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[10px] mt-1 tracking-wider uppercase font-semibold">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
