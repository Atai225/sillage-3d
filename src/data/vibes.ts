import type { VibePreset } from '../types';

/** Стартовый пресет, загружается в 3D-лабораторию при запуске. */
export const STARTER_PRESET: VibePreset = {
  id: 'midnight-cherry',
  label: 'Полночная вишня',
  query: 'кожей и вишней',
  formula: [
    { noteId: 'bergamot', drops: 5 },
    { noteId: 'pink-pepper', drops: 4 },
    { noteId: 'cardamom', drops: 2 },
    { noteId: 'cherry', drops: 7 },
    { noteId: 'rose', drops: 5 },
    { noteId: 'black-tea', drops: 4 },
    { noteId: 'tobacco', drops: 3 },
    { noteId: 'vanilla', drops: 2 },
    { noteId: 'ambroxan', drops: 2 },
  ],
};

/** Готовые чипсы-образы для «Хочу пахнуть как...». */
export const VIBE_PRESETS: VibePreset[] = [
  {
    id: 'apple-rain', label: '🍏 Яблоко после дождя', query: 'свежим зелёным яблоком после дождя',
    formula: [
      { noteId: 'green-apple', drops: 6 }, { noteId: 'bergamot', drops: 3 }, { noteId: 'eucalyptus', drops: 1 },
      { noteId: 'peony', drops: 6 }, { noteId: 'hedione', drops: 5 }, { noteId: 'sage', drops: 3 },
      { noteId: 'vetiver', drops: 3 }, { noteId: 'musk', drops: 3 },
    ],
  },
  {
    id: 'tobacco-vanilla', label: '🍂 Тёплый табак и ваниль', query: 'тёплым табаком и ванилью',
    formula: [
      { noteId: 'cardamom', drops: 4 }, { noteId: 'black-pepper', drops: 3 },
      { noteId: 'rum', drops: 6 }, { noteId: 'cinnamon', drops: 4 }, { noteId: 'tobacco', drops: 5 },
      { noteId: 'vanilla', drops: 4 }, { noteId: 'tonka', drops: 3 },
    ],
  },
  {
    id: 'white-shirt', label: '👔 Чистая белая рубашка', query: 'чистой белой рубашкой',
    formula: [
      { noteId: 'neroli', drops: 5 }, { noteId: 'bergamot', drops: 4 },
      { noteId: 'iris', drops: 5 }, { noteId: 'white-rice', drops: 5 }, { noteId: 'hedione', drops: 5 },
      { noteId: 'musk', drops: 4 }, { noteId: 'cashmeran', drops: 2 },
    ],
  },
  {
    id: 'leather-cherry', label: '🍒 Кожа и вишня', query: 'кожей и вишней',
    formula: [
      { noteId: 'pink-pepper', drops: 5 }, { noteId: 'bergamot', drops: 3 },
      { noteId: 'cherry', drops: 8 }, { noteId: 'black-tea', drops: 4 }, { noteId: 'saffron', drops: 3 },
      { noteId: 'leather', drops: 4 }, { noteId: 'vanilla', drops: 2 },
    ],
  },
  {
    id: 'sea-breeze', label: '🌊 Морской бриз', query: 'солёным морским ветром на скалах',
    formula: [
      { noteId: 'sea-salt', drops: 6 }, { noteId: 'lemon', drops: 3 },
      { noteId: 'sage', drops: 7 }, { noteId: 'hedione', drops: 3 }, { noteId: 'fig', drops: 3 },
      { noteId: 'ambroxan', drops: 4 }, { noteId: 'vetiver', drops: 2 },
    ],
  },
  {
    id: 'fireplace', label: '🔥 Свитер у камина', query: 'уютным свитером у камина',
    formula: [
      { noteId: 'cardamom', drops: 4 }, { noteId: 'mandarin', drops: 3 },
      { noteId: 'cinnamon', drops: 4 }, { noteId: 'black-tea', drops: 5 }, { noteId: 'cognac', drops: 4 },
      { noteId: 'incense', drops: 3 }, { noteId: 'cashmeran', drops: 3 }, { noteId: 'vanilla', drops: 2 },
    ],
  },
  {
    id: 'velvet-rose', label: '🥀 Роза в бархате', query: 'тёмной розой и удом в дорогом отеле',
    formula: [
      { noteId: 'pink-pepper', drops: 4 }, { noteId: 'bergamot', drops: 3 },
      { noteId: 'rose', drops: 8 }, { noteId: 'saffron', drops: 4 }, { noteId: 'jasmine', drops: 3 },
      { noteId: 'oud', drops: 2 }, { noteId: 'patchouli', drops: 2 }, { noteId: 'amber', drops: 2 },
    ],
  },
  {
    id: 'tea-ceremony', label: '🍵 Чайная церемония', query: 'японской чайной церемонией',
    formula: [
      { noteId: 'yuzu', drops: 5 }, { noteId: 'bergamot', drops: 4 },
      { noteId: 'black-tea', drops: 6 }, { noteId: 'white-rice', drops: 4 }, { noteId: 'hedione', drops: 4 },
      { noteId: 'cedar', drops: 3 }, { noteId: 'iso-e-super', drops: 3 },
    ],
  },
];

