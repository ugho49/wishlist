import type { ButtonProps } from '@mui/material';
import type { LinkProps } from '@tanstack/react-router';
import type { PropsWithChildren } from 'react';

import CloseIcon from '@mui/icons-material/Close';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import { Avatar, alpha, Button, Container, keyframes, styled } from '@mui/material';
import { orange } from '@mui/material/colors';
import { Link } from '@tanstack/react-router';
import clsx from 'clsx';
import { useEffect, useState } from 'react';

import { AttendeeRole } from '../../gql';
import { brandColors } from '../../theme';
import { Rating } from '../common/Rating';
import { VisuallyHidden } from '../common/VisuallyHidden';
import { AttendeeRoleChip } from '../event/AttendeeRoleChip';
import { MockAvatar, MockNote } from './mockups/frames';
import { MockEventHeader } from './mockups/MockEventHeader';
import { MockItemCard } from './mockups/MockItemCard';
import { leaBirthdayDate, leaWishes, people } from './mockups/mock-data';
import { prefersReducedMotion, useInView } from './useInView';

const SECTION_ID = 'comment-ca-marche';

/** Light border of the landing cards. */
const CARD_BORDER = '#E3ECEF';
const CARD_PADDING_XS = 16;
const CARD_PADDING = 24;
const STEP_TITLE_LINE_HEIGHT = 26;
const PASTILLE_SIZE = 32;
/** Desktop: the pastilles sit above the cards, lined up with the card padding. */
const PASTILLE_INSET = 24;
/** Mobile: the timeline runs at x = 20, the cards start after it. */
const TIMELINE_X = 20;
const TIMELINE_WIDTH = 44;
const STEPS_GAP_MOBILE = 32;
const STEPS_GAP_DESKTOP = 24;
/** Same height for the three mockups on a row, so they line up. */
const MOCKUP_HEIGHT = 248;
/** The wish card is the real one, shrunk to fit the small mockup. */
const CARD_ZOOM = 0.72;
const SPRING = 'cubic-bezier(0.34, 1.56, 0.64, 1)';

const PRODUCT_URL = 'https://boutique.example/baskets-toile';
const TYPING_DELAY_MS = 400;
const TYPING_DURATION_MS = 1200;
const JOIN_DELAY_MS = 500;

/** Top of a mobile pastille, so it is centred on the card title. */
const pastilleTop = (cardPadding: number) => cardPadding + STEP_TITLE_LINE_HEIGHT / 2 - PASTILLE_SIZE / 2;

// Full-width grey band: the anchor lands right under the nav bar (56px, then 64px from sm), with no
// white strip above the band. The section's own top padding keeps the title clear of the bar.
const SectionStyled = styled('section')(({ theme }) => ({
  scrollMarginTop: 56,
  padding: theme.spacing(8, 0),
  backgroundColor: theme.palette.grey[50],
  [theme.breakpoints.up('sm')]: {
    scrollMarginTop: 64,
  },
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(12, 0),
  },
}));

const HeaderStyled = styled('header')(({ theme }) => ({
  maxWidth: 640,
  margin: `0 auto ${theme.spacing(5)}`,
  textAlign: 'center',
  [theme.breakpoints.up('md')]: {
    marginBottom: theme.spacing(7),
  },
}));

const TitleStyled = styled('h2')(({ theme }) => ({
  margin: 0,
  fontFamily: theme.typography.h2.fontFamily,
  fontWeight: 600,
  fontSize: '2rem',
  lineHeight: 1.2,
  color: theme.palette.primary.main,
  [theme.breakpoints.up('sm')]: {
    fontSize: '2.5rem',
  },
}));

const SubtitleStyled = styled('p')(({ theme }) => ({
  margin: theme.spacing(1.5, 0, 0),
  fontSize: '1.0625rem',
  lineHeight: 1.6,
  color: theme.palette.text.secondary,
  [theme.breakpoints.up('md')]: {
    fontSize: '1.125rem',
  },
}));

// Vertical timeline on mobile, three cards on a row from md. `minmax(0, 1fr)` keeps the mockups'
// min-content width from pushing the cards past the screen on phones.
const StepsListStyled = styled('ol')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr)',
  gap: STEPS_GAP_MOBILE,
  margin: 0,
  padding: 0,
  listStyle: 'none',
  [theme.breakpoints.up('md')]: {
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: STEPS_GAP_DESKTOP,
  },
}));

