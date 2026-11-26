import { NOTES, NOTES_BY_ID, getSynergy } from '../data/notes';
import type { Carrier, Concentration, FormulaItem, Layer, Note } from '../types';

export type PyramidLayer = 'top' | 'heart' | 'base';

export const TARGET_BALANCE: Record<PyramidLayer, number> = { top: 30, heart: 50, base: 20 };
export const TIMELINE_MAX = 480; // 8 часов в минутах

export const CONCENTRATIONS: Record<Concentration, { label: string; pct: number; longevity: number }> = {
  EDT: { label: 'EDT 10%', pct: 0.1, longevity: 0.7 },
  EDP: { label: 'EDP 18%', pct: 0.18, longevity: 1 },
  Extrait: { label: 'Extrait 25%', pct: 0.25, longevity: 1.3 },
};

export const VOLUMES = [10, 30, 50] as const;
export const DROPS_PER_ML = 20;

export const CARRIERS: Record<Carrier, string> = {
  alcohol: 'Спирт 96%',
  jojoba: 'Масло жожоба',
};

/** Молекулы распределяются по пирамиде по их летучести. */
export function pyramidRole(note: Note): PyramidLayer {
  if (note.layer !== 'molecule') return note.layer;
  return note.volatility >= 5 ? 'heart' : 'base';
}

export function totalDrops(items: FormulaItem[]): number {
  return items.reduce((s, i) => s + i.drops, 0);
}

export function percentOf(item: FormulaItem, items: FormulaItem[]): number {
  const t = totalDrops(items);
  return t ? (item.drops / t) * 100 : 0;
}

export function layerBalance(items: FormulaItem[]): Record<PyramidLayer, number> {
  const t = totalDrops(items);
  const res: Record<PyramidLayer, number> = { top: 0, heart: 0, base: 0 };
  if (!t) return res;
  for (const i of items) {
    const n = NOTES_BY_ID[i.noteId];
    if (n) res[pyramidRole(n)] += (i.drops / t) * 100;
  }
  return res;
}

/** Стойкость одной ноты на коже в часах (до разведения). */
function noteLongevityHours(note: Note): number {
  return 0.4 + (10 - note.volatility) * 1.05;
}

export function estimateLongevity(items: FormulaItem[], conc: Concentration = 'EDP'): number {
  const t = totalDrops(items);
  if (!t) return 0;
  // Стойкость определяется «хвостом»: берём взвешенную сумму, усиливая вклад самых стойких нот.
  let weighted = 0;
  let maxTail = 0;
  for (const i of items) {
    const n = NOTES_BY_ID[i.noteId];
    if (!n) continue;
    const h = noteLongevityHours(n);
    weighted += (i.drops / t) * h;
    const share = i.drops / t;
    maxTail = Math.max(maxTail, h * Math.min(1, 0.55 + share * 2.5));
  }
  const raw = weighted * 0.45 + maxTail * 0.55;
  return Math.round(raw * CONCENTRATIONS[conc].longevity * 10) / 10;
}

export function estimateSillage(items: FormulaItem[], conc: Concentration = 'EDP'): { score: number; label: string } {
  const t = totalDrops(items);
  if (!t) return { score: 0, label: '—' };
  let s = 0;
  for (const i of items) {
    const n = NOTES_BY_ID[i.noteId];
    if (n) s += (i.drops / t) * n.strength;
  }
  s *= conc === 'EDT' ? 0.85 : conc === 'Extrait' ? 1.12 : 1;
  const score = Math.min(10, Math.round(s * 10) / 10);
  const label = score < 4.5 ? 'Интимный' : score < 6 ? 'Умеренный' : score < 7.2 ? 'Заметный' : 'Шлейфовый';
  return { score, label };
}

export function characterTags(items: FormulaItem[], limit = 6): string[] {
  const t = totalDrops(items);
  const scores = new Map<string, number>();
  for (const i of items) {
    const n = NOTES_BY_ID[i.noteId];
    if (!n || !t) continue;
    n.vibeTags.forEach((tag, idx) => {
      const w = (i.drops / t) * (1 - idx * 0.08);
      scores.set(tag, (scores.get(tag) ?? 0) + w);
    });
  }
  return [...scores.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([tag]) => tag);
}

export interface DilutionResult {
  concentrateMl: number;
  carrierMl: number;
  concentrateDrops: number;
  scale: number;
}

export function dilution(items: FormulaItem[], conc: Concentration, volumeMl: number): DilutionResult {
  const concentrateMl = Math.round(volumeMl * CONCENTRATIONS[conc].pct * 100) / 100;
  const carrierMl = Math.round((volumeMl - concentrateMl) * 100) / 100;
  const concentrateDrops = Math.round(concentrateMl * DROPS_PER_ML);
  const t = totalDrops(items);
  return { concentrateMl, carrierMl, concentrateDrops, scale: t ? Math.round((concentrateDrops / t) * 10) / 10 : 0 };
}

export interface BalanceAdvice {
  ok: boolean;
  message: string;
  deficitLayer: PyramidLayer | null;
  suggestions: FormulaItem[];
}

const LAYER_GEN: Record<PyramidLayer, string> = { top: 'верхних нот', heart: 'нот сердца', base: 'базы' };

