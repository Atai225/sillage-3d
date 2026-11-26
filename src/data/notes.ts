import type { Layer, LinkType, Note, NoteLink } from '../types';

type RawNote = Omit<Note, 'links'>;

const RAW_NOTES: RawNote[] = [
  // ───────── ВЕРХНИЕ НОТЫ (Y > 0) ─────────
  { id: 'bergamot', name: 'Бергамот', layer: 'top', family: 'Цитрусовые', volatility: 9, strength: 6, vibeTags: ['свежий', 'цитрус', 'искристый', 'чистый', 'солнечный'], color: '#FDE68A' },
  { id: 'yuzu', name: 'Юдзу', layer: 'top', family: 'Цитрусовые', volatility: 10, strength: 5, vibeTags: ['свежий', 'цитрус', 'кислый', 'японский', 'искристый'], color: '#FEF08A' },
  { id: 'black-pepper', name: 'Черный перец', layer: 'top', family: 'Пряные', volatility: 8, strength: 7, vibeTags: ['пряный', 'сухой', 'острый', 'мужской', 'древесный'], color: '#F5E6A8' },
  { id: 'pink-pepper', name: 'Розовый перец', layer: 'top', family: 'Пряные', volatility: 8, strength: 6, vibeTags: ['пряный', 'игристый', 'розовый', 'модный', 'яркий'], color: '#FCD9B8' },
  { id: 'eucalyptus', name: 'Эвкалипт', layer: 'top', family: 'Ароматические', volatility: 9, strength: 7, vibeTags: ['свежий', 'холодный', 'мятный', 'зелёный', 'чистый'], color: '#E2F7B5' },
  { id: 'neroli', name: 'Нероли', layer: 'top', family: 'Цветочно-цитрусовые', volatility: 8, strength: 5, vibeTags: ['свежий', 'цветочный', 'мыльный', 'чистый', 'солнечный', 'белый'], color: '#FFF7D6' },
  { id: 'green-apple', name: 'Зеленое яблоко', layer: 'top', family: 'Фруктовые', volatility: 9, strength: 5, vibeTags: ['свежий', 'яблоко', 'хрустящий', 'зелёный', 'сочный', 'фруктовый'], color: '#E8F5A0' },
  { id: 'blood-orange', name: 'Красный апельсин', layer: 'top', family: 'Цитрусовые', volatility: 9, strength: 6, vibeTags: ['сочный', 'цитрус', 'солнечный', 'сладкий', 'фруктовый'], color: '#FDBA74' },
  { id: 'cardamom', name: 'Кардамон', layer: 'top', family: 'Пряные', volatility: 7, strength: 6, vibeTags: ['пряный', 'тёплый', 'восточный', 'кофейный', 'ароматный'], color: '#FDE047' },
  { id: 'pear', name: 'Груша', layer: 'top', family: 'Фруктовые', volatility: 8, strength: 4, vibeTags: ['сочный', 'фруктовый', 'нежный', 'сладкий', 'свежий'], color: '#FEF3C7' },
  { id: 'lemon', name: 'Лимон', layer: 'top', family: 'Цитрусовые', volatility: 10, strength: 6, vibeTags: ['свежий', 'цитрус', 'кислый', 'чистый', 'бодрый'], color: '#FACC15' },
  { id: 'mandarin', name: 'Мандарин', layer: 'top', family: 'Цитрусовые', volatility: 9, strength: 5, vibeTags: ['сладкий', 'цитрус', 'солнечный', 'праздничный', 'фруктовый'], color: '#FCD34D' },
  { id: 'sea-salt', name: 'Морская соль', layer: 'top', family: 'Морские', volatility: 7, strength: 5, vibeTags: ['морской', 'солёный', 'свежий', 'минеральный', 'ветреный'], color: '#EAF6F0' },

  // ───────── НОТЫ СЕРДЦА (Y ≈ 0) ─────────
  { id: 'rose', name: 'Роза', layer: 'heart', family: 'Цветочные', volatility: 6, strength: 8, vibeTags: ['цветочный', 'романтичный', 'бархатный', 'женственный', 'классический'], color: '#F0ABFC' },
  { id: 'peony', name: 'Пион', layer: 'heart', family: 'Цветочные', volatility: 7, strength: 5, vibeTags: ['цветочный', 'нежный', 'розовый', 'свежий', 'воздушный'], color: '#F5D0FE' },
  { id: 'white-rice', name: 'Белый рис', layer: 'heart', family: 'Гурманские', volatility: 6, strength: 3, vibeTags: ['чистый', 'мягкий', 'пудровый', 'молочный', 'уютный'], color: '#EDE9FE' },
  { id: 'jasmine', name: 'Жасмин', layer: 'heart', family: 'Цветочные', volatility: 5, strength: 8, vibeTags: ['цветочный', 'белый', 'чувственный', 'сладкий', 'ночной'], color: '#E9D5FF' },
  { id: 'cherry', name: 'Вишня', layer: 'heart', family: 'Фруктовые', volatility: 6, strength: 7, vibeTags: ['фруктовый', 'вишня', 'сочный', 'дерзкий', 'сладкий', 'ликёрный'], color: '#F472B6' },
  { id: 'black-tea', name: 'Черный чай', layer: 'heart', family: 'Чайные', volatility: 6, strength: 5, vibeTags: ['чай', 'сухой', 'дымный', 'уютный', 'утончённый'], color: '#C4B5FD' },
  { id: 'lavender', name: 'Лаванда', layer: 'heart', family: 'Ароматические', volatility: 7, strength: 6, vibeTags: ['ароматический', 'чистый', 'успокаивающий', 'травяной', 'барбершоп'], color: '#A78BFA' },
  { id: 'iris', name: 'Ирис', layer: 'heart', family: 'Пудровые', volatility: 4, strength: 6, vibeTags: ['пудровый', 'элегантный', 'холодный', 'чистый', 'дорогой'], color: '#DDD6FE' },
  { id: 'fig', name: 'Инжир', layer: 'heart', family: 'Фруктово-зелёные', volatility: 6, strength: 5, vibeTags: ['зелёный', 'сливочный', 'молочный', 'средиземноморский', 'сочный'], color: '#C084FC' },
  { id: 'saffron', name: 'Шафран', layer: 'heart', family: 'Пряные', volatility: 5, strength: 8, vibeTags: ['пряный', 'кожаный', 'восточный', 'тёплый', 'роскошный'], color: '#D8B4FE' },
  { id: 'rum', name: 'Ром', layer: 'heart', family: 'Ликёрные', volatility: 6, strength: 7, vibeTags: ['ликёрный', 'тёплый', 'сладкий', 'пьяный', 'вечерний'], color: '#E4B5F7' },
  { id: 'cognac', name: 'Коньяк', layer: 'heart', family: 'Ликёрные', volatility: 5, strength: 7, vibeTags: ['ликёрный', 'тёплый', 'дорогой', 'вечерний', 'бархатный'], color: '#D9A6F5' },
  { id: 'cinnamon', name: 'Корица', layer: 'heart', family: 'Пряные', volatility: 5, strength: 8, vibeTags: ['пряный', 'тёплый', 'сладкий', 'праздничный', 'уютный'], color: '#E2A6F0' },
  { id: 'sage', name: 'Шалфей', layer: 'heart', family: 'Ароматические', volatility: 7, strength: 5, vibeTags: ['травяной', 'свежий', 'сухой', 'морской', 'минеральный'], color: '#C7B8F5' },

  // ───────── БАЗОВЫЕ НОТЫ (Y < 0) ─────────
  { id: 'tobacco', name: 'Табак', layer: 'base', family: 'Табачные', volatility: 3, strength: 8, vibeTags: ['табак', 'тёплый', 'медовый', 'дымный', 'уютный', 'вечерний'], color: '#D4AF37' },
  { id: 'vanilla', name: 'Ваниль', layer: 'base', family: 'Гурманские', volatility: 2, strength: 7, vibeTags: ['сладкий', 'тёплый', 'ваниль', 'уютный', 'гурманский'], color: '#F3D98B' },
  { id: 'musk', name: 'Мускус', layer: 'base', family: 'Мускусные', volatility: 1, strength: 4, vibeTags: ['чистый', 'кожный', 'мягкий', 'бельё', 'уютный'], color: '#EADBB0' },
  { id: 'rosewood', name: 'Палисандр', layer: 'base', family: 'Древесные', volatility: 4, strength: 5, vibeTags: ['древесный', 'розовый', 'мягкий', 'тёплый'], color: '#C8A46A' },
  { id: 'patchouli', name: 'Пачули', layer: 'base', family: 'Древесные', volatility: 2, strength: 8, vibeTags: ['землистый', 'тёмный', 'древесный', 'шипровый', 'глубокий'], color: '#A67C2E' },
  { id: 'oud', name: 'Уд', layer: 'base', family: 'Древесные', volatility: 1, strength: 10, vibeTags: ['древесный', 'смолистый', 'восточный', 'тёмный', 'роскошный', 'дымный'], color: '#B8862A' },
  { id: 'amber', name: 'Амбра', layer: 'base', family: 'Амбровые', volatility: 2, strength: 7, vibeTags: ['тёплый', 'смолистый', 'сладкий', 'восточный', 'обволакивающий'], color: '#E0A526' },
  { id: 'leather', name: 'Кожа', layer: 'base', family: 'Кожаные', volatility: 2, strength: 8, vibeTags: ['кожаный', 'дерзкий', 'дымный', 'тёмный', 'мужской'], color: '#A8743A' },
  { id: 'vetiver', name: 'Ветивер', layer: 'base', family: 'Древесные', volatility: 2, strength: 6, vibeTags: ['землистый', 'зелёный', 'дымный', 'сухой', 'чистый'], color: '#B59B4C' },
  { id: 'cedar', name: 'Кедр', layer: 'base', family: 'Древесные', volatility: 3, strength: 6, vibeTags: ['древесный', 'сухой', 'карандашный', 'чистый', 'строгий'], color: '#C9A45C' },
  { id: 'sandalwood', name: 'Сандал', layer: 'base', family: 'Древесные', volatility: 2, strength: 6, vibeTags: ['древесный', 'сливочный', 'мягкий', 'медитативный', 'молочный'], color: '#E3C27A' },
  { id: 'tonka', name: 'Бобы тонка', layer: 'base', family: 'Гурманские', volatility: 2, strength: 7, vibeTags: ['сладкий', 'миндальный', 'тёплый', 'ореховый', 'гурманский'], color: '#D9B45A' },
  { id: 'incense', name: 'Ладан', layer: 'base', family: 'Смолистые', volatility: 2, strength: 8, vibeTags: ['дымный', 'смолистый', 'мистический', 'церковный', 'холодный'], color: '#BFA76A' },
  { id: 'praline', name: 'Пралине', layer: 'base', family: 'Гурманские', volatility: 2, strength: 7, vibeTags: ['сладкий', 'карамельный', 'ореховый', 'гурманский', 'десертный'], color: '#E8B04B' },

  // ───────── МОЛЕКУЛЫ (внешнее орбитальное кольцо) ─────────
  { id: 'iso-e-super', name: 'Iso E Super', layer: 'molecule', family: 'Синтетические молекулы', volatility: 3, strength: 4, vibeTags: ['бархатный', 'древесный', 'кожный', 'прозрачный', 'современный'], color: '#38BDF8' },
  { id: 'ambroxan', name: 'Ambroxan', layer: 'molecule', family: 'Синтетические молекулы', volatility: 2, strength: 7, vibeTags: ['амбровый', 'минеральный', 'солёный', 'кожный', 'современный', 'чистый'], color: '#7DD3FC' },
  { id: 'hedione', name: 'Hedione', layer: 'molecule', family: 'Синтетические молекулы', volatility: 5, strength: 3, vibeTags: ['воздушный', 'жасминовый', 'прозрачный', 'свежий', 'сияющий'], color: '#BAE6FD' },
  { id: 'cashmeran', name: 'Cashmeran', layer: 'molecule', family: 'Синтетические молекулы', volatility: 4, strength: 5, vibeTags: ['мягкий', 'кашемир', 'мускусный', 'древесный', 'уютный'], color: '#22A6E8' },
];