// Each step draws the dotted segment that joins its pastille to the next one
const StepStyled = styled('li')(({ theme }) => ({
  position: 'relative',
  minWidth: 0,
  paddingLeft: TIMELINE_WIDTH,
  '&:not(:last-of-type)::before': {
    content: '""',
    position: 'absolute',
    top: pastilleTop(CARD_PADDING_XS) + PASTILLE_SIZE / 2,
    left: TIMELINE_X - 1,
    height: `calc(100% + ${STEPS_GAP_MOBILE}px)`,
    borderLeft: `2px dotted ${brandColors.mist}`,
  },
  [theme.breakpoints.up('sm')]: {
    '&:not(:last-of-type)::before': {
      top: pastilleTop(CARD_PADDING) + PASTILLE_SIZE / 2,
    },
  },
  [theme.breakpoints.up('md')]: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    paddingLeft: 0,
    '&:not(:last-of-type)::before': {
      top: PASTILLE_SIZE / 2 - 1,
      left: PASTILLE_INSET + PASTILLE_SIZE / 2,
      width: `calc(100% + ${STEPS_GAP_DESKTOP}px)`,
      height: 0,
      borderLeft: 'none',
      borderTop: `2px dotted ${brandColors.mist}`,
    },
  },
}));

const StepNumberStyled = styled('span')(({ theme }) => ({
  position: 'absolute',
  top: pastilleTop(CARD_PADDING_XS),
  left: TIMELINE_X - PASTILLE_SIZE / 2,
  zIndex: 1,
  display: 'grid',
  placeItems: 'center',
  width: PASTILLE_SIZE,
  height: PASTILLE_SIZE,
  borderRadius: '50%',
  fontFamily: theme.typography.h1.fontFamily,
  fontWeight: 600,
  fontSize: '1rem',
  color: theme.palette.common.white,
  backgroundColor: theme.palette.primary.main,
  // Ring in the band colour, so the dotted line stops short of the pastille
  boxShadow: `0 0 0 4px ${theme.palette.grey[50]}`,
  [theme.breakpoints.up('sm')]: {
    top: pastilleTop(CARD_PADDING),
  },
  [theme.breakpoints.up('md')]: {
    position: 'relative',
    top: 'auto',
    left: 'auto',
    flexShrink: 0,
    marginLeft: PASTILLE_INSET,
  },
}));

const StepCardStyled = styled('div')(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  padding: CARD_PADDING_XS,
  borderRadius: 20,
  border: `1px solid ${CARD_BORDER}`,
  backgroundColor: theme.palette.common.white,
  [theme.breakpoints.up('sm')]: {
    padding: CARD_PADDING,
  },
  [theme.breakpoints.up('md')]: {
    flexGrow: 1,
  },
  // Three cards on a row are narrow until lg: give the mockups some room
  [theme.breakpoints.only('md')]: {
    padding: 20,
  },
}));

const StepTitleStyled = styled('h3')(({ theme }) => ({
  margin: 0,
  fontFamily: theme.typography.h3.fontFamily,
  fontWeight: 600,
  fontSize: '1.25rem',
  lineHeight: `${STEP_TITLE_LINE_HEIGHT}px`,
  color: theme.palette.primary.main,
}));

const StepTextStyled = styled('p')(({ theme }) => ({
  margin: theme.spacing(1, 0, 2.5),
  fontSize: '0.9375rem',
  lineHeight: 1.6,
  color: theme.palette.text.secondary,
}));

const CtaButtonStyled = styled(Button)<ButtonProps & LinkProps>(({ theme }) => ({
  display: 'flex',
  width: '100%',
  margin: `${theme.spacing(5)} auto 0`,
  fontWeight: 600,
  [theme.breakpoints.up('md')]: {
    width: 'fit-content',
    marginTop: theme.spacing(7),
  },
}));

/* ---------- Mockups: shared pieces ---------- */

// Capped at 360px and centred in the card while the steps are stacked; full card width from md
const MockupStyled = styled('div')(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  width: '100%',
  maxWidth: 360,
  minHeight: 210,
  marginInline: 'auto',
  padding: 10,
  overflow: 'hidden',
  borderRadius: 12,
  backgroundColor: theme.palette.grey[50],
  [theme.breakpoints.up('sm')]: {
    padding: 12,
  },
  [theme.breakpoints.up('md')]: {
    maxWidth: 'none',
    height: MOCKUP_HEIGHT,
    marginTop: 'auto',
  },
}));

