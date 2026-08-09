export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'completed';

export interface Task {
  id: string;
  title: string;
  notes?: string;
  priority: Priority;
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  status: TaskStatus;
  category?: string;
  createdAt: string;
}

export type MemoryCategory = 'personal' | 'preference' | 'contact' | 'project' | 'goal' | 'other';

export interface Memory {
  id: string;
  category: MemoryCategory;
  key: string;
  value: string;
  source: 'ai_detected' | 'user_added';
  createdAt: string;
}

export interface WhatsAppDraft {
  id: string;
  recipientName: string;
  phone?: string;
  messageText: string;
  status: 'draft' | 'sent' | 'cancelled';
  createdAt: string;
}

export type ActionType = 
  | 'none'
  | 'create_task'
  | 'complete_task'
  | 'add_memory'
  | 'whatsapp_draft'
  | 'web_search'
  | 'toggle_setting';

export interface MessageActionData {
  task?: Partial<Task>;
  memory?: Partial<Memory>;
  whatsapp?: Partial<WhatsAppDraft>;
  searchQuery?: string;
}

export interface Message {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  actionType?: ActionType;
  actionData?: MessageActionData;
  actionCompleted?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  lastMessageAt: string;
  messages: Message[];
}

export interface ToolItem {
  id: string;
  name: string;
  iconName: string;
  description: string;
  status: 'connected' | 'not_connected';
  category: string;
  badge?: string;
}

export interface UserSettings {
  assistantName: string;
  userName: string;
  language: 'roman_urdu' | 'english' | 'urdu';
  theme: 'system' | 'light' | 'dark';
  notificationsEnabled: boolean;
  confirmImportantActions: boolean;
  autoSpeech: boolean;
}

export type NavTab = 'dashboard' | 'chat' | 'tasks' | 'memory' | 'tools' | 'settings';
