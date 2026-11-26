import type { Perfume } from '../types';

/**
 * Пирамиды упрощены до нот, которые есть в базе SILLAGE 3D.
 * Все id нот ссылаются на src/data/notes.ts.
 */
export const PERFUMES: Perfume[] = [
  {
    id: 'tf-tobacco-vanille', brand: 'Tom Ford', name: 'Tobacco Vanille', year: 2007,
    pyramid: { top: ['cardamom', 'black-pepper'], heart: ['tobacco', 'tonka'], base: ['vanilla', 'praline', 'cedar'] },
    description: 'Густой медовый табачный лист, ваниль и пряности — как кожаное кресло в английском клубе. Тёплый, плотный, очень стойкий.',
    vibes: ['тёплый', 'уютный', 'вечерний', 'табак', 'сладкий', 'роскошный'],
    similar: ['mm-jazz-club', 'initio-side-effect', 'kilian-angels-share'],
  },
  {
    id: 'mm-jazz-club', brand: 'Maison Margiela', name: 'Replica Jazz Club', year: 2013,
    pyramid: { top: ['pink-pepper', 'neroli', 'lemon'], heart: ['rum', 'sage', 'vetiver'], base: ['tobacco', 'vanilla'] },
    description: 'Бархатный джаз-бар: ром, табачный лист и ваниль, но легче и прозрачнее, чем у классических табачных ароматов.',
    vibes: ['вечерний', 'уютный', 'табак', 'ликёрный', 'тёплый', 'мужской'],
    similar: ['tf-tobacco-vanille', 'initio-side-effect', 'kilian-angels-share'],
  },
  {
    id: 'initio-side-effect', brand: 'Initio', name: 'Side Effect', year: 2016,
    pyramid: { top: ['rum'], heart: ['tobacco', 'cinnamon'], base: ['vanilla', 'amber'] },
    description: 'Пьянящий ром с корицей на табачно-ванильной базе. Громкий, соблазнительный, «опасный» вечерний аромат.',
    vibes: ['соблазнительный', 'вечерний', 'ликёрный', 'тёплый', 'сладкий', 'дерзкий'],
    similar: ['kilian-angels-share', 'tf-tobacco-vanille', 'mm-jazz-club'],
  },
  {
    id: 'kilian-angels-share', brand: 'Kilian', name: "Angels' Share", year: 2020,
    pyramid: { top: ['cognac'], heart: ['cinnamon', 'tonka'], base: ['praline', 'vanilla', 'sandalwood'] },
    description: 'Коньяк, корица и пралине — как глоток в дубовом погребе. Гурманский, праздничный и очень уютный.',
    vibes: ['гурманский', 'праздничный', 'ликёрный', 'уютный', 'сладкий', 'тёплый'],
    similar: ['initio-side-effect', 'tf-tobacco-vanille', 'lancome-lveb'],
  },
  {
    id: 'room1015-cherry-punk', brand: 'Room 1015', name: 'Cherry Punk', year: 2018,
    pyramid: { top: ['bergamot', 'pink-pepper'], heart: ['cherry', 'black-tea'], base: ['leather', 'vanilla', 'musk'] },
    description: 'Рок-н-ролльная вишня в кожаной куртке: сочная ягода, дымный чай и потёртая кожа на сладкой базе.',
    vibes: ['дерзкий', 'вишня', 'кожаный', 'сладкий', 'бунтарский', 'вечерний'],
    similar: ['tf-tobacco-vanille', 'fm-portrait-lady', 'initio-side-effect'],
  },
  {
    id: 'diptyque-eau-duelle', brand: 'Diptyque', name: 'Eau Duelle', year: 2010,
    pyramid: { top: ['cardamom', 'pink-pepper'], heart: ['black-tea', 'saffron'], base: ['vanilla', 'incense', 'musk'] },
    description: 'Ваниль, которая не сладкая: сухая, чайная, с дымком ладана и пряностями. Ваниль для тех, кто «не любит ваниль».',
    vibes: ['ваниль', 'сухой', 'дымный', 'утончённый', 'уютный', 'унисекс'],
    similar: ['le-labo-the-noir', 'byredo-gypsy-water', 'tf-tobacco-vanille'],
  },
  {
    id: 'byredo-blanche', brand: 'Byredo', name: 'Blanche', year: 2009,
    pyramid: { top: ['pink-pepper', 'rose'], heart: ['peony', 'neroli'], base: ['musk', 'sandalwood'] },
    description: 'Хрустящая белая рубашка, только что из прачечной: альдегиды, белые цветы и чистейший мускус.',
    vibes: ['чистый', 'бельё', 'свежий', 'белый', 'нежный', 'минимализм'],
    similar: ['jhag-not-a-perfume', 'le-labo-another-13', 'jm-pear-freesia'],
  },
  {
    id: 'le-labo-santal-33', brand: 'Le Labo', name: 'Santal 33', year: 2011,
    pyramid: { top: ['cardamom', 'iris'], heart: ['ambroxan', 'iris'], base: ['sandalwood', 'cedar', 'leather'] },
    description: 'Культовый сандал Нью-Йорка: сухое дерево, кожа, кардамон и фиалковая пудра. Узнаётся с первого вдоха.',
    vibes: ['древесный', 'кожаный', 'модный', 'унисекс', 'сухой', 'городской'],
    similar: ['tf-oud-wood', 'molecule-01', 'le-labo-another-13'],
  },
  {
    id: 'creed-aventus', brand: 'Creed', name: 'Aventus', year: 2010,
    pyramid: { top: ['bergamot', 'green-apple', 'black-pepper'], heart: ['jasmine', 'rose', 'patchouli'], base: ['musk', 'ambroxan', 'vanilla', 'leather'] },
    description: 'Ароматный символ успеха: сочные фрукты, дымная берёза-кожа и амбровый мускус. Уверенный и праздничный.',
    vibes: ['уверенный', 'свежий', 'фруктовый', 'мужской', 'деловой', 'дымный'],
    similar: ['dior-sauvage', 'terre-d-hermes', 'le-labo-another-13'],
  },
  {
    id: 'dkny-be-delicious', brand: 'DKNY', name: 'Be Delicious', year: 2004,
    pyramid: { top: ['green-apple'], heart: ['rose', 'jasmine'], base: ['sandalwood', 'amber', 'musk'] },
    description: 'Хрустящее зелёное яблоко Нью-Йорка: сочное, свежее и жизнерадостное, с лёгкими цветами.',
    vibes: ['свежий', 'яблоко', 'хрустящий', 'фруктовый', 'жизнерадостный', 'весенний'],
    similar: ['jm-pear-freesia', 'byredo-blanche', 'issey-leau-dissey'],
  },
  {
    id: 'jm-wood-sage-sea-salt', brand: 'Jo Malone', name: 'Wood Sage & Sea Salt', year: 2014,
    pyramid: { top: ['sea-salt'], heart: ['sage'], base: ['musk', 'ambroxan', 'vetiver'] },
    description: 'Прогулка по утёсам у моря: солёный ветер, сухой шалфей и минеральная свежесть.',
    vibes: ['морской', 'солёный', 'свежий', 'минеральный', 'ветреный', 'спокойный'],
    similar: ['jhag-not-a-perfume', 'issey-leau-dissey', 'le-labo-another-13'],
  },
  {
    id: 'mfk-br540', brand: 'Maison Francis Kurkdjian', name: 'Baccarat Rouge 540', year: 2015,
    pyramid: { top: ['saffron', 'jasmine'], heart: ['hedione', 'amber'], base: ['ambroxan', 'cedar'] },
    description: 'Сияющая сахарная амбра и шафран: воздушный, кристаллический и невероятно шлейфовый аромат-легенда.',
    vibes: ['роскошный', 'сияющий', 'сладкий', 'амбровый', 'шлейфовый', 'вечерний'],
    similar: ['jhag-not-a-perfume', 'molecule-01', 'fm-portrait-lady'],
  },
  {
    id: 'molecule-01', brand: 'Escentric Molecules', name: 'Molecule 01', year: 2006,
    pyramid: { top: [], heart: [], base: ['iso-e-super'] },
    description: 'Одна молекула Iso E Super. Бархатное дерево, которое звучит как «твоя кожа, только лучше».',
    vibes: ['кожный', 'прозрачный', 'древесный', 'минимализм', 'современный', 'чистый'],
    similar: ['jhag-not-a-perfume', 'le-labo-another-13', 'le-labo-santal-33'],
  },
  {
    id: 'jhag-not-a-perfume', brand: 'Juliette Has a Gun', name: 'Not a Perfume', year: 2010,
    pyramid: { top: [], heart: [], base: ['ambroxan'] },
    description: 'Чистый Ambroxan (Cetalox): минеральная амбра, тёплая кожа, ничего лишнего. Гипоаллергенный минимализм.',
    vibes: ['кожный', 'чистый', 'минимализм', 'амбровый', 'прозрачный', 'современный'],
    similar: ['molecule-01', 'le-labo-another-13', 'jm-wood-sage-sea-salt'],
  },
  {
    id: 'le-labo-another-13', brand: 'Le Labo', name: 'Another 13', year: 2010,
    pyramid: { top: ['pear'], heart: ['jasmine', 'hedione'], base: ['ambroxan', 'musk', 'iso-e-super'] },
    description: 'Арт-галерейный мускус: амброксан, жасминовая прозрачность и едва уловимая груша. Холодный, интеллектуальный.',
    vibes: ['чистый', 'кожный', 'минимализм', 'городской', 'современный', 'холодный'],
    similar: ['molecule-01', 'jhag-not-a-perfume', 'byredo-blanche'],
  },
  {
    id: 'le-labo-rose-31', brand: 'Le Labo', name: 'Rose 31', year: 2006,
    pyramid: { top: ['rose', 'cardamom'], heart: ['cedar', 'incense'], base: ['oud', 'vetiver', 'musk'] },
    description: 'Роза, которая перестала быть «женской»: сухая, пряная, обёрнутая в кедр, ладан и тёмное дерево.',
    vibes: ['цветочный', 'древесный', 'пряный', 'унисекс', 'сухой', 'дерзкий'],
    similar: ['fm-portrait-lady', 'tf-oud-wood', 'le-labo-santal-33'],
  },
  {
    id: 'byredo-gypsy-water', brand: 'Byredo', name: 'Gypsy Water', year: 2008,
    pyramid: { top: ['bergamot', 'lemon', 'black-pepper'], heart: ['incense', 'iris'], base: ['sandalwood', 'vanilla', 'amber'] },
    description: 'Костёр в сосновом лесу и свобода кочевника: цитрусы, смолы и мягкая древесная ваниль.',
    vibes: ['свободный', 'древесный', 'дымный', 'свежий', 'лесной', 'унисекс'],
    similar: ['diptyque-eau-duelle', 'le-labo-santal-33', 'terre-d-hermes'],
  },
  {
    id: 'jm-pear-freesia', brand: 'Jo Malone', name: 'English Pear & Freesia', year: 2010,
    pyramid: { top: ['pear'], heart: ['rose', 'peony'], base: ['patchouli', 'amber', 'musk'] },
    description: 'Сочная осенняя груша и белые цветы: элегантная, светлая, по-английски сдержанная фруктовость.',
    vibes: ['фруктовый', 'нежный', 'свежий', 'элегантный', 'осенний', 'чистый'],
    similar: ['dkny-be-delicious', 'byredo-blanche', 'lancome-lveb'],
  },
  {
    id: 'tf-oud-wood', brand: 'Tom Ford', name: 'Oud Wood', year: 2007,
    pyramid: { top: ['cardamom', 'black-pepper', 'rosewood'], heart: ['oud', 'sandalwood'], base: ['vetiver', 'tonka', 'amber'] },
    description: 'Самый «носибельный» уд: гладкое дымное дерево, палисандр, кардамон и тонка. Дорого и спокойно.',
    vibes: ['древесный', 'роскошный', 'восточный', 'деловой', 'дымный', 'спокойный'],
    similar: ['le-labo-santal-33', 'le-labo-rose-31', 'tf-tobacco-vanille'],
  },
  {
    id: 'terre-d-hermes', brand: 'Hermès', name: "Terre d'Hermès", year: 2006,
    pyramid: { top: ['blood-orange', 'black-pepper'], heart: ['vetiver', 'cedar'], base: ['patchouli', 'cedar', 'vetiver'] },
    description: 'Земля, кремень и апельсиновая корка: минеральный древесный аромат для уверенных и спокойных.',
    vibes: ['древесный', 'минеральный', 'мужской', 'деловой', 'землистый', 'строгий'],
    similar: ['dior-sauvage', 'creed-aventus', 'byredo-gypsy-water'],
  },
  {
    id: 'dior-sauvage', brand: 'Dior', name: 'Sauvage EDT', year: 2015,
    pyramid: { top: ['bergamot', 'black-pepper'], heart: ['lavender', 'pink-pepper'], base: ['ambroxan', 'cedar', 'patchouli'] },
    description: 'Взрывной бергамот и мощный Ambroxan: свежий, громкий, узнаваемый аромат «дикой» пустыни.',
    vibes: ['свежий', 'мужской', 'громкий', 'амбровый', 'уверенный', 'современный'],
    similar: ['creed-aventus', 'terre-d-hermes', 'jm-wood-sage-sea-salt'],
  },
  {
    id: 'lancome-lveb', brand: 'Lancôme', name: 'La Vie Est Belle', year: 2012,
    pyramid: { top: ['pear'], heart: ['iris', 'jasmine'], base: ['praline', 'vanilla', 'patchouli'] },
    description: 'Ирисовое пралине и ваниль: гурманская сладость с пудровым шлейфом, праздничная и тёплая.',
    vibes: ['сладкий', 'гурманский', 'пудровый', 'женственный', 'праздничный', 'тёплый'],
    similar: ['kilian-angels-share', 'jm-pear-freesia', 'prada-infusion-iris'],
  },
  {
    id: 'prada-infusion-iris', brand: 'Prada', name: "Infusion d'Iris", year: 2007,
    pyramid: { top: ['mandarin', 'neroli'], heart: ['iris', 'incense'], base: ['cedar', 'vetiver', 'musk'] },
    description: 'Ирис как дорогая пудреница: чистый, прохладный, с тонким дымком ладана. Офисная элегантность.',
    vibes: ['пудровый', 'чистый', 'элегантный', 'деловой', 'холодный', 'утончённый'],
    similar: ['byredo-blanche', 'le-labo-another-13', 'lancome-lveb'],
  },
  {
    id: 'fm-portrait-lady', brand: 'Frédéric Malle', name: 'Portrait of a Lady', year: 2010,
    pyramid: { top: ['rose', 'cinnamon'], heart: ['patchouli', 'incense'], base: ['sandalwood', 'musk', 'amber'] },
    description: 'Барочная турецкая роза в бархате пачули и ладана. Драматичная, роскошная, с огромным шлейфом.',
    vibes: ['роскошный', 'цветочный', 'тёмный', 'вечерний', 'драматичный', 'шлейфовый'],
    similar: ['le-labo-rose-31', 'mfk-br540', 'room1015-cherry-punk'],
  },
  {
    id: 'diptyque-philosykos', brand: 'Diptyque', name: 'Philosykos', year: 1996,
    pyramid: { top: ['fig'], heart: ['fig', 'sage'], base: ['cedar', 'sandalwood'] },
    description: 'Целое фиговое дерево: зелёные листья, сливочная мякоть и тёплая кора под греческим солнцем.',
    vibes: ['зелёный', 'средиземноморский', 'сливочный', 'летний', 'спокойный', 'свежий'],
    similar: ['le-labo-the-noir', 'jm-wood-sage-sea-salt', 'issey-leau-dissey'],
  },
  {
    id: 'le-labo-the-noir', brand: 'Le Labo', name: 'Thé Noir 29', year: 2015,
    pyramid: { top: ['bergamot', 'fig'], heart: ['black-tea'], base: ['cedar', 'vetiver', 'tobacco', 'musk'] },
    description: 'Сухие листья чёрного чая, инжир и табак: аромат старой библиотеки и неторопливого чаепития.',
    vibes: ['чай', 'сухой', 'уютный', 'дымный', 'утончённый', 'осенний'],
    similar: ['diptyque-eau-duelle', 'diptyque-philosykos', 'mm-jazz-club'],
  },
  {
    id: 'issey-leau-dissey', brand: 'Issey Miyake', name: "L'Eau d'Issey pour Homme", year: 1994,
    pyramid: { top: ['yuzu', 'lemon', 'mandarin'], heart: ['sage', 'hedione'], base: ['vetiver', 'sandalwood', 'musk', 'cedar'] },
    description: 'Японская чистота: юдзу, водная свежесть и прозрачное дерево. Аромат минимализма 90-х.',
    vibes: ['свежий', 'цитрус', 'чистый', 'японский', 'водный', 'минимализм'],
    similar: ['jm-wood-sage-sea-salt', 'dior-sauvage', 'byredo-blanche'],
  },
];

export const PERFUMES_BY_ID: Record<string, Perfume> = Object.fromEntries(PERFUMES.map((p) => [p.id, p]));

export function perfumeNoteIds(p: Perfume): string[] {
  return Array.from(new Set([...p.pyramid.top, ...p.pyramid.heart, ...p.pyramid.base]));
}
