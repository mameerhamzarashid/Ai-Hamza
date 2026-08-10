import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Mic, Paperclip, Terminal, Volume2, VolumeX,
  CheckCircle2, Brain, MessageSquare, FileText,
  Clock, ArrowRight, Zap, CheckSquare, Copy, RotateCcw, X, Trash2, Check, Search, ShieldCheck
} from 'lucide-react';
import { Message, Conversation, Task, Memory, WhatsAppDraft, UserSettings, NavTab } from '../types';
import { SpeechHelper } from '../utils/voice';
import { WhatsAppCard } from './WhatsAppCard';

interface ChatViewProps {
  conversations: Conversation[];
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onSendMessage: (text: string, attachment?: File) => void;
  isGenerating: boolean;
  tasks: Task[];
  memories: Memory[];
  onOpenWhatsAppModal: (draft: WhatsAppDraft) => void;
  onNavigate: (tab: NavTab) => void;
  settings: UserSettings;
  showHistoryDrawer: boolean;
  onCloseHistoryDrawer: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onSendMessage,
  isGenerating,
  tasks,
  memories,
  onOpenWhatsAppModal,
  onNavigate,
  settings,
  showHistoryDrawer,
  onCloseHistoryDrawer,
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

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

  const handleCopyText = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(msgId);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleRegenerate = () => {
    if (messages.length < 2 || isGenerating) return;
    const lastUserMsg = [...messages].reverse().find((m) => m.sender === 'user');
    if (lastUserMsg) {
      onSendMessage(lastUserMsg.text);
    }
  };

