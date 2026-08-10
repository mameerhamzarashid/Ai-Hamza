import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy init for Gemini API
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
}
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey: apiKey.trim(),
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

function parseGeminiJson(rawText: string | undefined): any {
  if (!rawText) return {};
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  }
  try {
    return JSON.parse(cleaned);
  } catch {
    return {};
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  const ai = getGenAI();
  res.json({
    status: 'ok',
    geminiConfigured: !!ai,
    message: !!ai ? 'Gemini API is connected and configured.' : 'GEMINI_API_KEY is not configured in environment variables.',
  });
});

// ---------------------------
// WHATSAPP WEBHOOK (GET - Meta Verification)
// ---------------------------
const handleWhatsAppVerification = (req: any, res: any) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const expectedToken = process.env.WHATSAPP_VERIFY_TOKEN || 'hamza_ai_verify_token';

  if (mode === 'subscribe' && token === expectedToken) {
    return res.status(200).send(challenge || '');
  }
  return res.status(403).send('Forbidden: Invalid verify token or mode');
};

app.get('/webhook', handleWhatsAppVerification);
app.get('/api/webhook', handleWhatsAppVerification);

// ---------------------------
// WHATSAPP WEBHOOK (POST - Incoming Messages)
// ---------------------------
const handleWhatsAppIncoming = async (req: any, res: any) => {
  // Always acknowledge immediately with 200 OK
  res.status(200).json({ status: 'success' });

  try {
    const payload = req.body;
    const entry = payload?.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const messageObj = value?.messages?.[0];

    if (!messageObj) return;

    const from = messageObj.from;
    const textBody = messageObj.text?.body || messageObj.caption || '';
    const senderName = value?.contacts?.[0]?.profile?.name || 'User';
    const metaPhoneId = value?.metadata?.phone_number_id;

    if (!from || !textBody) return;

    const ai = getGenAI();
    let replyText = `Assalam-o-Alaikum ${senderName}! Main Hamza AI hoon. AAP ka paigham mil gaya: "${textBody}"`;

    if (ai) {
      const systemInstruction = `
You are "Hamza AI", a highly intelligent personal AI agent responding to WhatsApp messages from ${senderName}.
Keep your responses helpful, clear, concise, and optimized for mobile/WhatsApp readability.
Support Roman Urdu (default) and English naturally based on user language.
`.trim();

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: textBody,
        config: {
          systemInstruction,
        },
      });

      if (response.text) {
        replyText = response.text;
      }
    }

    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = metaPhoneId || process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (accessToken && phoneNumberId) {
      await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: from,
          type: 'text',
          text: { body: replyText },
        }),
      });
    }
  } catch (err) {
    console.error('Error processing WhatsApp message in server:', err);
  }
};

app.post('/webhook', handleWhatsAppIncoming);
app.post('/api/webhook', handleWhatsAppIncoming);