/** Связи: [нота A, нота B, синергия 1–100, тип]. c — классика, a — авангард. */
const PAIRS: [string, string, number, 'c' | 'a'][] = [
  // верхние
  ['bergamot', 'lavender', 88, 'c'], ['bergamot', 'neroli', 85, 'c'], ['bergamot', 'black-tea', 90, 'c'], ['bergamot', 'vetiver', 82, 'c'],
  ['bergamot', 'iris', 75, 'c'], ['bergamot', 'ambroxan', 80, 'c'], ['bergamot', 'lemon', 78, 'c'], ['bergamot', 'pink-pepper', 74, 'c'],
  ['yuzu', 'hedione', 86, 'a'], ['yuzu', 'white-rice', 78, 'a'], ['yuzu', 'musk', 80, 'c'], ['yuzu', 'jasmine', 72, 'a'], ['yuzu', 'black-tea', 76, 'a'], ['yuzu', 'sea-salt', 70, 'a'],
  ['black-pepper', 'cedar', 84, 'c'], ['black-pepper', 'leather', 80, 'c'], ['black-pepper', 'cardamom', 78, 'c'], ['black-pepper', 'incense', 82, 'c'], ['black-pepper', 'vetiver', 76, 'c'], ['black-pepper', 'oud', 74, 'a'],
  ['pink-pepper', 'rose', 88, 'c'], ['pink-pepper', 'iris', 76, 'c'], ['pink-pepper', 'cherry', 79, 'a'], ['pink-pepper', 'patchouli', 78, 'c'], ['pink-pepper', 'ambroxan', 72, 'a'], ['pink-pepper', 'peony', 70, 'c'],
  ['eucalyptus', 'lavender', 80, 'c'], ['eucalyptus', 'sea-salt', 74, 'a'], ['eucalyptus', 'vetiver', 68, 'a'], ['eucalyptus', 'cedar', 72, 'c'], ['eucalyptus', 'iso-e-super', 66, 'a'],
  ['neroli', 'jasmine', 84, 'c'], ['neroli', 'musk', 86, 'c'], ['neroli', 'white-rice', 72, 'a'], ['neroli', 'lemon', 80, 'c'], ['neroli', 'iris', 74, 'c'], ['neroli', 'hedione', 82, 'c'],
  ['green-apple', 'pear', 78, 'c'], ['green-apple', 'musk', 75, 'c'], ['green-apple', 'peony', 74, 'c'], ['green-apple', 'cedar', 70, 'a'], ['green-apple', 'ambroxan', 77, 'a'], ['green-apple', 'sage', 64, 'a'],
  ['blood-orange', 'cinnamon', 76, 'a'], ['blood-orange', 'vanilla', 74, 'c'], ['blood-orange', 'saffron', 72, 'a'], ['blood-orange', 'amber', 78, 'c'], ['blood-orange', 'patchouli', 70, 'a'],
  ['cardamom', 'tobacco', 82, 'c'], ['cardamom', 'rosewood', 84, 'c'], ['cardamom', 'sandalwood', 80, 'c'], ['cardamom', 'iris', 78, 'a'], ['cardamom', 'saffron', 76, 'c'], ['cardamom', 'cognac', 74, 'a'],
  ['pear', 'jasmine', 70, 'c'], ['pear', 'praline', 80, 'c'], ['pear', 'iris', 74, 'a'], ['pear', 'musk', 72, 'c'], ['pear', 'vanilla', 70, 'c'],
  ['lemon', 'lavender', 76, 'c'], ['lemon', 'sage', 74, 'c'], ['lemon', 'cedar', 70, 'c'], ['lemon', 'rum', 66, 'a'],
  ['mandarin', 'cinnamon', 72, 'c'], ['mandarin', 'tonka', 74, 'c'], ['mandarin', 'jasmine', 70, 'c'], ['mandarin', 'amber', 68, 'c'],
  ['sea-salt', 'sage', 92, 'c'], ['sea-salt', 'ambroxan', 88, 'a'], ['sea-salt', 'vetiver', 74, 'a'], ['sea-salt', 'musk', 72, 'c'], ['sea-salt', 'fig', 68, 'a'],
  // сердце
  ['rose', 'oud', 94, 'c'], ['rose', 'patchouli', 90, 'c'], ['rose', 'saffron', 86, 'c'], ['rose', 'cherry', 72, 'a'], ['rose', 'black-tea', 70, 'a'], ['rose', 'musk', 74, 'c'], ['rose', 'incense', 78, 'a'], ['rose', 'leather', 70, 'a'],
  ['peony', 'musk', 80, 'c'], ['peony', 'white-rice', 72, 'a'], ['peony', 'hedione', 76, 'c'], ['peony', 'cashmeran', 70, 'a'],
  ['white-rice', 'sandalwood', 76, 'a'], ['white-rice', 'musk', 82, 'c'], ['white-rice', 'iris', 74, 'a'], ['white-rice', 'cashmeran', 78, 'a'], ['white-rice', 'black-tea', 70, 'a'],
  ['jasmine', 'sandalwood', 82, 'c'], ['jasmine', 'hedione', 90, 'c'], ['jasmine', 'vanilla', 72, 'c'], ['jasmine', 'amber', 74, 'c'], ['jasmine', 'saffron', 80, 'a'], ['jasmine', 'tonka', 70, 'c'],
  ['cherry', 'tobacco', 86, 'a'], ['cherry', 'leather', 84, 'a'], ['cherry', 'vanilla', 82, 'c'], ['cherry', 'tonka', 80, 'c'], ['cherry', 'black-tea', 74, 'a'], ['cherry', 'cognac', 76, 'a'],
  ['black-tea', 'tobacco', 74, 'a'], ['black-tea', 'fig', 80, 'a'], ['black-tea', 'vetiver', 72, 'c'], ['black-tea', 'cedar', 70, 'c'], ['black-tea', 'leather', 68, 'a'],
  ['lavender', 'tonka', 86, 'c'], ['lavender', 'vanilla', 78, 'c'], ['lavender', 'cedar', 72, 'c'], ['lavender', 'musk', 70, 'c'], ['lavender', 'incense', 64, 'a'], ['lavender', 'ambroxan', 68, 'a'],
  ['iris', 'cedar', 72, 'c'], ['iris', 'ambroxan', 74, 'a'], ['iris', 'leather', 80, 'c'], ['iris', 'musk', 84, 'c'], ['iris', 'vanilla', 76, 'c'], ['iris', 'incense', 78, 'a'],
  ['fig', 'sandalwood', 74, 'c'], ['fig', 'cedar', 82, 'c'], ['fig', 'vetiver', 70, 'a'], ['fig', 'cashmeran', 72, 'a'], ['fig', 'musk', 66, 'c'], ['fig', 'iso-e-super', 74, 'a'],
  ['saffron', 'oud', 92, 'c'], ['saffron', 'leather', 86, 'c'], ['saffron', 'amber', 78, 'c'], ['saffron', 'ambroxan', 82, 'a'], ['saffron', 'cedar', 76, 'a'],
  ['rum', 'tobacco', 88, 'c'], ['rum', 'vanilla', 84, 'c'], ['rum', 'cinnamon', 82, 'c'], ['rum', 'tonka', 78, 'c'], ['rum', 'praline', 76, 'c'],
  ['cognac', 'cinnamon', 86, 'c'], ['cognac', 'tonka', 82, 'c'], ['cognac', 'praline', 84, 'c'], ['cognac', 'sandalwood', 74, 'c'], ['cognac', 'oud', 72, 'a'],
  ['cinnamon', 'vanilla', 82, 'c'], ['cinnamon', 'tobacco', 84, 'c'], ['cinnamon', 'amber', 76, 'c'], ['cinnamon', 'incense', 70, 'a'],
  ['sage', 'ambroxan', 84, 'a'], ['sage', 'musk', 70, 'c'], ['sage', 'cedar', 72, 'c'], ['sage', 'vetiver', 74, 'c'],
  // база
  ['tobacco', 'vanilla', 95, 'c'], ['tobacco', 'tonka', 88, 'c'], ['tobacco', 'leather', 78, 'c'], ['tobacco', 'cedar', 70, 'c'], ['tobacco', 'praline', 72, 'a'], ['tobacco', 'oud', 74, 'a'], ['tobacco', 'amber', 76, 'c'],
  ['vanilla', 'amber', 88, 'c'], ['vanilla', 'tonka', 90, 'c'], ['vanilla', 'sandalwood', 82, 'c'], ['vanilla', 'praline', 86, 'c'], ['vanilla', 'incense', 72, 'a'], ['vanilla', 'musk', 74, 'c'],
  ['musk', 'cashmeran', 84, 'c'], ['musk', 'ambroxan', 78, 'c'], ['musk', 'sandalwood', 76, 'c'], ['musk', 'iso-e-super', 80, 'c'],
  ['rosewood', 'oud', 86, 'c'], ['rosewood', 'sandalwood', 82, 'c'], ['rosewood', 'vetiver', 72, 'c'], ['rosewood', 'iso-e-super', 70, 'a'],
  ['patchouli', 'vanilla', 80, 'c'], ['patchouli', 'amber', 82, 'c'], ['patchouli', 'leather', 74, 'c'], ['patchouli', 'praline', 76, 'a'], ['patchouli', 'oud', 72, 'c'],
  ['oud', 'amber', 84, 'c'], ['oud', 'incense', 80, 'c'], ['oud', 'leather', 82, 'c'], ['oud', 'sandalwood', 80, 'c'],
  ['amber', 'ambroxan', 72, 'a'], ['amber', 'incense', 78, 'c'], ['amber', 'cashmeran', 70, 'c'],
  ['leather', 'vetiver', 70, 'c'], ['leather', 'incense', 74, 'a'], ['leather', 'iso-e-super', 72, 'a'], ['leather', 'cedar', 72, 'c'],
  ['vetiver', 'cedar', 84, 'c'], ['vetiver', 'iso-e-super', 80, 'a'], ['vetiver', 'incense', 74, 'c'], ['vetiver', 'ambroxan', 70, 'a'],
  ['cedar', 'iso-e-super', 88, 'c'], ['cedar', 'sandalwood', 76, 'c'], ['cedar', 'incense', 76, 'c'], ['cedar', 'cashmeran', 72, 'a'],
  ['sandalwood', 'iso-e-super', 82, 'c'], ['sandalwood', 'cashmeran', 80, 'c'], ['sandalwood', 'ambroxan', 74, 'a'],
  ['tonka', 'praline', 82, 'c'], ['tonka', 'cashmeran', 72, 'a'], ['tonka', 'amber', 76, 'c'],
  ['incense', 'iso-e-super', 76, 'a'], ['incense', 'ambroxan', 68, 'a'],
  ['praline', 'ambroxan', 74, 'a'], ['praline', 'cashmeran', 76, 'a'],
  // молекулы между собой
  ['hedione', 'iso-e-super', 80, 'c'], ['ambroxan', 'iso-e-super', 86, 'c'], ['hedione', 'ambroxan', 78, 'c'], ['cashmeran', 'iso-e-super', 74, 'c'],
];

