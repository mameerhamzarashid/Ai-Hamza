import React, { useState } from 'react';
import { 
  CheckSquare, Plus, Search, Calendar, Clock, AlertCircle, 
  Trash2, Edit3, CheckCircle2, Circle, Filter, Sparkles, X 
} from 'lucide-react';
import { Task, Priority, TaskStatus } from '../types';

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

  // Modal Form State
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

  // Filtering Logic
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
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Header & Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-emerald-400" />
            Task Manager
          </h2>
          <p className="text-xs text-slate-400">
            Organize & schedule your daily tasks in Urdu or English
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Task
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
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: 'All' },
            { id: 'today', label: 'Today' },
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'high', label: 'High Priority' },
            { id: 'completed', label: 'Completed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all ${
                filterTab === tab.id
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Task Cards List */}
      <div className="space-y-2.5">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-10 bg-slate-900/60 rounded-2xl border border-slate-800">
            <CheckSquare className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-300">No tasks found</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Add a task manually or ask Hamza AI in chat!
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
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <button
                      onClick={() => onToggleTaskStatus(task.id)}
                      className="mt-0.5 text-slate-400 hover:text-emerald-400 transition-colors shrink-0"
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-500" />
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
                        <p className="text-[11px] text-slate-400 mt-1 leading-snug line-clamp-2">
                          {task.notes}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 mt-2">
                        {task.dueDate && (
                          <span className="flex items-center gap-1 text-slate-300">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            {task.dueDate}
                          </span>
                        )}
                        {task.dueTime && (
                          <span className="flex items-center gap-1 text-emerald-400 font-mono">
                            <Clock className="w-3 h-3" />
                            {task.dueTime}
                          </span>
                        )}
                        {task.category && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium">
                            {task.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        task.priority === 'high'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : task.priority === 'medium'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {task.priority}
                    </span>

                    <button
                      onClick={() => openEditModal(task)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-5 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">
                {editingTask ? 'Edit Task' : 'Create New Task'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* AI Natural Language Quick Parse Input */}
            {!editingTask && (
              <div className="bg-emerald-950/30 border border-emerald-500/30 p-3 rounded-xl space-y-2">
                <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Quick Parse in Urdu/English
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={naturalInput}
                    onChange={(e) => setNaturalInput(e.target.value)}
                    placeholder='e.g. "Kal 5 baje Ali ko call karna hai"'
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    onClick={handleNaturalParse}
                    disabled={isParsing}
                    className="px-3 py-1.5 bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-emerald-400 disabled:opacity-50"
                  >
                    {isParsing ? 'Parsing...' : 'Parse'}
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Call Ahmed regarding project"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">
                  Notes / Details
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional instructions..."
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Work, Personal..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">
                    Due Time
                  </label>
                  <input
                    type="time"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!title.trim()}
                className="px-4 py-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl disabled:opacity-50"
              >
                {editingTask ? 'Update Task' : 'Save Task'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
