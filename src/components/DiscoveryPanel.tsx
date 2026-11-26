import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Dna, Heart, Loader2, Search, Sparkles, ThumbsDown, Wand2 } from 'lucide-react';
import { LAYER_COLORS, LAYER_SHORT, NOTES, NOTES_BY_ID } from '../data/notes';
import { PERFUMES, PERFUMES_BY_ID } from '../data/perfumes';
import { VIBE_PRESETS } from '../data/vibes';
import type { FormulaItem, Layer, Perfume } from '../types';
import { AINotAvailable, askAI, type AISettings } from '../ai/aiClient';
import {
  findSimilar,
  matchVibe,
  norm,
  perfumeToFormula,
  rankByNotes,
  rankPerfumesForFormula,
  type VibeResult,
} from '../utils/recommendationEngine';

type Tab = 'perfume' | 'notes' | 'vibe';

interface Props {
  aiSettings: AISettings;
  aiServerReady: boolean;
  onLoadFormula: (items: FormulaItem[], name: string) => void;
  onOpenSettings: () => void;
}

function NoteChip({ id, size = 'sm' }: { id: string; size?: 'sm' | 'md' }) {
  const n = NOTES_BY_ID[id];
  if (!n) return null;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/60 ${size === 'md' ? 'px-2.5 py-1 text-[13px]' : 'px-2 py-0.5 text-[11.5px]'} text-zinc-200`}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: n.color }} />
      {n.name}
    </span>
  );
}

function PyramidView({ p }: { p: Perfume }) {
  const rows: { key: 'top' | 'heart' | 'base'; label: string }[] = [
    { key: 'top', label: 'Верх' },
    { key: 'heart', label: 'Сердце' },
    { key: 'base', label: 'База' },
  ];
  return (
    <div className="space-y-2">
      {rows.map((r) =>
        p.pyramid[r.key].length ? (
          <div key={r.key} className="flex items-start gap-3">
            <span className="w-14 pt-1 font-mono text-[10px] uppercase tracking-wider" style={{ color: LAYER_COLORS[r.key] }}>
              {r.label}
            </span>
            <div className="flex flex-1 flex-wrap gap-1.5">
              {p.pyramid[r.key].map((id) => (
                <NoteChip key={id} id={id} size="md" />
              ))}
            </div>
          </div>
        ) : null,
      )}
    </div>
  );
}

function PerfumeCard({ p, onClick, active, right }: { p: Perfume; onClick?: () => void; active?: boolean; right?: ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-xl border p-3 text-left transition ${active ? 'border-[#D4AF37]/70 bg-[#D4AF37]/[0.07]' : 'border-zinc-800 bg-black/20 hover:border-zinc-600'}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500">{p.brand}</div>
          <div className="truncate font-serif text-xl leading-tight text-zinc-50">{p.name}</div>
        </div>
        {right}
      </div>
      <div className="mt-1.5 flex flex-wrap gap-1">
        {p.vibes.slice(0, 3).map((v) => (
          <span key={v} className="text-[11px] text-zinc-500">#{v}</span>
        ))}
      </div>
    </button>
  );
}

const DnaButton = ({ onClick, children }: { onClick: () => void; children: ReactNode }) => (
  <button
    onClick={onClick}
    className="flex items-center justify-center gap-2 rounded-xl border border-[#D4AF37]/60 bg-[#D4AF37]/10 px-4 py-2.5 text-sm text-[#F3D98B] transition hover:bg-[#D4AF37]/20"
  >
    {children}
  </button>
);

// ─────────────────────────────────────────────

function ByPerfume({ onLoadFormula }: Pick<Props, 'onLoadFormula'>) {
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<string>('tf-tobacco-vanille');
  const list = useMemo(() => {
    const s = norm(q);
    return PERFUMES.filter((p) => !s || norm(`${p.brand} ${p.name}`).includes(s));
  }, [q]);
  const p = PERFUMES_BY_ID[selected];
  const similar = useMemo(() => findSimilar(selected, 4), [selected]);

  return (
    <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
      <div>
        <div className="relative">
          <Search size={15} className="absolute top-1/2 left-3 -translate-y-1/2 text-zinc-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Поиск: Santal, Kilian, Aventus…"
            className="w-full rounded-xl border border-zinc-800 bg-black/40 py-2.5 pr-3 pl-9 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-zinc-600"
          />
        </div>
        <div className="scroll-thin mt-3 max-h-[60vh] space-y-2 overflow-y-auto pr-1">
          {list.map((x) => (
            <PerfumeCard key={x.id} p={x} active={x.id === selected} onClick={() => setSelected(x.id)} />
          ))}
          {!list.length && <p className="p-3 text-sm text-zinc-500">Ничего не найдено в базе.</p>}
        </div>
      </div>

      {p && (
        <div key={p.id} className="fade-up rounded-2xl border border-zinc-800 bg-black/25 p-5">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500">
            {p.brand} · {p.year}
          </div>
          <h2 className="mt-1 font-serif text-5xl leading-none text-zinc-50">{p.name}</h2>
          <p className="mt-3 max-w-2xl font-serif text-lg leading-snug text-zinc-300 italic">{p.description}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {p.vibes.map((v) => (
              <span key={v} className="rounded-full border border-[#C084FC]/30 px-2.5 py-0.5 text-[12px] text-purple-200">{v}</span>
            ))}
          </div>
          <div className="mt-5">
            <PyramidView p={p} />
          </div>
          <div className="mt-5">
            <DnaButton onClick={() => onLoadFormula(perfumeToFormula(p), `ДНК: ${p.name}`)}>
              <Dna size={16} /> Разобрать ДНК в 3D-графе
            </DnaButton>
          </div>

          <div className="mt-7 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Похожие альтернативы</div>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {similar.map((s) => (
              <div key={s.perfume.id} className="rounded-xl border border-zinc-800 bg-black/20 p-3">
                <button onClick={() => setSelected(s.perfume.id)} className="text-left">
                  <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500">{s.perfume.brand}</div>
                  <div className="font-serif text-xl text-zinc-50 hover:text-[#F3D98B]">{s.perfume.name}</div>
                </button>
                <p className="mt-1 text-[12.5px] text-zinc-400">Роднит: {s.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────

function ByNotes({ onLoadFormula }: Pick<Props, 'onLoadFormula'>) {
  const [state, setState] = useState<Record<string, 'love' | 'hate'>>({});
  const loved = Object.keys(state).filter((k) => state[k] === 'love');
  const hated = Object.keys(state).filter((k) => state[k] === 'hate');
  const results = useMemo(() => rankByNotes(loved, hated), [loved.join(), hated.join()]); // eslint-disable-line react-hooks/exhaustive-deps

  const cycle = (id: string) =>
    setState((s) => {
      const next = { ...s };
      if (!s[id]) next[id] = 'love';
      else if (s[id] === 'love') next[id] = 'hate';
      else delete next[id];
      return next;
    });

  const groups: Layer[] = ['top', 'heart', 'base', 'molecule'];
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_420px]">
      <div>
        <p className="text-sm text-zinc-400">
          Клик по ноте: <span className="text-emerald-300">1 раз — люблю</span>, <span className="text-red-300">2 раза — не переношу</span>, 3 раза — сброс.
        </p>
        <div className="mt-4 space-y-4">
          {groups.map((layer) => (
            <div key={layer}>
              <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: LAYER_COLORS[layer] }}>
                {LAYER_SHORT[layer]}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {NOTES.filter((n) => n.layer === layer).map((n) => {
                  const st = state[n.id];
                  return (
                    <button
                      key={n.id}
                      onClick={() => cycle(n.id)}
                      className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-[13px] transition ${
                        st === 'love'
                          ? 'border-emerald-400/70 bg-emerald-400/15 text-emerald-100'
                          : st === 'hate'
                            ? 'border-red-400/70 bg-red-500/15 text-red-200 line-through decoration-red-400/60'
                            : 'border-zinc-800 text-zinc-300 hover:border-zinc-600'
                      }`}
                    >
                      {st === 'love' ? <Heart size={12} /> : st === 'hate' ? <ThumbsDown size={12} /> : <span className="h-1.5 w-1.5 rounded-full" style={{ background: n.color }} />}
                      {n.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-black/25 p-4">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Совпадения в базе</div>
        {!results.length && <p className="mt-3 text-sm text-zinc-500">Отметьте хотя бы одну ноту — рейтинг обновится мгновенно.</p>}
        <div className="scroll-thin mt-3 max-h-[62vh] space-y-2 overflow-y-auto pr-1">
          {results.slice(0, 10).map((r) => (
            <div key={r.perfume.id} className="fade-up rounded-xl border border-zinc-800 bg-black/20 p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500">{r.perfume.brand}</div>
                  <div className="font-serif text-xl leading-tight text-zinc-50">{r.perfume.name}</div>
                </div>
                <div className={`font-mono text-xl ${r.match >= 70 ? 'text-emerald-300' : r.match >= 40 ? 'text-[#F3D98B]' : 'text-zinc-500'}`}>{r.match}%</div>
              </div>
              <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-zinc-900">
                <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-[#D4AF37]" style={{ width: `${r.match}%` }} />
              </div>
              <div className="mt-2 flex flex-wrap gap-1 text-[11.5px]">
                {r.loved.map((id) => <span key={id} className="text-emerald-300">♥ {NOTES_BY_ID[id].name}</span>)}
                {r.hated.map((id) => <span key={id} className="text-red-300">✕ {NOTES_BY_ID[id].name}</span>)}
              </div>
              <button
                onClick={() => onLoadFormula(perfumeToFormula(r.perfume), `ДНК: ${r.perfume.name}`)}
                className="mt-2 flex items-center gap-1.5 text-[12px] text-[#F3D98B] hover:underline"
              >
                <Dna size={13} /> Разобрать в 3D
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────

function ByVibe({ aiSettings, aiServerReady, onLoadFormula, onOpenSettings }: Props) {
  const [q, setQ] = useState('');
  const [result, setResult] = useState<VibeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState('');
  const [empty, setEmpty] = useState(false);

  const aiEnabled = aiSettings.mode === 'own' ? Boolean(aiSettings.apiKey.trim()) : aiSettings.mode === 'auto' && aiServerReady;

  const run = async (text: string) => {
    const query = text.trim();
    if (!query) return;
    setQ(query);
    setNote('');
    const local = matchVibe(query);
    setResult(local);
    setEmpty(!local);
    if (!aiEnabled) return;
    setLoading(true);
    try {
      const ai = await askAI(query, aiSettings);
      const perfumes = ai.perfumeIds.length
        ? ai.perfumeIds.map((id, i) => ({ perfume: PERFUMES_BY_ID[id], match: 94 - i * 4 }))
        : rankPerfumesForFormula(ai.formula);
      setResult({
        title: ai.title,
        explanation: ai.explanation,
        formula: ai.formula,
        perfumes,
        matchedWords: local?.matchedWords ?? [],
        source: 'ai',
        aiProvider: ai.providerLabel,
      });
      setEmpty(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setNote(e instanceof AINotAvailable ? `ИИ недоступен (${msg}) — показан результат локального движка.` : `${msg}. Показан результат локального движка.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Wand2 size={16} className="absolute top-1/2 left-3.5 -translate-y-1/2 text-[#C084FC]" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && run(q)}
            placeholder="Хочу пахнуть как… свежим зелёным яблоком после дождя"
            className="w-full rounded-xl border border-zinc-800 bg-black/40 py-3 pr-3 pl-10 font-serif text-lg text-zinc-100 italic outline-none placeholder:text-zinc-600 focus:border-[#C084FC]/50"
          />
        </div>
        <button
          onClick={() => run(q)}
          disabled={loading || !q.trim()}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#C084FC]/20 px-5 py-3 text-sm text-purple-100 transition hover:bg-[#C084FC]/30 disabled:opacity-40"
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />} Подобрать
        </button>
      </div>

      <div className="mt-2 flex items-center gap-2 font-mono text-[10.5px]">
        <span className={`h-1.5 w-1.5 rounded-full ${aiEnabled ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
        <span className="text-zinc-500">
          {aiEnabled
            ? aiSettings.mode === 'own'
              ? 'ИИ: ваш ключ (из настроек браузера) + локальный движок'
              : 'ИИ: серверный ключ подключён + локальный движок'
            : 'Локальный движок ассоциаций (ИИ не подключён)'}
        </span>
        <button onClick={onOpenSettings} className="text-zinc-400 underline-offset-2 hover:text-zinc-200 hover:underline">
          настройки ИИ
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {VIBE_PRESETS.map((v) => (
          <button
            key={v.id}
            onClick={() => run(v.query)}
            className="rounded-full border border-zinc-800 bg-zinc-900/40 px-3 py-1.5 text-[13px] text-zinc-300 transition hover:border-[#C084FC]/50 hover:text-zinc-50"
          >
            {v.label}
          </button>
        ))}
      </div>

      {note && <p className="mt-4 text-[12.5px] text-amber-300/80">{note}</p>}
      {empty && !loading && (
        <p className="mt-6 text-sm text-zinc-400">
          Не нашёл ассоциаций для этого образа. Попробуйте описать конкретнее: предметы, место, время года, вкус (например, «дымный чай у камина»).
        </p>
      )}

      {result && (
        <div key={result.title + result.source} className="fade-up mt-6 grid gap-5 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-2xl border border-zinc-800 bg-black/25 p-5">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
              Идеальный набор нот
              {result.source === 'ai' && <span className="rounded bg-emerald-400/15 px-1.5 py-0.5 text-emerald-300 normal-case tracking-normal">✦ {result.aiProvider}</span>}
              {result.source === 'preset' && <span className="rounded bg-[#D4AF37]/15 px-1.5 py-0.5 text-[#F3D98B] normal-case tracking-normal">кураторский</span>}
              {loading && <Loader2 size={12} className="animate-spin text-purple-300" />}
            </div>
            <h3 className="mt-1 font-serif text-4xl leading-tight text-zinc-50">{result.title}</h3>
            <p className="mt-2 text-[13.5px] text-zinc-400">{result.explanation}</p>
            <div className="mt-4 space-y-1.5">
              {result.formula.map((f) => {
                const n = NOTES_BY_ID[f.noteId];
                return (
                  <div key={f.noteId} className="flex items-center gap-2 text-[13.5px]">
                    <span className="h-2 w-2 rounded-full" style={{ background: n.color }} />
                    <span className="flex-1 text-zinc-200">{n.name}</span>
                    <span className="font-mono text-[10px] uppercase" style={{ color: LAYER_COLORS[n.layer] }}>{LAYER_SHORT[n.layer]}</span>
                    <span className="w-14 text-right font-mono text-zinc-300">{f.drops} кап</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-5">
              <DnaButton onClick={() => onLoadFormula(result.formula, result.title)}>
                <Sparkles size={15} /> Загрузить формулу в 3D и посмотреть раскрытие
              </DnaButton>
            </div>
          </div>

          <div className="space-y-2">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Готовые парфюмы в этом вайбе</div>
            {result.perfumes.map(({ perfume, match }) => (
              <div key={perfume.id} className="rounded-xl border border-zinc-800 bg-black/20 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500">{perfume.brand}</div>
                    <div className="font-serif text-2xl leading-tight text-zinc-50">{perfume.name}</div>
                  </div>
                  <span className="font-mono text-lg text-[#F3D98B]">{match}%</span>
                </div>
                <p className="mt-1 text-[12.5px] text-zinc-400">{perfume.description}</p>
                <button
                  onClick={() => onLoadFormula(perfumeToFormula(perfume), `ДНК: ${perfume.name}`)}
                  className="mt-2 flex items-center gap-1.5 text-[12px] text-[#F3D98B] hover:underline"
                >
                  <Dna size={13} /> Разобрать ДНК в 3D
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────

export default function DiscoveryPanel(props: Props) {
  const [tab, setTab] = useState<Tab>('vibe');
  useEffect(() => {
    document.getElementById('discovery-scroll')?.scrollTo({ top: 0 });
  }, [tab]);

  const tabs: { id: Tab; label: string; hint: string }[] = [
    { id: 'perfume', label: 'По любимому парфюму', hint: 'Разбор и похожие' },
    { id: 'notes', label: 'Люблю / Не переношу', hint: 'Рейтинг по нотам' },
    { id: 'vibe', label: 'Хочу пахнуть как…', hint: 'Образ → формула' },
  ];

  return (
    <div id="discovery-scroll" className="scroll-thin absolute inset-0 overflow-y-auto bg-[#050507]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_at_top,rgba(192,132,252,0.13),transparent_60%)]" />
      <div className="relative mx-auto max-w-6xl px-4 pt-24 pb-16 sm:px-6">
        <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#D4AF37]">Подбор аромата</div>
        <h1 className="mt-2 font-serif text-5xl leading-none text-zinc-50 sm:text-6xl">Найдите свой шлейф</h1>
        <p className="mt-3 max-w-xl text-zinc-400">
          Три способа: оттолкнуться от любимого флакона, от нот, которые вы любите и не переносите, или просто описать образ словами.
        </p>

        <div className="mt-8 grid grid-cols-3 gap-1 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-xl px-2 py-2.5 text-center transition ${tab === t.id ? 'bg-zinc-800/80 text-zinc-50' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              <div className="text-[13px] sm:text-sm">{t.label}</div>
              <div className="hidden font-mono text-[10px] text-zinc-500 sm:block">{t.hint}</div>
            </button>
          ))}
        </div>

        <div className="mt-6">
          {tab === 'perfume' && <ByPerfume onLoadFormula={props.onLoadFormula} />}
          {tab === 'notes' && <ByNotes onLoadFormula={props.onLoadFormula} />}
          {tab === 'vibe' && <ByVibe {...props} />}
        </div>
      </div>
    </div>
  );
}
