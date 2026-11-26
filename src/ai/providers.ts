/**
 * Общий код вызова ИИ-провайдеров. Работает и на сервере (Vercel Edge Function /api/ai),
 * и в браузере (если пользователь вставил собственный ключ в настройках).
 * Использует только fetch — без SDK и без зависимостей.
 */

export type ProviderId = 'gemini' | 'openai' | 'anthropic' | 'groq' | 'openrouter';

export const PROVIDER_LABELS: Record<ProviderId, string> = {
  gemini: 'Google Gemini',
  openai: 'OpenAI',
  anthropic: 'Anthropic Claude',
  groq: 'Groq',
  openrouter: 'OpenRouter',
};

/** Модели по умолчанию. Если первая недоступна (404), пробуется следующая. */
export const DEFAULT_MODELS: Record<ProviderId, string[]> = {
  gemini: ['gemini-flash-latest', 'gemini-2.5-flash', 'gemini-2.0-flash'],
  openai: ['gpt-4.1-mini', 'gpt-4o-mini'],
  anthropic: ['claude-haiku-5-5', 'claude-haiku-4-5', 'claude-3-5-haiku-latest'],
  groq: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'],
  openrouter: ['openai/gpt-4o-mini', 'google/gemini-2.5-flash'],
};

export const SYSTEM_PROMPT = `Ты — опытный нишевый парфюмер и консультант лаборатории SILLAGE 3D.
Пользователь описывает образ, настроение или воспоминание, которым он хочет пахнуть.
Твоя задача — собрать формулу из нот каталога и подобрать готовые парфюмы из каталога.

Правила:
- Используй ТОЛЬКО id нот и id парфюмов из присланного каталога. Не придумывай новые id.
- Формула: 6–9 нот. Обязательно 1–3 верхние (top), 2–3 ноты сердца (heart), 2–3 базовые (base); молекулы (molecule) — по желанию, максимум 2.
- Капли (drops) — целые числа от 1 до 12. Ориентир баланса пирамиды по каплям: верх ≈30%, сердце ≈50%, база ≈20%.
- Подбери ровно 3 парфюма из каталога, которые лучше всего попадают в образ.
- Пиши по-русски, коротко и образно.

Ответ — строго один JSON-объект без markdown и без пояснений вокруг:
{"title":"короткое название образа","explanation":"1–2 предложения: почему эти ноты передают образ","notes":[{"id":"note-id","drops":5}],"perfumes":["perfume-id","perfume-id","perfume-id"]}`;

export function buildUserPrompt(query: string, catalog: string): string {
  return `КАТАЛОГ:\n${catalog}\n\nЗАПРОС ПОЛЬЗОВАТЕЛЯ: «${query}»\n\nВерни JSON.`;
}

export interface ProviderCall {
  provider: ProviderId;
  apiKey: string;
  model?: string;
  system: string;
  user: string;
  /** true — вызов из браузера (нужен особый заголовок для Anthropic). */
  browser?: boolean;
}

export class ProviderError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const OPENAI_COMPATIBLE_BASE: Partial<Record<ProviderId, string>> = {
  openai: 'https://api.openai.com/v1',
  groq: 'https://api.groq.com/openai/v1',
  openrouter: 'https://openrouter.ai/api/v1',
};

async function readError(res: Response): Promise<string> {
  const text = await res.text().catch(() => '');
  try {
    const j = JSON.parse(text);
    return j?.error?.message ?? j?.message ?? text.slice(0, 300);
  } catch {
    return text.slice(0, 300) || res.statusText;
  }
}

async function callOnce(c: ProviderCall, model: string, baseUrl?: string): Promise<string> {
  if (c.provider === 'gemini') {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': c.apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: c.system }] },
        contents: [{ role: 'user', parts: [{ text: c.user }] }],
        generationConfig: { temperature: 0.7, responseMimeType: 'application/json', maxOutputTokens: 2048 },
      }),
    });
    if (!res.ok) throw new ProviderError(await readError(res), res.status);
    const data = await res.json();
    const parts: { text?: string }[] = data?.candidates?.[0]?.content?.parts ?? [];
    return parts.map((p) => p.text ?? '').join('');
  }

  if (c.provider === 'anthropic') {
    const headers: Record<string, string> = {
      'content-type': 'application/json',
      'x-api-key': c.apiKey,
      'anthropic-version': '2023-06-01',
    };
    if (c.browser) headers['anthropic-dangerous-direct-browser-access'] = 'true';
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        max_tokens: 1200,
        system: c.system,
        messages: [{ role: 'user', content: c.user }],
      }),
    });
    if (!res.ok) throw new ProviderError(await readError(res), res.status);
    const data = await res.json();
    const blocks: { type: string; text?: string }[] = data?.content ?? [];
    return blocks.filter((b) => b.type === 'text').map((b) => b.text ?? '').join('');
  }

  // OpenAI и совместимые API (Groq, OpenRouter, собственный OPENAI_BASE_URL)
  const base = (baseUrl || OPENAI_COMPATIBLE_BASE[c.provider] || OPENAI_COMPATIBLE_BASE.openai!).replace(/\/$/, '');
  const res = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${c.apiKey}` },
    body: JSON.stringify({
      model,
      temperature: 0.7,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: c.system },
        { role: 'user', content: c.user },
      ],
    }),
  });
  if (!res.ok) throw new ProviderError(await readError(res), res.status);
  const data = await res.json();
  return data?.choices?.[0]?.message?.content ?? '';
}

/**
 * Вызывает провайдера. Если модель не найдена (404 / «not found»), пробует следующую модель
 * из списка по умолчанию — так приложение не ломается, когда провайдер переименовывает модели.
 */
export async function callProvider(c: ProviderCall, baseUrl?: string): Promise<{ text: string; model: string }> {
  const models = c.model ? [c.model, ...DEFAULT_MODELS[c.provider].filter((m) => m !== c.model)] : DEFAULT_MODELS[c.provider];
  let lastError: unknown = null;
  for (const model of models) {
    try {
      const text = await callOnce(c, model, baseUrl);
      if (!text.trim()) throw new ProviderError('Пустой ответ модели', 502);
      return { text, model };
    } catch (e) {
      lastError = e;
      const status = e instanceof ProviderError ? e.status : 0;
      const msg = e instanceof Error ? e.message.toLowerCase() : '';
      const modelMissing = status === 404 || (status === 400 && /model|not found|not supported/.test(msg));
      if (!modelMissing) break;
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Неизвестная ошибка провайдера');
}

/** Достаёт JSON-объект из ответа модели (даже если он обёрнут в ```json). */
export function extractJson(text: string): unknown {
  const cleaned = text.replace(/```(?:json)?/gi, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end <= start) throw new Error('Модель вернула не JSON');
  return JSON.parse(cleaned.slice(start, end + 1));
}
