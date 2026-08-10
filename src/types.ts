export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'completed';
export type RecurringFrequency = 'none' | 'daily' | 'weekly' | 'monthly';

export interface Task {
  id: string;
  title: string;
  notes?: string;
  priority: Priority;
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  status: TaskStatus;
  category?: string;
  recurring?: RecurringFrequency;
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

export interface EmailDraft {
  id: string;
  recipientEmail?: string;
  subject: string;
  body: string;
  createdAt: string;
}

export interface ConfirmationData {
  actionKind: 'delete_task' | 'delete_memory' | 'clear_all_data' | 'send_payload' | 'execute_workflow';
  actionTitle: string;
  actionDescription: string;
  targetId?: string;
}

export type ActionType = 
  | 'none'
  | 'create_task'
  | 'complete_task'
  | 'delete_task'
  | 'add_memory'
  | 'delete_memory'
  | 'whatsapp_draft'
  | 'email_draft'
  | 'web_search'
  | 'generate_image'
  | 'generate_video'
  | 'multi_step_workflow'
  | 'confirmation_required'
  | 'toggle_setting';

export interface SearchSource {
  title: string;
  uri: string;
}

export interface MessageActionData {
  task?: Partial<Task>;
  memory?: Partial<Memory>;
  whatsapp?: Partial<WhatsAppDraft>;
  email?: Partial<EmailDraft>;
  searchQuery?: string;
  searchSummary?: string;
  searchSources?: SearchSource[];
  confirmation?: ConfirmationData;
  targetTaskId?: string;
  targetMemoryId?: string;
  workflowSummary?: string;
  mediaPrompt?: string;
  mediaType?: 'image' | 'video';
  mediaUrl?: string;
  thumbnailUrl?: string;
  aspectRatio?: string;
  style?: string;
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

export interface FileData {
  name: string;
  type: string;
  content: string; // base64 or text string
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

export type NavTab = 'home' | 'chat' | 'create' | 'tasks' | 'memory' | 'tools' | 'settings';