  const examplePrompts = [
    {
      code: '[01]',
      title: 'WhatsApp Payload',
      prompt: 'Client ko WhatsApp message draft kar do ke project complete ho gaya hai.',
      icon: <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />,
    },
    {
      code: '[02]',
      title: 'Schedule Task',
      prompt: 'Kal shaam 5 baje Ali ko call karne ka reminder lagao.',
      icon: <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />,
    },
    {
      code: '[03]',
      title: 'Save Memory',
      prompt: 'Mera office timing subah 9 baje hai, isko yaad rakhna.',
      icon: <Brain className="w-3.5 h-3.5 text-emerald-400" />,
    },
    {
      code: '[04]',
      title: 'Web Intel Search',
      prompt: 'Search the web for the latest updates on AI mobile assistants.',
      icon: <Search className="w-3.5 h-3.5 text-emerald-400" />,
    },
    {
      code: '[05]',
      title: 'Pending Tasks',
      prompt: 'Mere sabhi pending tasks aur reminders ki list dikhao.',
      icon: <Clock className="w-3.5 h-3.5 text-emerald-400" />,
    },
    {
      code: '[06]',
      title: 'Direct Query',
      prompt: 'Explain quantum computing in simple Roman Urdu.',
      icon: <Zap className="w-3.5 h-3.5 text-emerald-400" />,
    },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-3xl mx-auto relative font-sans">
      {/* History Slide Drawer */}
      {showHistoryDrawer && (
        <div className="fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" 
            onClick={onCloseHistoryDrawer} 
          />
          <div className="relative w-72 max-w-[80vw] bg-slate-950 border-r border-emerald-500/20 h-full p-4 flex flex-col z-10 animate-in slide-in-from-left duration-200 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-white font-mono tracking-wider flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                SESSION_LOGS
              </span>
              <button
                onClick={onCloseHistoryDrawer}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-3">
              <button
                onClick={() => {
                  onNewConversation();
                  onCloseHistoryDrawer();
                }}
                className="w-full py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/20"
              >
                <Terminal className="w-3.5 h-3.5" />
                NEW SESSION
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 py-2 font-mono text-xs">
              {conversations.map((conv) => {
                const isActive = conv.id === activeConversationId;
                return (
                  <div
                    key={conv.id}
                    className={`group flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer ${
                      isActive
                        ? 'bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/30'
                        : 'text-slate-300 hover:bg-slate-900 hover:text-emerald-300'
                    }`}
                    onClick={() => {
                      onSelectConversation(conv.id);
                      onCloseHistoryDrawer();
                    }}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-70 text-emerald-400" />
                      <span className="truncate">{conv.title}</span>
                    </div>

                    {conversations.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteConversation(conv.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 rounded transition-opacity"
                        title="Delete chat"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Messages / Welcome Container */}
      <div className="flex-1 overflow-y-auto px-2 sm:px-4 py-4 space-y-4">
        {messages.length <= 1 ? (
          /* Cyber Command Welcome Screen */
          <div className="py-6 px-2 max-w-xl mx-auto text-center space-y-5 animate-in fade-in duration-300">
            <div className="w-12 h-12 rounded-2xl bg-slate-900/90 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-500/10">
              <Terminal className="w-6 h-6" />
            </div>

            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                COMMAND_CENTER // ACTIVE
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight mt-2.5 font-mono">
                COMMAND CONSOLE // {settings.userName || 'USER_ADMIN'}
              </h2>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed max-w-md mx-auto">
                Private AI Command Center supporting Roman Urdu & English natural commands. Integrated task engine, persistent memory core, and web search intelligence.
              </p>
            </div>

            {/* Prompt Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left pt-2 font-mono">
              {examplePrompts.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(item.prompt)}
                  className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 text-xs transition-all flex items-start gap-2.5 group text-slate-300 hover:text-white shadow-xs"
                >
                  <div className="mt-0.5 p-1.5 rounded-xl bg-slate-950 border border-slate-800 group-hover:border-emerald-500/30 shrink-0">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-emerald-400">{item.code}</span>
                      <span className="font-bold text-white text-xs block truncate">{item.title}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-sans line-clamp-1 mt-0.5">
                      "{item.prompt}"
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Stream of Messages */
          messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start group animate-in fade-in duration-150`}
              >
                {/* AI Avatar icon */}
                {!isUser && (
                  <div className="w-7 h-7 rounded-xl bg-slate-900 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400 shadow-xs shadow-emerald-500/10 mt-1">
                    <Terminal className="w-3.5 h-3.5" />
                  </div>
                )}

                {/* Message Bubble Container */}
                <div className={`flex flex-col max-w-[85%] sm:max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`p-3.5 text-xs sm:text-sm leading-relaxed font-sans whitespace-pre-wrap ${
                      isUser
                        ? 'bg-emerald-600 text-slate-950 font-medium rounded-2xl rounded-tr-xs shadow-md shadow-emerald-600/10'
                        : 'bg-slate-900/90 border border-slate-800 text-slate-100 rounded-2xl rounded-tl-xs shadow-xs'
                    }`}
                  >
                    {msg.text}

                    {/* Compact WhatsApp Action Card */}
                    {!isUser && msg.actionType === 'whatsapp_draft' && msg.actionData?.whatsapp && (
                      <div className="mt-3">
                        <WhatsAppCard draft={msg.actionData.whatsapp} />
                      </div>
                    )}

                    {/* Compact Task Created Notification */}
                    {!isUser && msg.actionType === 'create_task' && msg.actionData?.task && (
                      <div className="mt-3 bg-slate-950/90 border border-emerald-500/30 rounded-xl p-3 space-y-1.5 text-left text-slate-200">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> [TASK_QUEUED]
                          </span>
                          <span className="text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 uppercase">
                            {msg.actionData.task.priority || 'medium'}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-white">{msg.actionData.task.title}</p>
                        <button
                          onClick={() => onNavigate('tasks')}
                          className="text-[11px] text-emerald-400 font-mono font-medium hover:underline flex items-center gap-1 pt-1"
                        >
                          OPEN TASKS <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    {/* Compact Memory Saved Notification */}
                    {!isUser && msg.actionType === 'add_memory' && msg.actionData?.memory && (
                      <div className="mt-3 bg-slate-950/90 border border-emerald-500/30 rounded-xl p-3 space-y-1.5 text-left text-slate-200">
                        <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                          <Brain className="w-3.5 h-3.5" /> [MEMORY_STORED]
                        </span>
                        <p className="text-xs font-medium text-slate-100">
                          <span className="font-bold text-emerald-400">{msg.actionData.memory.key}:</span> {msg.actionData.memory.value}
                        </p>
                        <button
                          onClick={() => onNavigate('memory')}
                          className="text-[11px] text-emerald-400 font-mono font-medium hover:underline flex items-center gap-1 pt-1"
                        >
                          OPEN MEMORY <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Message Tools (Copy, TTS, Timestamp) */}
                  <div className="flex items-center gap-3 mt-1.5 px-1 text-[10px] text-slate-400 font-mono">
                    <span>{msg.timestamp}</span>

                    {!isUser && (
                      <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleCopyText(msg.id, msg.text)}
                          className="hover:text-emerald-400 transition-colors flex items-center gap-0.5"
                          title="Copy text"
                        >
                          {copiedMsgId === msg.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>

                        <button
                          onClick={() => handleToggleSpeech(msg.id, msg.text)}
                          className="hover:text-emerald-400 transition-colors"
                          title="Read aloud"
                        >
                          {speakingMsgId === msg.id ? (
                            <VolumeX className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Volume2 className="w-3 h-3" />
                          )}
                        </button>

                        <button
                          onClick={handleRegenerate}
                          className="hover:text-emerald-400 transition-colors"
                          title="Regenerate response"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Typing / Generating Indicator */}
        {isGenerating && (
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono py-2 px-3 bg-slate-900/90 rounded-xl w-fit border border-emerald-500/30 animate-pulse">
            <Terminal className="w-3.5 h-3.5 animate-spin" />
            <span>PROCESSING COMMAND...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Selected File Chip */}
      {selectedFile && (
        <div className="bg-slate-900 border border-emerald-500/30 rounded-xl px-3 py-1.5 flex items-center justify-between text-xs text-slate-200 mb-2 font-mono">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span className="truncate max-w-xs">{selectedFile.name}</span>
            <span className="text-[10px] text-slate-400">
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

      {/* Cyber Input Bar */}
      <div className="p-2.5 bg-slate-900/95 border border-emerald-500/30 focus-within:border-emerald-400 focus-within:ring-1 focus-within:ring-emerald-400/30 rounded-2xl shadow-xl flex items-end gap-2 shrink-0 mb-14 transition-all">
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
          className="p-2 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors shrink-0"
          title="Attach Payload"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        <button
          onClick={toggleMic}
          className={`p-2 rounded-xl transition-colors shrink-0 ${
            isListening
              ? 'bg-rose-500 text-white animate-bounce'
              : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800'
          }`}
          title={isListening ? 'Stop listening' : 'Voice input'}
        >
          <Mic className="w-4 h-4" />
        </button>

        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type command or prompt in Roman Urdu / English..."
          rows={1}
          className="flex-1 bg-transparent text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none resize-none max-h-24 leading-relaxed font-sans py-1.5"
        />

        <button
          onClick={() => handleSend()}
          disabled={(!inputText.trim() && !selectedFile) || isGenerating}
          className="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold disabled:opacity-30 transition-all shrink-0 active:scale-95 shadow-md shadow-emerald-500/20"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
