import type { ElementType } from 'react';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  accordionSummaryClasses,
  Container,
  Link,
  styled,
  Typography,
  useMediaQuery,
} from '@mui/material';

import { brandColors } from '../../theme';
import { Genie } from '../common/Genie';

type Faq = { question: string; answer: string };

/** Honest answers to the real objections: everything here must match what the app does. */
const FAQS: Faq[] = [
  {
    question: "C'est vraiment gratuit\u00a0?",
    answer: "Oui. Wishlist est entièrement gratuit et sans publicité, et il n'y a aucun paiement dans l'application.",
  },
  {
    question: "Vais-je voir ce qu'on va m'offrir\u00a0?",
    answer:
      "Non. Sur une liste faite pour vous, vous ne voyez ni les réservations ni les suggestions de vos proches. Même si vous supprimez un souhait déjà réservé, il reste visible pour ceux qui l'offrent.",
  },
  {
    question: 'Mes proches doivent-ils créer un compte\u00a0?',
    answer:
      "Oui, pour voir les listes. Invitez-les par email depuis votre événement\u00a0: ils reçoivent une invitation, s'inscrivent avec cette adresse (ou avec Google) et retrouvent l'événement automatiquement.",
  },
  {
    question: 'Qui peut voir ma liste\u00a0?',
    answer:
      "Uniquement les participants des événements auxquels vous l'avez liée. Il n'existe pas de lien public\u00a0: personne d'autre ne peut y accéder.",
  },
  {
    question: 'Et si deux personnes veulent offrir le même cadeau\u00a0?',
    answer:
      "Elles l'offrent ensemble\u00a0: la seconde clique sur «\u00a0Participer\u00a0» au lieu de «\u00a0Réserver\u00a0», et chacun voit qui est déjà sur le coup. Wishlist ne gère pas d'argent\u00a0: le partage des frais se règle entre vous.",
  },
  {
    question: "Puis-je ajouter un produit de n'importe quel site\u00a0?",
    answer:
      "Oui, collez simplement le lien. L'image est récupérée automatiquement quand le site le permet\u00a0; sinon, vous pouvez indiquer l'adresse d'une image. Le titre et les détails (taille, couleur…), c'est vous qui les écrivez.",
  },
  {
    question: 'Puis-je faire une liste pour mon enfant\u00a0?',
    answer:
      "Oui. Choisissez «\u00a0Pour une autre personne\u00a0» et ajoutez son prénom et sa photo. Vous décidez si vous voulez voir les réservations\u00a0; dans ce cas, vous pouvez ajouter l'autre parent comme co-gestionnaire.",
  },
  {
    question: 'Comment fonctionne le Secret Santa\u00a0?',
    answer:
      "Depuis un événement à venir, choisissez au moins deux participants parmi les invités, un budget et d'éventuelles exclusions, puis lancez le tirage. Chacun reçoit un email et découvre son destinataire dans l'app, en grattant une boule de Noël.",
  },
  {
    question: 'Y a-t-il une application mobile\u00a0?',
    answer:
      "Wishlist fonctionne dans le navigateur, sur mobile comme sur ordinateur. Vous pouvez aussi l'installer sur l'écran d'accueil de votre téléphone, sans passer par un store.",
  },
];

const CONTACT_EMAIL = 'contact@wishlistapp.fr';

/** FAQPage structured data built from the same answers, so search engines never read stale copy. */
const FAQ_JSON_LD = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map(({ question, answer }) => ({
    '@type': 'Question',
    name: question,
    acceptedAnswer: { '@type': 'Answer', text: answer },
  })),
}).replace(/</g, '\\u003c');

const DIVIDER_COLOR = '#E3ECEF';

const FaqSectionStyled = styled(Container)<{ component: ElementType }>(({ theme }) => ({
  scrollMarginTop: 80,
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  gridTemplateAreas: '"title genie" "list list" "contact contact"',
  alignItems: 'center',
  columnGap: theme.spacing(2),
  rowGap: theme.spacing(4),
  paddingTop: theme.spacing(8),
  paddingBottom: theme.spacing(8),
  [theme.breakpoints.up('md')]: {
    gridTemplateColumns: 'minmax(0, 4fr) minmax(0, 8fr)',
    gridTemplateAreas: '"intro list"',
    alignItems: 'start',
    columnGap: theme.spacing(8),
    paddingTop: theme.spacing(12),
    paddingBottom: theme.spacing(12),
  },
}));

/** Left column on desktop (sticky while the answers scroll); on mobile its children join the section grid. */
const FaqIntroStyled = styled('div')(({ theme }) => ({
  display: 'contents',
  [theme.breakpoints.up('md')]: {
    gridArea: 'intro',
    position: 'sticky',
    top: 96,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: theme.spacing(2.5),
  },
}));

