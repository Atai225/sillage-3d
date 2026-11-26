import { FlaskConical, X } from 'lucide-react';
import { LAYER_COLORS, LAYER_LABELS, NOTES_BY_ID } from '../data/notes';

interface Props {
  noteId: string;
  inFormula: boolean;
  onAdd: (id: string) => void;
  onSelect: (id: string | null) => void;
}

function Meter({ value, color, label }: { value: number; color: string; label: string }) {
  return (
    <div>
      <div className="mb-1 flex justify-between font-mono text-[10px] text-zinc-500">
        <span>{label}</span>
        <span className="text-zinc-300">{value}/10</span>
      </div>
      <div className="flex gap-[3px]">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-1.5 flex-1 rounded-sm" style={{ background: i < value ? color : '#27272a' }} />
        ))}
      </div>
    </div>
  );
}

export default function NodeInspector({ noteId, inFormula, onAdd, onSelect }: Props) {
  const note = NOTES_BY_ID[noteId];
  if (!note) return null;
  const color = LAYER_COLORS[note.layer];
  return (
    <div className="glass fade-up w-full max-w-[300px] rounded-2xl p-4 shadow-2xl shadow-black/60">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color }}>
            {LAYER_LABELS[note.layer]} · {note.family}
          </div>
          <h3 className="mt-1 font-serif text-3xl leading-none text-zinc-50">{note.name}</h3>
        </div>
        <button onClick={() => onSelect(null)} className="rounded-md p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200" title="Закрыть">
          <X size={16} />
        </button>
      </div>

      <div className="mt-4 space-y-2.5">
        <Meter value={note.volatility} color={color} label="Летучесть" />
        <Meter value={note.strength} color={color} label="Сила" />
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {note.vibeTags.map((t) => (
          <span key={t} className="rounded-full border border-zinc-800 px-2 py-0.5 text-[11px] text-zinc-300">
            {t}
          </span>
        ))}
      </div>

      <div className="mt-4 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">Совместимость</div>
      <div className="scroll-thin mt-1.5 max-h-44 space-y-1 overflow-y-auto pr-1">
        {note.links.map((l) => {
          const t = NOTES_BY_ID[l.targetId];
          if (!t) return null;
          return (
            <button
              key={l.targetId}
              onClick={() => onSelect(l.targetId)}
              className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-[13px] text-zinc-300 hover:bg-zinc-800/70"
            >
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: t.color }} />
              <span className="flex-1 truncate">{t.name}</span>
              <span className={`font-mono text-[9px] uppercase ${l.type === 'classic' ? 'text-zinc-500' : 'text-[#D4AF37]'}`}>
                {l.type === 'classic' ? 'классика' : 'авангард'}
              </span>
              <span className="w-9 text-right font-mono text-[12px] text-zinc-100">{l.synergy}%</span>
            </button>
          );
        })}
      </div>

      <button
        onClick={() => onAdd(note.id)}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-[#D4AF37]/50 bg-[#D4AF37]/10 py-2 text-sm text-[#F3D98B] transition hover:bg-[#D4AF37]/20"
      >
        <FlaskConical size={15} /> {inFormula ? 'Ещё +2 капли во флакон' : 'Добавить во флакон'}
      </button>
      <p className="mt-2 text-center font-mono text-[10px] text-zinc-600">двойной клик по узлу — тоже добавляет</p>
    </div>
  );
}
