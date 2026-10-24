import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { RotateCcw, Type, X } from 'lucide-react';

const POPULAR_FONTS = [
  'Bodoni Moda', 'Bungee', 'Inter', 'Manrope', 'Montserrat', 'DM Sans', 'Space Grotesk',
  'Barlow Condensed', 'Plus Jakarta Sans', 'Roboto', 'Open Sans', 'Lato',
  'Poppins', 'Oswald', 'Roboto Condensed', 'Roboto Slab', 'Playfair Display',
  'Merriweather', 'Nunito Sans', 'Nunito', 'Work Sans', 'Outfit', 'Archivo',
  'Barlow', 'Figtree', 'Urbanist', 'Sora', 'League Spartan', 'Archivo Black',
  'IBM Plex Sans', 'Source Sans 3', 'PT Sans', 'Raleway', 'Ubuntu', 'Rubik',
  'Karla', 'Libre Franklin', 'Titillium Web', 'Bebas Neue', 'Hanken Grotesk',
];

const DEFAULT_FONT = 'Hanken Grotesk';
const STORAGE_KEY = 'mwfitness-font-preview';
const TEXT_TYPES = [
  { key: 'all', label: 'All text' },
  { key: 'h1', label: 'H1 — Main title' },
  { key: 'h2', label: 'H2 — Section titles' },
  { key: 'subheadings', label: 'H3–H6 — Subheadings' },
  { key: 'body', label: 'Paragraphs (P)' },
  { key: 'ui', label: 'Buttons & navigation' },
  { key: 'small', label: 'Labels & small text' },
] as const;
type FontType = typeof TEXT_TYPES[number]['key'];
type FontSelections = Record<FontType, string>;

const DEFAULT_SELECTIONS: FontSelections = {
  all: DEFAULT_FONT, h1: DEFAULT_FONT, h2: DEFAULT_FONT,
  subheadings: DEFAULT_FONT, body: DEFAULT_FONT, ui: DEFAULT_FONT, small: DEFAULT_FONT,
};

function loadGoogleFont(font: string) {
  const id = 'mw-font-preview-google-font';
  let link = document.getElementById(id) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font).replace(/%20/g, '+')}&display=swap`;
}

export function FontPreviewSwitcher() {
  const [typeFonts, setTypeFonts] = useState<FontSelections>(DEFAULT_SELECTIONS);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(true);

  useEffect(() => {
    try {
      const savedTypes = window.localStorage.getItem(`${STORAGE_KEY}-types`);
      if (savedTypes) {
        const parsed = JSON.parse(savedTypes) as Partial<FontSelections>;
        setTypeFonts((current) => ({ ...current, ...parsed }));
      } else {
        const legacyFont = window.localStorage.getItem(STORAGE_KEY);
        if (legacyFont && POPULAR_FONTS.includes(legacyFont)) {
          setTypeFonts(Object.fromEntries(TEXT_TYPES.map(({ key }) => [key, legacyFont])) as FontSelections);
        }
      }
    } catch {
      window.localStorage.removeItem(`${STORAGE_KEY}-types`);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const keys: Record<FontType, string> = {
      all: '--mw-preview-font-all',
      h1: '--mw-preview-font-h1',
      h2: '--mw-preview-font-h2',
      subheadings: '--mw-preview-font-headings',
      body: '--mw-preview-font-body',
      ui: '--mw-preview-font-ui',
      small: '--mw-preview-font-small',
    };
    Object.entries(keys).forEach(([key, variable]) => {
      const selected = typeFonts[key as FontType] || DEFAULT_FONT;
      if (selected !== DEFAULT_FONT) {
        loadGoogleFont(selected);
        root.style.setProperty(variable, `"${selected}"`);
      } else {
        root.style.removeProperty(variable);
      }
    });
    const anyCustom = Object.values(typeFonts).some((selected) => selected !== DEFAULT_FONT);
    if (anyCustom) root.setAttribute('data-mw-font-preview', 'true');
    else root.removeAttribute('data-mw-font-preview');
    window.localStorage.setItem(`${STORAGE_KEY}-types`, JSON.stringify(typeFonts));
    if (typeFonts.all !== DEFAULT_FONT) window.localStorage.setItem(STORAGE_KEY, typeFonts.all);
    else window.localStorage.removeItem(STORAGE_KEY);
  }, [typeFonts]);

  const filteredFonts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return POPULAR_FONTS.filter((item) => item.toLowerCase().includes(query));
  }, [search]);

  const setSelectedFont = (type: FontType, selected: string) => {
    if (type === 'all') {
      setTypeFonts(Object.fromEntries(TEXT_TYPES.map(({ key }) => [key, selected])) as FontSelections);
      return;
    }
    setTypeFonts((current) => ({ ...current, all: DEFAULT_FONT, [type]: selected }));
  };

  const reset = () => {
    setTypeFonts(DEFAULT_SELECTIONS);
    setSearch('');
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(`${STORAGE_KEY}-types`);
  };

  if (!open) {
    return (
      <button type="button" className="mw-font-preview-reopen" onClick={() => setOpen(true)} aria-label="Open font preview" title="Try website fonts">
        <Type size={17} />
        <span>Try fonts</span>
      </button>
    );
  }

  return (
    <aside className="mw-font-preview-panel" aria-label="Website font preview controls">
      <div className="mw-font-preview-header">
        <div className="mw-font-preview-heading"><Type size={17} /><span>Try website fonts</span></div>
        <button type="button" className="mw-font-preview-icon-button" onClick={() => setOpen(false)} aria-label="Minimise font preview"><X size={16} /></button>
      </div>
      <label className="mw-font-preview-label" htmlFor="mw-font-search">Search popular Google Fonts</label>
      <input id="mw-font-search" className="mw-font-preview-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search fonts…" />
      <div className="mw-font-preview-font-list">
        {TEXT_TYPES.map(({ key, label }) => {
          const selectId = `mw-font-select-${key}`;
          return (
            <div className="mw-font-preview-font-row" key={key}>
              <label className="mw-font-preview-label" htmlFor={selectId}>{label}</label>
              <select id={selectId} className="mw-font-preview-select" value={typeFonts[key]} onChange={(event) => setSelectedFont(key, event.target.value)}>
                <option value={DEFAULT_FONT}>Original — {DEFAULT_FONT}</option>
                {filteredFonts.filter((item) => item !== DEFAULT_FONT).map((item) => <option value={item} key={item}>{item}</option>)}
              </select>
            </div>
          );
        })}
      </div>
      <div className="mw-font-preview-sample" style={{ "--mw-font-preview-sample": `"${typeFonts.h1}"` } as CSSProperties}>
        <strong>MW FITNESS — Aa Bb 123</strong>
        <span>Train smarter. Build habits that last.</span>
        <small>PERSONAL COACHING · REAL-LIFE PROGRESS</small>
      </div>
      <p className="mw-font-preview-type-note">Every text type has its own selector. Choose <strong>All text</strong> to apply one font site-wide, or customise each category independently.</p>
      <button type="button" className="mw-font-preview-reset" onClick={reset}><RotateCcw size={14} />Reset original fonts</button>
      <p className="mw-font-preview-note">Preview only · Changes stay in this browser</p>
    </aside>
  );
}