// Smaller annotation for the small mockups; hidden until its scene has played (`.is-done` parent)
const MiniNoteStyled = styled(MockNote)({
  padding: '5px 10px',
  fontSize: 12,
  whiteSpace: 'normal',
  opacity: 0,
  transition: `opacity 250ms ease 250ms, transform 400ms ${SPRING} 250ms`,
  '.is-done > &': {
    opacity: 1,
    transform: 'none',
  },
  '@media (prefers-reduced-motion: reduce)': {
    transition: 'none',
  },
});

// Outlined text field, as in the app's forms, at mockup scale
const MiniFieldStyled = styled('div')(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  height: 32,
  padding: theme.spacing(0, 1.25),
  border: `1px solid ${theme.palette.grey[300]}`,
  borderRadius: 8,
  fontSize: '0.72rem',
  color: theme.palette.text.primary,
  backgroundColor: theme.palette.common.white,
  '&.is-focused': {
    borderColor: theme.palette.primary.main,
    boxShadow: `inset 0 0 0 1px ${theme.palette.primary.main}`,
  },
}));

const MiniLabelStyled = styled('span')(({ theme }) => ({
  position: 'absolute',
  top: -7,
  left: 7,
  padding: '0 3px',
  fontSize: '0.6rem',
  lineHeight: '13px',
  color: theme.palette.text.secondary,
  backgroundColor: theme.palette.common.white,
  '.is-focused > &': {
    color: theme.palette.primary.main,
  },
}));

const MiniValueStyled = styled('span')({
  flex: 1,
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

/* ---------- Step 1: add a wish ---------- */

const MiniDialogStyled = styled('div')(({ theme }) => ({
  borderRadius: 10,
  border: `1px solid ${CARD_BORDER}`,
  backgroundColor: theme.palette.common.white,
  boxShadow: `0 12px 24px -16px ${alpha(theme.palette.primary.main, 0.4)}`,
}));

// The dialog's navy app bar
const MiniDialogBarStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  height: 28,
  padding: theme.spacing(0, 1.25),
  borderRadius: '9px 9px 0 0',
  fontFamily: theme.typography.h6.fontFamily,
  fontWeight: 600,
  fontSize: '0.75rem',
  color: theme.palette.common.white,
  backgroundColor: theme.palette.primary.main,
  '& svg': {
    fontSize: 14,
  },
}));

const MiniDialogBodyStyled = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  gap: 11,
  padding: '12px 10px 10px',
});

const UrlRowStyled = styled('div')({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
});

const UrlFieldStyled = styled(MiniFieldStyled)({
  flex: 1,
  minWidth: 0,
});

// Left-aligned while the URL fits; once it is longer than the field, the end stays in view like a real
// input and the start gives way to an ellipsis (an rtl line overflows, and truncates, on its left side)
const UrlValueStyled = styled(MiniValueStyled)({
  direction: 'rtl',
  textAlign: 'left',
});

// Isolated left-to-right run, so the URL's slashes and dots keep their place inside the rtl line
const UrlTextStyled = styled('span')(({ theme }) => ({
  direction: 'ltr',
  unicodeBidi: 'isolate',
  '&.with-caret::after': {
    content: '""',
    display: 'inline-block',
    width: 1,
    height: '1.1em',
    marginLeft: 1,
    verticalAlign: 'text-bottom',
    backgroundColor: theme.palette.primary.main,
  },
}));

// The picture found from the link (an emoji on a pastel tile here)
const ThumbStyled = styled('span')({
  display: 'grid',
  placeItems: 'center',
  flexShrink: 0,
  width: 32,
  height: 32,
  borderRadius: 6,
  fontSize: 18,
  lineHeight: 1,
  backgroundColor: leaWishes.sneakers.tint,
  opacity: 0,
  transform: 'scale(0.6)',
  transition: `opacity 250ms ease, transform 450ms ${SPRING}`,
  '.is-done > &': {
    opacity: 1,
    transform: 'none',
  },
  '@media (prefers-reduced-motion: reduce)': {
    transition: 'none',
  },
});

