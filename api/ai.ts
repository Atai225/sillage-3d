/**
 * Vercel Edge Function: POST /api/ai
 *
 * Именно она делает ИИ рабочим на основной (задеплоенной) версии сайта.
 * Ключ хранится в Environment Variables проекта на Vercel и НИКОГДА не попадает в браузер.
 *
 * Поддерживаемые переменные (достаточно одной):
 *   GEMINI_API_KEY      (или GOOGLE_API_KEY)
 *   OPENAI_API_KEY      (+ необязательно OPENAI_BASE_URL для совместимых API)
 *   ANTHROPIC_API_KEY   (или CLAUDE_API_KEY)
 *   GROQ_API_KEY
 *   OPENROUTER_API_KEY
 * Необязательно: AI_PROVIDER — принудительно выбрать провайдера, AI_MODEL — модель.
 *
 * GET /api/ai — проверка статуса (подключён ли ключ), без раскрытия ключа.
 */
import { buildUserPrompt, callProvider, extractJson, PROVIDER_LABELS, SYSTEM_PROMPT, type ProviderId } from '../src/ai/providers';

export const config = { runtime: 'edge' };

declare const process: { env: Record<string, string | undefined> };

const KEY_NAMES: Record<ProviderId, string[]> = {
  gemini: ['GEMINI_API_KEY', 'GOOGLE_API_KEY', 'GOOGLE_GENERATIVE_AI_API_KEY', 'VITE_GEMINI_API_KEY'],
  openai: ['OPENAI_API_KEY', 'VITE_OPENAI_API_KEY'],
  anthropic: ['ANTHROPIC_API_KEY', 'CLAUDE_API_KEY', 'VITE_ANTHROPIC_API_KEY'],
  groq: ['GROQ_API_KEY', 'VITE_GROQ_API_KEY'],
  openrouter: ['OPENROUTER_API_KEY', 'VITE_OPENROUTER_API_KEY'],
};
const ORDER: ProviderId[] = ['gemini', 'openai', 'anthropic', 'groq', 'openrouter'];

function readEnv(name: string): string | undefined {
  try {
    const v = process.env[name];
    return v && v.trim() ? v.trim() : undefined;
  } catch {
    return undefined;
  }
}

function detectProvider(): { provider: ProviderId; apiKey: string } | null {
  const forced = readEnv('AI_PROVIDER')?.toLowerCase() as ProviderId | undefined;
  const list = forced && KEY_NAMES[forced] ? [forced, ...ORDER.filter((p) => p !== forced)] : ORDER;
  for (const provider of list) {
    for (const name of KEY_NAMES[provider]) {
      const apiKey = readEnv(name);
      if (apiKey) return { provider, apiKey };
    }
  }
  return null;
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

export default async function handler(req: Request): Promise<Response> {
  const found = detectProvider();

  if (req.method === 'GET') {
    return json({
      configured: Boolean(found),
      provider: found?.provider ?? null,
      providerLabel: found ? PROVIDER_LABELS[found.provider] : null,
    });
  }
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  if (!found) {
    return json(
      { configured: false, error: 'На сервере не задан ключ ИИ. Добавьте GEMINI_API_KEY / OPENAI_API_KEY / ANTHROPIC_API_KEY в Environment Variables на Vercel и сделайте Redeploy.' },
      503,
    );
  }

  let body: { query?: unknown; catalog?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Некорректный JSON' }, 400);
  }
  const query = typeof body.query === 'string' ? body.query.trim().slice(0, 400) : '';
  const catalog = typeof body.catalog === 'string' ? body.catalog.slice(0, 24000) : '';
  if (!query || !catalog) return json({ error: 'Нужны поля query и catalog' }, 400);

  try {
    const { text, model } = await callProvider(
      {
        provider: found.provider,
        apiKey: found.apiKey,
        model: readEnv('AI_MODEL'),
        system: SYSTEM_PROMPT,
        user: buildUserPrompt(query, catalog),
      },
      found.provider === 'openai' ? readEnv('OPENAI_BASE_URL') : undefined,
    );
    const data = extractJson(text);
    return json({ ok: true, provider: found.provider, model, data });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return json({ ok: false, provider: found.provider, error: `Ошибка ${PROVIDER_LABELS[found.provider]}: ${message}` }, 502);
  }
}
