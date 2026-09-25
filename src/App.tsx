import React, { useState, useEffect } from 'react';
import { ScreenId } from './types';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ConsultationModal } from './components/ConsultationModal';
import { PhoneCall } from 'lucide-react';

// Screens
import { HomeScreen } from './components/screens/HomeScreen';
import { OnlineCoachingScreen } from './components/screens/OnlineCoachingScreen';
import { PackagesScreen } from './components/screens/PackagesScreen';
import { AppScreen } from './components/screens/AppScreen';
import { ShwagScreen } from './components/screens/ShwagScreen';
import { ContactScreen } from './components/screens/ContactScreen';

const VALID_SCREENS: ScreenId[] = ['home', 'online-coaching', 'packages', 'app', 'shwag', 'contact'];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('home');
  const [bookCallOpen, setBookCallOpen] = useState(false);
  const [bookCallInterest, setBookCallInterest] = useState('');
  const [showMobileCta, setShowMobileCta] = useState(false);

  // Show the sticky mobile "book a call" bar once the visitor scrolls past the hero
  useEffect(() => {
    const onScroll = () => {
      setShowMobileCta((document.documentElement.scrollTop || document.body.scrollTop) > 400);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Handle URL hash navigation if needed
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '') as ScreenId;
      if (VALID_SCREENS.includes(hash)) setCurrentScreen(hash);
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

  const handleOpenBookCall = (interest?: string) => {
    if (interest) setBookCallInterest(interest);
    setBookCallOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0c0e] text-[#f3f4f6] font-sans selection:bg-[#ff5500] selection:text-black">
      {/* Sticky Navigation */}
      <Navbar
        currentScreen={currentScreen}
        onSelectScreen={handleSelectScreen}
        onOpenBookCall={() => handleOpenBookCall()}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {currentScreen === 'home' && (
          <HomeScreen onSelectScreen={handleSelectScreen} onOpenBookCall={handleOpenBookCall} />
        )}
        {currentScreen === 'online-coaching' && (
          <OnlineCoachingScreen onSelectScreen={handleSelectScreen} />
        )}
        {currentScreen === 'packages' && (
          <PackagesScreen onOpenBookCall={handleOpenBookCall} />
        )}
        {currentScreen === 'app' && (
          <AppScreen onOpenBookCall={handleOpenBookCall} />
        )}
        {currentScreen === 'shwag' && (
          <ShwagScreen onOpenBookCall={handleOpenBookCall} />
        )}
        {currentScreen === 'contact' && (
          <ContactScreen onOpenBookCall={handleOpenBookCall} />
        )}
      </main>

      {/* Footer */}
      <Footer
        onSelectScreen={handleSelectScreen}
        onOpenBookCall={() => handleOpenBookCall()}
      />

      {/* Sticky mobile CTA (appears after scrolling past the hero) */}
      {showMobileCta && (
        <div className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-[#0b0c0e]/95 backdrop-blur-md border-t border-[#ff5500]/40">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Ready when you are</span>
            <button
              onClick={() => handleOpenBookCall()}
              className="bg-[#ff5500] hover:bg-[#ff6a1f] text-black font-mono font-bold text-xs uppercase px-4 py-2.5 flex items-center gap-2 shadow-[0_0_20px_rgba(255,85,0,0.3)] active:scale-95"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              Book a free call
            </button>
          </div>
        </div>
      )}

      {/* Book a call modal */}
      <ConsultationModal
        isOpen={bookCallOpen}
        onClose={() => setBookCallOpen(false)}
        defaultInterest={bookCallInterest}
        onSelectScreen={handleSelectScreen}
      />
    </div>
  );
}