// Below the thumbnail, over the empty end of the next field, its arrow on the thumbnail
const FormNoteStyled = styled(MiniNoteStyled)(({ theme }) => ({
  position: 'absolute',
  top: 'calc(100% + 8px)',
  right: -16,
  zIndex: 2,
  maxWidth: 112,
  transform: 'translateY(-4px)',
  transformOrigin: 'top right',
  '&.arrow-up::after': {
    left: 'auto',
    right: 27,
  },
  // The fields are narrowest with three cards on a row: a tighter bubble, closer to the thumbnail,
  // covers less of the "Détails" field (the nbsp keeps the sparkle on the second line)
  [theme.breakpoints.only('md')]: {
    top: 'calc(100% + 6px)',
    maxWidth: 100,
    padding: '4px 8px',
    fontSize: 11,
  },
}));

const PreferenceStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: 2,
  fontSize: '0.625rem',
  fontWeight: 500,
  color: theme.palette.primary.main,
}));

/** The "Ajouter un souhait" form: the product link types itself, then its picture shows up. */
const AddWishMockup = () => {
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.5 });
  const [typedLength, setTypedLength] = useState(() => (prefersReducedMotion() ? PRODUCT_URL.length : 0));
  const done = typedLength >= PRODUCT_URL.length;

  useEffect(() => {
    if (!inView || prefersReducedMotion()) return;

    let length = 0;
    let interval: number | undefined;
    const timeout = window.setTimeout(() => {
      interval = window.setInterval(() => {
        length += 1;
        setTypedLength(length);
        if (length >= PRODUCT_URL.length) window.clearInterval(interval);
      }, TYPING_DURATION_MS / PRODUCT_URL.length);
    }, TYPING_DELAY_MS);

    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(interval);
    };
  }, [inView]);

  return (
    <MockupStyled ref={ref} aria-hidden inert>
      <MiniDialogStyled>
        <MiniDialogBarStyled>
          Ajouter un souhait
          <CloseIcon />
        </MiniDialogBarStyled>
        <MiniDialogBodyStyled>
          <MiniFieldStyled>
            <MiniLabelStyled>Titre du souhait *</MiniLabelStyled>
            <MiniValueStyled>{leaWishes.sneakers.name}</MiniValueStyled>
          </MiniFieldStyled>
          <UrlRowStyled className={clsx(done && 'is-done')}>
            <UrlFieldStyled className={clsx(!done && 'is-focused')}>
              <MiniLabelStyled>URL</MiniLabelStyled>
              <UrlValueStyled>
                <UrlTextStyled className={clsx(!done && 'with-caret')}>
                  {PRODUCT_URL.slice(0, typedLength)}
                </UrlTextStyled>
              </UrlValueStyled>
            </UrlFieldStyled>
            <ThumbStyled>{leaWishes.sneakers.emoji}</ThumbStyled>
            <FormNoteStyled arrow="up">l'image arrive toute seule&nbsp;✨</FormNoteStyled>
          </UrlRowStyled>
          <MiniFieldStyled>
            <MiniLabelStyled>Détails</MiniLabelStyled>
            <MiniValueStyled>{leaWishes.sneakers.details}</MiniValueStyled>
          </MiniFieldStyled>
          <PreferenceStyled>
            Niveau de préférence
            <Rating value={leaWishes.sneakers.hearts} size="small" readOnly />
          </PreferenceStyled>
        </MiniDialogBodyStyled>
      </MiniDialogStyled>
    </MockupStyled>
  );
};

/* ---------- Step 2: invite relatives ---------- */

const EventMockupStyled = styled(MockupStyled)({
  gap: 10,
});

// The event's participants card: search field, then the list
const AttendeesPanelStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: 8,
  borderRadius: 10,
  border: `1px solid ${CARD_BORDER}`,
  backgroundColor: theme.palette.common.white,
}));

const SearchFieldStyled = styled(MiniFieldStyled)(({ theme }) => ({
  flexShrink: 0,
  height: 30,
  marginBottom: 2,
  color: theme.palette.text.disabled,
}));

const AttendeeRowStyled = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  minHeight: 32,
  padding: '2px 0',
  '& > .MuiChip-root': {
    flexShrink: 0,
  },
});

const AttendeeTextStyled = styled('span')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minWidth: 0,
  lineHeight: 1.3,
  '& > b, & > span': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  '& > b': {
    fontSize: '0.72rem',
    color: theme.palette.text.primary,
  },
  '& > span': {
    fontSize: '0.625rem',
    color: theme.palette.text.secondary,
  },
}));

