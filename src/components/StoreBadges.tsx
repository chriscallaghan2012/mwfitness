import React from 'react';

interface StoreBadgesProps {
  compact?: boolean;
  appStoreUrl?: string;
  googlePlayUrl?: string;
}

export const StoreBadges: React.FC<StoreBadgesProps> = ({ compact = false, appStoreUrl, googlePlayUrl }) => {
  const resolvedAppStoreUrl = resolvedAppStoreUrl ?? import.meta.env.VITE_APP_STORE_URL;
  const resolvedGooglePlayUrl = resolvedGooglePlayUrl ?? import.meta.env.VITE_GOOGLE_PLAY_URL;
  const badgeClass = `inline-flex min-h-[58px] min-w-[190px] items-center gap-3 rounded-xl border border-zinc-700 bg-black px-4 py-3 text-left transition-colors ${compact ? 'min-w-0 min-h-[44px] px-3 py-2' : 'hover:border-[#ff5500]/70'}`;
  const appleIcon = <svg aria-hidden="true" viewBox="0 0 24 24" className={compact ? 'h-5 w-5' : 'h-8 w-8'} fill="currentColor"><path d="M16.37 12.1c.02 2.1 1.84 2.8 1.86 2.81-.02.05-.29 1.02-.96 2.02-.58.86-1.18 1.72-2.12 1.74-.92.02-1.22-.56-2.28-.56-1.05 0-1.39.54-2.26.58-.91.03-1.61-.94-2.2-1.8-1.2-1.74-2.12-4.92-.89-7.07.61-1.07 1.71-1.75 2.9-1.77.9-.02 1.75.61 2.3.61.55 0 1.58-.75 2.67-.64.46.02 1.75.19 2.58 1.42-.07.04-1.54.9-1.6 2.66ZM14.61 6.3c.48-.58.8-1.38.71-2.18-.69.03-1.53.46-2.02 1.04-.44.51-.83 1.33-.73 2.1.77.06 1.56-.39 2.04-.96Z"/></svg>;
  const playIcon = <svg aria-hidden="true" viewBox="0 0 24 24" className={compact ? 'h-5 w-5' : 'h-8 w-8'}><path d="M3.2 2.6c-.4.3-.6.8-.6 1.5v15.8c0 .7.2 1.2.6 1.5L12 13 3.2 2.6Z" fill="#34A853"/><path d="m14.1 10.9-2.1 2.1 2.1 2.1 5.1-2.9c.7-.4.7-1 0-1.4l-5.1-2.9-2.1 2.1 2.1.9Z" fill="#4285F4"/><path d="M3.2 2.6 14.1 10.9 12 13 3.2 21.4c.3.1.7 0 1.1-.2l12.9-7.3L3.2 2.6Z" fill="#FBBC04"/><path d="M3.2 21.4 14.1 13l3.1 1.8L4.3 22.1c-.4.2-.8.2-1.1-.7Z" fill="#EA4335"/></svg>;
  const apple = <>{appleIcon}<span><span className="block text-[9px] leading-tight text-zinc-300">{resolvedAppStoreUrl ? 'Download on the' : 'Coming soon to the'}</span><span className={`block font-semibold leading-tight text-white ${compact ? 'text-[10px]' : 'text-sm'}`}>App Store</span></span></>;
  const google = <>{playIcon}<span><span className="block text-[9px] leading-tight text-zinc-300">{resolvedGooglePlayUrl ? 'Get it on' : compact ? 'COMING SOON' : 'Coming soon on'}</span><span className={`block font-semibold leading-tight text-white ${compact ? 'text-[10px]' : 'text-sm'}`}>Google Play</span></span></>;
  return <div className={`flex flex-wrap items-center gap-4 ${compact ? 'gap-2' : ''}`} aria-label="MWFitnessUK app store availability">
    {resolvedAppStoreUrl ? <a href={resolvedAppStoreUrl} target="_blank" rel="noopener noreferrer" className={badgeClass} aria-label="Download MWFitnessUK from the App Store">{apple}</a> : <div className={badgeClass} aria-label="App Store listing coming soon">{apple}</div>}
    {resolvedGooglePlayUrl ? <a href={resolvedGooglePlayUrl} target="_blank" rel="noopener noreferrer" className={badgeClass} aria-label="Get MWFitnessUK on Google Play">{google}</a> : <div className={badgeClass} aria-label="Google Play listing coming soon">{google}</div>}
  </div>;
};
