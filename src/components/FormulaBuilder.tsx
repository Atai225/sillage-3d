import { useMemo, useState } from 'react';
import { Check, Copy, Download, FolderOpen, Plus, Save, Scale, Trash2, X } from 'lucide-react';
import { LAYER_COLORS, LAYER_SHORT, NOTES_BY_ID } from '../data/notes';
import type { Carrier, Concentration, FormulaItem, SavedFormula } from '../types';
import {
  CARRIERS,
  CONCENTRATIONS,
  TARGET_BALANCE,
  VOLUMES,
  balanceAdvice,
  characterTags,
  dilution,
  estimateLongevity,
  estimateSillage,
  layerBalance,
  percentOf,
  totalDrops,
  type BalanceAdvice,
  type PyramidLayer,
} from '../utils/perfumeryMath';

interface Props {
  formula: FormulaItem[];
  formulaName: string;
  onNameChange: (n: string) => void;
  onDropsChange: (id: string, drops: number) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  onAddMany: (items: FormulaItem[]) => void;
  onLoad: (items: FormulaItem[], name: string) => void;
  onHighlight: (ids: string[]) => void;
  onSelect: (id: string) => void;
}

const SAVED_KEY = 'sillage.saved';
const LAYER_ORDER: PyramidLayer[] = ['top', 'heart', 'base'];

function loadSaved(): SavedFormula[] {
  try {
    return JSON.parse(localStorage.getItem(SAVED_KEY) ?? '[]');
  } catch {
    return [];
  }
}

