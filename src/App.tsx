import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlaskConical, MousePointerClick, Settings2 } from 'lucide-react';
import Scene3D from './components/Scene3D';
import TimelineSlider from './components/TimelineSlider';
import NodeInspector from './components/NodeInspector';
import FormulaBuilder from './components/FormulaBuilder';
import DiscoveryPanel from './components/DiscoveryPanel';
import SettingsModal from './components/SettingsModal';
import { STARTER_PRESET } from './data/vibes';
import { LAYER_COLORS } from './data/notes';
import type { FormulaItem } from './types';
import { TIMELINE_MAX, evolutionStatus } from './utils/perfumeryMath';
import { getServerStatus, loadAISettings, saveAISettings, type AISettings, type ServerStatus } from './ai/aiClient';

type Mode = 'lab' | 'discover';

/** Полные 8 часов раскрытия проигрываются примерно за 30 секунд. */
const PLAY_SPEED = TIMELINE_MAX / 30;

export default function App() {
  const [mode, setMode] = useState<Mode>('lab');
  const [formula, setFormula] = useState<FormulaItem[]>(STARTER_PRESET.formula);
  const [formulaName, setFormulaName] = useState(STARTER_PRESET.label);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [highlightIds, setHighlightIds] = useState<string[]>([]);
  const [minutes, setMinutes] = useState(45);
  const [playing, setPlaying] = useState(false);
  const [showFormula, setShowFormula] = useState(false);

  const [aiSettings, setAISettings] = useState<AISettings>(loadAISettings);
  const [server, setServer] = useState<ServerStatus | null>(null);
  const [checking, setChecking] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const recheck = useCallback(async () => {
    setChecking(true);
    setServer(await getServerStatus());
    setChecking(false);
  }, []);
  useEffect(() => {
    recheck();
  }, [recheck]);

  // Анимация таймлайна
  const lastT = useRef<number | null>(null);
  const minutesRef = useRef(minutes);
  minutesRef.current = minutes;
  useEffect(() => {
    if (!playing) {
      lastT.current = null;
      return;
    }
    let raf = 0;
    const tick = (t: number) => {
      if (lastT.current !== null) {
        const dt = Math.min(0.1, (t - lastT.current) / 1000);
        const next = Math.min(TIMELINE_MAX, minutesRef.current + dt * PLAY_SPEED);
        minutesRef.current = next;
        setMinutes(next);
        if (next >= TIMELINE_MAX) {
          setPlaying(false);
          return;
        }
      }
      lastT.current = t;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const togglePlay = () => {
    if (!playing && minutes >= TIMELINE_MAX) setMinutes(0);
    setPlaying((p) => !p);
  };

  const addNote = useCallback((id: string, drops = 3) => {
    setFormula((f) => {
      const ex = f.find((i) => i.noteId === id);
      if (ex) return f.map((i) => (i.noteId === id ? { ...i, drops: Math.min(30, i.drops + 2) } : i));
      return [...f, { noteId: id, drops }];
    });
    setHighlightIds((h) => h.filter((x) => x !== id));
  }, []);

  const addMany = (items: FormulaItem[]) => {
    setFormula((f) => {
      const next = [...f];
      items.forEach((it) => {
        const idx = next.findIndex((x) => x.noteId === it.noteId);
        if (idx >= 0) next[idx] = { ...next[idx], drops: Math.min(30, next[idx].drops + it.drops) };
        else next.push(it);
      });
      return next;
    });
  };

  const loadFormula = (items: FormulaItem[], name: string) => {
    setFormula(items);
    setFormulaName(name);
    setSelectedId(null);
    setHighlightIds([]);
    setMode('lab');
    setMinutes(0);
    setPlaying(true);
  };

  const status = useMemo(() => evolutionStatus(formula, minutes), [formula, Math.round(minutes / 2)]); // eslint-disable-line react-hooks/exhaustive-deps
  const inFormula = selectedId ? formula.some((f) => f.noteId === selectedId) : false;
  const aiOn = aiSettings.mode === 'own' ? Boolean(aiSettings.apiKey) : aiSettings.mode === 'auto' && Boolean(server?.configured);

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#050507] text-zinc-200">
      {/* 3D-сцена всегда смонтирована, на экране подбора просто ставится на паузу */}
      <div className={`absolute inset-0 z-0 ${mode === 'lab' ? '' : 'invisible'}`}>
        <Scene3D
          formula={formula}
          selectedId={selectedId}
          minutes={minutes}
          highlightIds={highlightIds}
          paused={mode !== 'lab'}
          onSelect={setSelectedId}
          onAdd={(id) => addNote(id)}
        />
      </div>

      {/* Шапка */}
      <header className="absolute inset-x-0 top-0 z-30 flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-baseline gap-2">
          <span className="font-serif text-[28px] leading-none tracking-[0.12em] text-zinc-50">SILLAGE</span>
          <span className="font-mono text-xs text-[#D4AF37]">3D</span>
        </div>
        <nav className="glass flex rounded-full p-1 font-mono text-[11px] tracking-[0.12em] sm:text-xs">
          {([
            ['lab', '[ 3D ЛАБОРАТОРИЯ ]'],
            ['discover', '[ ПОДБОР АРОМАТА ]'],
          ] as [Mode, string][]).map(([m, label]) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-full px-3 py-1.5 transition sm:px-4 ${mode === m ? 'bg-zinc-100 text-zinc-950' : 'text-zinc-400 hover:text-zinc-100'}`}
            >
              {label}
            </button>
          ))}
        </nav>
        <button onClick={() => setShowSettings(true)} className="glass flex items-center gap-2 rounded-full px-3 py-1.5 text-xs text-zinc-300 hover:text-zinc-50" title="Настройки ИИ">
          <span className={`h-1.5 w-1.5 rounded-full ${aiOn ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' : 'bg-zinc-600'}`} />
          <span className="hidden font-mono sm:inline">{aiOn ? 'ИИ онлайн' : 'локально'}</span>
          <Settings2 size={14} />
        </button>
      </header>

      {mode === 'lab' && (
        <>
          {/* Левая колонка: инспектор / легенда */}
          <div className="pointer-events-none absolute top-20 left-4 z-20 flex flex-col gap-3 sm:left-6">
            <div className="pointer-events-auto">
              {selectedId ? (
                <NodeInspector noteId={selectedId} inFormula={inFormula} onAdd={(id) => addNote(id)} onSelect={setSelectedId} />
              ) : (
                <div className="glass hidden max-w-[260px] rounded-2xl p-4 sm:block">
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">Ольфакторная пирамида</div>
                  <div className="mt-2 space-y-1.5 text-[12.5px]">
                    {([
                      ['top', 'Верхние ноты — 0–30 мин'],
                      ['heart', 'Сердце — 30 мин–3 ч'],
                      ['base', 'База — 3–8 ч'],
                      ['molecule', 'Молекулы — орбита'],
                    ] as const).map(([l, t]) => (
                      <div key={l} className="flex items-center gap-2 text-zinc-300">
                        <span className="h-2 w-2 rounded-full" style={{ background: LAYER_COLORS[l], boxShadow: `0 0 8px ${LAYER_COLORS[l]}` }} />
                        {t}
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center gap-3 font-mono text-[10px] text-zinc-500">
                    <span className="flex items-center gap-1"><span className="h-px w-4 bg-white" /> классика</span>
                    <span className="flex items-center gap-1"><span className="h-px w-4 bg-[#D4AF37]" /> авангард</span>
                  </div>
                  <p className="mt-3 flex items-start gap-1.5 text-[11.5px] text-zinc-500">
                    <MousePointerClick size={13} className="mt-0.5 shrink-0" />
                    Клик — совместимость, двойной клик — во флакон. Тяните, чтобы вращать.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Правая панель */}
          <div className={`absolute top-20 right-4 bottom-4 z-20 w-[min(360px,calc(100%-2rem))] sm:right-6 ${showFormula ? 'block' : 'hidden'} lg:block lg:bottom-6`}>
            <FormulaBuilder
              formula={formula}
              formulaName={formulaName}
              onNameChange={setFormulaName}
              onDropsChange={(id, d) => setFormula((f) => f.map((i) => (i.noteId === id ? { ...i, drops: d } : i)))}
              onRemove={(id) => setFormula((f) => f.filter((i) => i.noteId !== id))}
              onClear={() => {
                setFormula([]);
                setHighlightIds([]);
              }}
              onAddMany={addMany}
              onLoad={(items, name) => loadFormula(items, name)}
              onHighlight={setHighlightIds}
              onSelect={(id) => setSelectedId(id)}
            />
          </div>
          <button
            onClick={() => setShowFormula((v) => !v)}
            className="glass absolute right-4 bottom-40 z-30 flex items-center gap-2 rounded-full px-3 py-2 text-xs text-[#F3D98B] lg:hidden"
          >
            <FlaskConical size={14} /> {showFormula ? 'Скрыть флакон' : `Флакон · ${formula.length}`}
          </button>

          {/* Таймлайн */}
          <div className="absolute bottom-4 left-4 right-4 z-20 sm:left-6 lg:right-[400px] lg:bottom-6 xl:left-[300px]">
            <TimelineSlider
              minutes={minutes}
              playing={playing}
              status={status}
              disabled={!formula.length}
              onChange={(m) => {
                setPlaying(false);
                setMinutes(m);
              }}
              onTogglePlay={togglePlay}
            />
          </div>
        </>
      )}

      {mode === 'discover' && (
        <DiscoveryPanel aiSettings={aiSettings} aiServerReady={Boolean(server?.configured)} onLoadFormula={loadFormula} onOpenSettings={() => setShowSettings(true)} />
      )}

      {showSettings && (
        <SettingsModal
          settings={aiSettings}
          server={server}
          checking={checking}
          onRecheck={recheck}
          onClose={() => setShowSettings(false)}
          onSave={(s) => {
            setAISettings(s);
            saveAISettings(s);
            setShowSettings(false);
          }}
        />
      )}
    </div>
  );
}
