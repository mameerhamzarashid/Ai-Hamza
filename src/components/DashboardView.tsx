import React from 'react';
import { 
  Sparkles, CheckSquare, Plus, Brain, MessageSquare, Wrench, 
  ArrowRight, Calendar, AlertCircle, Clock, ShieldCheck
} from 'lucide-react';
import { Task, Memory, NavTab, UserSettings } from '../types';

interface DashboardViewProps {
  settings: UserSettings;
  tasks: Task[];
  memories: Memory[];
  onNavigate: (tab: NavTab) => void;
  onOpenQuickTaskModal: () => void;
  onOpenQuickMemoryModal: () => void;
  onToggleTaskStatus: (taskId: string) => void;
  onOpenWhatsAppDraftModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  settings,
  tasks,
  memories,
  onNavigate,
  onOpenQuickTaskModal,
  onOpenQuickMemoryModal,
  onToggleTaskStatus,
  onOpenWhatsAppDraftModal,
}) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const pendingTasks = tasks.filter((t) => t.status === 'pending');
  const completedTasks = tasks.filter((t) => t.status === 'completed');
  const highPriorityTasks = pendingTasks.filter((t) => t.priority === 'high');

  return (
    <div className="space-y-5 pb-24 animate-in fade-in duration-200">
      {/* Top Banner Greeting */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/60 border border-slate-800 p-5 shadow-xl">
        <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
        
        <div className="flex items-start justify-between relative z-10">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium mb-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{todayStr}</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {getGreeting()}, {settings.userName || 'Hamza'}!
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
              Main Hamza AI hoon. Aapke <span className="text-emerald-400 font-semibold">{pendingTasks.length} pending tasks</span> aur <span className="text-teal-400 font-semibold">{memories.length} saved memories</span> active hain.
            </p>
          </div>

          <button
            onClick={() => onNavigate('chat')}
            className="p-3 rounded-2xl bg-emerald-500 text-slate-950 font-semibold shadow-lg shadow-emerald-500/20 hover:scale-105 transition-transform flex items-center justify-center shrink-0"
            title="Start Chat"
          >
            <Sparkles className="w-5 h-5 fill-slate-950" />
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2.5 mt-5 pt-4 border-t border-slate-800/80">
          <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800/60 text-center">
            <span className="text-lg font-extrabold text-amber-400">{pendingTasks.length}</span>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Pending</p>
          </div>
          <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800/60 text-center">
            <span className="text-lg font-extrabold text-emerald-400">{completedTasks.length}</span>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Done</p>
          </div>
          <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800/60 text-center">
            <span className="text-lg font-extrabold text-teal-400">{memories.length}</span>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Memories</p>
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5 px-1">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={onOpenQuickTaskModal}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/80 text-left transition-all group shadow-sm"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold text-white block">Create Task</span>
              <span className="text-[10px] text-slate-400">Natural Urdu input</span>
            </div>
          </button>

          <button
            onClick={() => onNavigate('chat')}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-teal-500/50 hover:bg-slate-800/80 text-left transition-all group shadow-sm"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold text-white block">Ask AI</span>
              <span className="text-[10px] text-slate-400">Roman Urdu Chat</span>
            </div>
          </button>

          <button
            onClick={onOpenQuickMemoryModal}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/80 text-left transition-all group shadow-sm"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold text-white block">Add Memory</span>
              <span className="text-[10px] text-slate-400">Save preference</span>
            </div>
          </button>

          <button
            onClick={onOpenWhatsAppDraftModal}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/80 text-left transition-all group shadow-sm"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold text-white block">WhatsApp</span>
              <span className="text-[10px] text-slate-400">Draft & Preview</span>
            </div>
          </button>
        </div>
      </div>

      {/* High Priority & Upcoming Tasks Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Upcoming Tasks ({pendingTasks.length})
            </h3>
          </div>
          <button
            onClick={() => onNavigate('tasks')}
            className="text-[11px] font-semibold text-emerald-400 hover:underline flex items-center gap-1"
          >
            View All
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {pendingTasks.length === 0 ? (
          <div className="text-center py-6 bg-slate-950/40 rounded-xl border border-slate-800/50">
            <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto mb-1.5 opacity-80" />
            <p className="text-xs font-semibold text-slate-300">All tasks completed!</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Shabash! Safe & clear workflow.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pendingTasks.slice(0, 3).map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <input
                    type="checkbox"
                    checked={task.status === 'completed'}
                    onChange={() => onToggleTaskStatus(task.id)}
                    className="w-4 h-4 rounded border-slate-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900 cursor-pointer"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-200 truncate">{task.title}</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                      {task.dueTime && (
                        <span className="flex items-center gap-1 text-emerald-400 font-mono">
                          <Clock className="w-2.5 h-2.5" />
                          {task.dueTime}
                        </span>
                      )}
                      {task.category && (
                        <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                          {task.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${
                    task.priority === 'high'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : task.priority === 'medium'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Memories & AI Facts */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Saved Context & Memories ({memories.length})
            </h3>
          </div>
          <button
            onClick={() => onNavigate('memory')}
            className="text-[11px] font-semibold text-indigo-400 hover:underline flex items-center gap-1"
          >
            Manage
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {memories.slice(0, 4).map((mem) => (
            <div
              key={mem.id}
              className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start justify-between"
            >
              <div className="min-w-0 pr-2">
                <span className="text-[10px] font-semibold text-indigo-300 block truncate">
                  {mem.key}
                </span>
                <span className="text-xs text-slate-200 block truncate">{mem.value}</span>
              </div>
              <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 shrink-0">
                {mem.category}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
