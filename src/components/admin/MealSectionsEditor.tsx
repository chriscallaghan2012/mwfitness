import React, { useMemo } from 'react';
import { btnGhost, inp } from './fields';

type JsonRecord = Record<string, unknown>;

function parseSections(value: string): JsonRecord[] | null {
  try {
    const parsed: unknown = JSON.parse(value || '[]');
    if (!Array.isArray(parsed)) return null;
    if (parsed.some((section) => {
      if (!section || typeof section !== 'object' || Array.isArray(section)) return true;
      const items = (section as JsonRecord).items;
      return items !== undefined && (!Array.isArray(items) || items.some((item) => !item || typeof item !== 'object' || Array.isArray(item)));
    })) return null;
    return parsed as JsonRecord[];
  } catch {
    return null;
  }
}

function updateItem(
  sections: JsonRecord[],
  sectionIndex: number,
  itemIndex: number,
  key: string,
  value: string,
): JsonRecord[] {
  return sections.map((section, index) => {
    if (index !== sectionIndex) return section;
    const items = Array.isArray(section.items) ? (section.items as unknown[]) : [];
    const nextItems = items.map((item, currentIndex) => {
      if (currentIndex !== itemIndex || !item || typeof item !== 'object' || Array.isArray(item)) return item;
      const next = { ...(item as JsonRecord) };
      if (key === 'calories' || key === 'protein') {
        if (!value.trim()) delete next[key];
        else {
          const number = Number(value);
          next[key] = Number.isFinite(number) && number >= 0 ? number : value;
        }
      } else {
        next[key] = value;
      }
      return next;
    });
    return { ...section, items: nextItems };
  });
}

export function MealSectionsEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const sections = useMemo(() => parseSections(value), [value]);

  const commit = (next: JsonRecord[]) => onChange(JSON.stringify(next, null, 2));

  if (!sections) {
    return (
      <div className="mt-3">
        <p className="text-xs text-amber-300 mb-2">Meal data is not a valid section array. Correct the JSON here, then the guided editor will return.</p>
        <textarea
          className={`${inp} min-h-40`}
          aria-label="Meal sections JSON"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder='[{"name":"BREAKFAST","items":[{"name":"Oats","sub":"50g oats","calories":190,"protein":7}]}]'
        />
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] text-zinc-500 uppercase">Meals and food items</p>
        <button type="button" className={btnGhost} onClick={() => commit([...sections, { name: 'New meal', items: [] }])}>+ Add meal</button>
      </div>
      {sections.length === 0 && <p className="text-xs text-zinc-500">No meals added yet.</p>}
      {sections.map((section, sectionIndex) => {
        const items = Array.isArray(section.items) ? (section.items as unknown[]) : [];
        return (
          <section key={sectionIndex} className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-3">
            <div className="flex items-start gap-2">
              <label className="flex-1 text-xs text-zinc-400">
                Meal / section name
                <input
                  className={`${inp} mt-1`}
                  value={String(section.name ?? '')}
                  onChange={(event) => commit(sections.map((item, index) => index === sectionIndex ? { ...item, name: event.target.value } : item))}
                />
              </label>
              <button type="button" className={btnGhost} aria-label={`Remove meal ${sectionIndex + 1}`} onClick={() => commit(sections.filter((_, index) => index !== sectionIndex))}>Remove</button>
            </div>
            <div className="mt-3 space-y-2">
              {items.map((item, itemIndex) => {
                const food = item && typeof item === 'object' && !Array.isArray(item) ? item as JsonRecord : {};
                return (
                  <div key={itemIndex} className="rounded-md border border-zinc-800 p-2">
                    <div className="flex items-start gap-2">
                      <label className="flex-1 text-xs text-zinc-400">
                        Food name
                        <input className={`${inp} mt-1`} value={String(food.name ?? '')} onChange={(event) => commit(updateItem(sections, sectionIndex, itemIndex, 'name', event.target.value))} />
                      </label>
                      <button type="button" className={btnGhost} aria-label={`Remove food ${itemIndex + 1}`} onClick={() => commit(sections.map((sectionItem, index) => index === sectionIndex ? { ...sectionItem, items: items.filter((_, currentIndex) => currentIndex !== itemIndex) } : sectionItem))}>×</button>
                    </div>
                    <label className="block mt-2 text-xs text-zinc-400">
                      Portion / notes
                      <input className={`${inp} mt-1`} value={String(food.sub ?? '')} onChange={(event) => commit(updateItem(sections, sectionIndex, itemIndex, 'sub', event.target.value))} />
                    </label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {(['calories', 'protein'] as const).map((key) => (
                        <label key={key} className="text-xs text-zinc-400">
                          {key === 'calories' ? 'Calories (kcal)' : 'Protein (g)'}
                          <input type="number" min="0" step="1" className={`${inp} mt-1`} value={food[key] == null ? '' : String(food[key])} onChange={(event) => commit(updateItem(sections, sectionIndex, itemIndex, key, event.target.value))} />
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              type="button"
              className={`${btnGhost} mt-3`}
              onClick={() => commit(sections.map((sectionItem, index) => index === sectionIndex ? { ...sectionItem, items: [...items, { name: '', sub: '', calories: 0, protein: 0 }] } : sectionItem))}
            >
              + Add food
            </button>
          </section>
        );
      })}
    </div>
  );
}
