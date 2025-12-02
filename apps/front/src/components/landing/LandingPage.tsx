import { Box } from '@mui/material'

import { SEO } from '../SEO'
import { FAQSection } from './FAQSection'
import { FeaturesGridSection } from './FeaturesGrid'
import { FooterSection } from './FooterSection'
import { GetStartedSection } from './GetStartedSection'
import { HeroSection } from './HeroSection'

export const LandingPage = () => {
  return (
    <>
      <SEO canonical="/" />
      <Box>
        <HeroSection />
        <FeaturesGridSection />
        <GetStartedSection />
        <FAQSection />
        <FooterSection />
      </Box>
    </>
  )
}
