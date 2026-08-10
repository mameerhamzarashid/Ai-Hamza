import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, Mic, Paperclip, Image as ImageIcon, Sparkles, Volume2, VolumeX,
  CheckCircle2, Brain, MessageSquare, FileText,
  Clock, ArrowRight, Zap, CheckSquare, Copy, RotateCcw, X, Trash2, Check, Search, Mail, Film
} from 'lucide-react';
import { Message, Conversation, Task, Memory, WhatsAppDraft, UserSettings, NavTab } from '../types';
import { SpeechHelper } from '../utils/voice';
import { WhatsAppCard } from './WhatsAppCard';
import { EmailCard } from './EmailCard';
import { WebSearchCard } from './WebSearchCard';
import { ConfirmationCard } from './ConfirmationCard';
import { CygnusLogo } from './CygnusLogo';

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
  onConfirmSensitiveAction?: (msgId: string, actionData: any) => void;
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
  onConfirmSensitiveAction,
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConv = conversations.find((c) => c.id === activeConversationId) || conversations[0];
  const messages = activeConv ? activeConv.messages : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  // Auto-expand textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputText]);

  const handleSend = (textToSend?: string) => {
    const query = textToSend || inputText;
    if ((!query.trim() && !selectedFile) || isGenerating) return;
    onSendMessage(query, selectedFile || undefined);
    setInputText('');
    setSelectedFile(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
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

  const quickChips = [
    { label: 'Create Image', icon: <ImageIcon className="w-3 h-3 text-purple-400" />, tab: 'create' as NavTab },
    { label: 'Create Video', icon: <Film className="w-3 h-3 text-indigo-400" />, tab: 'create' as NavTab },
    { label: 'Search Web', icon: <Search className="w-3 h-3 text-cyan-400" />, prompt: 'Search the web for ' },
    { label: 'WhatsApp', icon: <MessageSquare className="w-3 h-3 text-emerald-400" />, prompt: 'Draft a WhatsApp message to ' },
    { label: 'Tasks', icon: <CheckSquare className="w-3 h-3 text-amber-400" />, tab: 'tasks' as NavTab },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-3xl mx-auto relative font-sans">
      {/* Session History Drawer */}
      <AnimatePresence>
        {showHistoryDrawer && (
          <div className="fixed inset-0 z-50 flex">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" 
              onClick={onCloseHistoryDrawer} 
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-80 max-w-[85vw] bg-slate-950 border-r border-slate-800 h-full p-4 flex flex-col z-10 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <CygnusLogo size="sm" />
                  <span className="text-xs font-bold text-white font-mono tracking-wider">
                    SESSIONS
                  </span>
                </div>
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
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-cyan-500/20"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>NEW SESSION</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-1 py-2 text-xs">
                {conversations.map((conv) => {
                  const isActive = conv.id === activeConversationId;
                  return (
                    <div
                      key={conv.id}
                      className={`group flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer ${
                        isActive
                          ? 'bg-cyan-500/10 text-cyan-300 font-bold border border-cyan-500/30'
                          : 'text-slate-300 hover:bg-slate-900 hover:text-cyan-200'
                      }`}
                      onClick={() => {
                        onSelectConversation(conv.id);
                        onCloseHistoryDrawer();
                      }}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-70 text-cyan-400" />
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
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto px-2 sm:px-4 py-4 space-y-5">
        {messages.length <= 1 ? (
          /* Empty Chat Welcome State */
          <div className="py-8 px-2 max-w-lg mx-auto text-center space-y-4">
            <div className="relative inline-block mb-1">
              <CygnusLogo size="lg" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                CYGNUS AI Workspace
              </h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Ask questions in Roman Urdu or English, create images, search live web data, and manage schedule tasks.
              </p>
            </div>
          </div>
        ) : (
          /* Messages Stream */
          messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start group`}
              >
                {/* Assistant Cygnus Icon Badge */}
                {!isUser && (
                  <div className="mt-1 shrink-0">
                    <CygnusLogo size="sm" showText={false} />
                  </div>
                )}

                {/* Message Bubble */}
                <div className={`flex flex-col max-w-[85%] sm:max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`p-3.5 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                      isUser
                        ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-medium rounded-2xl rounded-tr-xs shadow-md shadow-cyan-600/10'
                        : 'bg-slate-900/90 border border-slate-800/80 text-slate-100 rounded-2xl rounded-tl-xs shadow-xs backdrop-blur-md'
                    }`}
                  >
                    {msg.text}

                    {/* WhatsApp Action Card */}
                    {!isUser && msg.actionType === 'whatsapp_draft' && msg.actionData?.whatsapp && (
                      <div className="mt-3">
                        <WhatsAppCard draft={msg.actionData.whatsapp} />
                      </div>
                    )}

                    {/* Email Action Card */}
                    {!isUser && msg.actionType === 'email_draft' && msg.actionData?.email && (
                      <div className="mt-3">
                        <EmailCard draft={msg.actionData.email} />
                      </div>
                    )}

                    {/* Web Search Card */}
                    {!isUser && msg.actionType === 'web_search' && (
                      <div className="mt-3">
                        <WebSearchCard
                          query={msg.actionData?.searchQuery}
                          summary={msg.actionData?.workflowSummary}
                        />
                      </div>
                    )}

                    {/* Sensitive Action Confirmation Card */}
                    {!isUser && msg.actionType === 'confirmation_required' && msg.actionData?.confirmation && (
                      <div className="mt-3">
                        <ConfirmationCard
                          confirmation={msg.actionData.confirmation}
                          onConfirm={() => {
                            if (onConfirmSensitiveAction) {
                              onConfirmSensitiveAction(msg.id, msg.actionData);
                            }
                          }}
                          onCancel={() => {}}
                        />
                      </div>
                    )}

                    {/* Task Queued Notification */}
                    {!isUser && msg.actionType === 'create_task' && msg.actionData?.task && (
                      <div className="mt-3 bg-slate-950/90 border border-cyan-500/30 rounded-xl p-3 space-y-1.5 text-left text-slate-200">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> [TASK QUEUED]
                          </span>
                          <span className="text-[9px] font-mono font-bold bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/20 uppercase">
                            {msg.actionData.task.priority || 'medium'}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-white">{msg.actionData.task.title}</p>
                        <button
                          onClick={() => onNavigate('tasks')}
                          className="text-[11px] text-cyan-400 font-mono font-medium hover:underline flex items-center gap-1 pt-1"
                        >
                          View Tasks <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    {/* Memory Stored Notification */}
                    {!isUser && msg.actionType === 'add_memory' && msg.actionData?.memory && (
                      <div className="mt-3 bg-slate-950/90 border border-cyan-500/30 rounded-xl p-3 space-y-1.5 text-left text-slate-200">
                        <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                          <Brain className="w-3.5 h-3.5" /> [MEMORY STORED]
                        </span>
                        <p className="text-xs font-medium text-slate-100">
                          <span className="font-bold text-cyan-400">{msg.actionData.memory.key}:</span> {msg.actionData.memory.value}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Message Action Tools */}
                  <div className="flex items-center gap-3 mt-1.5 px-1 text-[10px] text-slate-400 font-mono">
                    <span>{msg.timestamp}</span>

                    {!isUser && (
                      <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleCopyText(msg.id, msg.text)}
                          className="hover:text-cyan-400 transition-colors flex items-center gap-0.5"
                          title="Copy text"
                        >
                          {copiedMsgId === msg.id ? (
                            <Check className="w-3 h-3 text-cyan-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>

                        <button
                          onClick={() => handleToggleSpeech(msg.id, msg.text)}
                          className="hover:text-cyan-400 transition-colors"
                          title="Read aloud"
                        >
                          {speakingMsgId === msg.id ? (
                            <VolumeX className="w-3 h-3 text-cyan-400" />
                          ) : (
                            <Volume2 className="w-3 h-3" />
                          )}
                        </button>

                        <button
                          onClick={handleRegenerate}
                          className="hover:text-cyan-400 transition-colors"
                          title="Regenerate response"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}

        {/* AI Generating State */}
        {isGenerating && (
          <div className="flex items-center gap-2.5 text-cyan-400 text-xs font-mono py-2.5 px-3.5 bg-slate-900/90 rounded-2xl w-fit border border-cyan-500/30 animate-pulse">
            <CygnusLogo size="sm" animated={true} />
            <span>CYGNUS AI THINKING...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Chips Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 px-1 scrollbar-none">
        {quickChips.map((chip, i) => (
          <button
            key={i}
            onClick={() => {
              if (chip.tab) {
                onNavigate(chip.tab);
              } else if (chip.prompt) {
                setInputText(chip.prompt);
                textareaRef.current?.focus();
              }
            }}
            className="px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 text-[11px] text-slate-300 hover:text-white flex items-center gap-1.5 shrink-0 transition-colors"
          >
            {chip.icon}
            <span>{chip.label}</span>
          </button>
        ))}
      </div>

      {/* Selected File Chip */}
      {selectedFile && (
        <div className="bg-slate-900 border border-cyan-500/30 rounded-xl px-3 py-1.5 flex items-center justify-between text-xs text-slate-200 mb-2 font-mono">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
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

      {/* Large Modern Message Composer */}
      <div className="p-2.5 bg-slate-900/95 border border-slate-800 focus-within:border-cyan-500/50 rounded-2xl shadow-2xl flex items-end gap-2 shrink-0 mb-14 backdrop-blur-xl transition-all">
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

        {/* Attachment Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2.5 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors shrink-0"
          title="Attach file or document"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        {/* Voice Button */}
        <button
          onClick={toggleMic}
          className={`p-2.5 rounded-xl transition-all shrink-0 ${
            isListening
              ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30'
              : 'text-slate-400 hover:text-cyan-400 hover:bg-slate-800'
          }`}
          title={isListening ? 'Listening...' : 'Voice input'}
        >
          <Mic className="w-4 h-4" />
        </button>

        {/* Quick Image Mode Switcher Button */}
        <button
          onClick={() => onNavigate('create')}
          className="p-2.5 rounded-xl text-slate-400 hover:text-purple-400 hover:bg-slate-800 transition-colors shrink-0 hidden sm:block"
          title="Create Image or Video"
        >
          <ImageIcon className="w-4 h-4" />
        </button>

        {/* Auto-expanding Text Area */}
        <textarea
          ref={textareaRef}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message CYGNUS AI in Roman Urdu, English..."
          rows={1}
          className="flex-1 bg-transparent text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none resize-none max-h-32 leading-relaxed py-1.5"
        />

        {/* Send Button */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => handleSend()}
          disabled={(!inputText.trim() && !selectedFile) || isGenerating}
          className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold disabled:opacity-30 transition-all shrink-0 shadow-md shadow-cyan-500/20"
        >
          <Send className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
};