export default function FormulaBuilder(props: Props) {
  const { formula, formulaName } = props;
  const [conc, setConc] = useState<Concentration>('EDP');
  const [volume, setVolume] = useState<number>(30);
  const [carrier, setCarrier] = useState<Carrier>('alcohol');
  const [advice, setAdvice] = useState<BalanceAdvice | null>(null);
  const [saved, setSaved] = useState<SavedFormula[]>(loadSaved);
  const [showSaved, setShowSaved] = useState(false);
  const [toast, setToast] = useState('');

  const bal = useMemo(() => layerBalance(formula), [formula]);
  const total = totalDrops(formula);
  const longevity = estimateLongevity(formula, conc);
  const sillage = estimateSillage(formula, conc);
  const tags = characterTags(formula);
  const dil = dilution(formula, conc, volume);

  const sorted = useMemo(() => {
    const order: Record<string, number> = { top: 0, heart: 1, base: 2, molecule: 3 };
    return [...formula].sort((a, b) => order[NOTES_BY_ID[a.noteId]?.layer ?? 'base'] - order[NOTES_BY_ID[b.noteId]?.layer ?? 'base']);
  }, [formula]);

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(''), 1800);
  };

  const runBalance = () => {
    const a = balanceAdvice(formula);
    setAdvice(a);
    props.onHighlight(a.suggestions.map((s) => s.noteId));
  };

  const persist = (list: SavedFormula[]) => {
    setSaved(list);
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify(list));
    } catch {
      /* ignore */
    }
  };

  const save = () => {
    if (!formula.length) return;
    const name = formulaName.trim() || 'Моя формула';
    const item: SavedFormula = { id: `${Date.now()}`, name, items: formula, createdAt: Date.now() };
    persist([item, ...saved.filter((s) => s.name !== name)].slice(0, 30));
    flash('Сохранено в браузере');
  };

  const recipeText = () => {
    const lines: string[] = [];
    lines.push(`SILLAGE 3D — рецепт «${formulaName || 'Моя формула'}»`);
    lines.push(`Дата: ${new Date().toLocaleDateString('ru-RU')}`);
    lines.push('');
    lines.push('ФОРМУЛА (капли · %)');
    const groups: Record<string, string> = { top: 'Верхние ноты', heart: 'Ноты сердца', base: 'Базовые ноты', molecule: 'Молекулы' };
    (['top', 'heart', 'base', 'molecule'] as const).forEach((layer) => {
      const items = sorted.filter((f) => NOTES_BY_ID[f.noteId]?.layer === layer);
      if (!items.length) return;
      lines.push(`${groups[layer]}:`);
      items.forEach((f) => lines.push(`  • ${NOTES_BY_ID[f.noteId].name} — ${f.drops} кап. (${percentOf(f, formula).toFixed(1)}%)`));
    });
    lines.push(`Всего: ${total} капель`);
    lines.push('');
    lines.push(`Баланс пирамиды: Верх ${Math.round(bal.top)}% / Сердце ${Math.round(bal.heart)}% / База ${Math.round(bal.base)}% (ориентир 30/50/20)`);
    lines.push(`Стойкость: ≈ ${longevity} ч · Шлейф: ${sillage.label.toLowerCase()} (${sillage.score}/10)`);
    lines.push(`Характер: ${tags.join(', ')}`);
    lines.push('');
    lines.push(`РАЗВЕДЕНИЕ: ${CONCENTRATIONS[conc].label}, флакон ${volume} мл`);
    lines.push(`  Концентрат: ${dil.concentrateMl} мл (≈ ${dil.concentrateDrops} капель, формула × ${dil.scale})`);
    lines.push(`  ${CARRIERS[carrier]}: ${dil.carrierMl} мл`);
    lines.push('');
    lines.push('Выдержка (мацерация): 2–4 недели в тёмном прохладном месте.');
    return lines.join('\n');
  };

  const copyRecipe = async () => {
    try {
      await navigator.clipboard.writeText(recipeText());
      flash('Рецепт скопирован');
    } catch {
      flash('Не удалось скопировать');
    }
  };

  const downloadRecipe = () => {
    const blob = new Blob([recipeText()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sillage-${(formulaName || 'formula').replace(/\s+/g, '-').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="glass scroll-thin relative flex h-full flex-col overflow-y-auto rounded-2xl p-4 shadow-2xl shadow-black/60">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Формула и калькулятор</span>
        <div className="flex gap-1">
          <button onClick={() => setShowSaved((v) => !v)} className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100" title="Сохранённые формулы">
            <FolderOpen size={15} />
          </button>
          <button onClick={props.onClear} className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-red-300" title="Очистить флакон">
            <Trash2 size={15} />
          </button>
        </div>
      </div>
      <input
        value={formulaName}
        onChange={(e) => props.onNameChange(e.target.value)}
        placeholder="Название аромата"
        className="mt-1 w-full border-b border-transparent bg-transparent font-serif text-[28px] leading-tight text-zinc-50 outline-none placeholder:text-zinc-600 focus:border-zinc-700"
      />

      {showSaved && (
        <div className="fade-up mt-2 rounded-xl border border-zinc-800 bg-black/40 p-2">
          {!saved.length && <p className="p-2 text-xs text-zinc-500">Пока нет сохранённых формул.</p>}
          {saved.map((s) => (
            <div key={s.id} className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-zinc-800/60">
              <button className="flex-1 truncate text-left text-sm text-zinc-200" onClick={() => { props.onLoad(s.items, s.name); setShowSaved(false); }}>
                {s.name}
                <span className="ml-2 font-mono text-[10px] text-zinc-500">{new Date(s.createdAt).toLocaleDateString('ru-RU')}</span>
              </button>
              <button onClick={() => persist(saved.filter((x) => x.id !== s.id))} className="text-zinc-600 hover:text-red-300">
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Список нот */}
      <div className="mt-3 space-y-2">
        {!formula.length && (
          <p className="rounded-xl border border-dashed border-zinc-800 p-4 text-center text-sm text-zinc-500">
            Флакон пуст. Кликните по ноте в 3D-графе и нажмите «Добавить во флакон».
          </p>
        )}
        {sorted.map((f) => {
          const n = NOTES_BY_ID[f.noteId];
          if (!n) return null;
          const c = LAYER_COLORS[n.layer];
          return (
            <div key={f.noteId} className="group rounded-lg px-1 py-1">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: n.color, boxShadow: `0 0 8px ${n.color}` }} />
                <button onClick={() => props.onSelect(n.id)} className="flex-1 truncate text-left text-[13.5px] text-zinc-200 hover:text-white">
                  {n.name}
                </button>
                <span className="font-mono text-[9px] uppercase" style={{ color: c }}>
                  {LAYER_SHORT[n.layer]}
                </span>
                <span className="w-12 text-right font-mono text-[12px] text-zinc-100">{f.drops} кап</span>
                <span className="w-11 text-right font-mono text-[11px] text-zinc-500">{percentOf(f, formula).toFixed(1)}%</span>
                <button onClick={() => props.onRemove(f.noteId)} className="text-zinc-600 opacity-60 hover:text-red-300 group-hover:opacity-100">
                  <X size={13} />
                </button>
              </div>
              <input
                type="range"
                min={1}
                max={30}
                value={f.drops}
                onChange={(e) => props.onDropsChange(f.noteId, Number(e.target.value))}
                className="lux mt-1 w-full"
                style={{ ['--thumb' as string]: n.color }}
              />
            </div>
          );
        })}
      </div>

      {formula.length > 0 && (
        <>
          {/* Шкала пирамиды */}
          <div className="mt-4">
            <div className="mb-1.5 flex justify-between font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500">
              <span>Баланс пирамиды</span>
              <span>ориентир 30/50/20</span>
            </div>
            <div className="relative flex h-3 overflow-hidden rounded-full bg-zinc-900">
              {LAYER_ORDER.map((l) => (
                <div key={l} style={{ width: `${bal[l]}%`, background: LAYER_COLORS[l] }} className="h-full transition-all duration-500" />
              ))}
              <div className="absolute top-0 h-full w-px bg-white/80" style={{ left: '30%' }} />
              <div className="absolute top-0 h-full w-px bg-white/80" style={{ left: '80%' }} />
            </div>
            <div className="mt-1.5 grid grid-cols-3 font-mono text-[11px]">
              {LAYER_ORDER.map((l) => {
                const diff = Math.round(bal[l] - TARGET_BALANCE[l]);
                return (
                  <div key={l} className={l === 'heart' ? 'text-center' : l === 'base' ? 'text-right' : ''}>
                    <span style={{ color: LAYER_COLORS[l] }}>{l === 'top' ? 'Верх' : l === 'heart' ? 'Сердце' : 'База'}</span>{' '}
                    <span className="text-zinc-100">{Math.round(bal[l])}%</span>{' '}
                    <span className={Math.abs(diff) > 7 ? 'text-amber-400' : 'text-zinc-600'}>{diff > 0 ? `+${diff}` : diff}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Оценки */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-zinc-800 bg-black/30 p-3">
              <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">Стойкость</div>
              <div className="font-mono text-xl text-zinc-50">≈ {longevity} ч</div>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-black/30 p-3">
              <div className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">Шлейф</div>
              <div className="text-lg text-zinc-50">
                {sillage.label} <span className="font-mono text-xs text-zinc-500">{sillage.score}/10</span>
              </div>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <span key={t} className="rounded-full border border-zinc-800 bg-zinc-900/60 px-2 py-0.5 text-[11px] text-zinc-300">
                {t}
              </span>
            ))}
          </div>

          {/* Балансировка */}
          <button
            onClick={runBalance}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-[#38BDF8]/40 bg-[#38BDF8]/10 py-2 text-sm text-sky-200 transition hover:bg-[#38BDF8]/20"
          >
            <Scale size={15} /> Сбалансировать формулу
          </button>
          {advice && (
            <div className="fade-up mt-2 rounded-xl border border-zinc-800 bg-black/30 p-3 text-[12.5px] text-zinc-300">
              <div className="flex gap-2">
                {advice.ok ? <Check size={15} className="mt-0.5 shrink-0 text-emerald-400" /> : <Scale size={15} className="mt-0.5 shrink-0 text-sky-300" />}
                <p>{advice.message}</p>
              </div>
              {advice.suggestions.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {advice.suggestions.map((s) => (
                    <button
                      key={s.noteId}
                      onClick={() => props.onSelect(s.noteId)}
                      className="rounded-full border border-sky-400/40 px-2 py-0.5 text-[12px] text-sky-200 hover:bg-sky-400/10"
                    >
                      {NOTES_BY_ID[s.noteId]?.name} · {s.drops} кап
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      props.onAddMany(advice.suggestions);
                      props.onHighlight([]);
                      setAdvice(null);
                      flash('Ноты добавлены');
                    }}
                    className="flex items-center gap-1 rounded-full bg-sky-400/20 px-2.5 py-0.5 text-[12px] text-sky-100 hover:bg-sky-400/30"
                  >
                    <Plus size={12} /> Добавить
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Калькулятор разведения */}
          <div className="mt-4 rounded-xl border border-zinc-800 bg-black/30 p-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500">Калькулятор разведения</div>
            <div className="mt-2 grid grid-cols-3 gap-1">
              {(Object.keys(CONCENTRATIONS) as Concentration[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setConc(c)}
                  className={`rounded-md border px-1 py-1 font-mono text-[11px] ${conc === c ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#F3D98B]' : 'border-zinc-800 text-zinc-400 hover:text-zinc-200'}`}
                >
                  {CONCENTRATIONS[c].label}
                </button>
              ))}
            </div>
            <div className="mt-1.5 grid grid-cols-3 gap-1">
              {VOLUMES.map((v) => (
                <button
                  key={v}
                  onClick={() => setVolume(v)}
                  className={`rounded-md border py-1 font-mono text-[11px] ${volume === v ? 'border-zinc-400 bg-zinc-800 text-zinc-100' : 'border-zinc-800 text-zinc-400 hover:text-zinc-200'}`}
                >
                  {v} мл
                </button>
              ))}
            </div>
            <div className="mt-1.5 grid grid-cols-2 gap-1">
              {(Object.keys(CARRIERS) as Carrier[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setCarrier(c)}
                  className={`rounded-md border py-1 text-[11.5px] ${carrier === c ? 'border-zinc-400 bg-zinc-800 text-zinc-100' : 'border-zinc-800 text-zinc-400 hover:text-zinc-200'}`}
                >
                  {CARRIERS[c]}
                </button>
              ))}
            </div>
            <div className="mt-3 space-y-1 font-mono text-[12px]">
              <div className="flex justify-between"><span className="text-zinc-500">Концентрат</span><span className="text-zinc-100">{dil.concentrateMl} мл</span></div>
              <div className="flex justify-between"><span className="text-zinc-500">≈ капель концентрата</span><span className="text-zinc-100">{dil.concentrateDrops}</span></div>
              <div className="flex justify-between"><span className="text-zinc-500">Формула ×</span><span className="text-[#F3D98B]">{dil.scale}</span></div>
              <div className="flex justify-between"><span className="text-zinc-500">{CARRIERS[carrier]}</span><span className="text-zinc-100">{dil.carrierMl} мл</span></div>
            </div>
          </div>

          {/* Действия */}
          <div className="mt-3 grid grid-cols-3 gap-1.5">
            <button onClick={save} className="flex items-center justify-center gap-1.5 rounded-lg border border-zinc-800 py-2 text-[12px] text-zinc-300 hover:bg-zinc-800">
              <Save size={13} /> Сохранить
            </button>
            <button onClick={copyRecipe} className="flex items-center justify-center gap-1.5 rounded-lg border border-zinc-800 py-2 text-[12px] text-zinc-300 hover:bg-zinc-800">
              <Copy size={13} /> Копия
            </button>
            <button onClick={downloadRecipe} className="flex items-center justify-center gap-1.5 rounded-lg border border-zinc-800 py-2 text-[12px] text-zinc-300 hover:bg-zinc-800">
              <Download size={13} /> .txt
            </button>
          </div>
        </>
      )}

      {toast && (
        <div className="fade-up pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-900">{toast}</div>
      )}
    </div>
  );
}