const FaqTitleStyled = styled(Typography)(({ theme }) => ({
  gridArea: 'title',
  margin: 0,
  fontSize: '1.75rem',
  lineHeight: 1.2,
  color: theme.palette.primary.main,
  [theme.breakpoints.up('md')]: {
    fontSize: '2.25rem',
  },
}));

const FaqContactStyled = styled(Typography)(({ theme }) => ({
  gridArea: 'contact',
  margin: 0,
  fontSize: 15,
  lineHeight: 1.6,
  color: theme.palette.text.secondary,
  '& a': {
    fontWeight: 600,
    overflowWrap: 'anywhere',
  },
}));

const FaqGenieStyled = styled(Genie)(({ theme }) => ({
  gridArea: 'genie',
  [theme.breakpoints.up('md')]: {
    marginTop: theme.spacing(2),
  },
}));

const FaqListStyled = styled('div')({
  gridArea: 'list',
  borderTop: `1px solid ${DIVIDER_COLOR}`,
});

const FaqAccordionStyled = styled(Accordion)({
  backgroundColor: 'transparent',
  borderBottom: `1px solid ${DIVIDER_COLOR}`,
  '&::before': {
    display: 'none',
  },
});

const FaqQuestionStyled = styled(AccordionSummary)(({ theme }) => ({
  minHeight: 56,
  padding: theme.spacing(2, 0),
  gap: theme.spacing(2),
  fontFamily: theme.typography.h1.fontFamily,
  fontSize: 17,
  fontWeight: 600,
  lineHeight: 1.35,
  color: theme.palette.primary.main,
  [`& .${accordionSummaryClasses.content}`]: {
    margin: 0,
  },
  [`& .${accordionSummaryClasses.expandIconWrapper}`]: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 28,
    height: 28,
    borderRadius: '50%',
    color: theme.palette.primary.main,
    backgroundColor: brandColors.mistLight,
    transition: theme.transitions.create(['transform', 'background-color'], {
      duration: theme.transitions.duration.shorter,
    }),
  },
  [`&:hover .${accordionSummaryClasses.expandIconWrapper}`]: {
    backgroundColor: brandColors.mist,
  },
  [`&.${accordionSummaryClasses.focusVisible}`]: {
    backgroundColor: 'transparent',
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: 2,
    borderRadius: 8,
  },
  '@media (prefers-reduced-motion: reduce)': {
    [`& .${accordionSummaryClasses.expandIconWrapper}`]: {
      transition: 'none',
    },
  },
}));

const FaqAnswerStyled = styled(AccordionDetails)(({ theme }) => ({
  padding: theme.spacing(0, 0, 2.5),
  fontSize: 15,
  lineHeight: 1.65,
  color: theme.palette.text.secondary,
  [theme.breakpoints.up('md')]: {
    paddingRight: theme.spacing(5.5),
  },
}));

export const FAQSection = () => {
  const isDesktop = useMediaQuery(theme => theme.breakpoints.up('md'), { noSsr: true });
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)', { noSsr: true });

  return (
    <FaqSectionStyled maxWidth="lg" component="section" id="faq" aria-labelledby="faq-title">
      {/* Rendered in place: search engines read JSON-LD anywhere in the page, <head> adds nothing. */}
      <script type="application/ld+json">{FAQ_JSON_LD}</script>

      <FaqIntroStyled>
        <FaqTitleStyled variant="h2" id="faq-title">
          Les questions qu'on nous pose souvent
        </FaqTitleStyled>
        <FaqContactStyled>
          Une autre question&nbsp;? Écrivez-nous à <Link href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</Link>
        </FaqContactStyled>
        <FaqGenieStyled variant="lost" size={isDesktop ? 140 : 88} grounded />
      </FaqIntroStyled>

      <FaqListStyled>
        {FAQS.map(({ question, answer }, index) => (
          <FaqAccordionStyled
            key={question}
            defaultExpanded={index === 0}
            disableGutters
            elevation={0}
            square
            slotProps={reduceMotion ? { transition: { timeout: 0 } } : undefined}
          >
            <FaqQuestionStyled
              id={`faq-question-${index}`}
              aria-controls={`faq-answer-${index}`}
              expandIcon={<ExpandMoreIcon fontSize="small" />}
            >
              {question}
            </FaqQuestionStyled>
            <FaqAnswerStyled>{answer}</FaqAnswerStyled>
          </FaqAccordionStyled>
        ))}
      </FaqListStyled>
    </FaqSectionStyled>
  );
};