// ---------------------------
// 1. CHAT & COMMAND API
// ---------------------------
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history, fileData, tasks = [], memories = [], userSettings = {} } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message string is required' });
    }

    const ai = getGenAI();

    // Prepare system prompt context
    const userName = userSettings.userName || 'Hamza';
    const languagePreference = userSettings.language || 'roman_urdu';
    const todayStr = new Date().toISOString().split('T')[0];
    const currentTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const systemInstruction = `
You are "Hamza AI", an autonomous, highly intelligent, personal AI Agent built for ${userName}.
Current date: ${todayStr}, Current time: ${currentTimeStr}.
User preferred language setting: ${languagePreference}.

CORE AGENT CAPABILITIES:
1. Multi-turn natural communication (Roman Urdu default, English/Urdu supported).
2. Autonomous task creation, scheduling, recurring reminders (daily, weekly, monthly), task completion, and deletion.
3. Memory vault storage, categorization, and memory item purging.
4. Document / Image analysis & summarization (text, PDF, image extraction).
5. Email and WhatsApp payload drafting with one-click action buttons.
6. Web intelligence & grounded search.
7. Multi-step workflows (e.g. analyze input -> create reminder -> store memory -> draft notification).
8. SENSITIVE ACTION CONFIRMATION:
   For sensitive actions (e.g. deleting tasks/memories, clearing all data, purging logs, executing high-impact workflows), ALWAYS set actionType to 'confirmation_required' with actionData.confirmation detailing the action so the user can explicitly confirm!

ACTION TYPES YOU CAN TRIGGER:
- 'create_task': Create reminder/task or recurring task (e.g., "Har Monday reminder", "Kal meeting").
- 'complete_task': Mark task completed by targetTaskId.
- 'delete_task': Delete task. Requires confirmation or sets confirmation_required!
- 'add_memory': Save detail/preference/contact to memory core.
- 'delete_memory': Purge a memory item. Requires confirmation!
- 'whatsapp_draft': Draft WhatsApp message.
- 'email_draft': Draft email with recipient, subject, and body.
- 'web_search': Trigger web intelligence search.
- 'multi_step_workflow': Execute multiple simultaneous operations (e.g., create task + save memory + draft email).
- 'confirmation_required': Present user with a confirm/cancel card before executing high-impact action.
- 'none': Direct response, Q&A, formatting, or guidance.

CURRENT SAVED MEMORIES OF USER:
${memories.map((m: any) => `- ID: "${m.id}" | ${m.key}: ${m.value}`).join('\n')}

CURRENT TASKS LIST:
${tasks.map((t: any) => `- [${t.status}] ID: "${t.id}" | Title: "${t.title}" | Due: ${t.dueDate || 'N/A'} ${t.dueTime || ''} | Recurring: ${t.recurring || 'none'} | Priority: ${t.priority}`).join('\n')}

Response Format:
You MUST output valid JSON matching this schema:
{
  "replyText": "Conversational response in Roman Urdu or requested language",
  "actionType": "none" | "create_task" | "complete_task" | "delete_task" | "add_memory" | "delete_memory" | "whatsapp_draft" | "email_draft" | "web_search" | "multi_step_workflow" | "confirmation_required",
  "actionData": {
    "task": { "title": "...", "notes": "...", "priority": "high"|"medium"|"low", "dueDate": "YYYY-MM-DD", "dueTime": "HH:mm", "recurring": "none"|"daily"|"weekly"|"monthly", "category": "..." },
    "targetTaskId": "id_if_targeting_task",
    "targetMemoryId": "id_if_targeting_memory",
    "memory": { "key": "...", "value": "...", "category": "personal"|"preference"|"contact"|"project"|"goal"|"other" },
    "whatsapp": { "recipientName": "...", "phone": "...", "messageText": "..." },
    "email": { "recipientEmail": "...", "subject": "...", "body": "..." },
    "searchQuery": "...",
    "workflowSummary": "...",
    "confirmation": { "actionKind": "delete_task"|"delete_memory"|"clear_all_data"|"send_payload"|"execute_workflow", "actionTitle": "...", "actionDescription": "...", "targetId": "..." }
  }
}
`;

    if (!ai) {
      // Fallback rule-based intelligence if GEMINI_API_KEY is not set yet
      const lower = message.toLowerCase();
      let replyText = '⚠️ Gemini API key is not configured in server environment secrets. Showing offline agent mode.';
      let actionType: any = 'none';
      let actionData: any = {};

      if (lower.includes('task') || lower.includes('yaad dila') || lower.includes('call karna') || lower.includes('baje')) {
        actionType = 'create_task';
        const isWeekly = lower.includes('monday') || lower.includes('weekly') || lower.includes('har haftay');
        replyText = `Ji ${userName}! (Offline Mode) Main ne aapke liye task create kar diya hai. [Set GEMINI_API_KEY for real Gemini AI]`;
        actionData = {
          task: {
            title: message.replace(/task banao|yaad dila dena|baje/gi, '').trim() || 'New Reminder',
            priority: lower.includes('urgent') || lower.includes('jaruri') ? 'high' : 'medium',
            dueDate: todayStr,
            dueTime: '17:00',
            recurring: isWeekly ? 'weekly' : 'none',
          },
        };
      } else if (lower.includes('memory') || lower.includes('yaad rakho')) {
        actionType = 'add_memory';
        replyText = `Bilkul ${userName}, main ne ye baat memory mein save kar li hai. [Set GEMINI_API_KEY for real Gemini AI]`;
        actionData = {
          memory: {
            key: 'User Preference',
            value: message,
            category: 'preference',
          },
        };
      } else if (lower.includes('whatsapp') || lower.includes('message banao') || lower.includes('draft')) {
        actionType = 'whatsapp_draft';
        const recipient = lower.includes('ali') ? 'Ali' : lower.includes('ahmed') ? 'Ahmed' : 'Recipient';
        replyText = `Main ne ${recipient} ke liye WhatsApp message ka draft taiyar kar diya hai.`;
        actionData = {
          whatsapp: {
            recipientName: recipient,
            phone: '',
            messageText: `Assalam-o-Alaikum ${recipient}, ${message}`,
          },
        };
      } else if (lower.includes('email') || lower.includes('mail')) {
        actionType = 'email_draft';
        replyText = `Main ne Email ka draft taiyar kar diya hai. Aap 'Draft in Email Client' button dabayein.`;
        actionData = {
          email: {
            recipientEmail: 'contact@example.com',
            subject: 'Update from Hamza AI',
            body: `Hello,\n\n${message}\n\nBest regards,\n${userName}`,
          },
        };
      } else {
        replyText = `Ji ${userName}! Main Hamza AI hoon. ⚠️ Server par GEMINI_API_KEY configured nahi hai. Direct Gemini AI response ke liye environment variables mein GEMINI_API_KEY add karein.`;
      }

      return res.json({ replyText, actionType, actionData, apiNotConfigured: true });
    }

    // Prepare contents array for Gemini
    const formattedHistory = Array.isArray(history)
      ? history.slice(-10).map((h: any) => ({
          role: h.sender === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }],
        }))
      : [];

    const userMessageParts: any[] = [];

    if (fileData && fileData.content) {
      if (fileData.type && (fileData.type.startsWith('image/') || fileData.type === 'application/pdf')) {
        userMessageParts.push({
          inlineData: {
            mimeType: fileData.type,
            data: fileData.content,
          },
        });
      } else {
        userMessageParts.push({
          text: `[ATTACHED FILE: ${fileData.name}]\n${fileData.content}\n\n[USER COMMAND]: ${message}`,
        });
      }
    }

    if (userMessageParts.length === 0 || message) {
      userMessageParts.push({ text: message });
    }

    const contents = [
      ...formattedHistory,
      { role: 'user', parts: userMessageParts },
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: contents as any,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            replyText: { type: Type.STRING },
            actionType: { type: Type.STRING },
            actionData: {
              type: Type.OBJECT,
              properties: {
                task: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    notes: { type: Type.STRING },
                    priority: { type: Type.STRING },
                    dueDate: { type: Type.STRING },
                    dueTime: { type: Type.STRING },
                    recurring: { type: Type.STRING },
                    category: { type: Type.STRING },
                  },
                },
                targetTaskId: { type: Type.STRING },
                targetMemoryId: { type: Type.STRING },
                memory: {
                  type: Type.OBJECT,
                  properties: {
                    key: { type: Type.STRING },
                    value: { type: Type.STRING },
                    category: { type: Type.STRING },
                  },
                },
                whatsapp: {
                  type: Type.OBJECT,
                  properties: {
                    recipientName: { type: Type.STRING },
                    phone: { type: Type.STRING },
                    messageText: { type: Type.STRING },
                  },
                },
                email: {
                  type: Type.OBJECT,
                  properties: {
                    recipientEmail: { type: Type.STRING },
                    subject: { type: Type.STRING },
                    body: { type: Type.STRING },
                  },
                },
                searchQuery: { type: Type.STRING },
                workflowSummary: { type: Type.STRING },
                confirmation: {
                  type: Type.OBJECT,
                  properties: {
                    actionKind: { type: Type.STRING },
                    actionTitle: { type: Type.STRING },
                    actionDescription: { type: Type.STRING },
                    targetId: { type: Type.STRING },
                  },
                },
              },
            },
          },
          required: ['replyText', 'actionType'],
        },
      },
    });

    const parsed = parseGeminiJson(response.text);
    res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    res.status(500).json({
      replyText: `⚠️ Gemini API Error: ${error.message || 'Unable to connect to Gemini API'}. Please check your server GEMINI_API_KEY configuration.`,
      actionType: 'none',
      error: error.message,
    });
  }
});

