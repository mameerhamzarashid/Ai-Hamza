import { GoogleGenAI, Type } from '@google/genai';

export interface Env {
  GEMINI_API_KEY?: string;
  ASSETS: Fetcher;
}

function getGenAI(env: Env): GoogleGenAI | null {
  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey.trim(),
  });
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // ---------------------------
    // HEALTH CHECK
    // ---------------------------
    if (url.pathname === '/api/health') {
      const ai = getGenAI(env);
      return new Response(
        JSON.stringify({
          status: 'ok',
          geminiConfigured: !!ai,
          message: !!ai
            ? 'Gemini API is connected and configured.'
            : 'GEMINI_API_KEY secret is not configured in Cloudflare Worker environment.',
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ---------------------------
    // 1. CHAT API
    // ---------------------------
    if (url.pathname === '/api/chat' && request.method === 'POST') {
      try {
        const body: any = await request.json();
        const { message, history, tasks = [], memories = [], userSettings = {} } = body;

        if (!message || typeof message !== 'string') {
          return new Response(
            JSON.stringify({ error: 'Message string is required' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }

        const ai = getGenAI(env);
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
          const lower = message.toLowerCase();
          let replyText = '⚠️ Gemini API key is not configured in server environment secrets. Showing offline assistant mode.';
          let actionType: any = 'none';
          let actionData: any = {};

          if (lower.includes('task') || lower.includes('yaad dila') || lower.includes('call karna') || lower.includes('baje')) {
            actionType = 'create_task';
            replyText = `Ji ${userName}! (Offline Mode) Main ne aapke liye task create kar diya hai. [Set GEMINI_API_KEY in Cloudflare Workers secrets]`;
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
            replyText = `Bilkul ${userName}, main ne ye baat memory mein save kar li hai. [Set GEMINI_API_KEY in Cloudflare Workers secrets]`;
            actionData = {
              memory: {
                key: 'User Preference',
                value: message,
                category: 'preference',
              },
            };
          } else if (lower.includes('whatsapp') || lower.includes('bolo ke') || lower.includes('message')) {
            actionType = 'whatsapp_draft';
            replyText = `Main ne WhatsApp message ka draft taiyar kar liya hai. [Set GEMINI_API_KEY in Cloudflare Workers secrets]`;
            actionData = {
              whatsapp: {
                recipientName: lower.includes('ali') ? 'Ali' : lower.includes('ahmed') ? 'Ahmed' : 'Contact',
                messageText: message,
              },
            };
          } else if (lower.includes('english')) {
            replyText = `Sure ${userName}! I will respond in English. Note: Please configure GEMINI_API_KEY in Cloudflare Worker secrets for full Gemini AI responses.`;
          } else {
            replyText = `Ji ${userName}! Main Hamza AI hoon. ⚠️ Cloudflare Worker par GEMINI_API_KEY secret configured nahi hai. Direct Gemini AI response ke liye 'npx wrangler secret put GEMINI_API_KEY' run karein.`;
          }

          return new Response(
            JSON.stringify({ replyText, actionType, actionData, apiNotConfigured: true }),
            { headers: { 'Content-Type': 'application/json' } }
          );
        }

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
        return new Response(JSON.stringify(parsed), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (error: any) {
        return new Response(
          JSON.stringify({
            replyText: `⚠️ Gemini API Error: ${error.message || 'Unable to connect to Gemini API'}. Please check your Cloudflare Worker GEMINI_API_KEY configuration.`,
            actionType: 'none',
            error: error.message,
          }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // ---------------------------
    // 2. PARSE COMMAND API
    // ---------------------------
    if (url.pathname === '/api/parse-command' && request.method === 'POST') {
      try {
        const body: any = await request.json();
        const { command } = body;
        if (!command) {
          return new Response(
            JSON.stringify({ error: 'Command text is required' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }

        const ai = getGenAI(env);
        const todayStr = new Date().toISOString().split('T')[0];

        if (!ai) {
          return new Response(
            JSON.stringify({
              title: command,
              priority: 'medium',
              dueDate: todayStr,
              dueTime: '17:00',
              category: 'General',
            }),
            { headers: { 'Content-Type': 'application/json' } }
          );
        }

        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: `Parse this task command into structured json fields. Today is ${todayStr}.\nCommand: "${command}"`,
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
        return new Response(JSON.stringify(parsed), {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // ---------------------------
    // 3. WEB RESEARCH API
    // ---------------------------
    if (url.pathname === '/api/web-research' && request.method === 'POST') {
      try {
        const body: any = await request.json();
        const { query } = body;
        if (!query) {
          return new Response(
            JSON.stringify({ error: 'Query is required' }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }

        const ai = getGenAI(env);
        if (!ai) {
          return new Response(
            JSON.stringify({
              summary: `Web research simulation for: "${query}". Please configure GEMINI_API_KEY in Cloudflare Worker secrets for live search grounding.`,
              sources: [],
            }),
            { headers: { 'Content-Type': 'application/json' } }
          );
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

        return new Response(
          JSON.stringify({
            summary: response.text,
            sources,
          }),
          { headers: { 'Content-Type': 'application/json' } }
        );
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // ---------------------------
    // 4. STATIC ASSETS SERVING
    // ---------------------------
    if (env.ASSETS) {
      const res = await env.ASSETS.fetch(request);
      if (res.status !== 404) {
        return res;
      }
      // SPA Fallback for client routes
      const indexReq = new Request(new URL('/index.html', request.url), request);
      return await env.ASSETS.fetch(indexReq);
    }

    return new Response('Not found', { status: 404 });
  },
};
