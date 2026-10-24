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

function loadGoogleFont(font: string) {
  const id = 'mw-font-preview-google-font';
  let link = document.getElementById(id) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font).replace(/%20/g, '+')}:wght@400;500;600;700;800&display=swap`;
}

export function FontPreviewSwitcher() {
  const [font, setFont] = useState(DEFAULT_FONT);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved && POPULAR_FONTS.includes(saved)) setFont(saved);
  }, []);

  useEffect(() => {
    if (font === DEFAULT_FONT) {
      document.documentElement.removeAttribute('data-mw-font-preview');
      document.documentElement.style.removeProperty('--mw-preview-font');
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }
    loadGoogleFont(font);
    document.documentElement.style.setProperty('--mw-preview-font', `"${font}"`);
    document.documentElement.setAttribute('data-mw-font-preview', 'true');
    window.localStorage.setItem(STORAGE_KEY, font);
  }, [font]);

  const filteredFonts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return POPULAR_FONTS.filter((item) => item.toLowerCase().includes(query));
  }, [search]);

  const reset = () => {
    setFont(DEFAULT_FONT);
    setSearch('');
    window.localStorage.removeItem(STORAGE_KEY);
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
      <label className="mw-font-preview-label" htmlFor="mw-font-select">Font family</label>
      <select id="mw-font-select" className="mw-font-preview-select" value={font} onChange={(event) => setFont(event.target.value)}>
        <option value={DEFAULT_FONT}>Original — {DEFAULT_FONT}</option>
        {filteredFonts.filter((item) => item !== DEFAULT_FONT).map((item) => <option value={item} key={item}>{item}</option>)}
      </select>
      <div className="mw-font-preview-sample" style={{ fontFamily: `"${font}", sans-serif` }}>
        <strong>Train smarter.</strong>
        <span>Find the font that fits MW Fitness.</span>
      </div>
      <button type="button" className="mw-font-preview-reset" onClick={reset}><RotateCcw size={14} />Reset original font</button>
      <p className="mw-font-preview-note">Preview only · Changes stay in this browser</p>
    </aside>
  );
}
