import { AddRounded } from '@mui/icons-material'
import { Accordion, AccordionDetails, AccordionSummary, Box, Container, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useState } from 'react'

import { landingTokens } from './landing.tokens'

const FAQSectionContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(14, 0),
  backgroundColor: landingTokens.surface,
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(10, 0),
  },
}))

const FAQLayout = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '0.8fr 1.2fr',
  gap: theme.spacing(10),
  alignItems: 'start',
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
    gap: theme.spacing(5),
  },
}))

const Kicker = styled(Typography)(({ theme }) => ({
  color: landingTokens.accent,
  fontSize: '0.8rem',
  fontWeight: 600,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  marginBottom: theme.spacing(2),
}))

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontFamily: landingTokens.displayFont,
  fontWeight: 500,
  fontSize: 'clamp(1.9rem, 3.5vw, 2.6rem)',
  lineHeight: 1.2,
  letterSpacing: '-0.01em',
  color: landingTokens.ink,
  marginBottom: theme.spacing(2),
}))

const SectionSubtitle = styled(Typography)(() => ({
  color: landingTokens.inkMuted,
  fontSize: '1.05rem',
  lineHeight: 1.7,
}))

const FAQAccordion = styled(Accordion)(({ theme }) => ({
  backgroundColor: 'transparent',
  boxShadow: 'none',
  borderBottom: `1px solid ${landingTokens.hairline}`,
  '&::before': {
    display: 'none',
  },
  '&.Mui-expanded': {
    margin: 0,
  },
  '& .MuiAccordionSummary-root': {
    padding: theme.spacing(0.5, 0),
    minHeight: 0,
  },
  '& .MuiAccordionSummary-content': {
    margin: theme.spacing(2, 0),
  },
  '& .MuiAccordionSummary-expandIconWrapper': {
    color: landingTokens.inkMuted,
    transition: 'transform 0.25s ease',
  },
  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
    transform: 'rotate(45deg)',
    color: theme.palette.primary.main,
  },
}))

const Question = styled(Typography)(() => ({
  fontWeight: 600,
  fontSize: '1.05rem',
  color: landingTokens.ink,
}))

const Answer = styled(AccordionDetails)(({ theme }) => ({
  padding: theme.spacing(0, 0, 3),
  color: landingTokens.inkMuted,
  lineHeight: 1.7,
  fontSize: '0.95rem',
  maxWidth: '60ch',
}))

const DEFAULT_FAQS = [
  {
    question: 'Est-ce que Wishlist est gratuit ?',
    answer: 'Oui, Wishlist est entièrement gratuit à utiliser pour tous vos événements et listes de souhaits.',
  },
  {
    question: 'Comment inviter mes proches ?',
    answer: 'Vous pouvez facilement inviter vos proches par email ou en partageant un lien vers votre événement.',
  },
  {
    question: 'Puis-je créer plusieurs listes ?',
    answer: 'Absolument ! Vous pouvez créer autant de listes que vous voulez pour différents événements.',
  },
  {
    question: 'Comment fonctionne le Secret Santa ?',
    answer: 'Notre système effectue automatiquement le tirage au sort en respectant vos contraintes et exclusions.',
  },
  {
    question: 'Mes données sont-elles sécurisées ?',
    answer:
      'Absolument ! Nous utilisons un chiffrement de niveau bancaire pour protéger toutes vos informations personnelles.',
  },
  {
    question: 'Puis-je modifier mes listes après création ?',
    answer: 'Oui, vous pouvez modifier, ajouter ou supprimer des articles de vos listes à tout moment.',
  },
  {
    question: 'Comment réserver un cadeau ?',
    answer: 'Cliquez simplement sur un article dans une liste pour le réserver et éviter les doublons.',
  },
]

interface FAQSectionProps {
  faqs?: Array<{ question: string; answer: string }>
}

export const FAQSection = ({ faqs = DEFAULT_FAQS }: FAQSectionProps) => {
  const [expanded, setExpanded] = useState<number | false>(0)

  return (
    <FAQSectionContainer id="faq">
      <Container maxWidth="lg">
        <FAQLayout>
          <Box>
            <Kicker>FAQ</Kicker>
            <SectionTitle>Questions fréquentes</SectionTitle>
            <SectionSubtitle>
              Une autre question ? Créez un compte gratuitement et découvrez Wishlist par vous-même.
            </SectionSubtitle>
          </Box>

          <Box>
            {faqs.map((faq, index) => (
              <FAQAccordion
                key={faq.question}
                disableGutters
                square
                expanded={expanded === index}
                onChange={(_, isExpanded) => setExpanded(isExpanded ? index : false)}
              >
                <AccordionSummary expandIcon={<AddRounded />}>
                  <Question>{faq.question}</Question>
                </AccordionSummary>
                <Answer>{faq.answer}</Answer>
              </FAQAccordion>
            ))}
          </Box>
        </FAQLayout>
      </Container>
    </FAQSectionContainer>
  )
}
