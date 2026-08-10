import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, Image, Film, Globe, MessageSquare, CheckSquare, 
  ArrowRight, Search, Zap, Clock, ChevronRight, Radio
} from 'lucide-react';
import { CygnusLogo } from './CygnusLogo';
import { NavTab, Conversation, Task, Memory } from '../types';

interface HomeViewProps {
  userName?: string;
  onNavigate: (tab: NavTab) => void;
  onQuickActionPrompt: (prompt: string, targetTab?: NavTab) => void;
  conversations: Conversation[];
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
  tasks: Task[];
  memories: Memory[];
  onOpenLiveVoice?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  userName = 'Hamza',
  onNavigate,
  onQuickActionPrompt,
  conversations,
  onSelectConversation,
  tasks,
  memories,
  onOpenLiveVoice,
}) => {
  const [quickInput, setQuickInput] = useState('');

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    onQuickActionPrompt(quickInput.trim(), 'chat');
    setQuickInput('');
  };

  const quickActions = [
    {
      id: 'ask',
      title: 'Ask Anything',
      subtitle: 'Ask coding, research, writing or reasoning questions',
      icon: <Sparkles className="w-5 h-5 text-cyan-400" />,
      gradient: 'from-cyan-500/10 via-indigo-500/5 to-transparent border-cyan-500/30 hover:border-cyan-400',
      glow: 'group-hover:shadow-cyan-500/20',
      tab: 'chat' as NavTab,
      preset: 'How can CYGNUS AI assist you today?',
    },
    {
      id: 'image',
      title: 'Create Image',
      subtitle: 'Generate high-res visuals, concept art & UI mockups',
      icon: <Image className="w-5 h-5 text-purple-400" />,
      gradient: 'from-purple-500/10 via-indigo-500/5 to-transparent border-purple-500/30 hover:border-purple-400',
      glow: 'group-hover:shadow-purple-500/20',
      tab: 'create' as NavTab,
      preset: 'Generate a futuristic cyberpunk city logo for CYGNUS AI',
    },
    {
      id: 'video',
      title: 'Create Video',
      subtitle: 'Produce motion video clips & AI animations',
      icon: <Film className="w-5 h-5 text-indigo-400" />,
      gradient: 'from-indigo-500/10 via-blue-500/5 to-transparent border-indigo-500/30 hover:border-indigo-400',
      glow: 'group-hover:shadow-indigo-500/20',
      tab: 'create' as NavTab,
      preset: 'Create a cinematic video loop of a glowing Cygnus constellation',
    },
    {
      id: 'search',
      title: 'Search Web',
      subtitle: 'Live web intelligence & grounded factual analysis',
      icon: <Globe className="w-5 h-5 text-sky-400" />,
      gradient: 'from-sky-500/10 via-cyan-500/5 to-transparent border-sky-500/30 hover:border-sky-400',
      glow: 'group-hover:shadow-sky-500/20',
      tab: 'chat' as NavTab,
      preset: 'Search the web for the latest breakthrough in AI agent frameworks',
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp',
      subtitle: 'Draft and automate WhatsApp messages & updates',
      icon: <MessageSquare className="w-5 h-5 text-emerald-400" />,
      gradient: 'from-emerald-500/10 via-teal-500/5 to-transparent border-emerald-500/30 hover:border-emerald-400',
      glow: 'group-hover:shadow-emerald-500/20',
      tab: 'chat' as NavTab,
      preset: 'Draft a WhatsApp message to Ali regarding project delivery',
    },
    {
      id: 'tasks',
      title: 'Tasks',
      subtitle: 'Manage autonomous schedules & recurring reminders',
      icon: <CheckSquare className="w-5 h-5 text-amber-400" />,
      gradient: 'from-amber-500/10 via-orange-500/5 to-transparent border-amber-500/30 hover:border-amber-400',
      glow: 'group-hover:shadow-amber-500/20',
      tab: 'tasks' as NavTab,
      preset: '',
    },
  ];

  const pendingTasks = tasks.filter((t) => t.status === 'pending');

  return (
    <div className="flex flex-col items-center justify-between min-h-[calc(100vh-7rem)] py-6 px-2 sm:px-4 max-w-4xl mx-auto">
      {/* Top Hero Section */}
      <div className="w-full flex flex-col items-center text-center my-auto">
        {/* Glowing Centered Cygnus Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative mb-6"
        >
          {/* Ambient Glow */}
          <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/30 via-indigo-500/30 to-purple-500/30 rounded-full blur-2xl opacity-60 animate-pulse" />
          <CygnusLogo size="xl" animated={true} />
        </motion.div>

        {/* Welcome Titles */}
        <motion.div
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-2 mb-6"
        >
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-sans">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400">Cygnus</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-md mx-auto font-medium">
            Your intelligent personal AI.
          </p>

          {onOpenLiveVoice && (
            <div className="pt-2">
              <button
                onClick={onOpenLiveVoice}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/20 via-indigo-500/20 to-purple-500/20 border border-cyan-500/40 text-cyan-300 hover:text-white font-mono font-bold text-xs shadow-lg shadow-cyan-500/10 hover:border-cyan-400 transition-all hover:scale-105"
              >
                <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span>CYGNUS REAL-TIME LIVE VOICE MODE</span>
              </button>
            </div>
          )}
        </motion.div>

        {/* Immediate Input Bar */}
        <motion.form
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          onSubmit={handleQuickSubmit}
          className="w-full max-w-xl relative mb-10 group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-indigo-500/20 to-purple-500/20 rounded-2xl blur-md opacity-50 group-hover:opacity-100 transition-opacity" />
          <div className="relative flex items-center bg-slate-900/90 border border-slate-800 group-hover:border-cyan-500/50 rounded-2xl p-2 shadow-xl shadow-black/40 backdrop-blur-xl transition-all">
            <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
            <input
              type="text"
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              placeholder={`Ask CYGNUS AI anything, ${userName}...`}
              className="w-full bg-transparent px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!quickInput.trim()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-40 text-white font-medium text-xs flex items-center gap-1.5 transition-all shadow-md shadow-cyan-500/20 active:scale-95 shrink-0"
            >
              <span>Ask</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.form>

        {/* Quick Action Grid */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5"
        >
          {quickActions.map((action) => (
            <motion.button
              key={action.id}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (action.preset) {
                  onQuickActionPrompt(action.preset, action.tab);
                } else {
                  onNavigate(action.tab);
                }
              }}
              className={`group relative text-left p-4 rounded-2xl bg-slate-900/80 border ${action.gradient} backdrop-blur-md shadow-lg transition-all ${action.glow}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 shadow-inner">
                  {action.icon}
                </div>
                <div className="w-6 h-6 rounded-full bg-slate-950/60 border border-slate-800 flex items-center justify-center text-slate-500 group-hover:text-cyan-400 group-hover:border-cyan-500/40 transition-colors">
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
              <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                {action.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {action.subtitle}
              </p>
            </motion.button>
          ))}
        </motion.div>
      </div>

      {/* Bottom Quick Context Bar (Recent conversations + Pending task count) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="w-full max-w-xl mt-8 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400"
      >
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>{conversations.length} Active Sessions</span>
        </div>

        {pendingTasks.length > 0 ? (
          <button
            onClick={() => onNavigate('tasks')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span>{pendingTasks.length} Pending Tasks</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        ) : (
          <div className="flex items-center gap-1.5 text-slate-500">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>System Ready</span>
          </div>
        )}
      </motion.div>
    </div>
  );
};
