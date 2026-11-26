export type Layer = 'top' | 'heart' | 'base' | 'molecule';
export type LinkType = 'classic' | 'avant-garde';

export interface NoteLink {
  targetId: string;
  /** Синергия 1–100 */
  synergy: number;
  type: LinkType;
}

export interface Note {
  id: string;
  name: string;
  layer: Layer;
  family: string;
  /** Летучесть 1–10 (10 — испаряется быстрее всего) */
  volatility: number;
  /** Сила / яркость 1–10 */
  strength: number;
  vibeTags: string[];
  color: string;
  links: NoteLink[];
}

export interface Perfume {
  id: string;
  brand: string;
  name: string;
  year: number;
  pyramid: { top: string[]; heart: string[]; base: string[] };
  description: string;
  vibes: string[];
  similar: string[];
}

export interface FormulaItem {
  noteId: string;
  drops: number;
}

export type Concentration = 'EDT' | 'EDP' | 'Extrait';
export type Carrier = 'alcohol' | 'jojoba';

export interface VibePreset {
  id: string;
  label: string;
  query: string;
  formula: FormulaItem[];
}

export interface SavedFormula {
  id: string;
  name: string;
  items: FormulaItem[];
  createdAt: number;
}