// ---------------------------
// 2. PARSE COMMAND TO TASK API
// ---------------------------
app.post('/api/parse-command', async (req, res) => {
  try {
    const { command } = req.body;
    if (!command) return res.status(400).json({ error: 'Command text is required' });

    const ai = getGenAI();
    const todayStr = new Date().toISOString().split('T')[0];

    if (!ai) {
      return res.json({
        title: command,
        priority: 'medium',
        dueDate: todayStr,
        dueTime: '17:00',
        category: 'General',
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Parse this task command into structured json fields. Today is ${todayStr}.
Command: "${command}"`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            notes: { type: Type.STRING },
            priority: { type: Type.STRING },
            dueDate: { type: Type.STRING },
            dueTime: { type: Type.STRING },
            category: { type: Type.STRING },
          },
          required: ['title', 'priority'],
        },
      },
    });

    const parsed = parseGeminiJson(response.text);
    res.json(parsed);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------
// 3. WEB RESEARCH API WITH GROUNDING
// ---------------------------
app.post('/api/web-research', async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: 'Query is required' });

    const ai = getGenAI();
    if (!ai) {
      return res.json({
        summary: `Web research simulation for: "${query}". Please configure GEMINI_API_KEY for live search grounding.`,
        sources: [],
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Provide a concise, factual summary for this search query: "${query}". Also highlight key insights.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = chunks.map((c: any) => ({
      title: c.web?.title || 'Web Source',
      uri: c.web?.uri || '#',
    }));

    res.json({
      summary: response.text,
      sources,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------
// 4. VITE / STATIC SERVING
// ---------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Hamza AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
