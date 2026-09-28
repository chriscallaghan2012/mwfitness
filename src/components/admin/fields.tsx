// Small shared helpers for the staff admin panel.
import { FormEvent, ReactNode } from 'react';

export const inp =
  'w-full bg-[#121315] border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#ff5500] placeholder-zinc-600';
export const btn =
  'inline-flex items-center gap-1.5 bg-[#ff5500] hover:bg-[#ff6a1f] text-black font-mono font-bold text-xs uppercase px-3 py-2 rounded-lg active:scale-[0.98]';
export const btnGhost =
  'inline-flex items-center gap-1.5 border border-zinc-700 text-zinc-300 font-mono text-xs uppercase px-3 py-2 rounded-lg hover:bg-zinc-800';
export const card = 'rounded-xl bg-[#16181d] border border-zinc-700 p-4';

export type Row = Record<string, any>;

export function Fmt(n: number | null | undefined, suffix = ''): string {
  return n == null ? '—' : `${n}${suffix}`;
}

export function ShortDate(s: string | null | undefined): string {
  if (!s) return '—';
  try {
    return new Date(s).toLocaleDateString('en-GB');
  } catch {
    return '—';
  }
}

/** Form submit guard so Enter in a text input doesn't reload the page. */
export function avoidReload(fn?: () => void) {
  return (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    fn?.();
  };
}

export function StatusPill(status: string) {
  const color =
    status === 'active' || status === 'reviewed' || status === 'completed'
      ? 'text-green-400 border-green-500/40'
      : status === 'canceled' || status === 'skipped' || status === 'past_due'
        ? 'text-red-400 border-red-500/40'
        : 'text-zinc-400 border-zinc-600';
  return (
    <span className={`inline-block border ${color} rounded-full px-2 py-0.5 text-[10px] font-mono uppercase tracking-wide`}>
      {status}
    </span>
  );
}

/** Generic striped table used across admin sections. */
export function AdminTable({
  cols,
  rows,
  empty,
  onEdit,
}: {
  cols: { key: string; label: string; render?: (r: Row) => ReactNode }[];
  rows: Row[];
  empty?: string;
  onEdit?: (r: Row) => void;
}) {
  if (!rows || rows.length === 0) {
    return <p className="text-sm text-zinc-400">{empty ?? 'Nothing here yet.'}</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="text-[10px] uppercase font-mono text-zinc-500">
            {cols.map((c) => (
              <th key={c.key} className="py-2">
                {c.label}
              </th>
            ))}
            {onEdit ? <th /> : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={String(r.id)} className="border-t border-zinc-800">
              {cols.map((c) => (
                <td key={c.key} className="py-2 text-zinc-300">
                  {c.render ? c.render(r) : String(r[c.key] ?? '—')}
                </td>
              ))}
              {onEdit ? (
                <td>
                  <button onClick={() => onEdit(r)} className={btnGhost}>
                    Edit
                  </button>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}