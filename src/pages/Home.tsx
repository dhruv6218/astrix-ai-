import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { HeroSection } from '../components/sections/HeroSection';
import { ChaosSection } from '../components/sections/ChaosSection';
import { ClaritySection } from '../components/sections/ClaritySection';
import { VolumeValueSection } from '../components/sections/VolumeValueSection';
import { SignalExplorerSection } from '../components/sections/SignalExplorerSection';
import { EvidenceViewSection } from '../components/sections/EvidenceViewSection';
import { EngineSection } from '../components/sections/EngineSection';
import { PostLaunchSection } from '../components/sections/PostLaunchSection';
import { MainLayout } from '../layouts/MainLayout';

export const Home = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location]);

  return (
    <MainLayout>
      {/* 1. Hero */}
      <HeroSection />
      
      {/* 2. Problem Section: Unpaid invoices, awkward follow-ups */}
      <ChaosSection />
      
      {/* 3. How it works: 6-step recovery loop */}
      <ClaritySection />
      
      {/* 4. Why different: AI tone & Smart recovery */}
      <VolumeValueSection />
      
      {/* 5. Product Preview: The Core Loop in Action */}
      <SignalExplorerSection />
      <EvidenceViewSection />
      <EngineSection />
      <PostLaunchSection />
      
      {/* Final CTA is handled by EmpireSection inside MainLayout */}
    </MainLayout>
  );
};
