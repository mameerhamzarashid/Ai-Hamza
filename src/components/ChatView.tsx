import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Mic, Paperclip, Plus, Sparkles, Volume2, VolumeX,
  CheckCircle2, Brain, MessageSquare, Wrench, RefreshCw, X, FileText, ChevronDown
} from 'lucide-react';
import { Message, Conversation, Task, Memory, WhatsAppDraft, UserSettings, NavTab } from '../types';
import { SpeechHelper } from '../utils/voice';

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

  const handleSend = () => {
    if ((!inputText.trim() && !selectedFile) || isGenerating) return;
    onSendMessage(inputText, selectedFile || undefined);
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

  const quickPrompts = [
    'Kal 5 baje Ali ko call karna hai.',
    'Mere pending tasks dikhao.',
    'Ahmed wali task complete karo.',
    'Meri memory dikhao.',
    'Ali ko WhatsApp message likho ke meeting kal hai.',
    'English mein jawab do.',
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto pb-16">
      {/* Top Conversation Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-t-2xl p-3 flex items-center justify-between shrink-0 shadow-sm relative z-20">
        <div className="relative">
          <button
            onClick={() => setShowHistoryDropdown(!showHistoryDropdown)}
            className="flex items-center gap-2 text-xs font-bold text-white hover:text-emerald-400 transition-colors bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800"
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span className="truncate max-w-[180px]">{activeConv?.title || 'Chat Session'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* History Dropdown */}
          {showHistoryDropdown && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-30 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between px-2 py-1 mb-1 border-b border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Conversations</span>
                <button
                  onClick={() => {
                    onNewConversation();
                    setShowHistoryDropdown(false);
                  }}
                  className="text-[11px] text-emerald-400 font-semibold hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> New
                </button>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => {
                      onSelectConversation(conv.id);
                      setShowHistoryDropdown(false);
                    }}
                    className={`w-full text-left p-2 rounded-xl text-xs truncate transition-colors ${
                      conv.id === activeConversationId
                        ? 'bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/30'
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

        <button
          onClick={onNewConversation}
          className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          New Chat
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-slate-950/60 border-x border-slate-800 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
            >
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 px-1">{msg.timestamp}</span>
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
                className={`max-w-[88%] sm:max-w-[78%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-sm font-sans whitespace-pre-wrap ${
                  isUser
                    ? 'bg-emerald-600 text-white rounded-br-none font-medium'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none'
                }`}
              >
                {msg.text}

                {/* Structured Action Outcome Cards */}
                {!isUser && msg.actionType && msg.actionType !== 'none' && msg.actionData && (
                  <div className="mt-3 pt-2.5 border-t border-slate-800 text-left">
                    {msg.actionType === 'create_task' && msg.actionData.task && (
                      <div className="bg-slate-950/90 border border-emerald-500/30 rounded-xl p-3 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-emerald-400 uppercase flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Task Created
                          </span>
                          <span className="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                            {msg.actionData.task.priority || 'medium'}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-white">{msg.actionData.task.title}</p>
                        {msg.actionData.task.dueTime && (
                          <p className="text-[10px] text-slate-400">
                            Due Time: {msg.actionData.task.dueTime}
                          </p>
                        )}
                        <button
                          onClick={() => onNavigate('tasks')}
                          className="mt-1 text-[10px] text-emerald-400 hover:underline font-semibold"
                        >
                          View in Task Manager →
                        </button>
                      </div>
                    )}

                    {msg.actionType === 'add_memory' && msg.actionData.memory && (
                      <div className="bg-slate-950/90 border border-indigo-500/30 rounded-xl p-3 space-y-1.5">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase flex items-center gap-1">
                          <Brain className="w-3.5 h-3.5" /> Memory Saved
                        </span>
                        <p className="text-xs font-semibold text-slate-200">
                          {msg.actionData.memory.key}: {msg.actionData.memory.value}
                        </p>
                        <button
                          onClick={() => onNavigate('memory')}
                          className="text-[10px] text-indigo-400 hover:underline font-semibold"
                        >
                          View Memories →
                        </button>
                      </div>
                    )}

                    {msg.actionType === 'whatsapp_draft' && msg.actionData.whatsapp && (
                      <div className="bg-slate-950/90 border border-emerald-500/30 rounded-xl p-3 space-y-2">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase flex items-center gap-1">
                          <Wrench className="w-3.5 h-3.5" /> WhatsApp Message Draft
                        </span>
                        <p className="text-[11px] text-slate-300">
                          Recipient: <b>{msg.actionData.whatsapp.recipientName}</b>
                        </p>
                        <p className="text-xs text-slate-200 bg-slate-900 p-2 rounded-lg italic">
                          "{msg.actionData.whatsapp.messageText}"
                        </p>
                        <button
                          onClick={() =>
                            onOpenWhatsAppModal({
                              id: 'draft-temp',
                              recipientName: msg.actionData?.whatsapp?.recipientName || 'Contact',
                              messageText: msg.actionData?.whatsapp?.messageText || '',
                              status: 'draft',
                              createdAt: new Date().toISOString(),
                            })
                          }
                          className="w-full py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] text-center"
                        >
                          Preview & Send Draft
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isGenerating && (
          <div className="flex items-center gap-2 text-slate-400 text-xs py-2 px-3 bg-slate-900/80 rounded-2xl border border-slate-800 w-fit animate-pulse">
            <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
            <span>Hamza AI soch raha hai...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Prompt Suggestions Pills */}
      <div className="bg-slate-950 border-x border-slate-800 p-2 overflow-x-auto whitespace-nowrap flex gap-1.5 scrollbar-none shrink-0">
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => {
              setInputText(prompt);
            }}
            className="text-[11px] text-slate-300 bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800 px-3 py-1 rounded-full transition-colors shrink-0"
          >
            {prompt}
          </button>
        ))}
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
          placeholder="Type in Roman Urdu or English..."
          rows={1}
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none max-h-24 font-sans"
        />

        <button
          onClick={handleSend}
          disabled={(!inputText.trim() && !selectedFile) || isGenerating}
          className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold transition-all shrink-0 shadow-md shadow-emerald-500/20"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