export function balanceAdvice(items: FormulaItem[]): BalanceAdvice {
  const bal = layerBalance(items);
  const t = totalDrops(items);
  if (!items.length) {
    return { ok: false, message: 'Формула пуста — добавьте ноты из 3D-графа.', deficitLayer: null, suggestions: [] };
  }
  const deficits = (Object.keys(TARGET_BALANCE) as PyramidLayer[])
    .map((l) => ({ layer: l, diff: TARGET_BALANCE[l] - bal[l] }))
    .sort((a, b) => b.diff - a.diff);
  const worst = deficits[0];
  if (worst.diff < 7) {
    return { ok: true, message: 'Пирамида сбалансирована — близко к ориентиру 30/50/20.', deficitLayer: null, suggestions: [] };
  }
  const inFormula = new Set(items.map((i) => i.noteId));
  const candidates = NOTES.filter((n) => !inFormula.has(n.id) && pyramidRole(n) === worst.layer)
    .map((n) => ({
      note: n,
      score: items.reduce((s, i) => s + getSynergy(n.id, i.noteId) * i.drops, 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 2);
  // Сколько капель добавить, чтобы закрыть дефицит: x / (t + x) = (cur + diff)/100
  const targetShare = TARGET_BALANCE[worst.layer] / 100;
  const curDrops = (bal[worst.layer] / 100) * t;
  const need = Math.max(2, Math.round((targetShare * t - curDrops) / (1 - targetShare)));
  const per = Math.max(1, Math.min(30, Math.round(need / Math.max(1, candidates.length))));
  return {
    ok: false,
    message: `Не хватает ${LAYER_GEN[worst.layer]} (${Math.round(bal[worst.layer])}% при ориентире ${TARGET_BALANCE[worst.layer]}%). Подсвечены совместимые ноты.`,
    deficitLayer: worst.layer,
    suggestions: candidates.map((c) => ({ noteId: c.note.id, drops: per })),
  };
}

// ───────────── Таймлайн раскрытия ─────────────

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * Math.min(1, Math.max(0, t));
}
function smooth(t: number) {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

/** Интенсивность слоя (0–1) в момент времени (минуты 0–480). */
export function layerIntensity(layer: Layer | PyramidLayer, minutes: number, moleculeRole: PyramidLayer = 'base'): number {
  const m = minutes;
  switch (layer) {
    case 'top':
      if (m <= 30) return 1;
      if (m <= 180) return lerp(1, 0.15, smooth((m - 30) / 150));
      return lerp(0.15, 0.05, (m - 180) / 300);
    case 'heart':
      if (m <= 30) return lerp(0.5, 0.6, m / 30);
      if (m <= 90) return lerp(0.6, 1, smooth((m - 30) / 60));
      if (m <= 180) return 1;
      if (m <= 300) return lerp(1, 0.22, smooth((m - 180) / 120));
      return lerp(0.22, 0.1, (m - 300) / 180);
    case 'base':
      if (m <= 30) return lerp(0.08, 0.14, m / 30);
      if (m <= 180) return lerp(0.14, 0.65, smooth((m - 30) / 150));
      return lerp(0.65, 1, smooth((m - 180) / 180));
    case 'molecule':
      if (moleculeRole === 'heart') {
        // Hedione — прозрачное сияние сердца, держится дольше обычных цветов
        if (m <= 30) return 0.6;
        if (m <= 240) return lerp(0.6, 1, smooth((m - 30) / 120));
        return lerp(1, 0.45, (m - 240) / 240);
      }
      // Iso E Super, Ambroxan, Cashmeran: «радиаторы» кожи, светят всё сильнее
      if (m <= 30) return 0.35;
      if (m <= 180) return lerp(0.35, 0.8, smooth((m - 30) / 150));
      return lerp(0.8, 1, (m - 180) / 300);
  }
}

export function noteIntensity(note: Note, minutes: number): number {
  return layerIntensity(note.layer, minutes, pyramidRole(note));
}

export function formatTime(minutes: number): string {
  const m = Math.round(minutes);
  if (m <= 0) return '0 мин';
  if (m < 60) return `${m} мин`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h} ч ${r} мин` : `${h} ч`;
}

export function phaseLabel(minutes: number): string {
  if (minutes < 30) return 'Старт · верхние ноты';
  if (minutes < 180) return 'Сердце аромата';
  return 'База · шлейф';
}

function joinRu(names: string[]): string {
  if (names.length <= 1) return names.join('');
  return `${names.slice(0, -1).join(', ')} и ${names[names.length - 1]}`;
}

/** Динамическая строка статуса таймлайна. */
export function evolutionStatus(items: FormulaItem[], minutes: number): string {
  const notes = items.map((i) => ({ item: i, note: NOTES_BY_ID[i.noteId] })).filter((x) => x.note);
  if (!notes.length) return 'Добавьте ноты во флакон, чтобы увидеть раскрытие аромата во времени.';
  const t = totalDrops(items);
  const ranked = notes
    .map(({ item, note }) => ({
      note,
      value: noteIntensity(note, minutes) * (0.35 + item.drops / t) * (0.6 + note.strength / 20),
    }))
    .sort((a, b) => b.value - a.value);
  const leaders = ranked.slice(0, 3).map((r) => r.note.name);
  const time = minutes <= 0 ? 'Старт' : `Через ${formatTime(minutes)}`;

  if (minutes < 30) {
    return `${time}: первыми вспыхивают ${joinRu(leaders)} — сердце пока приглушено, база спит.`;
  }
  const tops = notes.filter((x) => x.note.layer === 'top');
  const gone = tops.filter((x) => noteIntensity(x.note, minutes) < 0.35).map((x) => x.note.name);
  const goneText = gone.length
    ? gone.length === tops.length
      ? 'верхние ноты ушли'
      : `верх уходит (${gone.slice(0, 2).join(', ')})`
    : 'верх ещё искрится';
  if (minutes < 180) {
    return `${time}: ${goneText}, сейчас солируют ${joinRu(leaders)}; база начинает просыпаться.`;
  }
  return `${time}: ${goneText}, на коже остаётся шлейф — ${joinRu(leaders)}.`;
}
