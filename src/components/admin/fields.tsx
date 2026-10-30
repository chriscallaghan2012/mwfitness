// Small shared helpers for the staff admin panel.
import { FormEvent, ReactNode, useState } from 'react';
import { ChevronDown, Pencil, Trash2 } from 'lucide-react';

export const inp =
  'w-full min-w-0 rounded-xl border border-white/[0.1] bg-[#0e1013] px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-orange-400/70 focus:ring-2 focus:ring-orange-400/10';
export const btn =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-semibold text-black shadow-sm shadow-orange-950/20 transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.99]';
export const btnGhost =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.025] px-3.5 py-2.5 text-xs font-medium text-zinc-300 transition hover:border-white/[0.18] hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-50';
export const card = 'rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#17191e] to-[#121316] p-5 shadow-lg shadow-black/10';

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

export function ConfirmDialog({ title, description, confirmLabel = 'Delete', onCancel, onConfirm }: {
  title: string;
  description: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4" role="presentation">
      <section role="alertdialog" aria-modal="true" aria-label={title} className="w-full max-w-md rounded-2xl border border-white/10 bg-[#17191e] p-5 shadow-2xl shadow-black/60">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-red-500/25 bg-red-500/10 text-red-300"><Trash2 className="h-5 w-5" /></div>
        <h3 className="text-base font-semibold text-white">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-zinc-400">{description}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className={btnGhost}>Cancel</button>
          <button type="button" onClick={onConfirm} className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-red-400"><Trash2 className="h-3.5 w-3.5" />{confirmLabel}</button>
        </div>
      </section>
    </div>
  );
}

/** Search text for raw records, including nested profile/plan relationships. */
function searchableText(value: unknown, depth = 0): string {
  if (value == null || depth > 4) return '';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return value.map((item) => searchableText(item, depth + 1)).join(' ');
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    if ('$$typeof' in record) return '';
    return Object.values(record).map((item) => searchableText(item, depth + 1)).join(' ');
  }
  return '';
}

