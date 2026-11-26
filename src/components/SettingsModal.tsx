import { useState } from 'react';
import { CheckCircle2, CircleDashed, KeyRound, Loader2, RefreshCw, X } from 'lucide-react';
import type { AISettings, ServerStatus } from '../ai/aiClient';
import { PROVIDER_LABELS, type ProviderId } from '../ai/providers';

interface Props {
  settings: AISettings;
  server: ServerStatus | null;
  checking: boolean;
  onRecheck: () => void;
  onSave: (s: AISettings) => void;
  onClose: () => void;
}

export default function SettingsModal({ settings, server, checking, onRecheck, onSave, onClose }: Props) {
  const [draft, setDraft] = useState<AISettings>(settings);
  const set = <K extends keyof AISettings>(k: K, v: AISettings[K]) => setDraft((d) => ({ ...d, [k]: v }));

  const modes: { id: AISettings['mode']; title: string; text: string }[] = [
    { id: 'auto', title: 'Серверный ИИ (рекомендуется)', text: 'Ключ хранится на Vercel в Environment Variables. Работает у всех посетителей сайта, ключ не виден в браузере.' },
    { id: 'own', title: 'Мой ключ в этом браузере', text: 'Для личного использования: ключ сохраняется только в localStorage этого браузера.' },
    { id: 'off', title: 'Только локальный движок', text: 'Без ИИ: подбор по словарю ассоциаций, синонимам и vibe-тегам. Работает офлайн.' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="glass fade-up w-full max-w-lg rounded-2xl p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-3xl text-zinc-50">Настройки ИИ</h2>
          <button onClick={onClose} className="rounded-md p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-100">
            <X size={18} />
          </button>
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-xl border border-zinc-800 bg-black/40 p-3 text-[13px]">
          {checking ? (
            <Loader2 size={16} className="animate-spin text-zinc-400" />
          ) : server?.configured ? (
            <CheckCircle2 size={16} className="text-emerald-400" />
          ) : (
            <CircleDashed size={16} className="text-zinc-500" />
          )}
          <span className="flex-1 text-zinc-300">
            {checking
              ? 'Проверяю /api/ai…'
              : server?.configured
                ? `Сервер: ключ подключён (${server.provider})`
                : server?.reachable
                  ? 'Сервер работает, но ключ не задан в Environment Variables'
                  : 'Серверная функция /api/ai не отвечает (например, в превью без бэкенда)'}
          </span>
          <button onClick={onRecheck} className="text-zinc-500 hover:text-zinc-200" title="Проверить снова">
            <RefreshCw size={14} />
          </button>
        </div>

        <div className="mt-4 space-y-2">
          {modes.map((m) => (
            <label
              key={m.id}
              className={`flex cursor-pointer gap-3 rounded-xl border p-3 transition ${draft.mode === m.id ? 'border-[#D4AF37]/60 bg-[#D4AF37]/[0.06]' : 'border-zinc-800 hover:border-zinc-700'}`}
            >
              <input type="radio" checked={draft.mode === m.id} onChange={() => set('mode', m.id)} className="mt-1 accent-[#D4AF37]" />
              <div>
                <div className="text-sm text-zinc-100">{m.title}</div>
                <div className="text-[12px] text-zinc-500">{m.text}</div>
              </div>
            </label>
          ))}
        </div>

        {draft.mode === 'own' && (
          <div className="fade-up mt-4 space-y-2">
            <select
              value={draft.provider}
              onChange={(e) => set('provider', e.target.value as ProviderId)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none"
            >
              {(Object.keys(PROVIDER_LABELS) as ProviderId[]).map((p) => (
                <option key={p} value={p}>
                  {PROVIDER_LABELS[p]}
                </option>
              ))}
            </select>
            <div className="relative">
              <KeyRound size={14} className="absolute top-1/2 left-3 -translate-y-1/2 text-zinc-500" />
              <input
                type="password"
                value={draft.apiKey}
                onChange={(e) => set('apiKey', e.target.value)}
                placeholder="API-ключ"
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 py-2 pr-3 pl-8 font-mono text-sm text-zinc-100 outline-none"
              />
            </div>
            <input
              value={draft.model}
              onChange={(e) => set('model', e.target.value)}
              placeholder="Модель (необязательно, напр. gemini-2.5-flash)"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 font-mono text-sm text-zinc-100 outline-none"
            />
          </div>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-zinc-400 hover:text-zinc-100">
            Отмена
          </button>
          <button onClick={() => onSave(draft)} className="rounded-lg bg-[#D4AF37] px-4 py-2 text-sm font-medium text-black hover:bg-[#e3c252]">
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}
