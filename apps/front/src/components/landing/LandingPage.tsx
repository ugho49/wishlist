import { Box } from '@mui/material'

import { FAQSection } from './FAQSection'
import { FeaturesGridSection } from './FeaturesGrid'
import { FooterSection } from './FooterSection'
import { GetStartedSection } from './GetStartedSection'
import { HeroSection } from './HeroSection'

export const LandingPage = () => {
  return (
    <Box>
      <HeroSection />
      <FeaturesGridSection />
      <GetStartedSection />
      <FAQSection />
      <FooterSection />
    </Box>
  )
}