// The invitation's status is a sentence: let it wrap instead of cutting it
const PendingTextStyled = styled(AttendeeTextStyled)({
  '& > span': {
    whiteSpace: 'normal',
  },
});

// Same colours as a pending invitation in the app, with an envelope for the email invite
const PendingAvatarStyled = styled(Avatar)({
  width: 26,
  height: 26,
  color: orange[600],
  backgroundColor: orange[100],
  '& svg': {
    fontSize: 15,
  },
});

const PendingRowStyled = styled(AttendeeRowStyled)({
  '@media (prefers-reduced-motion: no-preference)': {
    opacity: 0,
    transform: 'translateX(24px)',
    transition: 'opacity 400ms ease-out 300ms, transform 500ms cubic-bezier(0.22, 1, 0.36, 1) 300ms',
    '&.is-done': {
      opacity: 1,
      transform: 'none',
    },
  },
});

/** The event with its participants; the email invitation slides in. */
const EventMockup = () => {
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.5 });

  return (
    <EventMockupStyled ref={ref} aria-hidden inert>
      <MockEventHeader emoji="🎂" title="Anniversaire de Léa" date={leaBirthdayDate()} hideDate compact />
      <AttendeesPanelStyled>
        <SearchFieldStyled>
          <MiniValueStyled>Rechercher un participant ...</MiniValueStyled>
        </SearchFieldStyled>
        <AttendeeRowStyled>
          <MockAvatar person={people.camille} size={26} />
          <AttendeeTextStyled>
            <b>
              {people.camille.firstName} {people.camille.lastName}
            </b>
            <span>camille.roux@email.example</span>
          </AttendeeTextStyled>
          <AttendeeRoleChip role={AttendeeRole.Admin} />
        </AttendeeRowStyled>
        <AttendeeRowStyled>
          <MockAvatar person={people.thomas} size={26} />
          <AttendeeTextStyled>
            <b>
              {people.thomas.firstName} {people.thomas.lastName}
            </b>
            <span>thomas.martin@email.example</span>
          </AttendeeTextStyled>
          <AttendeeRoleChip role={AttendeeRole.Participant} />
        </AttendeeRowStyled>
        <PendingRowStyled className={clsx(inView && 'is-done')}>
          <PendingAvatarStyled>
            <EmailOutlinedIcon />
          </PendingAvatarStyled>
          <PendingTextStyled>
            <b>jo.martin@email.example</b>
            <span>Invitation en attente de validation</span>
          </PendingTextStyled>
        </PendingRowStyled>
      </AttendeesPanelStyled>
    </EventMockupStyled>
  );
};

/* ---------- Step 3: relatives book, alone or together ---------- */

