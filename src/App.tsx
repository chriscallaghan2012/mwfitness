import React, { useState, useEffect } from 'react';
import { ScreenId } from './types';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ConsultationModal } from './components/ConsultationModal';

// Screens
import { HomeScreen } from './components/screens/HomeScreen';
import { PackagesScreen } from './components/screens/PackagesScreen';
import { AppScreen } from './components/screens/AppScreen';
import { ShwagScreen } from './components/screens/ShwagScreen';
import { ContactScreen } from './components/screens/ContactScreen';

const VALID_SCREENS: ScreenId[] = ['home', 'packages', 'app', 'shwag', 'contact'];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('home');
  const [bookCallOpen, setBookCallOpen] = useState(false);
  const [bookCallInterest, setBookCallInterest] = useState('');

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
        {currentScreen === 'packages' && (
          <PackagesScreen onOpenBookCall={handleOpenBookCall} />
        )}
        {currentScreen === 'app' && (
          <AppScreen />
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

      {/* Book a call modal */}
      <ConsultationModal
        isOpen={bookCallOpen}
        onClose={() => setBookCallOpen(false)}
        defaultInterest={bookCallInterest}
      />
    </div>
  );
}