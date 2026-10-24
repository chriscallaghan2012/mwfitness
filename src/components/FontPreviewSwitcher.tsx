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

const DEFAULT_SIZES: Record<FontType, number> = {
  all: 16, h1: 48, h2: 36, subheadings: 24, body: 16, ui: 14, small: 12,
};

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
  const [typeSizes, setTypeSizes] = useState<Record<FontType, number>>(DEFAULT_SIZES);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const savedTypes = window.localStorage.getItem(`${STORAGE_KEY}-types`);
      const savedSizes = window.localStorage.getItem(`${STORAGE_KEY}-sizes`);
      if (savedSizes) setTypeSizes((current) => ({ ...current, ...(JSON.parse(savedSizes) as Partial<Record<FontType, number>>) }));
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
    window.localStorage.removeItem(`${STORAGE_KEY}-sizes`);
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
    const sizeVariables: Record<FontType, string> = {
      all: '--mw-preview-size-all', h1: '--mw-preview-size-h1', h2: '--mw-preview-size-h2',
      subheadings: '--mw-preview-size-headings', body: '--mw-preview-size-body',
      ui: '--mw-preview-size-ui', small: '--mw-preview-size-small',
    };
    Object.entries(sizeVariables).forEach(([key, variable]) => {
      root.style.setProperty(variable, `${typeSizes[key as FontType]}px`);
    });
    const anyCustom = Object.values(typeFonts).some((selected) => selected !== DEFAULT_FONT) ||
      Object.entries(typeSizes).some(([key, size]) => size !== DEFAULT_SIZES[key as FontType]);
    if (anyCustom) root.setAttribute('data-mw-font-preview', 'true');
    else root.removeAttribute('data-mw-font-preview');
    window.localStorage.setItem(`${STORAGE_KEY}-types`, JSON.stringify(typeFonts));
    window.localStorage.setItem(`${STORAGE_KEY}-sizes`, JSON.stringify(typeSizes));
    if (typeFonts.all !== DEFAULT_FONT) window.localStorage.setItem(STORAGE_KEY, typeFonts.all);
    else window.localStorage.removeItem(STORAGE_KEY);
  }, [typeFonts, typeSizes]);

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
    setTypeSizes(DEFAULT_SIZES);
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
              <div className="mw-font-preview-size-row">
                <label htmlFor={`mw-font-size-${key}`}>Font size</label>
                <span className="mw-font-preview-size-value">{typeSizes[key]}px</span>
                <input
                  id={`mw-font-size-${key}`}
                  type="range"
                  min={key === 'h1' ? 24 : 10}
                  max={key === 'h1' ? 88 : key === 'h2' ? 64 : key === 'subheadings' ? 48 : 32}
                  step="1"
                  value={typeSizes[key]}
                  aria-label={`${label} font size`}
                  onChange={(event) => {
                    const size = Number(event.target.value);
                    if (key === 'all') setTypeSizes(Object.fromEntries(TEXT_TYPES.map(({ key: typeKey }) => [typeKey, size])) as Record<FontType, number>);
                    else setTypeSizes((current) => ({ ...current, [key]: size }));
                  }}
                  style={{ gridColumn: '1 / -1' }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mw-font-preview-sticky-preview">
        <div className="mw-font-preview-sample" style={{ "--mw-font-preview-sample": `"${typeFonts.h1}"`, fontSize: `${typeSizes.h1}px` } as CSSProperties}>
          <strong style={{ fontSize: `${typeSizes.h1}px` }}>MW FITNESS — Aa Bb 123</strong>
          <span style={{ fontSize: `${typeSizes.body}px` }}>Train smarter. Build habits that last.</span>
          <small style={{ fontSize: `${typeSizes.small}px` }}>PERSONAL COACHING · REAL-LIFE PROGRESS</small>
        </div>
        <button type="button" className="mw-font-preview-reset" onClick={reset}><RotateCcw size={14} />Reset original fonts</button>
        <p className="mw-font-preview-note">Preview only · Changes stay in this browser</p>
      </div>
    </aside>
  );
}
