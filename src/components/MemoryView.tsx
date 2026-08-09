import React, { useState } from 'react';
import { Brain, Plus, Search, Trash2, Edit3, ShieldCheck, Tag, X, UserCheck } from 'lucide-react';
import { Memory, MemoryCategory } from '../types';

interface MemoryViewProps {
  memories: Memory[];
  onAddMemory: (memory: Omit<Memory, 'id' | 'createdAt'>) => void;
  onUpdateMemory: (memory: Memory) => void;
  onDeleteMemory: (memoryId: string) => void;
}

export const MemoryView: React.FC<MemoryViewProps> = ({
  memories,
  onAddMemory,
  onUpdateMemory,
  onDeleteMemory,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);

  // Form State
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [category, setCategory] = useState<MemoryCategory>('personal');

  const openAddModal = () => {
    setKey('');
    setValue('');
    setCategory('personal');
    setEditingMemory(null);
    setShowAddModal(true);
  };

  const openEditModal = (mem: Memory) => {
    setEditingMemory(mem);
    setKey(mem.key);
    setValue(mem.value);
    setCategory(mem.category);
    setShowAddModal(true);
  };

  const handleSave = () => {
    if (!key.trim() || !value.trim()) return;

    if (editingMemory) {
      onUpdateMemory({
        ...editingMemory,
        key,
        value,
        category,
      });
    } else {
      onAddMemory({
        key,
        value,
        category,
        source: 'user_added',
      });
    }
    setShowAddModal(false);
  };

  const filteredMemories = memories.filter((m) => {
    const matchesSearch =
      m.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.value.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (activeCategory !== 'all' && m.category !== activeCategory) return false;

    return true;
  });

  const categoryLabels: Record<MemoryCategory, string> = {
    personal: 'Personal',
    preference: 'Preferences',
    contact: 'Contacts',
    project: 'Projects',
    goal: 'Goals',
    other: 'Other',
  };

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Brain className="w-5 h-5 text-indigo-400" />
            AI Saved Memory
          </h2>
          <p className="text-xs text-slate-400">
            Information saved about you that informs Hamza AI's responses
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-3.5 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Memory
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-indigo-950/40 border border-indigo-800/40 p-3 rounded-2xl flex items-start gap-2.5 text-xs text-indigo-200">
        <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <p className="leading-snug">
          These memories are saved locally in your browser. Hamza AI uses them to give personalized answers in Roman Urdu or English.
        </p>
      </div>

      {/* Search & Category Filter */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search memories..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all ${
              activeCategory === 'all'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                : 'bg-slate-900 text-slate-400 border border-slate-800'
            }`}
          >
            All
          </button>
          {Object.entries(categoryLabels).map(([catKey, label]) => (
            <button
              key={catKey}
              onClick={() => setActiveCategory(catKey)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all ${
                activeCategory === catKey
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                  : 'bg-slate-900 text-slate-400 border border-slate-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Memories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredMemories.length === 0 ? (
          <div className="col-span-full text-center py-10 bg-slate-900/60 rounded-2xl border border-slate-800">
            <Brain className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-300">No memories found</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Add custom preferences or key contacts for your assistant.
            </p>
          </div>
        ) : (
          filteredMemories.map((mem) => (
            <div
              key={mem.id}
              className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {categoryLabels[mem.category] || mem.category}
                  </span>
                  <span
                    className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${
                      mem.source === 'ai_detected'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {mem.source === 'ai_detected' ? 'AI Learned' : 'User Added'}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-white">{mem.key}</h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 font-sans">
                  {mem.value}
                </p>
              </div>

              <div className="flex items-center justify-end gap-1.5 mt-3 pt-2 border-t border-slate-800/60">
                <button
                  onClick={() => openEditModal(mem)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                  title="Edit Memory"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDeleteMemory(mem.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                  title="Delete Memory"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Memory Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">
                {editingMemory ? 'Edit Memory' : 'Add New Memory'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as MemoryCategory)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="personal">Personal Info</option>
                  <option value="preference">Preference</option>
                  <option value="contact">Contact Info</option>
                  <option value="project">Active Project</option>
                  <option value="goal">Long-term Goal</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">
                  Memory Name / Subject *
                </label>
                <input
                  type="text"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="e.g. Favorite Language, Contact Ali, Goal"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">
                  Memory Value / Fact Detail *
                </label>
                <textarea
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="e.g. Roman Urdu mixed with English, Ali handles tech lead position"
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
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
                disabled={!key.trim() || !value.trim()}
                className="px-4 py-2 text-xs font-bold bg-indigo-500 hover:bg-indigo-400 text-slate-950 rounded-xl disabled:opacity-50"
              >
                {editingMemory ? 'Update Memory' : 'Save Memory'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
