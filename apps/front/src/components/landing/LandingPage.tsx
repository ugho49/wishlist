import { Box } from '@mui/material'

import { FAQSection } from './FAQSection'
import { FeaturesGridSection } from './FeaturesGrid'
import { FooterSection } from './FooterSection'
import { GetStartedSection } from './GetStartedSection'
import { HeroSection } from './HeroSection'
import { HowItWorksSection } from './HowItWorksSection'
import { LandingNav } from './LandingNav'

export const LandingPage = () => {
  return (
    <Box>
      <LandingNav />
      <HeroSection />
      <FeaturesGridSection />
      <HowItWorksSection />
      <FAQSection />
      <GetStartedSection />
      <FooterSection />
    </Box>
  )
}
