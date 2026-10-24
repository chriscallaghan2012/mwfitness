import { useEffect, useMemo, useState } from 'react';
import { RotateCcw, Type, X } from 'lucide-react';

const POPULAR_FONTS = [
  'Inter', 'Manrope', 'Montserrat', 'DM Sans', 'Space Grotesk',
  'Barlow Condensed', 'Plus Jakarta Sans', 'Roboto', 'Open Sans', 'Lato',
  'Poppins', 'Oswald', 'Roboto Condensed', 'Roboto Slab', 'Playfair Display',
  'Merriweather', 'Nunito Sans', 'Nunito', 'Work Sans', 'Outfit', 'Archivo',
  'Barlow', 'Figtree', 'Urbanist', 'Sora', 'League Spartan', 'Archivo Black',
  'IBM Plex Sans', 'Source Sans 3', 'PT Sans', 'Raleway', 'Ubuntu', 'Rubik',
  'Karla', 'Libre Franklin', 'Titillium Web', 'Bebas Neue', 'Hanken Grotesk',
];

const DEFAULT_FONT = 'Hanken Grotesk';
const STORAGE_KEY = 'mwfitness-font-preview';
const TYPES = [
  { key: 'all', label: 'All text', description: 'Every text style' },
  { key: 'headings', label: 'Main headings', description: 'H1 and H2' },
  { key: 'subheadings', label: 'Secondary headings', description: 'H3–H6 and card titles' },
  { key: 'body', label: 'Paragraphs & body', description: 'Paragraphs and long-form copy' },
  { key: 'ui', label: 'Buttons & navigation', description: 'Buttons, links and menus' },
  { key: 'small', label: 'Labels & small text', description: 'Captions, tags and metadata' },
] as const;
type FontType = typeof TYPES[number]['key'];
type FontSettings = Record<FontType, string>;

const DEFAULT_SETTINGS: FontSettings = {
  all: DEFAULT_FONT,
  headings: DEFAULT_FONT,
  subheadings: DEFAULT_FONT,
  body: DEFAULT_FONT,
  ui: DEFAULT_FONT,
  small: DEFAULT_FONT,
};

function loadGoogleFont(font: string) {
  if (font === DEFAULT_FONT) return;
  const id = `mw-font-preview-${font.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font).replace(/%20/g, '+')}:wght@400;500;600;700;800&display=swap`;
  document.head.appendChild(link);
}

function applyFontSettings(settings: FontSettings) {
  const root = document.documentElement;
  const allFont = settings.all !== DEFAULT_FONT ? settings.all : '';
  const vars: Record<string, string> = {
    '--mw-preview-font-all': allFont,
    '--mw-preview-font-headings': settings.headings !== DEFAULT_FONT ? settings.headings : '',
    '--mw-preview-font-subheadings': settings.subheadings !== DEFAULT_FONT ? settings.subheadings : '',
    '--mw-preview-font-body': settings.body !== DEFAULT_FONT ? settings.body : '',
    '--mw-preview-font-ui': settings.ui !== DEFAULT_FONT ? settings.ui : '',
    '--mw-preview-font-small': settings.small !== DEFAULT_FONT ? settings.small : '',
  };
  Object.values(settings).filter((font) => font !== DEFAULT_FONT).forEach(loadGoogleFont);
  Object.entries(vars).forEach(([name, value]) => {
    if (value) root.style.setProperty(name, `"${value}"`);
    else root.style.removeProperty(name);
  });
  if (Object.values(settings).some((font) => font !== DEFAULT_FONT)) {
    root.setAttribute('data-mw-font-preview', 'true');
  } else {
    root.removeAttribute('data-mw-font-preview');
  }
}

export function FontPreviewSwitcher() {
  const [settings, setSettings] = useState<FontSettings>(DEFAULT_SETTINGS);
  const [activeType, setActiveType] = useState<FontType>('all');
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(true);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<FontSettings>;
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    applyFontSettings(settings);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const filteredFonts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return POPULAR_FONTS.filter((item) => item.toLowerCase().includes(query));
  }, [search]);

  const setActiveFont = (font: string) => {
    setSettings((current) => {
      if (activeType === 'all') {
        return { all: font, headings: font, subheadings: font, body: font, ui: font, small: font };
      }
      return { ...current, [activeType]: font, all: DEFAULT_FONT };
    });
  };

  const reset = () => {
    setSettings(DEFAULT_SETTINGS);
    setSearch('');
    window.localStorage.removeItem(STORAGE_KEY);
  };

  if (!open) {
    return (
      <button type="button" className="mw-font-preview-reopen" onClick={() => setOpen(true)} aria-label="Open font preview" title="Try fonts">
        <Type size={17} /><span>Try fonts</span>
      </button>
    );
  }

  return (
    <aside className="mw-font-preview-panel" aria-label="Website typography preview controls">
      <div className="mw-font-preview-header">
        <div className="mw-font-preview-heading"><Type size={17} /><span>Try website fonts</span></div>
        <button type="button" className="mw-font-preview-icon-button" onClick={() => setOpen(false)} aria-label="Minimise font preview"><X size={16} /></button>
      </div>
      <label className="mw-font-preview-label" htmlFor="mw-font-type">Text type</label>
      <select id="mw-font-type" className="mw-font-preview-select" value={activeType} onChange={(event) => setActiveType(event.target.value as FontType)}>
        {TYPES.map((type) => <option value={type.key} key={type.key}>{type.label}</option>)}
      </select>
      <p className="mw-font-preview-type-note">{TYPES.find((type) => type.key === activeType)?.description}</p>
      <label className="mw-font-preview-label" htmlFor="mw-font-search">Search popular Google Fonts</label>
      <input id="mw-font-search" className="mw-font-preview-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search fonts…" />
      <label className="mw-font-preview-label" htmlFor="mw-font-select">Font for {TYPES.find((type) => type.key === activeType)?.label.toLowerCase()}</label>
      <select id="mw-font-select" className="mw-font-preview-select" value={settings[activeType]} onChange={(event) => setActiveFont(event.target.value)}>
        <option value={DEFAULT_FONT}>Original — {DEFAULT_FONT}</option>
        {filteredFonts.filter((item) => item !== DEFAULT_FONT).map((item) => <option value={item} key={item}>{item}</option>)}
      </select>
      <div className="mw-font-preview-sample" style={{ fontFamily: `"${settings[activeType]}", sans-serif` }}>
        <strong>Train smarter.</strong>
        <span>Find the font that fits MW Fitness.</span>
        <small>Personal coaching. Real-life progress.</small>
      </div>
      <button type="button" className="mw-font-preview-reset" onClick={reset}><RotateCcw size={14} />Reset all typography</button>
      <p className="mw-font-preview-note">Preview only · Changes stay in this browser</p>
    </aside>
  );
}