function buildNotes(): Note[] {
  const linkMap = new Map<string, NoteLink[]>();
  const seen = new Set<string>();
  const ids = new Set(RAW_NOTES.map((n) => n.id));
  for (const [a, b, synergy, t] of PAIRS) {
    if (!ids.has(a) || !ids.has(b) || a === b) continue;
    const key = [a, b].sort().join('|');
    if (seen.has(key)) continue;
    seen.add(key);
    const type: LinkType = t === 'c' ? 'classic' : 'avant-garde';
    if (!linkMap.has(a)) linkMap.set(a, []);
    if (!linkMap.has(b)) linkMap.set(b, []);
    linkMap.get(a)!.push({ targetId: b, synergy, type });
    linkMap.get(b)!.push({ targetId: a, synergy, type });
  }
  return RAW_NOTES.map((n) => ({
    ...n,
    links: (linkMap.get(n.id) ?? []).sort((x, y) => y.synergy - x.synergy),
  }));
}

export const NOTES: Note[] = buildNotes();

export const NOTES_BY_ID: Record<string, Note> = Object.fromEntries(NOTES.map((n) => [n.id, n]));

export const LAYER_LABELS: Record<Layer, string> = {
  top: 'Верхняя нота',
  heart: 'Нота сердца',
  base: 'Базовая нота',
  molecule: 'Молекула',
};

export const LAYER_SHORT: Record<Layer, string> = {
  top: 'Верх',
  heart: 'Сердце',
  base: 'База',
  molecule: 'Молекула',
};

export const LAYER_COLORS: Record<Layer, string> = {
  top: '#FDE047',
  heart: '#C084FC',
  base: '#D4AF37',
  molecule: '#38BDF8',
};

export function getSynergy(a: string, b: string): number {
  return NOTES_BY_ID[a]?.links.find((l) => l.targetId === b)?.synergy ?? 0;
}