/** Responsive, searchable and paginated table shared by Staff HQ sections. */
export function AdminTable({
  cols,
  rows,
  empty,
  onEdit,
  onDelete,
  sectionTitle,
  collapsible = false,
  defaultCollapsed = false,
  searchPlaceholder = 'Search records…',
  deleteLabel,
  deleteDescription,
}: {
  cols: { key: string; label: string; render?: (r: Row) => ReactNode }[];
  rows: Row[];
  empty?: string;
  onEdit?: (r: Row) => void;
  onDelete?: (r: Row) => void;
  sectionTitle?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  searchPlaceholder?: string;
  deleteLabel?: (row: Row) => string;
  deleteDescription?: (row: Row) => string;
}) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [pendingDelete, setPendingDelete] = useState<Row | null>(null);
  const indexedRows = rows.map((row) => ({ row, searchText: searchableText(row).toLocaleLowerCase() }));
  const query = search.trim().toLocaleLowerCase();
  const filteredRows = query ? indexedRows.filter((item) => item.searchText.includes(query)).map((item) => item.row) : rows;
  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const currentPage = Math.min(page, pageCount - 1);
  const pageRows = filteredRows.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

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

  const tableContent = (
    <>
      <div className="flex flex-col gap-3 border-b border-white/[0.06] p-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
        <label className="relative block w-full sm:max-w-sm">
          <span className="sr-only">{searchPlaceholder}</span>
          <input
            type="search"
            value={search}
            onChange={(event) => { setSearch(event.target.value); setPage(0); }}
            placeholder={searchPlaceholder}
            className="w-full rounded-lg border border-white/[0.1] bg-[#0b0c0e] py-2.5 pl-9 pr-14 text-xs text-white outline-none placeholder:text-zinc-600 focus:border-orange-400/70 focus:ring-2 focus:ring-orange-400/10"
          />
          {search ? <button type="button" onClick={() => { setSearch(""); setPage(0); }} className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-[10px] text-zinc-400 hover:bg-white/10 hover:text-white">Clear</button> : null}
          <span aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">⌕</span>
        </label>
        <label className="flex shrink-0 items-center gap-2 text-[11px] text-zinc-500">
          Rows per page
          <select aria-label="Rows per page" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(0); }} className="rounded-lg border border-white/[0.1] bg-[#0b0c0e] px-2.5 py-2 text-xs text-zinc-200 outline-none focus:border-orange-400/70">
            {[10, 25, 50].map((size) => <option key={size} value={size}>{size}</option>)}
          </select>
        </label>
      </div>
      {filteredRows.length === 0 ? (
        <div className="grid min-h-28 place-items-center px-6 py-8 text-center">
          <div><p className="text-sm font-medium text-zinc-200">No matching records</p><p className="mt-1 text-xs text-zinc-500">Try another search term or clear the search.</p></div>
        </div>
      ) : (
        <>
          <div className="max-h-[65vh] overflow-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="sticky top-0 z-10 border-b border-white/[0.06] bg-[#17191e]">
                <tr className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  {cols.map((column) => <th key={column.key} className="whitespace-nowrap px-4 py-3.5">{column.label}</th>)}
                  {onEdit || onDelete ? <th className="px-4 py-3.5 text-right">Actions</th> : null}
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row, index) => (
                  <tr key={String(row.id ?? String(currentPage) + '-' + String(index))} className="border-t border-white/[0.055] transition-colors hover:bg-orange-500/[0.035]">
                    {cols.map((column) => (
                      <td key={column.key} className="max-w-[360px] px-4 py-4 align-middle text-zinc-300">
                        {column.render ? column.render(row) : String(row[column.key] ?? '—')}
                      </td>
                    ))}
                    {onEdit || onDelete ? (
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <div className="flex justify-end gap-2">
                          {onEdit ? <button type="button" onClick={() => onEdit(row)} className={btnGhost}><Pencil className="h-3.5 w-3.5" aria-hidden="true" /> Edit</button> : null}
                          {onDelete ? <button type="button" onClick={() => setPendingDelete(row)} className={btnGhost}><Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Remove</button> : null}
                        </div>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col gap-3 border-t border-white/[0.06] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-[11px] text-zinc-500">
              Showing {currentPage * pageSize + 1}–{Math.min((currentPage + 1) * pageSize, filteredRows.length)} of {filteredRows.length}
              {query ? ' matching records' : ' records'}
              {filteredRows.length !== rows.length ? ' · ' + rows.length + ' total' : ''}
            </span>
            <div className="flex items-center gap-2">
              <button type="button" className={btnGhost} disabled={currentPage === 0} onClick={() => setPage(Math.max(0, currentPage - 1))}>Previous</button>
              <span className="min-w-20 text-center text-[11px] text-zinc-400">Page {currentPage + 1} of {pageCount}</span>
              <button type="button" className={btnGhost} disabled={currentPage >= pageCount - 1} onClick={() => setPage(Math.min(pageCount - 1, currentPage + 1))}>Next</button>
            </div>
          </div>
        </>
      )}
    </>
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-[#121418] to-[#0f1013] shadow-lg shadow-black/10">
      {collapsible ? (
        <button type="button" aria-expanded={!collapsed} onClick={() => setCollapsed((value) => !value)} className="flex w-full items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-3.5 text-left hover:bg-white/[0.025]">
          <span className="min-w-0 text-sm font-semibold text-white">{sectionTitle ?? 'Records'} <span className="ml-2 text-xs font-normal text-zinc-500">{rows.length}</span></span>
          <ChevronDown aria-hidden="true" className={`ml-3 h-4 w-4 shrink-0 text-zinc-400 transition-transform duration-200 ${collapsed ? '-rotate-90' : 'rotate-0'}`} />
        </button>
      ) : null}
      {(!collapsible || !collapsed) ? tableContent : null}
      {pendingDelete ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4" role="presentation">
          <section role="alertdialog" aria-modal="true" aria-labelledby="staff-delete-title" aria-describedby="staff-delete-description" className="w-full max-w-md rounded-2xl border border-white/10 bg-[#17191e] p-5 shadow-2xl shadow-black/60">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-red-500/25 bg-red-500/10 text-red-300"><Trash2 className="h-5 w-5" /></div>
            <h3 id="staff-delete-title" className="text-base font-semibold text-white">Confirm deletion</h3>
            <p id="staff-delete-description" className="mt-2 text-sm leading-6 text-zinc-400">{deleteDescription ? deleteDescription(pendingDelete) : <>Delete <span className="font-medium text-white">{String(pendingDelete.name ?? pendingDelete.title ?? pendingDelete.full_name ?? pendingDelete.email ?? pendingDelete.id ?? 'this record')}</span>? This action may not be reversible.</>}</p>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setPendingDelete(null)} className={btnGhost}>Cancel</button>
              <button type="button" onClick={() => { const row = pendingDelete; setPendingDelete(null); onDelete?.(row); }} className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-red-400"><Trash2 className="h-3.5 w-3.5" />{deleteLabel ? deleteLabel(pendingDelete) : "Delete"}</button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
