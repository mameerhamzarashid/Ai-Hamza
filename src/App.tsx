import React, { useState, useEffect } from 'react';
import { 
  Task, Memory, WhatsAppDraft, UserSettings, Conversation, Message, NavTab 
} from './types';
import { storage } from './utils/storage';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { Toast, ToastMessage } from './components/Toast';
import { WhatsAppModal } from './components/WhatsAppModal';
import { DashboardView } from './components/DashboardView';
import { ChatView } from './components/ChatView';
import { TasksView } from './components/TasksView';
import { MemoryView } from './components/MemoryView';
import { ToolsView } from './components/ToolsView';
import { SettingsView } from './components/SettingsView';

export default function App() {
  const [navTab, setNavTab] = useState<NavTab>('dashboard');
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(true);

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

  // Sync state changes to storage
  useEffect(() => {
    storage.saveSettings(settings);
    // Apply dark/light class to root document element
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
    showToast('Task Created', `"${newTask.title}" added to tasks.`);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    showToast('Task Updated', `"${updatedTask.title}" updated.`);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    showToast('Task Deleted', undefined, 'info');
  };

  const handleToggleTaskStatus = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextStatus = t.status === 'completed' ? 'pending' : 'completed';
          if (nextStatus === 'completed') {
            showToast('Task Completed! 🎉', `"${t.title}" marked completed.`);
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
    showToast('Memory Saved', `"${newMem.key}" added to memory.`);
  };

  const handleUpdateMemory = (updatedMem: Memory) => {
    setMemories((prev) => prev.map((m) => (m.id === updatedMem.id ? updatedMem : m)));
    showToast('Memory Updated');
  };

  const handleDeleteMemory = (memoryId: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== memoryId));
    showToast('Memory Removed', undefined, 'info');
  };

  // WhatsApp Draft Actions
  const handleSendWhatsAppConfirm = (draftId: string, updatedText: string) => {
    setWhatsappDrafts((prev) =>
      prev.map((d) => (d.id === draftId ? { ...d, messageText: updatedText, status: 'sent' } : d))
    );
    showToast('WhatsApp Text Prepared', 'Opening WhatsApp app...');
  };

  // Conversation & AI Actions
  const handleNewConversation = () => {
    const newConv: Conversation = {
      id: 'conv-' + Date.now(),
      title: 'Chat ' + (conversations.length + 1),
      createdAt: new Date().toISOString(),
      lastMessageAt: new Date().toISOString(),
      messages: [
        {
          id: 'msg-start',
          sender: 'assistant',
          text: `Assalam-o-Alaikum ${settings.userName || 'Hamza'}! Main Hamza AI hoon. Aaj main aapki kya madad kar sakta hoon?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newConv.id);
    showToast('New Chat Started');
  };

  const handleSendMessage = async (text: string, attachment?: File) => {
    const activeConv = conversations.find((c) => c.id === activeConversationId) || conversations[0];
    if (!activeConv) return;

    let fullPromptText = text;
    if (attachment) {
      fullPromptText += ` [Attached File: ${attachment.name}]`;
    }

    const userMsg: Message = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: fullPromptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...activeConv.messages, userMsg];

    // Update state immediately
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConv.id
          ? {
              ...c,
              lastMessageAt: new Date().toISOString(),
              messages: updatedMessages,
              title: c.messages.length === 1 ? text.slice(0, 24) + '...' : c.title,
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
          tasks,
          memories,
          userSettings: settings,
        }),
      });

      const data = await response.json();
      const replyText = data.replyText || 'Ji, main samajh gaya hoon.';
      const actionType = data.actionType || 'none';
      const actionData = data.actionData || {};

      // Execute side effects if AI triggered an action
      if (actionType === 'create_task' && actionData.task && actionData.task.title) {
        const newTask: Task = {
          id: 'task-' + Date.now(),
          title: actionData.task.title,
          notes: actionData.task.notes,
          priority: (actionData.task.priority as any) || 'medium',
          dueDate: actionData.task.dueDate || new Date().toISOString().split('T')[0],
          dueTime: actionData.task.dueTime || '17:00',
          status: 'pending',
          category: 'AI Auto',
          createdAt: new Date().toISOString(),
        };
        setTasks((prev) => [newTask, ...prev]);
        showToast('Task Created by AI', `"${newTask.title}"`);
      } else if (actionType === 'complete_task' && actionData.targetTaskId) {
        handleToggleTaskStatus(actionData.targetTaskId);
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
        showToast('Memory Saved by AI', `"${newMem.key}"`);
      } else if (actionType === 'whatsapp_draft' && actionData.whatsapp) {
        const newDraft: WhatsAppDraft = {
          id: 'draft-' + Date.now(),
          recipientName: actionData.whatsapp.recipientName || 'Contact',
          messageText: actionData.whatsapp.messageText || fullPromptText,
          status: 'draft',
          createdAt: new Date().toISOString(),
        };
        setWhatsappDrafts((prev) => [newDraft, ...prev]);
        showToast('WhatsApp Draft Ready', 'Preview available in Chat.');
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
        text: 'Apologies, server connection error. Please try again.',
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

  const pendingTasksCount = tasks.filter((t) => t.status === 'pending').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Header */}
      <Header
        settings={settings}
        onUpdateSettings={setSettings}
        isMobileFrame={isMobileFrame}
        onToggleMobileFrame={() => setIsMobileFrame(!isMobileFrame)}
      />

      {/* Main Container Wrapper (Responsive / Mobile Frame) */}
      <main className="flex-1 w-full flex justify-center py-2 px-2 sm:px-4">
        <div
          className={`w-full transition-all duration-300 ${
            isMobileFrame
              ? 'max-w-md bg-slate-950/90 border border-slate-800/80 rounded-3xl p-3 sm:p-4 shadow-2xl min-h-[calc(100vh-5rem)]'
              : 'max-w-4xl p-2 sm:p-4'
          }`}
        >
          {/* View Routing */}
          {navTab === 'dashboard' && (
            <DashboardView
              settings={settings}
              tasks={tasks}
              memories={memories}
              onNavigate={setNavTab}
              onOpenQuickTaskModal={() => setNavTab('tasks')}
              onOpenQuickMemoryModal={() => setNavTab('memory')}
              onToggleTaskStatus={handleToggleTaskStatus}
              onOpenWhatsAppDraftModal={() =>
                setActiveWhatsAppModalDraft({
                  id: 'draft-quick-test',
                  recipientName: 'Ali',
                  messageText: 'Assalam-o-Alaikum Ali, meeting shaam 5 baje confirm hai.',
                  status: 'draft',
                  createdAt: new Date().toISOString(),
                })
              }
            />
          )}

          {navTab === 'chat' && (
            <ChatView
              conversations={conversations}
              activeConversationId={activeConversationId}
              onSelectConversation={setActiveConversationId}
              onNewConversation={handleNewConversation}
              onSendMessage={handleSendMessage}
              isGenerating={isGenerating}
              tasks={tasks}
              memories={memories}
              onOpenWhatsAppModal={setActiveWhatsAppModalDraft}
              onNavigate={setNavTab}
              settings={settings}
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

      {/* WhatsApp Draft Preview Modal */}
      <WhatsAppModal
        draft={activeWhatsAppModalDraft}
        onClose={() => setActiveWhatsAppModalDraft(null)}
        onSendConfirm={handleSendWhatsAppConfirm}
      />

      {/* Global Toast Notifications */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Mobile-first Bottom Navigation Bar */}
      <BottomNav
        activeTab={navTab}
        onTabChange={setNavTab}
        pendingTasksCount={pendingTasksCount}
        memoriesCount={memories.length}
      />
    </div>
  );
}
