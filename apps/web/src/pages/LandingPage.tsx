import React, { useState, useEffect } from 'react';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { GymOSFlow } from '@/components/landing/GymOSFlow';
import { ProductWorkflowShowcase } from '@/components/landing/ProductWorkflowShowcase';
import { TodayCommandCenter } from '@/components/landing/TodayCommandCenter';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { PricingSection } from '@/components/landing/PricingSection';
import { FaqSection } from '@/components/landing/FaqSection';
import { CTASection } from '@/components/landing/CTASection';
import { FooterSection } from '@/components/landing/FooterSection';

export const LandingPage: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-background text-foreground flex flex-col selection:bg-primary selection:text-primary-foreground font-sans">
      {/* 1. Sticky Glass Navbar */}
      <LandingNavbar isScrolled={isScrolled} />

      {/* 2. Main Story Flow */}
      <main className="flex-1 pt-4 sm:pt-12 flex flex-col relative overflow-hidden">
        {/* Hero with Auto-Playing Product Experience */}
        <HeroSection />

        {/* The 5-Engine "Gym Operating System" Connected Pipeline */}
        <GymOSFlow />

        {/* Deep-Dive Transforming Interface Showcase */}
        <ProductWorkflowShowcase />

        {/* Operational Command Center (Live pulse, heatmaps, alerts, trainer splits) */}
        <TodayCommandCenter />

        {/* 3-Step Simple Onboarding */}
        <HowItWorks />

        {/* Transparent Pricing Matrix */}
        <PricingSection />

        {/* FAQ Accordion */}
        <FaqSection />

        {/* High-Impact Closing CTA */}
        <CTASection />
      </main>

      {/* 3. Footer */}
      <FooterSection />
    </div>
  );
};

export default LandingPage;
