import { styled } from '@mui/material';

import { FAQSection } from './FAQSection';
import { FeaturesSection } from './FeaturesSection';
import { FinalCtaSection } from './FinalCtaSection';
import { FooterSection } from './FooterSection';
import { HeroSection } from './HeroSection';
import { HowItWorksSection } from './HowItWorksSection';
import { LandingNav } from './LandingNav';
import { SecretSantaSection } from './SecretSantaSection';
import { SurpriseSection } from './SurpriseSection';

const LandingRoot = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  overflowX: 'clip',
}));

export const LandingPage = () => (
  <LandingRoot id="top">
    <LandingNav />
    <main>
      <HeroSection />
      <HowItWorksSection />
      <SurpriseSection />
      <FeaturesSection />
      <SecretSantaSection />
      <FAQSection />
      <FinalCtaSection />
    </main>
    <FooterSection />
  </LandingRoot>
);
