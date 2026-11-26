import { NOTES, NOTES_BY_ID } from '../data/notes';
import { PERFUMES, PERFUMES_BY_ID, perfumeNoteIds } from '../data/perfumes';
import type { FormulaItem } from '../types';
import { buildUserPrompt, callProvider, extractJson, PROVIDER_LABELS, SYSTEM_PROMPT, type ProviderId } from './providers';

/**
 * Режимы ИИ:
 *  - auto: сначала серверный ИИ (/api/ai на Vercel — ключ в Environment Variables), иначе локальный движок
 *  - own:  собственный ключ пользователя (хранится только в localStorage этого браузера)
 *  - off:  только локальный движок
 */
export type AIMode = 'auto' | 'own' | 'off';

export interface AISettings {
  mode: AIMode;
  provider: ProviderId;
  apiKey: string;
  model: string;
}

const KEY = 'sillage.ai.settings';

export const DEFAULT_AI_SETTINGS: AISettings = { mode: 'auto', provider: 'gemini', apiKey: '', model: '' };

export function loadAISettings(): AISettings {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULT_AI_SETTINGS, ...JSON.parse(raw) } : DEFAULT_AI_SETTINGS;
  } catch {
    return DEFAULT_AI_SETTINGS;
  }
}

export function saveAISettings(s: AISettings) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* приватный режим браузера */
  }
}

export interface ServerStatus {
  reachable: boolean;
  configured: boolean;
  provider: string | null;
}

export async function getServerStatus(): Promise<ServerStatus> {
  try {
    const res = await fetch('/api/ai', { method: 'GET', headers: { accept: 'application/json' } });
    const type = res.headers.get('content-type') ?? '';
    if (!res.ok || !type.includes('json')) return { reachable: false, configured: false, provider: null };
    const data = await res.json();
    return { reachable: true, configured: Boolean(data.configured), provider: data.providerLabel ?? data.provider ?? null };
  } catch {
    return { reachable: false, configured: false, provider: null };
  }
}

/** Компактный каталог для модели: id нот и парфюмов, чтобы ответ можно было проверить. */
export function buildCatalog(): string {
  const notes = NOTES.map((n) => `${n.id} | ${n.name} | ${n.layer} | ${n.vibeTags.slice(0, 4).join(', ')}`).join('\n');
  const perfumes = PERFUMES.map(
    (p) => `${p.id} | ${p.brand} ${p.name} | ${perfumeNoteIds(p).join(', ')} | ${p.vibes.slice(0, 4).join(', ')}`,
  ).join('\n');
  return `НОТЫ (id | название | слой | теги):\n${notes}\n\nПАРФЮМЫ (id | название | ноты | вайб):\n${perfumes}`;
}

export interface AIResult {
  title: string;
  explanation: string;
  formula: FormulaItem[];
  perfumeIds: string[];
  providerLabel: string;
}

export class AINotAvailable extends Error {}

function sanitize(data: unknown): Omit<AIResult, 'providerLabel'> {
  const d = (data ?? {}) as Record<string, unknown>;
  const rawNotes = Array.isArray(d.notes) ? d.notes : [];
  const seen = new Set<string>();
  const formula: FormulaItem[] = [];
  for (const n of rawNotes) {
    const id = typeof n === 'string' ? n : (n as { id?: unknown })?.id;
    const dropsRaw = typeof n === 'object' && n ? Number((n as { drops?: unknown }).drops) : 4;
    if (typeof id !== 'string' || !NOTES_BY_ID[id] || seen.has(id)) continue;
    seen.add(id);
    formula.push({ noteId: id, drops: Math.max(1, Math.min(30, Math.round(Number.isFinite(dropsRaw) ? dropsRaw : 4))) });
  }
  const perfumeIds = (Array.isArray(d.perfumes) ? d.perfumes : [])
    .map((p) => (typeof p === 'string' ? p : (p as { id?: unknown })?.id))
    .filter((id): id is string => typeof id === 'string' && Boolean(PERFUMES_BY_ID[id]))
    .slice(0, 3);
  if (formula.length < 3) throw new Error('ИИ вернул слишком короткую формулу');
  return {
    title: typeof d.title === 'string' ? d.title.slice(0, 80) : 'Образ от ИИ',
    explanation: typeof d.explanation === 'string' ? d.explanation.slice(0, 400) : '',
    formula,
    perfumeIds,
  };
}

export async function askAI(query: string, settings: AISettings): Promise<AIResult> {
  if (settings.mode === 'off') throw new AINotAvailable('ИИ выключен в настройках');
  const catalog = buildCatalog();

  if (settings.mode === 'own') {
    if (!settings.apiKey.trim()) throw new AINotAvailable('Не указан собственный ключ');
    const { text, model } = await callProvider({
      provider: settings.provider,
      apiKey: settings.apiKey.trim(),
      model: settings.model.trim() || undefined,
      system: SYSTEM_PROMPT,
      user: buildUserPrompt(query, catalog),
      browser: true,
    });
    return { ...sanitize(extractJson(text)), providerLabel: `${PROVIDER_LABELS[settings.provider]} · ${model}` };
  }

  // auto → серверная функция
  let res: Response;
  try {
    res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query, catalog }),
    });
  } catch {
    throw new AINotAvailable('Сервер ИИ недоступен');
  }
  const type = res.headers.get('content-type') ?? '';
  if (!type.includes('json')) throw new AINotAvailable('Серверная функция /api/ai не найдена');
  const data = await res.json();
  if (res.status === 503 || data.configured === false) throw new AINotAvailable(data.error ?? 'Ключ не задан на сервере');
  if (!res.ok || !data.ok) throw new Error(data.error ?? `Ошибка сервера ${res.status}`);
  const label = PROVIDER_LABELS[data.provider as ProviderId] ?? data.provider;
  return { ...sanitize(data.data), providerLabel: `${label} · ${data.model}` };
}

