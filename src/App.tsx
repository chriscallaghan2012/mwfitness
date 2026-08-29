import React, { useState, useEffect } from 'react';
import { ScreenId, Programme } from './types';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ConsultationModal } from './components/ConsultationModal';
import { ProgrammeModal } from './components/ProgrammeModal';

// Screens
import { HomeScreen } from './components/screens/HomeScreen';
import { PersonalTrainingScreen } from './components/screens/PersonalTrainingScreen';
import { OnlineCoachingScreen } from './components/screens/OnlineCoachingScreen';
import { MethodologyScreen } from './components/screens/MethodologyScreen';
import { PackagesScreen } from './components/screens/PackagesScreen';
import { ProgrammesScreen } from './components/screens/ProgrammesScreen';
import { ArmoryScreen } from './components/screens/ArmoryScreen';
import { ToolsScreen } from './components/screens/ToolsScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('home');
  const [consultationOpen, setConsultationOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState('Apex Protocol');
  const [activeProgramme, setActiveProgramme] = useState<Programme | null>(null);

  // Handle URL hash navigation if needed
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '') as ScreenId;
      if (['home', 'pt', 'online', 'methodology', 'packages', 'programmes', 'armory', 'tools'].includes(hash)) {
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

  const handleOpenConsultation = (tier?: string) => {
    if (tier) setSelectedTier(tier);
    setConsultationOpen(true);
  };

  const handleSelectProgramme = (prog: Programme) => {
    setActiveProgramme(prog);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0c0e] text-[#f3f4f6] font-sans selection:bg-[#ff5500] selection:text-black">
      {/* Primary Sticky Industrial Navigation */}
      <Navbar
        currentScreen={currentScreen}
        onSelectScreen={handleSelectScreen}
        onOpenConsultation={() => handleOpenConsultation()}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {currentScreen === 'home' && (
          <HomeScreen
            onSelectScreen={handleSelectScreen}
            onOpenConsultation={handleOpenConsultation}
            onSelectProgramme={handleSelectProgramme}
          />
        )}
        {currentScreen === 'pt' && (
          <PersonalTrainingScreen onOpenConsultation={handleOpenConsultation} />
        )}
        {currentScreen === 'online' && (
          <OnlineCoachingScreen onOpenConsultation={handleOpenConsultation} />
        )}
        {currentScreen === 'methodology' && (
          <MethodologyScreen onOpenConsultation={() => handleOpenConsultation('Biomechanics Audit')} />
        )}
        {currentScreen === 'packages' && (
          <PackagesScreen onOpenConsultation={handleOpenConsultation} />
        )}
        {currentScreen === 'programmes' && (
          <ProgrammesScreen onSelectProgramme={handleSelectProgramme} />
        )}
        {currentScreen === 'armory' && (
          <ArmoryScreen onOpenConsultation={() => handleOpenConsultation('Facility Tour')} />
        )}
        {currentScreen === 'tools' && (
          <ToolsScreen onOpenConsultation={() => handleOpenConsultation('Calculated Protocol')} />
        )}
      </main>

      {/* Footer */}
      <Footer
        onSelectScreen={handleSelectScreen}
        onOpenConsultation={() => handleOpenConsultation()}
      />

      {/* Modals */}
      <ConsultationModal
        isOpen={consultationOpen}
        onClose={() => setConsultationOpen(false)}
        defaultTier={selectedTier}
      />

      <ProgrammeModal
        programme={activeProgramme}
        onClose={() => setActiveProgramme(null)}
      />
    </div>
  );
}
