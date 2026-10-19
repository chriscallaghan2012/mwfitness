// Small shared helpers for the staff admin panel.
import { FormEvent, ReactNode } from 'react';
import { Pencil, Trash2 } from 'lucide-react';

export const inp =
  'w-full min-w-0 rounded-xl border border-white/[0.1] bg-[#0e1013] px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-orange-400/70 focus:ring-2 focus:ring-orange-400/10';
export const btn =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-semibold text-black shadow-sm shadow-orange-950/20 transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.99]';
export const btnGhost =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.025] px-3.5 py-2.5 text-xs font-medium text-zinc-300 transition hover:border-white/[0.18] hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-50';
export const card = 'rounded-2xl border border-white/[0.08] bg-[#14161a] p-5 shadow-sm shadow-black/10';

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

/** Responsive data table shared by the Staff HQ sections. */
export function AdminTable({
  cols,
  rows,
  empty,
  onEdit,
  onDelete,
}: {
  cols: { key: string; label: string; render?: (r: Row) => ReactNode }[];
  rows: Row[];
  empty?: string;
  onEdit?: (r: Row) => void;
  onDelete?: (r: Row) => void;
}) {
  if (!rows || rows.length === 0) {
    return (
      <div className="grid min-h-36 place-items-center rounded-2xl border border-dashed border-white/[0.1] bg-white/[0.015] px-6 py-10 text-center">
        <div>
          <p className="text-sm font-medium text-zinc-200">Nothing to show yet</p>
          <p className="mt-1 max-w-md text-xs leading-5 text-zinc-500">{empty ?? 'Create your first record to get started.'}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#101215]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-white/[0.025]">
            <tr className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
              {cols.map((column) => (
                <th key={column.key} className="whitespace-nowrap px-4 py-3.5">
                  {column.label}
                </th>
              ))}
              {onEdit || onDelete ? <th className="px-4 py-3.5 text-right">Actions</th> : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={String(row.id)} className="border-t border-white/[0.055] transition hover:bg-white/[0.025]">
                {cols.map((column) => (
                  <td key={column.key} className="max-w-[360px] px-4 py-3.5 align-middle text-zinc-300">
                    {column.render ? column.render(row) : String(row[column.key] ?? '—')}
                  </td>
                ))}
                {onEdit || onDelete ? (
                  <td className="whitespace-nowrap px-4 py-3.5">
                    <div className="flex justify-end gap-2">
                      {onEdit ? <button type="button" onClick={() => onEdit(row)} className={btnGhost}><Pencil className="h-3.5 w-3.5" aria-hidden="true" /> Edit</button> : null}
                      {onDelete ? <button type="button" onClick={() => onDelete(row)} className={btnGhost}><Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Remove</button> : null}
                    </div>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-white/[0.06] px-4 py-3 text-[11px] text-zinc-500">
        <span>{rows.length} {rows.length === 1 ? 'record' : 'records'}</span>
        <span>{onEdit || onDelete ? 'Select a row action to manage records' : 'Workspace records'}</span>
      </div>
    </div>
  );
}
