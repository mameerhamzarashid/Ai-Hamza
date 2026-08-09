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
// 1. CHAT & COMMAND API
// ---------------------------
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history, tasks = [], memories = [], userSettings = {} } = req.body;

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
You are "Hamza AI", a highly capable, intelligent, and friendly mobile AI Assistant built for ${userName}.
Current date: ${todayStr}, Current time: ${currentTimeStr}.
User preferred language setting: ${languagePreference}.

CRITICAL BEHAVIOR RULES:
1. Default Response Language: Always respond in natural Roman Urdu (e.g. "Ji Hamza! Main ne task add kar diya hai.") UNLESS the user explicitly writes in English or asks for an English response ("English mein jawab do").
2. Intent Understanding: Understand informal phrases, typos, spelling errors, and mixed Roman Urdu/English commands.
3. Scope & Truthfulness: Never pretend you executed external physical actions (like actually sending a real SMS or WhatsApp) if no API key is connected. For WhatsApp requests, clearly create a preview draft and offer to open/edit it.
4. Structured Actions: You can trigger 4 types of actions by returning them in the structured JSON response:
   - 'create_task': when the user wants to set a reminder or task (e.g. "Ali ko call karna hai", "Kal 5 baje meeting yaad dila dena").
   - 'complete_task': when the user wants to complete or check off a task (e.g. "Ahmed wali task complete kar do", "Task finished").
   - 'add_memory': when the user wants you to remember a personal detail, contact info, goal, or preference.
   - 'whatsapp_draft': when the user asks to send/draft a message to someone on WhatsApp (e.g. "Ali ko WhatsApp par bolo ke meeting kal hai").
   - 'none': general conversation, Q&A, formatting, or guidance.

CURRENT SAVED MEMORIES OF USER:
${memories.map((m: any) => `- ${m.key}: ${m.value}`).join('\n')}

CURRENT TASKS LIST:
${tasks.map((t: any) => `- [${t.status}] ID: "${t.id}" | Title: "${t.title}" | Due: ${t.dueDate || 'N/A'} ${t.dueTime || ''} | Priority: ${t.priority}`).join('\n')}

Response Format:
You MUST output valid JSON matching this schema:
{
  "replyText": "Conversational reply to the user in Roman Urdu or requested language",
  "actionType": "none" | "create_task" | "complete_task" | "add_memory" | "whatsapp_draft",
  "actionData": {
    "task": { "title": "...", "notes": "...", "priority": "high"|"medium"|"low", "dueDate": "YYYY-MM-DD", "dueTime": "HH:mm" },
    "targetTaskId": "id_if_completing_existing_task",
    "memory": { "key": "...", "value": "...", "category": "personal"|"preference"|"contact"|"project"|"goal" },
    "whatsapp": { "recipientName": "...", "messageText": "..." }
  }
}
`;

    if (!ai) {
      // Fallback rule-based intelligence if GEMINI_API_KEY is not set yet
      const lower = message.toLowerCase();
      let replyText = '⚠️ Gemini API key is not configured in server environment secrets. Showing offline assistant mode.';
      let actionType: any = 'none';
      let actionData: any = {};

      if (lower.includes('task') || lower.includes('yaad dila') || lower.includes('call karna') || lower.includes('baje')) {
        actionType = 'create_task';
        replyText = `Ji ${userName}! (Offline Mode) Main ne aapke liye task create kar diya hai. [Set GEMINI_API_KEY for real Gemini AI]`;
        actionData = {
          task: {
            title: message.replace(/task banao|yaad dila dena|baje/gi, '').trim() || 'New Reminder',
            priority: lower.includes('urgent') || lower.includes('jaruri') ? 'high' : 'medium',
            dueDate: todayStr,
            dueTime: '17:00',
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
      } else if (lower.includes('whatsapp') || lower.includes('bolo ke') || lower.includes('message')) {
        actionType = 'whatsapp_draft';
        replyText = `Main ne WhatsApp message ka draft taiyar kar liya hai. [Set GEMINI_API_KEY for real Gemini AI]`;
        actionData = {
          whatsapp: {
            recipientName: lower.includes('ali') ? 'Ali' : lower.includes('ahmed') ? 'Ahmed' : 'Contact',
            messageText: message,
          },
        };
      } else if (lower.includes('english')) {
        replyText = `Sure ${userName}! I will respond in English. Note: Please configure GEMINI_API_KEY in server secrets for full Gemini AI responses.`;
      } else {
        replyText = `Ji ${userName}! Main Hamza AI hoon. ⚠️ Server par GEMINI_API_KEY configured nahi hai. Direct Gemini AI response ke liye environment variables mein GEMINI_API_KEY add karein.`;
      }

      return res.json({ replyText, actionType, actionData, apiNotConfigured: true });
    }

    // Call Gemini 3.6 Flash
    const formattedHistory = Array.isArray(history)
      ? history.slice(-10).map((h: any) => ({
          role: h.sender === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }],
        }))
      : [];

    const contents = [
      ...formattedHistory,
      { role: 'user', parts: [{ text: message }] },
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
                  },
                },
                targetTaskId: { type: Type.STRING },
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
                    messageText: { type: Type.STRING },
                  },
                },
              },
            },
          },
          required: ['replyText', 'actionType'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
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

    const parsed = JSON.parse(response.text || '{}');
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
