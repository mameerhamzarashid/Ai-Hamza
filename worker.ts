import { GoogleGenAI, Type } from '@google/genai';

export interface Env {
  GEMINI_API_KEY?: string;
  WHATSAPP_VERIFY_TOKEN?: string;
  WHATSAPP_ACCESS_TOKEN?: string;
  WHATSAPP_PHONE_NUMBER_ID?: string;
  ASSETS: Fetcher;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

function getGenAI(env?: Env): GoogleGenAI | null {
  let apiKey = env?.GEMINI_API_KEY;
  if (!apiKey && typeof process !== 'undefined' && process?.env?.GEMINI_API_KEY) {
    apiKey = process.env.GEMINI_API_KEY;
  }
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
  }
  apiKey = apiKey.trim().replace(/^["']|["']$/g, '');
  if (!apiKey) return null;

  return new GoogleGenAI({
    apiKey,
  });
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

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // ---------------------------
    // CORS PREFLIGHT
    // ---------------------------
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

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
        { headers: corsHeaders }
      );
    }

    // ---------------------------
    // WHATSAPP WEBHOOK (GET - Meta Verification)
    // ---------------------------
    if ((url.pathname === '/webhook' || url.pathname === '/api/webhook') && request.method === 'GET') {
      const mode = url.searchParams.get('hub.mode');
      const token = url.searchParams.get('hub.verify_token');
      const challenge = url.searchParams.get('hub.challenge');

      const verifyToken =
        env?.WHATSAPP_VERIFY_TOKEN ||
        (typeof process !== 'undefined' ? process?.env?.WHATSAPP_VERIFY_TOKEN : undefined) ||
        'hamza_ai_verify_token';

      if (mode === 'subscribe' && token === verifyToken) {
        return new Response(challenge || '', {
          status: 200,
          headers: { 'Content-Type': 'text/plain' },
        });
      }

      return new Response('Forbidden: Invalid verify token or mode', {
        status: 403,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    // ---------------------------
    // WHATSAPP WEBHOOK (POST - Incoming Messages)
    // ---------------------------
    if ((url.pathname === '/webhook' || url.pathname === '/api/webhook') && request.method === 'POST') {
      try {
        const payload: any = await request.json();

        const processWhatsAppMessage = async () => {
          try {
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

            const ai = getGenAI(env);
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

            const accessToken =
              env?.WHATSAPP_ACCESS_TOKEN ||
              (typeof process !== 'undefined' ? process?.env?.WHATSAPP_ACCESS_TOKEN : undefined);
            const phoneNumberId =
              metaPhoneId ||
              env?.WHATSAPP_PHONE_NUMBER_ID ||
              (typeof process !== 'undefined' ? process?.env?.WHATSAPP_PHONE_NUMBER_ID : undefined);

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
            console.error('Error processing WhatsApp message:', err);
          }
        };

        if (ctx && typeof ctx.waitUntil === 'function') {
          ctx.waitUntil(processWhatsAppMessage());
        } else {
          await processWhatsAppMessage();
        }

        return new Response(JSON.stringify({ status: 'success' }), {
          status: 200,
          headers: corsHeaders,
        });
      } catch (err: any) {
        return new Response(JSON.stringify({ status: 'error', message: err.message }), {
          status: 200,
          headers: corsHeaders,
        });
      }
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
            { status: 400, headers: corsHeaders }
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
            { headers: corsHeaders }
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

        const parsed = parseGeminiJson(response.text);
        return new Response(JSON.stringify(parsed), {
          headers: corsHeaders,
        });
      } catch (error: any) {
        return new Response(
          JSON.stringify({
            replyText: `⚠️ Gemini API Error: ${error.message || 'Unable to connect to Gemini API'}. Please check your Cloudflare Worker GEMINI_API_KEY configuration.`,
            actionType: 'none',
            error: error.message,
          }),
          { status: 500, headers: corsHeaders }
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
            { status: 400, headers: corsHeaders }
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
            { headers: corsHeaders }
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

        const parsed = parseGeminiJson(response.text);
        return new Response(JSON.stringify(parsed), {
          headers: corsHeaders,
        });
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: corsHeaders,
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
            { status: 400, headers: corsHeaders }
          );
        }

        const ai = getGenAI(env);
        if (!ai) {
          return new Response(
            JSON.stringify({
              summary: `Web research simulation for: "${query}". Please configure GEMINI_API_KEY in Cloudflare Worker secrets for live search grounding.`,
              sources: [],
            }),
            { headers: corsHeaders }
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
          { headers: corsHeaders }
        );
      } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: corsHeaders,
        });
      }
    }

    // ---------------------------
    // 4. STATIC ASSETS SERVING & SPA FALLBACK
    // ---------------------------
    if (env.ASSETS) {
      const res = await env.ASSETS.fetch(request);
      if (res.status !== 404) {
        return res;
      }
      // If an API route was requested but not matched above, return 404 JSON instead of HTML SPA page
      if (url.pathname.startsWith('/api/')) {
        return new Response(
          JSON.stringify({ error: `API route not found: ${url.pathname}` }),
          { status: 404, headers: corsHeaders }
        );
      }
      // SPA Fallback for client routes
      const indexReq = new Request(new URL('/index.html', request.url), request);
      return await env.ASSETS.fetch(indexReq);
    }

    return new Response('Not found', { status: 404 });
  },
};
