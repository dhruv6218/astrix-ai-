'use client';

import React, { useEffect } from 'react';
import { HeroSection } from '../components/sections/HeroSection';
import { ChaosSection } from '../components/sections/ChaosSection';
import { ClaritySection } from '../components/sections/ClaritySection';
import { VolumeValueSection } from '../components/sections/VolumeValueSection';
import { ToneCloningSection } from '../components/sections/ToneCloningSection';
import { OneClickCheckoutSection } from '../components/sections/OneClickCheckoutSection';
import { SmartDeclineSection } from '../components/sections/SmartDeclineSection';
import { MainLayout } from '../layouts/MainLayout';

export const Home = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.location.hash) {
      const id = window.location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

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
      
      {/* 5. Product Features */}
      <ToneCloningSection />
      <OneClickCheckoutSection />
      <SmartDeclineSection />
      
      {/* Final CTA is handled by EmpireSection inside MainLayout */}
    </MainLayout>
  );
};

export default Home;
