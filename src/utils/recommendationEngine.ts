import { NOTES, NOTES_BY_ID, getSynergy } from '../data/notes';
import { PERFUMES, PERFUMES_BY_ID, perfumeNoteIds } from '../data/perfumes';
import { SYNONYMS, VIBE_PRESETS } from '../data/vibes';
import type { FormulaItem, Perfume } from '../types';
import { pyramidRole, type PyramidLayer } from './perfumeryMath';

export const norm = (s: string) => s.toLowerCase().replace(/ё/g, 'е');

export function tokenize(text: string): string[] {
  return norm(text)
    .split(/[^a-zа-я0-9]+/i)
    .filter((t) => t.length >= 2);
}

function tagStem(tag: string): string {
  const t = norm(tag);
  return t.length <= 5 ? t.slice(0, Math.max(3, t.length - 1)) : t.slice(0, t.length - 2);
}

function tokenMatchesStem(token: string, stem: string): boolean {
  return stem.length >= 3 && token.startsWith(stem);
}

function tokenMatchesTag(token: string, tag: string): boolean {
  const stem = tagStem(tag);
  return token.startsWith(stem) || (token.length >= 4 && stem.startsWith(token));
}

/** Перевод формулы парфюма в капли для 3D-лаборатории. */
export function perfumeToFormula(p: Perfume): FormulaItem[] {
  const map = new Map<string, number>();
  const add = (ids: string[], drops: number) => ids.forEach((id) => map.set(id, Math.max(map.get(id) ?? 0, drops)));
  add(p.pyramid.top, 4);
  add(p.pyramid.heart, 6);
  add(p.pyramid.base, 4);
  if (map.size === 1) {
    // ароматы-монолиты (Molecule 01, Not a Perfume) — показываем молекулу крупно
    const [id] = [...map.keys()];
    map.set(id, 12);
  }
  return [...map.entries()].filter(([id]) => NOTES_BY_ID[id]).map(([noteId, drops]) => ({ noteId, drops }));
}

// ───────────── 1. По любимому парфюму ─────────────

export interface SimilarResult {
  perfume: Perfume;
  score: number;
  sharedNotes: string[];
  sharedVibes: string[];
  explanation: string;
}

function jaccard<T>(a: Set<T>, b: Set<T>): number {
  const inter = [...a].filter((x) => b.has(x)).length;
  const uni = new Set([...a, ...b]).size;
  return uni ? inter / uni : 0;
}

