import React, { useEffect, useState } from 'react';
import { ContactKind, ScreenId } from './types';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ContactModal } from './components/ContactModal';
import { HomeScreen } from './components/screens/HomeScreen';
import { PackagesScreen } from './components/screens/PackagesScreen';
import { ContactScreen } from './components/screens/ContactScreen';
import { AppShopScreen } from './components/screens/AppShopScreen';

const VALID_SCREENS: ScreenId[] = ['home', 'packages', 'contact', 'app-shop'];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('home');
  const [contact, setContact] = useState<{ kind: ContactKind; interest?: string; source?: string } | null>(null);

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '') as ScreenId;
      if (VALID_SCREENS.includes(hash)) {
        setCurrentScreen(hash);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleSelectScreen = (screen: ScreenId) => {
    setCurrentScreen(screen);
    window.location.hash = screen;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openContact = (kind: ContactKind = 'book-call', interest?: string) => {
    setContact({ kind, interest, source: currentScreen });
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-paper text-brand-body font-sans selection:bg-brand-orange selection:text-white">
      <Navbar currentScreen={currentScreen} onSelectScreen={handleSelectScreen} onOpenContact={() => openContact('book-call')} />

      <main className="flex-1 w-full">
        {currentScreen === 'home' && (
          <HomeScreen onSelectScreen={handleSelectScreen} onOpenContact={openContact} />
        )}
        {currentScreen === 'packages' && (
          <PackagesScreen onSelectScreen={handleSelectScreen} onOpenContact={openContact} />
        )}
        {currentScreen === 'contact' && <ContactScreen />}
        {currentScreen === 'app-shop' && (
          <AppShopScreen onOpenContact={openContact} />
        )}
      </main>

      <Footer onSelectScreen={handleSelectScreen} onOpenContact={() => openContact('book-call')} />

      <ContactModal
        isOpen={contact !== null}
        kind={contact?.kind ?? 'book-call'}
        defaultInterest={contact?.interest}
        source={contact?.source}
        onClose={() => setContact(null)}
      />
    </div>
  );
}