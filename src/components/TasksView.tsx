import React, { useState } from 'react';
import { 
  CheckSquare, Plus, Search, Calendar, Clock, 
  Trash2, Edit3, CheckCircle2, Circle, Sparkles, X, Terminal 
} from 'lucide-react';
import { Task, Priority } from '../types';

interface TasksViewProps {
  tasks: Task[];
  onAddTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleTaskStatus: (taskId: string) => void;
  onParseNaturalLanguageCommand: (command: string) => Promise<any>;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onToggleTaskStatus,
  onParseNaturalLanguageCommand,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'today' | 'upcoming' | 'completed' | 'high'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueTime, setDueTime] = useState('17:00');
  const [category, setCategory] = useState('Personal');
  const [naturalInput, setNaturalInput] = useState('');
  const [isParsing, setIsParsing] = useState(false);

  const openAddModal = () => {
    setTitle('');
    setNotes('');
    setPriority('medium');
    setDueDate(new Date().toISOString().split('T')[0]);
    setDueTime('17:00');
    setCategory('Personal');
    setNaturalInput('');
    setEditingTask(null);
    setShowAddModal(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setNotes(task.notes || '');
    setPriority(task.priority);
    setDueDate(task.dueDate || new Date().toISOString().split('T')[0]);
    setDueTime(task.dueTime || '12:00');
    setCategory(task.category || 'Personal');
    setShowAddModal(true);
  };

  const handleSave = () => {
    if (!title.trim()) return;
    if (editingTask) {
      onUpdateTask({
        ...editingTask,
        title,
        notes,
        priority,
        dueDate,
        dueTime,
        category,
      });
    } else {
      onAddTask({
        title,
        notes,
        priority,
        dueDate,
        dueTime,
        status: 'pending',
        category,
      });
    }
    setShowAddModal(false);
  };

  const handleNaturalParse = async () => {
    if (!naturalInput.trim()) return;
    setIsParsing(true);
    try {
      const parsed = await onParseNaturalLanguageCommand(naturalInput);
      if (parsed.title) setTitle(parsed.title);
      if (parsed.notes) setNotes(parsed.notes);
      if (parsed.priority) setPriority(parsed.priority as Priority);
      if (parsed.dueDate) setDueDate(parsed.dueDate);
      if (parsed.dueTime) setDueTime(parsed.dueTime);
      if (parsed.category) setCategory(parsed.category);
    } catch {}
    setIsParsing(false);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.notes && t.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterTab === 'today') return t.dueDate === todayStr && t.status === 'pending';
    if (filterTab === 'upcoming') return t.dueDate && t.dueDate > todayStr && t.status === 'pending';
    if (filterTab === 'completed') return t.status === 'completed';
    if (filterTab === 'high') return t.priority === 'high' && t.status === 'pending';

    return true;
  });

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200 font-sans">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2 font-mono">
            <CheckSquare className="w-5 h-5 text-emerald-400" />
            TASK_ENGINE
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Active task schedule & reminders
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          ADD TASK
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/80 font-mono"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none font-mono">
          {[
            { id: 'all', label: '[ALL]' },
            { id: 'today', label: '[TODAY]' },
            { id: 'upcoming', label: '[UPCOMING]' },
            { id: 'high', label: '[HIGH_PRIO]' },
            { id: 'completed', label: '[COMPLETED]' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id as any)}
              className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition-all ${
                filterTab === tab.id
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-xs shadow-emerald-500/10'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-2">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-10 bg-slate-900/60 rounded-2xl border border-slate-800 font-mono">
            <CheckSquare className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-300">NO MATCHING TASKS</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Queue a task above or command Hamza AI in chat.
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isDone = task.status === 'completed';
            return (
              <div
                key={task.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isDone
                    ? 'bg-slate-950/40 border-slate-800/50 opacity-60'
                    : 'bg-slate-900/80 border-slate-800 hover:border-emerald-500/30'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <button
                      onClick={() => onToggleTaskStatus(task.id)}
                      className="mt-0.5 text-slate-500 hover:text-emerald-400 transition-colors shrink-0"
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-500 hover:text-emerald-400" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <h4
                        className={`text-xs font-bold ${
                          isDone ? 'line-through text-slate-500' : 'text-white'
                        }`}
                      >
                        {task.title}
                      </h4>

                      {task.notes && (
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug line-clamp-2">
                          {task.notes}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 font-mono mt-1.5">
                        {task.dueDate && (
                          <span className="flex items-center gap-1 text-slate-300">
                            <Calendar className="w-3 h-3 text-emerald-400" />
                            {task.dueDate}
                          </span>
                        )}
                        {task.dueTime && (
                          <span className="flex items-center gap-1 text-emerald-400">
                            <Clock className="w-3 h-3" />
                            {task.dueTime}
                          </span>
                        )}
                        {task.category && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-950 text-slate-300 border border-slate-800 font-semibold">
                            {task.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 font-mono">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase ${
                        task.priority === 'high'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          : task.priority === 'medium'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {task.priority}
                    </span>

                    <button
                      onClick={() => openEditModal(task)}
                      className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="p-1 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-emerald-500/30 w-full max-w-md rounded-2xl shadow-2xl p-4 space-y-3 font-sans">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 font-mono">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-emerald-400" />
                {editingTask ? 'EDIT_TASK' : 'CREATE_TASK'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!editingTask && (
              <div className="bg-slate-950 border border-emerald-500/30 p-2.5 rounded-xl space-y-1.5 font-mono">
                <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> NATURAL_LANG_PARSER
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={naturalInput}
                    onChange={(e) => setNaturalInput(e.target.value)}
                    placeholder='e.g. "Kal 5 baje Ali ko call karna hai"'
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    onClick={handleNaturalParse}
                    disabled={isParsing}
                    className="px-2.5 py-1 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-emerald-400 disabled:opacity-50"
                  >
                    {isParsing ? '...' : 'PARSE'}
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2.5 text-left">
              <div>
                <label className="text-[10px] font-bold text-slate-400 font-mono uppercase block mb-1">
                  TITLE *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Task title"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 font-mono uppercase block mb-1">
                  NOTES
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional parameters / notes..."
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                    PRIORITY
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                    CATEGORY
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                    DUE_DATE
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                    DUE_TIME
                  </label>
                  <input
                    type="time"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800 font-mono">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-xl"
              >
                CANCEL
              </button>
              <button
                onClick={handleSave}
                disabled={!title.trim()}
                className="px-3.5 py-1.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl disabled:opacity-50"
              >
                SAVE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