export function findSimilar(perfumeId: string, limit = 4): SimilarResult[] {
  const p = PERFUMES_BY_ID[perfumeId];
  if (!p) return [];
  const pn = new Set(perfumeNoteIds(p));
  const pv = new Set(p.vibes.map(norm));
  return PERFUMES.filter((q) => q.id !== p.id)
    .map((q) => {
      const qn = new Set(perfumeNoteIds(q));
      const qv = new Set(q.vibes.map(norm));
      // «Родственные» ноты тоже считаем: высокая синергия между нотами двух ароматов
      let affinity = 0;
      pn.forEach((a) => qn.forEach((b) => { if (a !== b) affinity = Math.max(affinity, getSynergy(a, b)); }));
      const score =
        jaccard(pn, qn) * 0.55 + jaccard(pv, qv) * 0.3 + (affinity / 100) * 0.08 + (p.similar.includes(q.id) ? 0.25 : 0);
      const sharedNotes = [...pn].filter((x) => qn.has(x)).map((id) => NOTES_BY_ID[id]?.name ?? id);
      const sharedVibes = q.vibes.filter((v) => pv.has(norm(v)));
      const parts: string[] = [];
      if (sharedNotes.length) parts.push(`общие ноты: ${sharedNotes.slice(0, 4).join(', ')}`);
      if (sharedVibes.length) parts.push(`общий вайб: ${sharedVibes.slice(0, 3).join(', ')}`);
      if (!parts.length) parts.push('похожая структура и настроение');
      return { perfume: q, score, sharedNotes, sharedVibes, explanation: parts.join(' · ') };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// ───────────── 2. Люблю / Не переношу ─────────────

export interface NoteMatchResult {
  perfume: Perfume;
  match: number;
  loved: string[];
  hated: string[];
}

export function rankByNotes(loved: string[], hated: string[]): NoteMatchResult[] {
  if (!loved.length && !hated.length) return [];
  return PERFUMES.map((p) => {
    const ids = new Set(perfumeNoteIds(p));
    const lovedHit = loved.filter((id) => ids.has(id));
    const hatedHit = hated.filter((id) => ids.has(id));
    // Частичный бонус за «родственные» ноты к любимым
    let related = 0;
    for (const l of loved) {
      if (ids.has(l)) continue;
      let best = 0;
      ids.forEach((id) => (best = Math.max(best, getSynergy(l, id))));
      related += best >= 80 ? 0.35 : best >= 70 ? 0.2 : 0;
    }
    const base = loved.length ? ((lovedHit.length + related) / loved.length) * 100 : 70;
    const match = Math.round(Math.max(0, Math.min(99, base - hatedHit.length * 38)));
    return { perfume: p, match, loved: lovedHit, hated: hatedHit };
  })
    .filter((r) => r.match > 0)
    .sort((a, b) => b.match - a.match || b.loved.length - a.loved.length);
}

// ───────────── 3. «Хочу пахнуть как...» ─────────────

export interface VibeResult {
  title: string;
  explanation: string;
  formula: FormulaItem[];
  perfumes: { perfume: Perfume; match: number }[];
  matchedWords: string[];
  source: 'local' | 'preset' | 'ai';
  aiProvider?: string;
}

export function scoreNotesForQuery(query: string): { scores: Map<string, number>; matchedWords: string[]; tags: Map<string, number> } {
  const tokens = tokenize(query);
  const scores = new Map<string, number>();
  const tags = new Map<string, number>();
  const matched = new Set<string>();
  const bump = (id: string, w: number) => scores.set(id, (scores.get(id) ?? 0) + w);

  for (const tok of tokens) {
    // а) прямое совпадение с названием ноты
    for (const n of NOTES) {
      // для составных названий («Черный чай») сверяем только ключевое последнее слово
      const words = tokenize(n.name).slice(-1);
      if (words.some((w) => (w.length <= 3 ? tok === w : tok.startsWith(w.slice(0, Math.max(3, w.length - 2)))))) {
        bump(n.id, 5);
        matched.add(tok);
      }
    }
    // б) словарь синонимов и образов
    for (const s of SYNONYMS) {
      const hit = s.stems.some((st) => tokenMatchesStem(tok, st)) || (s.exact ?? []).includes(tok);
      if (!hit) continue;
      matched.add(tok);
      s.notes.forEach((id, idx) => bump(id, 3 - idx * 0.35));
      s.tags.forEach((t) => tags.set(norm(t), (tags.get(norm(t)) ?? 0) + 1));
    }
  }
  // в) совпадение по vibeTags нот
  for (const n of NOTES) {
    for (const tag of n.vibeTags) {
      const direct = tokens.some((tok) => tokenMatchesTag(tok, tag));
      const fromSyn = tags.get(norm(tag)) ?? 0;
      if (direct) bump(n.id, 1.2);
      if (fromSyn) bump(n.id, 0.6 * fromSyn);
      if (direct) tags.set(norm(tag), (tags.get(norm(tag)) ?? 0) + 1);
    }
  }
  tokens.forEach((tok) => {
    if (NOTES.some((n) => n.vibeTags.some((t) => tokenMatchesTag(tok, t)))) matched.add(tok);
  });
  return { scores, matchedWords: [...matched], tags };
}

const LAYER_LIMITS: Record<PyramidLayer, number> = { top: 2, heart: 3, base: 3 };
const LAYER_DROPS: Record<PyramidLayer, number> = { top: 9, heart: 15, base: 7 };

export function buildFormulaFromScores(scores: Map<string, number>): FormulaItem[] {
  const ranked = [...scores.entries()].filter(([, s]) => s > 1).sort((a, b) => b[1] - a[1]);
  const picks: Record<PyramidLayer, { id: string; s: number }[]> = { top: [], heart: [], base: [] };
  let molecules = 0;
  for (const [id, s] of ranked) {
    const n = NOTES_BY_ID[id];
    if (!n) continue;
    const layer = pyramidRole(n);
    if (n.layer === 'molecule') {
      if (molecules >= 1 || s < 2) continue;
      molecules++;
    }
    if (picks[layer].length < LAYER_LIMITS[layer]) picks[layer].push({ id, s });
  }
  const chosen = () => [...picks.top, ...picks.heart, ...picks.base].map((p) => p.id);
  if (!chosen().length) return [];
  // Заполняем пустые слои лучшими партнёрами по синергии
  (['top', 'heart', 'base'] as PyramidLayer[]).forEach((layer) => {
    const need = layer === 'heart' ? 2 : 1;
    while (picks[layer].length < need) {
      const ids = chosen();
      const best = NOTES.filter((n) => pyramidRole(n) === layer && n.layer !== 'molecule' && !ids.includes(n.id))
        .map((n) => ({ id: n.id, s: ids.reduce((acc, id) => acc + getSynergy(n.id, id), 0) }))
        .sort((a, b) => b.s - a.s)[0];
      if (!best) break;
      picks[layer].push({ id: best.id, s: 1 });
    }
  });
  // «Звёзды» запроса (2 ноты с максимальным счётом) получают дополнительные капли,
  // чтобы главный образ звучал, даже если это базовая нота.
  const stars = new Set(ranked.slice(0, 2).map(([id]) => id));
  const out: FormulaItem[] = [];
  (['top', 'heart', 'base'] as PyramidLayer[]).forEach((layer) => {
    const list = picks[layer];
    const sum = list.reduce((a, p) => a + Math.sqrt(p.s), 0) || 1;
    const cap = list.length === 1 ? 6 : 30;
    list.forEach((p) => {
      const drops = Math.round((LAYER_DROPS[layer] * Math.sqrt(p.s)) / sum) + (stars.has(p.id) ? 3 : 0);
      out.push({ noteId: p.id, drops: Math.max(1, Math.min(cap, drops)) });
    });
  });
  return out;
}

export function rankPerfumesForFormula(formula: FormulaItem[], extraScores?: Map<string, number>, tags?: Map<string, number>) {
  const weights = new Map<string, number>();
  formula.forEach((f) => weights.set(f.noteId, (weights.get(f.noteId) ?? 0) + 1 + f.drops / 10));
  extraScores?.forEach((s, id) => weights.set(id, (weights.get(id) ?? 0) + s * 0.25));
  const raw = PERFUMES.map((p) => {
    const ids = perfumeNoteIds(p);
    let s = ids.reduce((acc, id) => acc + (weights.get(id) ?? 0), 0) / Math.sqrt(ids.length + 1);
    if (tags) p.vibes.forEach((v) => (s += (tags.get(norm(v)) ?? 0) * 0.6));
    return { perfume: p, s };
  }).sort((a, b) => b.s - a.s);
  const max = raw[0]?.s || 1;
  return raw
    .filter((r) => r.s > 0)
    .slice(0, 3)
    .map((r, i) => ({ perfume: r.perfume, match: Math.round(Math.min(97, 60 + (r.s / max) * 37 - i * 3)) }));
}

export function matchVibe(query: string): VibeResult | null {
  const q = norm(query.trim());
  if (!q) return null;
  const preset = VIBE_PRESETS.find((p) => norm(p.query) === q || norm(p.label).includes(q));
  const { scores, matchedWords, tags } = scoreNotesForQuery(query);

  if (preset) {
    return {
      title: preset.label.replace(/^\S+\s/, ''),
      explanation: 'Кураторский образ из коллекции SILLAGE: формула собрана парфюмером вручную.',
      formula: preset.formula,
      perfumes: rankPerfumesForFormula(preset.formula, scores, tags),
      matchedWords,
      source: 'preset',
    };
  }
  const formula = buildFormulaFromScores(scores);
  if (!formula.length) return null;
  const leaders = formula
    .slice()
    .sort((a, b) => (scores.get(b.noteId) ?? 0) - (scores.get(a.noteId) ?? 0))
    .slice(0, 3)
    .map((f) => NOTES_BY_ID[f.noteId].name);
  return {
    title: query.trim().replace(/^./, (c) => c.toUpperCase()),
    explanation: `Ассоциации найдены по словам: ${matchedWords.slice(0, 6).join(', ')}. Главные акценты — ${leaders.join(', ')}; недостающие слои пирамиды дополнены по синергии.`,
    formula,
    perfumes: rankPerfumesForFormula(formula, scores, tags),
    matchedWords,
    source: 'local',
  };
}
