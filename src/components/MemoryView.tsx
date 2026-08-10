import React, { useState } from 'react';
import { Brain, Plus, Search, Trash2, Edit3, ShieldCheck, Tag, X, Terminal } from 'lucide-react';
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
    <div className="space-y-4 pb-24 animate-in fade-in duration-200 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2 font-mono">
            <Brain className="w-5 h-5 text-emerald-400" />
            MEMORY_CORE
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Persistent personal facts learned by Hamza AI
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          ADD MEMORY
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-slate-900 border border-emerald-500/30 p-3 rounded-2xl flex items-start gap-2 text-xs text-slate-200 font-mono">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <p className="leading-snug">
          [SECURE_PERSISTENCE] Memory entries inform Hamza AI's responses in Roman Urdu or English.
        </p>
      </div>

      {/* Search & Filter */}
      <div className="space-y-2 font-mono">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search memory vault..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition-all ${
              activeCategory === 'all'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            [ALL]
          </button>
          {Object.entries(categoryLabels).map(([catKey, label]) => (
            <button
              key={catKey}
              onClick={() => setActiveCategory(catKey)}
              className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition-all ${
                activeCategory === catKey
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              [{label.toUpperCase()}]
            </button>
          ))}
        </div>
      </div>

      {/* Memories List */}
      <div className="space-y-2">
        {filteredMemories.length === 0 ? (
          <div className="text-center py-10 bg-slate-900/60 rounded-2xl border border-slate-800 font-mono">
            <Brain className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-300">NO MEMORIES STORED</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Add custom preferences or command "Isko yaad rakhna" in chat.
            </p>
          </div>
        ) : (
          filteredMemories.map((mem) => (
            <div
              key={mem.id}
              className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/30 transition-all flex items-start justify-between gap-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1 font-mono">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                    <Tag className="w-3 h-3 text-emerald-400" />
                    {categoryLabels[mem.category] || mem.category}
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-950 text-slate-400 border border-slate-800">
                    {mem.source === 'ai_detected' ? 'AI_LEARNED' : 'USER_ADDED'}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-white font-mono">{mem.key}</h4>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed font-sans">
                  {mem.value}
                </p>
              </div>

              <div className="flex items-center gap-1 shrink-0 font-mono">
                <button
                  onClick={() => openEditModal(mem)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDeleteMemory(mem.id)}
                  className="p-1 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-emerald-500/30 w-full max-w-md rounded-2xl shadow-2xl p-4 space-y-3 font-sans">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2 font-mono">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-emerald-400" />
                {editingMemory ? 'EDIT_MEMORY' : 'STORE_MEMORY'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-left font-mono">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  CATEGORY
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as MemoryCategory)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
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
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  SUBJECT / KEY *
                </label>
                <input
                  type="text"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="e.g. Favorite Language, Office Hours"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-sans"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  DETAIL / FACT *
                </label>
                <textarea
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="e.g. Prefers Roman Urdu and concise responses"
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-sans"
                />
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
                disabled={!key.trim() || !value.trim()}
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