export interface SynonymEntry {
  /** Начала слов (стеммы). Совпадение по префиксу. */
  stems: string[];
  /** Точные слова (для коротких и многозначных, например «ром», «уд»). */
  exact?: string[];
  notes: string[];
  tags: string[];
}

/** Словарь ассоциаций «образ → ноты». Всё в нижнем регистре, ё → е. */
export const SYNONYMS: SynonymEntry[] = [
  { stems: ['яблок', 'яблоч'], notes: ['green-apple'], tags: ['свежий', 'хрустящий', 'фруктовый'] },
  { stems: ['дожд', 'ливн', 'мокр', 'влажн', 'роса', 'росы', 'утрен', 'гроз'], notes: ['vetiver', 'hedione', 'eucalyptus', 'sage'], tags: ['свежий', 'зеленый', 'чистый'] },
  { stems: ['чист', 'стирк', 'бель', 'рубаш', 'хлопок', 'хлопк', 'мыл', 'порош', 'душ', 'постел', 'простын'], notes: ['musk', 'iris', 'neroli', 'hedione', 'white-rice'], tags: ['чистый', 'белье', 'мыльный'] },
  { stems: ['бел'], notes: ['musk', 'neroli', 'white-rice'], tags: ['белый', 'чистый'] },
  { stems: ['табак', 'табач', 'сигар', 'трубк', 'кури'], notes: ['tobacco'], tags: ['табак', 'дымный'] },
  { stems: ['ванил'], notes: ['vanilla'], tags: ['сладкий', 'ваниль'] },
  { stems: ['кож', 'байк', 'куртк', 'мотоц', 'седл'], notes: ['leather'], tags: ['кожаный', 'дерзкий'] },
  { stems: ['вишн', 'черешн', 'ягод'], notes: ['cherry'], tags: ['вишня', 'сочный'] },
  { stems: ['морск', 'море', 'морем', 'моря', 'океан', 'пляж', 'бриз', 'волн', 'солен', 'солью', 'соль', 'скал', 'побереж'], notes: ['sea-salt', 'ambroxan', 'sage'], tags: ['морской', 'соленый', 'минеральный'] },
  { stems: ['дым', 'костр', 'камин', 'огон', 'огн', 'пепел', 'угл'], notes: ['incense', 'black-tea', 'vetiver', 'leather'], tags: ['дымный'] },
  { stems: ['свитер', 'уют', 'плед', 'кашемир', 'мягк', 'обним', 'дом', 'шерст'], notes: ['cashmeran', 'musk', 'vanilla', 'tonka'], tags: ['уютный', 'мягкий'] },
  { stems: ['лес', 'хво', 'дерев', 'древес', 'кедр', 'сосн', 'ель', 'карандаш'], notes: ['cedar', 'vetiver', 'iso-e-super'], tags: ['древесный'] },
  { stems: ['роз'], notes: ['rose'], tags: ['цветочный', 'романтичный'] },
  { stems: ['цвет', 'букет', 'сад'], notes: ['rose', 'peony', 'jasmine'], tags: ['цветочный'] },
  { stems: ['чай', 'чайн', 'чаепит'], exact: ['чая', 'чаю', 'чаем', 'чае'], notes: ['black-tea'], tags: ['чай'] },
  { stems: ['кофе', 'кофейн', 'эспрессо'], notes: ['cardamom', 'tonka'], tags: ['кофейный'] },
  { stems: ['слад', 'десерт', 'конфет', 'карамел', 'пралин', 'торт', 'выпеч', 'шоколад', 'мед', 'медов'], notes: ['praline', 'vanilla', 'tonka'], tags: ['сладкий', 'гурманский'] },
  { stems: ['цитрус', 'лимон', 'апельсин', 'мандарин', 'лайм', 'грейпфрут', 'юдзу'], notes: ['lemon', 'bergamot', 'mandarin', 'blood-orange'], tags: ['цитрус', 'свежий'] },
  { stems: ['пряност', 'специ', 'перец', 'перц', 'острый', 'остро'], notes: ['pink-pepper', 'black-pepper', 'cardamom', 'cinnamon'], tags: ['пряный'] },
  { stems: ['кориц', 'рожд', 'новог', 'праздн', 'глинтв', 'елк'], notes: ['cinnamon', 'mandarin', 'vanilla', 'amber'], tags: ['праздничный', 'теплый'] },
  { stems: ['коньяк', 'виски', 'алкогол', 'ликер', 'бурбон', 'пьян'], exact: ['ром', 'рома', 'рому', 'ромом', 'бар', 'бара', 'баре'], notes: ['rum', 'cognac', 'tobacco'], tags: ['ликерный', 'вечерний'] },
  { stems: ['восток', 'восточ', 'араб', 'роскош', 'дорог', 'богат', 'золот', 'отел', 'дворц', 'миллион'], exact: ['уд', 'уда', 'удом'], notes: ['oud', 'saffron', 'amber', 'rose'], tags: ['роскошный', 'восточный'] },
  { stems: ['церк', 'храм', 'медит', 'монах', 'мистич', 'ладан', 'благовон', 'йог'], notes: ['incense', 'sandalwood', 'cedar'], tags: ['мистический', 'медитативный'] },
  { stems: ['офис', 'делов', 'строг', 'костюм', 'встреч', 'босс', 'карьер'], notes: ['iris', 'cedar', 'vetiver', 'bergamot'], tags: ['деловой', 'строгий', 'элегантный'] },
  { stems: ['секс', 'соблазн', 'страст', 'свидан', 'ночь', 'ночн', 'вечер', 'чувствен'], notes: ['jasmine', 'amber', 'vanilla', 'oud'], tags: ['чувственный', 'вечерний'] },
  { stems: ['весн', 'нежн', 'романт', 'девуш', 'воздуш', 'легк'], notes: ['peony', 'rose', 'pear', 'hedione'], tags: ['нежный', 'воздушный'] },
  { stems: ['лето', 'летн', 'солн', 'отпуск', 'средизем', 'итал', 'греци', 'юг'], notes: ['blood-orange', 'neroli', 'fig', 'bergamot'], tags: ['солнечный', 'летний'] },
  { stems: ['зелен', 'трав', 'листв', 'лист', 'огород', 'газон', 'стебл'], notes: ['fig', 'sage', 'eucalyptus', 'vetiver', 'green-apple'], tags: ['зеленый', 'травяной'] },
  { stems: ['груш'], notes: ['pear'], tags: ['сочный', 'фруктовый'] },
  { stems: ['инжир', 'фиг', 'смоков'], notes: ['fig'], tags: ['зеленый', 'сливочный'] },
  { stems: ['фрукт', 'сочн', 'персик', 'ананас'], notes: ['pear', 'green-apple', 'blood-orange', 'cherry'], tags: ['фруктовый', 'сочный'] },
  { stems: ['рис', 'молок', 'молоч', 'сливоч', 'каш'], notes: ['white-rice', 'sandalwood', 'fig'], tags: ['молочный', 'мягкий'] },
  { stems: ['лаванд', 'барбер', 'бритв', 'парикмах'], notes: ['lavender', 'tonka'], tags: ['барбершоп', 'ароматический'] },
  { stems: ['пудр', 'помад', 'косметик', 'макияж'], notes: ['iris', 'white-rice'], tags: ['пудровый'] },
  { stems: ['мускус', 'тело', 'тела', 'кожи', 'теплой кож'], notes: ['musk', 'iso-e-super', 'ambroxan'], tags: ['кожный'] },
  { stems: ['металл', 'минерал', 'камн', 'камен', 'бетон', 'город', 'асфальт'], notes: ['ambroxan', 'iso-e-super', 'incense', 'sea-salt'], tags: ['минеральный', 'городской'] },
  { stems: ['снег', 'зим', 'мороз', 'холод', 'лед', 'ледян'], notes: ['eucalyptus', 'iris', 'musk', 'incense'], tags: ['холодный'] },
  { stems: ['мят', 'эвкал', 'ментол'], notes: ['eucalyptus'], tags: ['мятный', 'холодный'] },
  { stems: ['жасмин'], notes: ['jasmine', 'hedione'], tags: ['цветочный'] },
  { stems: ['пион'], notes: ['peony'], tags: ['нежный'] },
  { stems: ['шафран'], notes: ['saffron'], tags: ['пряный'] },
  { stems: ['ирис', 'фиалк'], notes: ['iris'], tags: ['пудровый'] },
  { stems: ['сандал'], notes: ['sandalwood'], tags: ['древесный'] },
  { stems: ['амбр', 'янтар', 'смол'], notes: ['amber', 'ambroxan'], tags: ['теплый', 'смолистый'] },
  { stems: ['орех', 'миндал'], notes: ['tonka', 'praline'], tags: ['ореховый'] },
  { stems: ['земл', 'почв', 'гриб', 'мох', 'мха'], notes: ['patchouli', 'vetiver'], tags: ['землистый'] },
  { stems: ['япон', 'дзен', 'минимал'], notes: ['yuzu', 'hedione', 'white-rice', 'iso-e-super'], tags: ['японский', 'чистый'] },
  { stems: ['дерзк', 'бунт', 'рок', 'панк'], notes: ['leather', 'cherry', 'black-pepper'], tags: ['дерзкий'] },
  { stems: ['спорт', 'бодр', 'энерг', 'утро'], notes: ['lemon', 'bergamot', 'eucalyptus', 'ambroxan'], tags: ['бодрый', 'свежий'] },
  { stems: ['мужск', 'брутал', 'мужчин'], notes: ['leather', 'vetiver', 'black-pepper', 'cedar'], tags: ['мужской'] },
  { stems: ['женств', 'женск', 'элеган'], notes: ['rose', 'iris', 'jasmine'], tags: ['женственный', 'элегантный'] },
];
