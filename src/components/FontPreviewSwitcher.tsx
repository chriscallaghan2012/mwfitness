import { useEffect, useState } from 'react';
import { RotateCcw, Type, X } from 'lucide-react';

const SIZE_KEY = 'mwfitness-font-preview-sizes';
const FONT_KEY = 'mwfitness-font-preview-types';
const FONT_OPTIONS = [
  { label: 'Bebas Neue', value: '"Bebas Neue", sans-serif' },
  { label: 'Hanken Grotesk', value: '"Hanken Grotesk", sans-serif' },
  { label: 'JetBrains Mono', value: '"JetBrains Mono", monospace' },
  { label: 'Inter', value: '"Inter", sans-serif' },
  { label: 'Roboto', value: 'Roboto, sans-serif' },
  { label: 'Montserrat', value: 'Montserrat, sans-serif' },
  { label: 'Oswald', value: 'Oswald, sans-serif' },
  { label: 'DM Sans', value: '"DM Sans", sans-serif' },
  { label: 'Space Grotesk', value: '"Space Grotesk", sans-serif' },
  { label: 'Playfair Display', value: '"Playfair Display", serif' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
] as const;
const TEXT_TYPES = [
  { key: 'all', label: 'All text' },
  { key: 'h1', label: 'H1 — Main title' },
  { key: 'h2', label: 'H2 — Section titles' },
  { key: 'subheadings', label: 'H3–H6 — Subheadings' },
  { key: 'body', label: 'Paragraphs (P)' },
  { key: 'ui', label: 'Buttons & navigation' },
  { key: 'small', label: 'Labels & small text' },
] as const;
type TextType = typeof TEXT_TYPES[number]['key'];
type FontSelections = Record<TextType, string>;
const DEFAULT_FONTS: FontSelections = { all: 'inherit', h1: 'inherit', h2: 'inherit', subheadings: 'inherit', body: 'inherit', ui: 'inherit', small: 'inherit' };
const DEFAULT_SIZES: Record<TextType, number> = { all: 16, h1: 48, h2: 36, subheadings: 24, body: 16, ui: 14, small: 12 };

export function FontPreviewSwitcher() {
  const [typeSizes, setTypeSizes] = useState<Record<TextType, number>>(DEFAULT_SIZES);
  const [typeFonts, setTypeFonts] = useState<FontSelections>(DEFAULT_FONTS);
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const sizes = window.localStorage.getItem(SIZE_KEY);
      if (sizes) setTypeSizes((current) => ({ ...current, ...(JSON.parse(sizes) as Partial<Record<TextType, number>>) }));
      const fonts = window.localStorage.getItem(FONT_KEY);
      if (fonts) setTypeFonts((current) => ({ ...current, ...(JSON.parse(fonts) as Partial<FontSelections>) }));
    } catch {
      window.localStorage.removeItem(SIZE_KEY);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700;800;900&family=Montserrat:wght@400;500;600;700;800;900&family=Oswald:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700;800&family=Roboto:wght@400;500;700;900&family=Space+Grotesk:wght@400;500;600;700&display=swap';
    link.dataset.mwFontPreview = 'true';
    document.head.appendChild(link);
    return () => { link.remove(); };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const root = document.documentElement;
    const sizeVars: Record<TextType, string> = { all: '--mw-preview-size-all', h1: '--mw-preview-size-h1', h2: '--mw-preview-size-h2', subheadings: '--mw-preview-size-headings', body: '--mw-preview-size-body', ui: '--mw-preview-size-ui', small: '--mw-preview-size-small' };
    const fontVars: Record<TextType, string> = { all: '--mw-preview-font-all', h1: '--mw-preview-font-h1', h2: '--mw-preview-font-h2', subheadings: '--mw-preview-font-headings', body: '--mw-preview-font-body', ui: '--mw-preview-font-ui', small: '--mw-preview-font-small' };
    Object.entries(sizeVars).forEach(([key, variable]) => root.style.setProperty(variable, `${typeSizes[key as TextType]}px`));
    Object.entries(fontVars).forEach(([key, variable]) => {
      const font = typeFonts[key as TextType];
      if (font && font !== 'inherit') root.style.setProperty(variable, font);
      else root.style.removeProperty(variable);
    });
    const customSize = Object.entries(typeSizes).some(([key, size]) => size !== DEFAULT_SIZES[key as TextType]);
    const customFont = Object.values(typeFonts).some((font) => font !== 'inherit');
    if (customSize || customFont) root.setAttribute('data-mw-font-preview', 'true');
    else root.removeAttribute('data-mw-font-preview');
    window.localStorage.setItem(SIZE_KEY, JSON.stringify(typeSizes));
    window.localStorage.setItem(FONT_KEY, JSON.stringify(typeFonts));
  }, [typeSizes, typeFonts, hydrated]);

  const reset = () => {
    setTypeSizes(DEFAULT_SIZES);
    setTypeFonts(DEFAULT_FONTS);
    window.localStorage.removeItem(SIZE_KEY);
    window.localStorage.removeItem(FONT_KEY);
  };

  if (!open) return <button type="button" className="mw-font-preview-reopen" onClick={() => setOpen(true)} aria-label="Open typography controls" title="Choose fonts and adjust text sizes"><Type size={17} /><span>Fonts & sizes</span></button>;

  return <aside className="mw-font-preview-panel" aria-label="Website font and text size controls">
    <div className="mw-font-preview-header"><div className="mw-font-preview-heading"><Type size={17} /><span>Fonts & sizes</span></div><button type="button" className="mw-font-preview-icon-button" onClick={() => setOpen(false)} aria-label="Close font controls" title="Close font controls"><X size={18} /></button></div>
    <div className="mw-font-preview-font-list">
      {TEXT_TYPES.map(({ key, label }) => <div className="mw-font-preview-font-row" key={key}>
        <label className="mw-font-preview-label" htmlFor={`mw-font-family-${key}`}>{label} — font</label>
        <select id={`mw-font-family-${key}`} className="mw-font-preview-select" value={typeFonts[key]} onChange={(event) => {
          const font = event.target.value;
          if (key === 'all') setTypeFonts(Object.fromEntries(TEXT_TYPES.map(({ key: textKey }) => [textKey, font])) as FontSelections);
          else setTypeFonts((current) => ({ ...current, [key]: font }));
        }}>
          <option value="inherit">Use site default</option>{FONT_OPTIONS.map((font) => <option key={font.label} value={font.value}>{font.label}</option>)}
        </select>
        <div className="mw-font-preview-size-row"><label htmlFor={`mw-font-size-${key}`}>{label} — size</label><span className="mw-font-preview-size-value">{typeSizes[key]}px</span><input id={`mw-font-size-${key}`} type="range" min={key === 'h1' ? 24 : 10} max={key === 'h1' ? 88 : key === 'h2' ? 64 : key === 'subheadings' ? 48 : 32} step="1" value={typeSizes[key]} aria-label={`${label} font size`} onChange={(event) => {
          const size = Number(event.target.value);
          if (key === 'all') setTypeSizes(Object.fromEntries(TEXT_TYPES.map(({ key: textKey }) => [textKey, size])) as Record<TextType, number>);
          else setTypeSizes((current) => ({ ...current, [key]: size }));
        }} /></div>
      </div>)}
    </div>
    <div className="mw-font-preview-sticky-preview"><div className="mw-font-preview-sample" style={{ fontFamily: typeFonts.h1 === 'inherit' ? undefined : typeFonts.h1 }}><strong>MWFITNESSUK — REAL RESULTS.</strong><span>Preview your typography, then adjust each category above.</span></div><button type="button" className="mw-font-preview-reset" onClick={reset}><RotateCcw size={14} /> Reset fonts & sizes</button></div>
  </aside>;
}
