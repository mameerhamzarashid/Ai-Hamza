import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Mic, Paperclip, Plus, Sparkles, Volume2, VolumeX,
  CheckCircle2, Brain, MessageSquare, Wrench, FileText, ChevronDown,
  Bot, Clock, ArrowRight, Zap, CheckSquare
} from 'lucide-react';
import { Message, Conversation, Task, Memory, WhatsAppDraft, UserSettings, NavTab } from '../types';
import { SpeechHelper } from '../utils/voice';
import { WhatsAppCard } from './WhatsAppCard';

interface ChatViewProps {
  conversations: Conversation[];
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onSendMessage: (text: string, attachment?: File) => void;
  isGenerating: boolean;
  tasks: Task[];
  memories: Memory[];
  onOpenWhatsAppModal: (draft: WhatsAppDraft) => void;
  onNavigate: (tab: NavTab) => void;
  settings: UserSettings;
}

export const ChatView: React.FC<ChatViewProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onSendMessage,
  isGenerating,
  tasks,
  memories,
  onOpenWhatsAppModal,
  onNavigate,
  settings,
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find((c) => c.id === activeConversationId) || conversations[0];
  const messages = activeConv ? activeConv.messages : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  const handleSend = (textToSend?: string) => {
    const query = textToSend || inputText;
    if ((!query.trim() && !selectedFile) || isGenerating) return;
    onSendMessage(query, selectedFile || undefined);
    setInputText('');
    setSelectedFile(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleMic = () => {
    if (isListening) {
      SpeechHelper.stopListening();
      setIsListening(false);
    } else {
      setIsListening(true);
      SpeechHelper.startListening(
        (transcript) => {
          setInputText((prev) => (prev ? prev + ' ' + transcript : transcript));
          setIsListening(false);
        },
        () => setIsListening(false),
        () => setIsListening(false)
      );
    }
  };

  const handleToggleSpeech = (msgId: string, text: string) => {
    if (speakingMsgId === msgId) {
      SpeechHelper.stopSpeaking();
      setSpeakingMsgId(null);
    } else {
      setSpeakingMsgId(msgId);
      SpeechHelper.speak(text);
    }
  };

  const quickCategories = [
    {
      title: 'WhatsApp Assistant',
      icon: <MessageSquare className="w-4 h-4 text-emerald-400" />,
      color: 'hover:border-emerald-500/50 hover:bg-emerald-950/30',
      prompts: [
        'WhatsApp message banao client ke liye',
        'Isko message likho',
        'Client ko reply do ke project ready hai',
      ],
    },
    {
      title: 'Tasks & Reminders',
      icon: <CheckSquare className="w-4 h-4 text-amber-400" />,
      color: 'hover:border-amber-500/50 hover:bg-amber-950/30',
      prompts: [
        'Kal 5 baje meeting ka reminder lagao',
        'Mere pending tasks dikhao',
        'Call Ali task finish kar do',
      ],
    },
    {
      title: 'Memory & Context',
      icon: <Brain className="w-4 h-4 text-indigo-400" />,
      color: 'hover:border-indigo-500/50 hover:bg-indigo-950/30',
      prompts: [
        'Mera Office timing 9am save karo',
        'Meri saved memories dikhao',
      ],
    },
    {
      title: 'General & Speed',
      icon: <Zap className="w-4 h-4 text-teal-400" />,
      color: 'hover:border-teal-500/50 hover:bg-teal-950/30',
      prompts: [
        'English mein jawab do',
        'Aaj ke din ki summary do',
      ],
    },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-4xl mx-auto pb-14">
      {/* Top Conversation Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-t-2xl p-3 flex items-center justify-between shrink-0 shadow-sm relative z-20">
        <div className="relative">
          <button
            onClick={() => setShowHistoryDropdown(!showHistoryDropdown)}
            className="flex items-center gap-2 text-xs font-bold text-white hover:text-emerald-400 transition-colors bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800"
          >
            <Bot className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate max-w-[180px]">{activeConv?.title || 'Chat Session'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>

          {/* History Dropdown */}
          {showHistoryDropdown && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-30 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between px-2 py-1.5 mb-1 border-b border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Conversations</span>
                <button
                  onClick={() => {
                    onNewConversation();
                    setShowHistoryDropdown(false);
                  }}
                  className="text-[11px] text-emerald-400 font-semibold hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> New Chat
                </button>
              </div>

              <div className="max-h-52 overflow-y-auto space-y-1">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => {
                      onSelectConversation(conv.id);
                      setShowHistoryDropdown(false);
                    }}
                    className={`w-full text-left p-2 rounded-xl text-xs truncate transition-colors ${
                      conv.id === activeConversationId
                        ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {conv.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNewConversation}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            New Chat
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-5 bg-slate-950/70 border-x border-slate-800/80 space-y-4">
        {messages.length <= 1 ? (
          /* ChatGPT Style Welcome Screen */
          <div className="py-6 px-2 sm:px-6 max-w-2xl mx-auto text-center space-y-6 animate-in fade-in duration-300">
            {/* Logo Emblem */}
            <div className="relative inline-block">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-indigo-600 p-0.5 shadow-xl shadow-emerald-500/20 mx-auto">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400 animate-pulse" />
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-extrabold text-[9px] uppercase tracking-wider shadow-sm">
                Hamza AI
              </span>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Assalam-o-Alaikum, {settings.userName || 'Hamza'}!
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
                Main Hamza AI hoon — aapka personal mobile AI assistant. WhatsApp messages, reminders, memory, aur sawalon mein madad kar sakta hoon.
              </p>
            </div>

            {/* Feature Prompt Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left pt-2">
              {quickCategories.map((cat, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 space-y-2 shadow-sm"
                >
                  <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2">
                    {cat.icon}
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      {cat.title}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {cat.prompts.map((p, pIdx) => (
                      <button
                        key={pIdx}
                        onClick={() => handleSend(p)}
                        className={`w-full text-left p-2 rounded-xl text-xs text-slate-300 border border-slate-800/60 bg-slate-950/50 ${cat.color} transition-all flex items-center justify-between group`}
                      >
                        <span className="truncate pr-2">"{p}"</span>
                        <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-emerald-400 shrink-0 transition-colors" />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Conversation Stream */
          messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-2 sm:gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start group animate-in fade-in duration-200`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold shadow-md ${
                    isUser
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-900 border border-emerald-500/30 text-emerald-400'
                  }`}
                >
                  {isUser ? (
                    'You'
                  ) : (
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                  )}
                </div>

                {/* Message Box */}
                <div className={`flex flex-col max-w-[85%] sm:max-w-[78%] ${isUser ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-[10px] text-slate-500 font-mono">{msg.timestamp}</span>
                    {!isUser && (
                      <button
                        onClick={() => handleToggleSpeech(msg.id, msg.text)}
                        className="text-slate-500 hover:text-emerald-400 transition-colors p-0.5"
                        title="Read aloud"
                      >
                        {speakingMsgId === msg.id ? (
                          <VolumeX className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>

                  <div
                    className={`p-3.5 sm:p-4 text-xs leading-relaxed font-sans whitespace-pre-wrap shadow-sm ${
                      isUser
                        ? 'bg-emerald-600 text-white rounded-2xl rounded-tr-xs font-medium'
                        : 'bg-slate-900 border border-slate-800/90 text-slate-100 rounded-2xl rounded-tl-xs'
                    }`}
                  >
                    {msg.text}

                    {/* WhatsApp Action Card */}
                    {!isUser && msg.actionType === 'whatsapp_draft' && msg.actionData?.whatsapp && (
                      <div className="mt-3">
                        <WhatsAppCard draft={msg.actionData.whatsapp} />
                      </div>
                    )}

                    {/* Task Created Card */}
                    {!isUser && msg.actionType === 'create_task' && msg.actionData?.task && (
                      <div className="mt-3 bg-slate-950/90 border border-emerald-500/30 rounded-2xl p-3.5 space-y-2 text-left">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Task Created
                          </span>
                          <span className="text-[9px] font-bold uppercase bg-slate-800 px-2 py-0.5 rounded-full text-slate-300">
                            {msg.actionData.task.priority || 'medium'}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-white">{msg.actionData.task.title}</p>
                        {msg.actionData.task.dueTime && (
                          <p className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-emerald-400" />
                            Due: {msg.actionData.task.dueTime}
                          </p>
                        )}
                        <button
                          onClick={() => onNavigate('tasks')}
                          className="mt-1 text-[11px] text-emerald-400 hover:underline font-semibold flex items-center gap-1"
                        >
                          Open Task Manager <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    {/* Memory Saved Card */}
                    {!isUser && msg.actionType === 'add_memory' && msg.actionData?.memory && (
                      <div className="mt-3 bg-slate-950/90 border border-indigo-500/30 rounded-2xl p-3.5 space-y-2 text-left">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Brain className="w-3.5 h-3.5" /> Memory Saved
                        </span>
                        <p className="text-xs font-semibold text-slate-200">
                          <span className="text-indigo-300">{msg.actionData.memory.key}:</span> {msg.actionData.memory.value}
                        </p>
                        <button
                          onClick={() => onNavigate('memory')}
                          className="text-[11px] text-indigo-400 hover:underline font-semibold flex items-center gap-1"
                        >
                          View Saved Memory <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {isGenerating && (
          <div className="flex items-center gap-3 text-slate-400 text-xs py-2.5 px-4 bg-slate-900/90 rounded-2xl border border-slate-800 w-fit animate-pulse shadow-sm">
            <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
            <span className="font-medium text-slate-300">Hamza AI is generating response...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Selected File Chip */}
      {selectedFile && (
        <div className="bg-slate-900 border-x border-slate-800 px-3 py-1.5 flex items-center justify-between text-xs text-slate-300 shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span className="truncate max-w-xs">{selectedFile.name}</span>
            <span className="text-[10px] text-slate-500">
              ({(selectedFile.size / 1024).toFixed(1)} KB)
            </span>
          </div>
          <button
            onClick={() => setSelectedFile(null)}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Input Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-b-2xl p-2.5 flex items-end gap-2 shrink-0 shadow-lg relative z-20">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              setSelectedFile(e.target.files[0]);
            }
          }}
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors shrink-0"
          title="Attach file"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        <button
          onClick={toggleMic}
          className={`p-2.5 rounded-xl transition-colors shrink-0 ${
            isListening
              ? 'bg-rose-500 text-white animate-bounce'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
          }`}
          title={isListening ? 'Stop listening' : 'Speak to AI'}
        >
          <Mic className="w-4 h-4" />
        </button>

        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Hamza AI (WhatsApp, tasks, memory)..."
          rows={1}
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none max-h-24 font-sans leading-relaxed"
        />

        <button
          onClick={() => handleSend()}
          disabled={(!inputText.trim() && !selectedFile) || isGenerating}
          className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold transition-all shrink-0 shadow-md shadow-emerald-500/20 active:scale-95"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