const avatarPop = keyframes`
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

// AvatarGroup renders its avatars in reverse order: the newest taker is the first one in the DOM
const JOINING_AVATAR = '.is-done > & .MuiAvatarGroup-root > .MuiAvatar-root:first-of-type';

const ReservationMockupStyled = styled(MockupStyled)({
  alignItems: 'center',
});

const ReservationNoteStyled = styled(MiniNoteStyled)({
  flexShrink: 0,
  marginBottom: 2,
  textAlign: 'center',
  transform: 'translateY(4px)',
  '&.arrow-down::after': {
    left: 'calc(50% - 5px)',
  },
});

const ReservationCardStyled = styled(MockItemCard)({
  zoom: CARD_ZOOM,
  flexShrink: 0,
  height: 'auto',
  maxWidth: Math.round(240 / CARD_ZOOM),
  // The group's "small" spacing overlaps the avatars by 16px: Camille, painted last, would hide Thomas's
  // initial. A light overlap keeps both readable, as in the hero.
  '& .MuiAvatarGroup-root .MuiAvatar-root': {
    marginLeft: -6,
    '&:last-child': {
      marginLeft: 0,
    },
  },
  [JOINING_AVATAR]: {
    animation: `${avatarPop} 450ms ${SPRING} both`,
  },
  '@media (prefers-reduced-motion: reduce)': {
    [JOINING_AVATAR]: {
      animation: 'none',
    },
  },
});

/** The headphones as relatives see them: Camille booked them, Thomas joins her. */
const ReservationMockup = () => {
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.5 });
  const [joined, setJoined] = useState(prefersReducedMotion);

  useEffect(() => {
    if (!inView || joined) return;
    const timeout = window.setTimeout(() => setJoined(true), JOIN_DELAY_MS);
    return () => window.clearTimeout(timeout);
  }, [inView, joined]);

  return (
    <ReservationMockupStyled ref={ref} aria-hidden inert className={clsx(joined && 'is-done')}>
      <ReservationNoteStyled arrow="down">Camille et Thomas l'offrent ensemble</ReservationNoteStyled>
      <ReservationCardStyled
        wish={leaWishes.headphones}
        view="guest"
        takers={joined ? [people.camille, people.thomas] : [people.camille]}
      />
    </ReservationMockupStyled>
  );
};

/* ---------- Section ---------- */

type HowItWorksStepProps = PropsWithChildren<{
  number: number;
  title: string;
  text: string;
  /** Text version of the mockup, for screen readers. */
  summary: string;
}>;

const HowItWorksStep = ({ number, title, text, summary, children }: HowItWorksStepProps) => (
  <StepStyled>
    <StepNumberStyled aria-hidden>{number}</StepNumberStyled>
    <StepCardStyled>
      <StepTitleStyled>
        <VisuallyHidden>Étape {number}&nbsp;: </VisuallyHidden>
        {title}
      </StepTitleStyled>
      <StepTextStyled>{text}</StepTextStyled>
      {children}
      <VisuallyHidden>{summary}</VisuallyHidden>
    </StepCardStyled>
  </StepStyled>
);

/** "Comment ça marche": the three steps from the list to the gift, each with a mockup of the real screen. */
export const HowItWorksSection = () => (
  <SectionStyled id={SECTION_ID} aria-labelledby={`${SECTION_ID}-title`}>
    <Container maxWidth="lg">
      <HeaderStyled>
        <TitleStyled id={`${SECTION_ID}-title`}>Trois étapes, zéro prise de tête</TitleStyled>
        <SubtitleStyled>De l'idée au cadeau, sans tableur ni messages à rallonge.</SubtitleStyled>
      </HeaderStyled>

      <StepsListStyled>
        <HowItWorksStep
          number={1}
          title="Créez votre liste"
          text="Collez le lien du produit&nbsp;: l'image se récupère toute seule. Ajoutez des cœurs à vos envies préférées, et la taille si c'est un vêtement."
          summary="Aperçu&nbsp;: le formulaire «&nbsp;Ajouter un souhait&nbsp;». Le titre «&nbsp;Baskets en toile blanche&nbsp;» et le détail «&nbsp;Pointure 39&nbsp;» sont remplis&nbsp;; une fois le lien du produit saisi dans le champ URL, l'image des baskets apparaît toute seule. Niveau de préférence&nbsp;: 4 cœurs sur 5."
        >
          <AddWishMockup />
        </HowItWorksStep>

        <HowItWorksStep
          number={2}
          title="Invitez vos proches"
          text="Créez l'événement avec sa date et son emoji, puis invitez par email. Pas encore de compte&nbsp;? Ils reçoivent une invitation et retrouvent tout dès leur inscription."
          summary="Aperçu&nbsp;: l'événement «&nbsp;Anniversaire de Léa&nbsp;», dans 12 jours. Camille est admin, Thomas participant, et l'invitation envoyée par email à jo.martin@email.example est en attente de validation."
        >
          <EventMockup />
        </HowItWorksStep>

        <HowItWorksStep
          number={3}
          title="Ils réservent, seuls ou à plusieurs"
          text="Chacun clique sur «&nbsp;Réserver&nbsp;», ou sur «&nbsp;Participer&nbsp;» pour se joindre à un cadeau déjà pris. Et vous&nbsp;? Vous ne voyez rien."
          summary="Aperçu&nbsp;: le souhait «&nbsp;Casque audio sans fil&nbsp;» vu par les invités. Camille l'a réservé, puis Thomas la rejoint avec «&nbsp;Participer&nbsp;»&nbsp;: ils l'offrent ensemble."
        >
          <ReservationMockup />
        </HowItWorksStep>
      </StepsListStyled>

      <CtaButtonStyled variant="contained" size="large" component={Link} to="/register">
        Créer ma liste
      </CtaButtonStyled>
    </Container>
  </SectionStyled>
);
