import React, { useState, useEffect } from 'react';
import { 
  Task, Memory, WhatsAppDraft, UserSettings, Conversation, Message, NavTab 
} from './types';
import { storage } from './utils/storage';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { Toast, ToastMessage } from './components/Toast';
import { WhatsAppModal } from './components/WhatsAppModal';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { LiveVoiceModal } from './components/LiveVoiceModal';
import { HomeView } from './components/HomeView';
import { CreateView } from './components/CreateView';
import { ChatView } from './components/ChatView';
import { TasksView } from './components/TasksView';
import { MemoryView } from './components/MemoryView';
import { ToolsView } from './components/ToolsView';
import { SettingsView } from './components/SettingsView';

export default function App() {
  const [navTab, setNavTab] = useState<NavTab>('home');
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(true);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState<boolean>(false);

  // Core state loaded from local storage
  const [settings, setSettings] = useState<UserSettings>(() => storage.getSettings());
  const [tasks, setTasks] = useState<Task[]>(() => storage.getTasks());
  const [memories, setMemories] = useState<Memory[]>(() => storage.getMemories());
  const [whatsappDrafts, setWhatsappDrafts] = useState<WhatsAppDraft[]>(() => storage.getWhatsAppDrafts());
  const [conversations, setConversations] = useState<Conversation[]>(() => storage.getConversations());
  const [activeConversationId, setActiveConversationId] = useState<string>(() => storage.getActiveConversationId());

  const [isGenerating, setIsGenerating] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [activeWhatsAppModalDraft, setActiveWhatsAppModalDraft] = useState<WhatsAppDraft | null>(null);
  const [isLiveVoiceOpen, setIsLiveVoiceOpen] = useState(false);

  const handleAddChatMessageFromVoice = (msg: { sender: 'user' | 'assistant'; text: string }) => {
    setConversations((prev) => {
      let activeId = activeConversationId;
      let list = [...prev];

      if (!activeId || !list.find((c) => c.id === activeId)) {
        const newConv: Conversation = {
          id: `conv_${Date.now()}`,
          title: msg.text.slice(0, 30) || 'Voice Session',
          createdAt: new Date().toISOString(),
          lastMessageAt: new Date().toISOString(),
          messages: [],
        };
        list.unshift(newConv);
        activeId = newConv.id;
        setActiveConversationId(activeId);
      }

      return list.map((c) => {
        if (c.id === activeId) {
          const newMessage: Message = {
            id: `msg_${Date.now()}_${Math.random()}`,
            sender: msg.sender,
            text: msg.text,
            timestamp: new Date().toISOString(),
          };
          return {
            ...c,
            messages: [...c.messages, newMessage],
            updatedAt: new Date().toISOString(),
          };
        }
        return c;
      });
    });
  };

  // Sync state changes to storage
  useEffect(() => {
    storage.saveSettings(settings);
    if (settings.theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, [settings]);

  useEffect(() => {
    storage.saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    storage.saveMemories(memories);
  }, [memories]);

  useEffect(() => {
    storage.saveWhatsAppDrafts(whatsappDrafts);
  }, [whatsappDrafts]);

  useEffect(() => {
    storage.saveConversations(conversations);
  }, [conversations]);

  useEffect(() => {
    storage.setActiveConversationId(activeConversationId);
  }, [activeConversationId]);

  const showToast = (title: string, message?: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({
      id: Date.now().toString(),
      title,
      message,
      type,
    });
  };

  // Task Actions
  const handleAddTask = (newTaskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...newTaskData,
      id: 'task-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
    showToast('Task Queued', `"${newTask.title}" added to active tasks.`);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    showToast('Task Updated', `"${updatedTask.title}" synchronized.`);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    showToast('Task Purged', undefined, 'info');
  };

  const handleToggleTaskStatus = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextStatus = t.status === 'completed' ? 'pending' : 'completed';
          if (nextStatus === 'completed') {
            showToast('Task Executed', `"${t.title}" marked complete.`);
          }
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
  };

  // Memory Actions
  const handleAddMemory = (newMemData: Omit<Memory, 'id' | 'createdAt'>) => {
    const newMem: Memory = {
      ...newMemData,
      id: 'mem-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setMemories((prev) => [newMem, ...prev]);
    showToast('Memory Encrypted', `"${newMem.key}" saved to memory core.`);
  };

  const handleUpdateMemory = (updatedMem: Memory) => {
    setMemories((prev) => prev.map((m) => (m.id === updatedMem.id ? updatedMem : m)));
    showToast('Memory Core Updated');
  };

  const handleDeleteMemory = (memoryId: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== memoryId));
    showToast('Memory Purged', undefined, 'info');
  };

  // WhatsApp Draft Actions
  const handleSendWhatsAppConfirm = (draftId: string, updatedText: string) => {
    setWhatsappDrafts((prev) =>
      prev.map((d) => (d.id === draftId ? { ...d, messageText: updatedText, status: 'sent' } : d))
    );
    showToast('Payload Ready', 'Launching WhatsApp client...');
  };

  // Conversation & AI Actions
  const handleNewConversation = () => {
    const newConv: Conversation = {
      id: 'conv-' + Date.now(),
      title: 'Session ' + (conversations.length + 1),
      createdAt: new Date().toISOString(),
      lastMessageAt: new Date().toISOString(),
      messages: [],
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newConv.id);
    showToast('New Session Initialized');
  };

  const handleDeleteConversation = (id: string) => {
    const updated = conversations.filter((c) => c.id !== id);
    if (updated.length === 0) {
      handleNewConversation();
    } else {
      setConversations(updated);
      if (activeConversationId === id) {
        setActiveConversationId(updated[0].id);
      }
    }
    showToast('Session Logs Cleared', undefined, 'info');
  };

  // Confirmation Execution Handler
  const handleConfirmSensitiveAction = (msgId: string, actionData: any) => {
    if (!actionData || !actionData.confirmation) return;
    const { actionKind, targetId } = actionData.confirmation;

    if (actionKind === 'delete_task' && targetId) {
      handleDeleteTask(targetId);
      showToast('Task Deleted', 'Removed from schedule', 'info');
    } else if (actionKind === 'delete_memory' && targetId) {
      handleDeleteMemory(targetId);
      showToast('Memory Purged', 'Purged from vault', 'info');
    } else if (actionKind === 'clear_all_data') {
      handleResetAllData();
      showToast('Data Purged', 'All local logs cleared', 'info');
    } else {
      showToast('Action Executed', 'Confirmed operation executed successfully.');
    }
  };

  const handleSendMessage = async (text: string, attachment?: File) => {
    let activeConv = conversations.find((c) => c.id === activeConversationId);
    if (!activeConv) {
      activeConv = conversations[0];
      if (!activeConv) {
        handleNewConversation();
        return;
      }
    }

    let fullPromptText = text;
    let filePayload: any = null;

    if (attachment) {
      fullPromptText += ` [Attachment: ${attachment.name}]`;

      // Read file contents
      try {
        if (attachment.type.startsWith('image/') || attachment.type === 'application/pdf') {
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const result = reader.result as string;
              const base64Data = result.split(',')[1] || result;
              resolve(base64Data);
            };
            reader.onerror = reject;
            reader.readAsDataURL(attachment);
          });
          filePayload = {
            name: attachment.name,
            type: attachment.type,
            content: base64,
          };
        } else {
          const textContent = await attachment.text();
          filePayload = {
            name: attachment.name,
            type: attachment.type || 'text/plain',
            content: textContent,
          };
        }
      } catch (err) {
        console.error('File reading error:', err);
      }
    }

    const userMsg: Message = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: fullPromptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...activeConv.messages, userMsg];

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConv.id
          ? {
              ...c,
              lastMessageAt: new Date().toISOString(),
              messages: updatedMessages,
              title: c.messages.length === 0 ? text.slice(0, 24) + '...' : c.title,
            }
          : c
      )
    );

    setIsGenerating(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: fullPromptText,
          history: updatedMessages,
          fileData: filePayload,
          tasks,
          memories,
          userSettings: settings,
        }),
      });

      const data: any = await response.json();
      const replyText = data.replyText || 'Command processed.';
      const actionType = data.actionType || 'none';
      const actionData = data.actionData || {};

      if (actionType === 'create_task' && actionData.task && actionData.task.title) {
        const newTask: Task = {
          id: 'task-' + Date.now(),
          title: actionData.task.title,
          notes: actionData.task.notes,
          priority: (actionData.task.priority as any) || 'medium',
          dueDate: actionData.task.dueDate || new Date().toISOString().split('T')[0],
          dueTime: actionData.task.dueTime || '17:00',
          recurring: (actionData.task.recurring as any) || 'none',
          status: 'pending',
          category: actionData.task.category || 'AI Auto',
          createdAt: new Date().toISOString(),
        };
        setTasks((prev) => [newTask, ...prev]);
        showToast('Task Queued', `"${newTask.title}"`);
      } else if (actionType === 'complete_task' && actionData.targetTaskId) {
        handleToggleTaskStatus(actionData.targetTaskId);
      } else if (actionType === 'delete_task' && actionData.targetTaskId) {
        handleDeleteTask(actionData.targetTaskId);
        showToast('Task Deleted', undefined, 'info');
      } else if (actionType === 'add_memory' && actionData.memory && actionData.memory.key) {
        const newMem: Memory = {
          id: 'mem-' + Date.now(),
          category: (actionData.memory.category as any) || 'personal',
          key: actionData.memory.key,
          value: actionData.memory.value || fullPromptText,
          source: 'ai_detected',
          createdAt: new Date().toISOString(),
        };
        setMemories((prev) => [newMem, ...prev]);
        showToast('Memory Stored', `"${newMem.key}"`);
      } else if (actionType === 'delete_memory' && actionData.targetMemoryId) {
        handleDeleteMemory(actionData.targetMemoryId);
        showToast('Memory Purged', undefined, 'info');
      } else if (actionType === 'whatsapp_draft' && actionData.whatsapp) {
        const newDraft: WhatsAppDraft = {
          id: 'draft-' + Date.now(),
          recipientName: actionData.whatsapp.recipientName || 'Contact',
          messageText: actionData.whatsapp.messageText || fullPromptText,
          status: 'draft',
          createdAt: new Date().toISOString(),
        };
        setWhatsappDrafts((prev) => [newDraft, ...prev]);
        showToast('WhatsApp Payload Ready', 'Preview in Chat.');
      }

      const aiMsg: Message = {
        id: 'msg-ai-' + Date.now(),
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionType,
        actionData,
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConv.id
            ? { ...c, lastMessageAt: new Date().toISOString(), messages: [...c.messages, aiMsg] }
            : c
        )
      );
    } catch (err) {
      const errorMsg: Message = {
        id: 'msg-err-' + Date.now(),
        sender: 'assistant',
        text: '[SYS_ERR] Transmission interrupted. Please re-send query.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setConversations((prev) =>
        prev.map((c) => (c.id === activeConv.id ? { ...c, messages: [...c.messages, errorMsg] } : c))
      );
    }

    setIsGenerating(false);
  };

  const handleParseNaturalLanguageCommand = async (command: string) => {
    const res = await fetch('/api/parse-command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command }),
    });
    return res.json();
  };

  const handleResetAllData = () => {
    localStorage.clear();
    window.location.reload();
  };

  const handleQuickActionPrompt = (promptText: string, targetTab: NavTab = 'chat') => {
    setNavTab(targetTab);
    if (targetTab === 'chat' && promptText) {
      handleSendMessage(promptText);
    }
  };

  const pendingTasksCount = tasks.filter((t) => t.status === 'pending').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased flex flex-col selection:bg-cyan-500 selection:text-slate-950 transition-colors">
      {/* Header */}
      <Header
        settings={settings}
        onUpdateSettings={setSettings}
        isMobileFrame={isMobileFrame}
        onToggleMobileFrame={() => setIsMobileFrame(!isMobileFrame)}
        onNewChat={handleNewConversation}
        onToggleHistoryDrawer={() => setShowHistoryDrawer(!showHistoryDrawer)}
        onOpenLiveVoice={() => setIsLiveVoiceOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full flex justify-center py-2 px-2 sm:px-4 bg-radial from-slate-900/60 via-slate-950 to-slate-950">
        <div
          className={`w-full transition-all duration-200 ${
            isMobileFrame
              ? 'max-w-md bg-slate-900/80 backdrop-blur-xl border border-cyan-500/20 rounded-3xl p-2 sm:p-4 shadow-2xl shadow-cyan-950/40 min-h-[calc(100vh-5rem)]'
              : 'max-w-4xl p-2 sm:p-4'
          }`}
        >
          {navTab === 'home' && (
            <HomeView
              userName={settings.userName}
              onNavigate={setNavTab}
              onQuickActionPrompt={handleQuickActionPrompt}
              conversations={conversations}
              activeConversationId={activeConversationId}
              onSelectConversation={setActiveConversationId}
              tasks={tasks}
              memories={memories}
              onOpenLiveVoice={() => setIsLiveVoiceOpen(true)}
            />
          )}

          {navTab === 'create' && (
            <CreateView
              onSendToChat={(promptText) => {
                setNavTab('chat');
                handleSendMessage(promptText);
              }}
              onNavigate={setNavTab}
            />
          )}

          {navTab === 'chat' && (
            <ChatView
              conversations={conversations}
              activeConversationId={activeConversationId}
              onSelectConversation={setActiveConversationId}
              onNewConversation={handleNewConversation}
              onDeleteConversation={handleDeleteConversation}
              onSendMessage={handleSendMessage}
              isGenerating={isGenerating}
              tasks={tasks}
              memories={memories}
              onOpenWhatsAppModal={setActiveWhatsAppModalDraft}
              onNavigate={setNavTab}
              settings={settings}
              showHistoryDrawer={showHistoryDrawer}
              onCloseHistoryDrawer={() => setShowHistoryDrawer(false)}
              onConfirmSensitiveAction={handleConfirmSensitiveAction}
              onOpenLiveVoice={() => setIsLiveVoiceOpen(true)}
            />
          )}

          {navTab === 'tasks' && (
            <TasksView
              tasks={tasks}
              onAddTask={handleAddTask}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              onToggleTaskStatus={handleToggleTaskStatus}
              onParseNaturalLanguageCommand={handleParseNaturalLanguageCommand}
            />
          )}

          {navTab === 'memory' && (
            <MemoryView
              memories={memories}
              onAddMemory={handleAddMemory}
              onUpdateMemory={handleUpdateMemory}
              onDeleteMemory={handleDeleteMemory}
            />
          )}

          {navTab === 'tools' && (
            <ToolsView
              tools={storage.getTools()}
              onOpenWhatsAppModal={setActiveWhatsAppModalDraft}
            />
          )}

          {navTab === 'settings' && (
            <SettingsView
              settings={settings}
              onUpdateSettings={setSettings}
              onNavigate={setNavTab}
              onResetAllData={handleResetAllData}
            />
          )}
        </div>
      </main>

      {/* WhatsApp Modal */}
      <WhatsAppModal
        draft={activeWhatsAppModalDraft}
        onClose={() => setActiveWhatsAppModalDraft(null)}
        onSendConfirm={handleSendWhatsAppConfirm}
      />

      {/* Gemini Live Voice Modal */}
      <LiveVoiceModal
        isOpen={isLiveVoiceOpen}
        onClose={() => setIsLiveVoiceOpen(false)}
        onAddChatMessage={handleAddChatMessageFromVoice}
        userName={settings.userName || 'Hamza'}
      />

      {/* Toast Notifications */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* PWA Install Banner */}
      <PWAInstallPrompt />

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={navTab}
        onTabChange={setNavTab}
        pendingTasksCount={pendingTasksCount}
      />
    </div>
  );
}
