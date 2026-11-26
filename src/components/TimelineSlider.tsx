import { Pause, Play, RotateCcw } from 'lucide-react';
import { TIMELINE_MAX, formatTime, phaseLabel } from '../utils/perfumeryMath';

interface Props {
  minutes: number;
  playing: boolean;
  status: string;
  disabled?: boolean;
  onChange: (m: number) => void;
  onTogglePlay: () => void;
}

const MARKS = [
  { m: 0, label: '0' },
  { m: 30, label: '30м' },
  { m: 180, label: '3 ч' },
  { m: 480, label: '8 ч · шлейф' },
];

export default function TimelineSlider({ minutes, playing, status, disabled, onChange, onTogglePlay }: Props) {
  const pct = (minutes / TIMELINE_MAX) * 100;
  return (
    <div className="glass rounded-2xl px-5 py-4 shadow-2xl shadow-black/60">
      <div className="mb-3 flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
            <span>Scent Evolution</span>
            <span className="text-zinc-700">/</span>
            <span className="text-[#D4AF37]">{phaseLabel(minutes)}</span>
          </div>
          <p key={phaseLabel(minutes)} className="fade-up min-h-[2.6em] font-serif text-[17px] leading-snug text-zinc-100 italic">
            {status}
          </p>
        </div>
        <div className="text-right font-mono text-2xl tabular-nums text-zinc-100">{formatTime(minutes)}</div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onTogglePlay}
          disabled={disabled}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#D4AF37]/60 text-[#D4AF37] transition hover:bg-[#D4AF37]/10 disabled:opacity-30"
          title={playing ? 'Пауза' : 'Запустить раскрытие'}
        >
          {playing ? <Pause size={15} /> : minutes >= TIMELINE_MAX ? <RotateCcw size={15} /> : <Play size={15} className="ml-0.5" />}
        </button>
        <div className="relative flex-1">
          <div
            className="pointer-events-none absolute top-1/2 h-[3px] w-full -translate-y-1/2 rounded-full opacity-40"
            style={{ background: 'linear-gradient(90deg,#FDE047 0%,#FDE047 6%,#C084FC 20%,#C084FC 37%,#D4AF37 55%,#38BDF8 100%)' }}
          />
          <div
            className="pointer-events-none absolute top-1/2 h-[3px] -translate-y-1/2 rounded-full"
            style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#FDE047,#C084FC 40%,#D4AF37 75%,#38BDF8)' }}
          />
          <input
            type="range"
            min={0}
            max={TIMELINE_MAX}
            step={1}
            value={minutes}
            disabled={disabled}
            onChange={(e) => onChange(Number(e.target.value))}
            className="lux relative w-full"
            style={{ background: 'transparent' }}
          />
          <div className="relative mt-1 h-4 font-mono text-[9.5px] text-zinc-500">
            {MARKS.map((mk) => (
              <button
                key={mk.m}
                onClick={() => onChange(mk.m)}
                className="absolute -translate-x-1/2 whitespace-nowrap hover:text-zinc-200"
                style={{ left: `${Math.min(96, Math.max(3, (mk.m / TIMELINE_MAX) * 100))}%` }}
              >
                {mk.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
