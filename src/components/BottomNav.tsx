import React from 'react';
import { LayoutDashboard, MessageSquare, CheckSquare, Brain, Wrench, Settings } from 'lucide-react';
import { NavTab } from '../types';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  pendingTasksCount: number;
  memoriesCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  pendingTasksCount,
}) => {
  const tabs: { id: NavTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: 'Home', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'chat', label: 'Chat', icon: <MessageSquare className="w-5 h-5" /> },
    { id: 'tasks', label: 'Tasks', icon: <CheckSquare className="w-5 h-5" />, badge: pendingTasksCount },
    { id: 'memory', label: 'Memory', icon: <Brain className="w-5 h-5" /> },
    { id: 'tools', label: 'Tools', icon: <Wrench className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 dark:bg-slate-950/95 border-t border-slate-800/80 backdrop-blur-lg pb-safe">
      <div className="max-w-md mx-auto px-2 py-1.5 flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-emerald-400 font-semibold bg-emerald-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <div className="relative">
                {tab.icon}
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-2 bg-emerald-500 text-slate-950 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-md shadow-emerald-500/30">
                    {tab.badge > 9 ? '9+' : tab.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-0 w-5 h-0.5 bg-emerald-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
