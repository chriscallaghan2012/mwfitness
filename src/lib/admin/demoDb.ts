// demoDb.ts — Tiny in-memory PostgREST-compatible query client for Staff HQ demo mode.
// It implements exactly the query surface the staff components use: from().select()
// (columns, embedded relations, { count }), .eq(), .order(), .limit(), .maybeSingle(),
// and .insert() / .update() / .delete() with .select() chaining. Requests resolve to
// the familiar { data, error, count } shape so every component runs unchanged in demo.
// Writes mutate the in-memory tables only — never Neon — until resetDemoDb() runs.
import { createDemoTables, type DemoRow, type DemoTables } from './demoData';

export type DemoResult = { data: DemoRow[] | null; error: { message: string; code?: string } | null; count: number | null };

let tables: DemoTables = createDemoTables();

/** Rebuild the seeded demo dataset — called when staff exit demo mode. */
export function resetDemoDb() {
  tables = createDemoTables();
}

/** FK column used to resolve an embedded relation like plans(name,price). */
const RELATION_KEYS: Record<string, Record<string, string>> = {
  memberships: { profiles: 'profile_id', plans: 'plan_id' },
  workout_sessions: { workout_templates: 'template_id', profiles: 'profile_id' },
  workout_templates: { plans: 'plan_id' },
  workout_template_exercises: { workout_templates: 'template_id', workout_exercises: 'exercise_id' },
  workout_schedules: { profiles: 'profile_id', workout_templates: 'template_id' },
  checkins: { profiles: 'profile_id' },
  progress_logs: { profiles: 'profile_id' },
  coaching_programme_assignments: { profiles: 'profile_id', coaching_programmes: 'programme_id' },
};

function foreignKey(table: string, relation: string): string {
  return RELATION_KEYS[table]?.[relation] ?? `${relation.endsWith('s') ? relation.slice(0, -1) : relation}_id`;
}

function splitColumns(columns: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (const char of columns) {
    if (char === '(') depth += 1;
    if (char === ')') depth -= 1;
    if (char === ',' && depth === 0) { parts.push(current.trim()); current = ''; continue; }
    current += char;
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

function project(table: string, row: DemoRow, columns: string): DemoRow {
  if (!columns || columns.trim() === '*') return { ...row };
  const result: DemoRow = {};
  for (const token of splitColumns(columns)) {
    if (token === '*') {
      Object.assign(result, row);
      continue;
    }
    const embedded = token.match(/^([a-z_]+)\(([^)]*)\)$/i);
    if (embedded) {
      const relation = embedded[1];
      const related = (tables[relation] ?? []).find((candidate) => String(candidate.id) === String(row[foreignKey(table, relation)]));
      result[relation] = related ? project(relation, related, embedded[2]) : null;
    } else {
      result[token] = row[token];
    }
  }
  return result;
}

const DATE_COLUMN = /(_at|_on|date|since|due|starts|scheduled|recorded|logged|completed)/i;

function compareValues(a: unknown, b: unknown, column: string): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  const aTime = typeof a === 'string' && DATE_COLUMN.test(column) ? Date.parse(a) : NaN;
  const bTime = typeof b === 'string' && DATE_COLUMN.test(column) ? Date.parse(b) : NaN;
  if (Number.isFinite(aTime) && Number.isFinite(bTime)) return aTime - bTime;
  return String(a).localeCompare(String(b), 'en-GB', { numeric: true });
}

type Filter = { column: string; value: unknown };
type Order = { column: string; ascending: boolean };

class DemoQuery {
  private mode: 'select' | 'insert' | 'update' | 'delete' = 'select';
  private columns = '*';
  private payload: DemoRow | null = null;
  private filters: Filter[] = [];
  private orders: Order[] = [];
  private max: number | null = null;
  private wantCount = false;

  constructor(private readonly table: string) {}

  select(columns = '*', options?: { count?: string }) {
    this.columns = columns || '*';
    this.wantCount = options?.count === 'exact';
    return this;
  }
  insert(row: DemoRow) { this.mode = 'insert'; this.payload = row; return this; }
  update(row: DemoRow) { this.mode = 'update'; this.payload = row; return this; }
  delete() { this.mode = 'delete'; return this; }
  eq(column: string, value: unknown) { this.filters.push({ column, value }); return this; }
  order(column: string, options?: { ascending?: boolean }) { this.orders.push({ column, ascending: options?.ascending !== false }); return this; }
  limit(count: number) { this.max = count; return this; }

  async maybeSingle(): Promise<{ data: DemoRow | null; error: DemoResult['error'] }> {
    const result = await this.execute();
    if (result.error) return { data: null, error: result.error };
    return { data: result.data?.[0] ?? null, error: null };
  }

  then<TResult1 = DemoResult, TResult2 = never>(
    onfulfilled?: ((value: DemoResult) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }

  private matches(row: DemoRow) {
    return this.filters.every((filter) => {
      const value = row[filter.column];
      if (value == null || filter.value == null) return value === filter.value;
      return String(value) === String(filter.value);
    });
  }

  private async execute(): Promise<DemoResult> {
    const rows = tables[this.table];
    if (!rows) {
      return { data: null, error: { message: `relation "${this.table}" does not exist`, code: '42P01' }, count: null };
    }

    if (this.mode === 'insert') {
      const row: DemoRow = { ...(this.payload ?? {}) };
      if (!row.id) row.id = `demo-${this.table}-${rows.length + 1}-${Date.now().toString(36)}`;
      if (!row.created_at) row.created_at = new Date().toISOString();
      rows.push(row);
      return { data: [project(this.table, row, this.columns)], error: null, count: 1 };
    }

    const matched = rows.filter((row) => this.matches(row));
    if (this.mode === 'update') {
      for (const row of matched) Object.assign(row, this.payload ?? {});
      return { data: matched.map((row) => project(this.table, row, this.columns)), error: null, count: matched.length };
    }
    if (this.mode === 'delete') {
      for (const row of matched) {
        const index = rows.indexOf(row);
        if (index >= 0) rows.splice(index, 1);
      }
      return { data: matched.map((row) => project(this.table, row, this.columns)), error: null, count: matched.length };
    }

    let result = [...matched];
    // Stable multi-key sort: apply the least significant order first.
    for (const order of [...this.orders].reverse()) {
      result.sort((a, b) => (order.ascending ? 1 : -1) * compareValues(a[order.column], b[order.column], order.column));
    }
    const count = result.length;
    if (this.max != null) result = result.slice(0, this.max);
    return {
      data: result.map((row) => project(this.table, row, this.columns)),
      error: null,
      count: this.wantCount ? count : null,
    };
  }
}

export const demoDb = {
  from(table: string) {
    return new DemoQuery(table);
  },
};
