import { GoogleGenAI, Type } from '@google/genai';

export interface Env {
  GEMINI_API_KEY?: string;
  ASSETS: Fetcher;
}

function getGenAI(env?: Env): GoogleGenAI | null {
  const apiKey = env?.GEMINI_API_KEY;
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
        const { message, history, fileData, tasks = [], memories = [], userSettings = {} } = body;

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
          const lower = message.toLowerCase();
          let replyText = '⚠️ Gemini API key is not configured in server environment secrets. Showing offline agent mode.';
          let actionType: any = 'none';
          let actionData: any = {};

          if (lower.includes('task') || lower.includes('yaad dila') || lower.includes('call karna') || lower.includes('baje')) {
            actionType = 'create_task';
            const isWeekly = lower.includes('monday') || lower.includes('weekly') || lower.includes('har haftay');
            replyText = `Ji ${userName}! (Offline Mode) Main ne aapke liye task create kar diya hai. [Set GEMINI_API_KEY in Cloudflare Workers secrets]`;
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
            replyText = `Bilkul ${userName}, main ne ye baat memory mein save kar li hai. [Set GEMINI_API_KEY in Cloudflare Workers secrets]`;
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
