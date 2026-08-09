import { Task, Memory, WhatsAppDraft, UserSettings, Conversation, ToolItem } from '../types';

const STORAGE_KEYS = {
  TASKS: 'hamza_ai_tasks_v1',
  MEMORIES: 'hamza_ai_memories_v1',
  CONVERSATIONS: 'hamza_ai_conversations_v1',
  SETTINGS: 'hamza_ai_settings_v1',
  WHATSAPP_DRAFTS: 'hamza_ai_whatsapp_drafts_v1',
  ACTIVE_CONVERSATION_ID: 'hamza_ai_active_conv_id_v1',
};

const INITIAL_SETTINGS: UserSettings = {
  assistantName: 'Hamza AI',
  userName: 'Hamza',
  language: 'roman_urdu',
  theme: 'dark',
  notificationsEnabled: true,
  confirmImportantActions: true,
  autoSpeech: false,
};

const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Call Ahmed regarding project update',
    notes: 'Discuss the mobile screen redesign and API specs',
    priority: 'high',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '17:00',
    status: 'pending',
    category: 'Work',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'task-2',
    title: 'Ali ko meeting time confirm karna',
    notes: 'Kal shaam 5 baje Zoom call',
    priority: 'medium',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    dueTime: '15:00',
    status: 'pending',
    category: 'Reminders',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'task-3',
    title: 'Review Q3 strategy document',
    notes: 'Check budget allocations and key milestones',
    priority: 'low',
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    dueTime: '11:00',
    status: 'completed',
    category: 'Planning',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

const INITIAL_MEMORIES: Memory[] = [
  {
    id: 'mem-1',
    category: 'personal',
    key: 'User Name',
    value: 'Hamza',
    source: 'user_added',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'mem-2',
    category: 'preference',
    key: 'Preferred Language',
    value: 'Roman Urdu (Mixed English)',
    source: 'user_added',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'mem-3',
    category: 'contact',
    key: 'Close Contact - Ali',
    value: 'Team lead for frontend projects (Preferred time: 3 PM - 6 PM)',
    source: 'ai_detected',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'mem-4',
    category: 'project',
    key: 'Active Project',
    value: 'Hamza AI Assistant Prototype Development',
    source: 'ai_detected',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'mem-5',
    category: 'goal',
    key: 'Long-term Goal',
    value: 'Automate daily workflow using mobile AI agents',
    source: 'user_added',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

const INITIAL_TOOLS: ToolItem[] = [
  {
    id: 'web_search',
    name: 'Web Research',
    iconName: 'Globe',
    description: 'Real-time search and fact checking via Gemini Search Grounding',
    status: 'connected',
    category: 'Intelligence',
    badge: 'Live',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Drafts',
    iconName: 'MessageSquare',
    description: 'Parse natural messages, find contacts, format drafts & open chat',
    status: 'not_connected',
    category: 'Communication',
    badge: 'Preview Ready',
  },
  {
    id: 'email',
    name: 'Email Helper (Gmail)',
    iconName: 'Mail',
    description: 'Draft, summarize, and outline response emails for review',
    status: 'not_connected',
    category: 'Communication',
  },
  {
    id: 'calendar',
    name: 'Google Calendar',
    iconName: 'Calendar',
    description: 'Schedule, check availability, and format event invites',
    status: 'not_connected',
    category: 'Productivity',
  },
  {
    id: 'notes',
    name: 'Quick Notes',
    iconName: 'FileText',
    description: 'Local workspace notes and instant summarize tool',
    status: 'connected',
    category: 'Productivity',
    badge: 'Local',
  },
  {
    id: 'files',
    name: 'File Manager',
    iconName: 'Folder',
    description: 'Upload and attach documents for text parsing',
    status: 'connected',
    category: 'Storage',
    badge: 'Local',
  },
  {
    id: 'computer_control',
    name: 'Computer Control',
    iconName: 'Monitor',
    description: 'Desktop agent automation and script execution bridge',
    status: 'not_connected',
    category: 'Automation',
  },
  {
    id: 'google_sheets',
    name: 'Google Sheets',
    iconName: 'Table',
    description: 'Read/write structured tabular data and reports',
    status: 'not_connected',
    category: 'Productivity',
  },
];

const INITIAL_CONVERSATION: Conversation = {
  id: 'conv-default',
  title: 'Welcome & Setup',
  createdAt: new Date().toISOString(),
  lastMessageAt: new Date().toISOString(),
  messages: [
    {
      id: 'msg-1',
      sender: 'assistant',
      text: 'Assalam-o-Alaikum Hamza! Main apka personal AI assistant **Hamza AI** hoon. Main apke daily tasks, reminders, memories aur message drafts manage kar sakta hoon.\n\nAap Roman Urdu ya English mein bol sakte hain, jaise:\n• *"Kal 5 baje Ali ko call karna hai."*\n• *"Mere pending tasks dikhao."*\n• *"Ali ko WhatsApp message likho ke meeting kal hai."*',
      timestamp: new Date(Date.now() - 300000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ],
};

// Helper methods for localStorage
export const storage = {
  getSettings(): UserSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...INITIAL_SETTINGS, ...JSON.parse(data) } : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  },
  saveSettings(settings: UserSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  getTasks(): Task[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TASKS);
      return data ? JSON.parse(data) : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  },
  saveTasks(tasks: Task[]): void {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  },

  getMemories(): Memory[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MEMORIES);
      return data ? JSON.parse(data) : INITIAL_MEMORIES;
    } catch {
      return INITIAL_MEMORIES;
    }
  },
  saveMemories(memories: Memory[]): void {
    localStorage.setItem(STORAGE_KEYS.MEMORIES, JSON.stringify(memories));
  },

  getWhatsAppDrafts(): WhatsAppDraft[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WHATSAPP_DRAFTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  saveWhatsAppDrafts(drafts: WhatsAppDraft[]): void {
    localStorage.setItem(STORAGE_KEYS.WHATSAPP_DRAFTS, JSON.stringify(drafts));
  },

  getConversations(): Conversation[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
      return data ? JSON.parse(data) : [INITIAL_CONVERSATION];
    } catch {
      return [INITIAL_CONVERSATION];
    }
  },
  saveConversations(conversations: Conversation[]): void {
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
  },

  getActiveConversationId(): string {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_CONVERSATION_ID) || 'conv-default';
  },
  setActiveConversationId(id: string): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_CONVERSATION_ID, id);
  },

  getTools(): ToolItem[] {
    return INITIAL_TOOLS;
  },
};
