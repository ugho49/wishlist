import type { DateTime } from 'luxon';
import type { ReactNode } from 'react';
import type { MockPerson } from './mockups/mock-data';

import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckroomIcon from '@mui/icons-material/Checkroom';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import FavoriteIcon from '@mui/icons-material/Favorite';
import GoogleIcon from '@mui/icons-material/Google';
import InstallMobileIcon from '@mui/icons-material/InstallMobile';
import { alpha, Container, styled, useMediaQuery, useTheme } from '@mui/material';
import { Link } from '@tanstack/react-router';
import clsx from 'clsx';

import { AttendeeRole } from '../../gql';
import { brandColors } from '../../theme';
import { Genie } from '../common/Genie';
import { VisuallyHidden } from '../common/VisuallyHidden';
import { AttendeeRoleChip } from '../event/AttendeeRoleChip';
import { BrowserFrame, MockAvatar } from './mockups/frames';
import { MockEventHeader } from './mockups/MockEventHeader';
import { formatEventDate, leaListTitle, leaWishes, nextChristmasDate, people } from './mockups/mock-data';
import { useInView } from './useInView';

/* "Pensé pour toute la famille": a bento of the event page and the small features around it.
   Every tile shows a mini mockup with the app's real labels; mockups are hidden from assistive
   technologies and summed up in a visually-hidden sentence instead. */

const TILE_BORDER = '#E3ECEF';

/** Width kept free on the right of the big tile's text, where the genie stands (md+). */
const GENIE_ROOM = 140;

const fullName = (person: MockPerson) => `${person.firstName} ${person.lastName}`;

const eventGuests = [people.lea, people.thomas, people.camille, people.mamieJo, people.hugo, people.ines];

const eventOrganizers = [
  { person: people.mamieJo, role: AttendeeRole.Creator },
  { person: people.lea, role: AttendeeRole.Admin },
];

/** Shaped like WishlistCardWithOwner: list title and owner name. */
const eventLists = [
  { title: leaListTitle, avatar: people.lea, owner: fullName(people.lea) },
  { title: 'Liste de Gabin', avatar: people.gabin, owner: fullName(people.lea) },
  { title: 'Idées pour Thomas', avatar: people.thomas, owner: fullName(people.thomas) },
  { title: 'La liste de Mamie Jo', avatar: people.mamieJo, owner: 'Josiane Martin' },
];

/* Section */

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

const SectionTitleStyled = styled('h2')(({ theme }) => ({
  margin: 0,
  textAlign: 'center',
  fontFamily: theme.typography.h1.fontFamily,
  fontWeight: 600,
  fontSize: '2rem',
  lineHeight: 1.2,
  color: theme.palette.primary.main,
  [theme.breakpoints.up('sm')]: {
    fontSize: '2.5rem',
  },
}));

const SectionSubtitleStyled = styled('p')(({ theme }) => ({
  maxWidth: 560,
  margin: `${theme.spacing(1.5)} auto ${theme.spacing(5)}`,
  textAlign: 'center',
  fontSize: '1.0625rem',
  lineHeight: 1.6,
  color: theme.palette.text.secondary,
  [theme.breakpoints.up('md')]: {
    marginBottom: theme.spacing(7),
    fontSize: '1.125rem',
  },
}));

/* Bento grid: 1 column, then 2 (big tile and last tile full width), then 3 with the big tile 2×2. */

const BentoGridStyled = styled('ul')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr)',
  gap: theme.spacing(2),
  margin: 0,
  padding: 0,
  listStyle: 'none',
  [theme.breakpoints.up('sm')]: {
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    '& > .featured, & > .wide': {
      gridColumn: '1 / -1',
    },
  },
  [theme.breakpoints.up('lg')]: {
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 20,
    '& > .featured': {
      gridColumn: 'span 2',
      gridRow: 'span 2',
    },
    '& > .wide': {
      gridColumn: 'auto',
    },
  },
}));

const FeatureTileStyled = styled('li')(({ theme }) => ({
  '--tile-delay': '0ms',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
  padding: 20,
  borderRadius: 20,
  border: `1px solid ${TILE_BORDER}`,
  backgroundColor: theme.palette.common.white,
  // Entrance on opacity/transform (staggered), hover lift on `translate` so they never fight.
  transition: 'opacity 500ms ease var(--tile-delay), transform 500ms ease var(--tile-delay), translate 200ms ease',
  // Hover shadow: only the pseudo-element's opacity is animated, never the box-shadow itself.
  '&::after': {
    content: '""',
    position: 'absolute',
    inset: -1,
    borderRadius: 'inherit',
    boxShadow: `0 22px 44px -22px ${alpha(theme.palette.primary.main, 0.35)}`,
    opacity: 0,
    transition: 'opacity 200ms ease',
    pointerEvents: 'none',
  },
  '@media (hover: hover)': {
    '&:hover': {
      translate: '0 -2px',
    },
    '&:hover::after': {
      opacity: 1,
    },
  },
  '@media (prefers-reduced-motion: no-preference)': {
    '&:not(.in-view)': {
      opacity: 0,
      transform: 'translateY(12px)',
    },
  },
  '@media (prefers-reduced-motion: reduce)': {
    '&:hover': {
      translate: 'none',
    },
  },
  // Tiles that enter together appear one after the other; on one column they enter one by one.
  [theme.breakpoints.up('sm')]: Object.fromEntries(
    [1, 2, 3, 4, 5].map(index => [`&:nth-of-type(${index + 1})`, { '--tile-delay': `${index * 60}ms` }]),
  ),
  // Last tile on the 2-column layout: full width, mockup on the left and text on the right.
  [theme.breakpoints.between('sm', 'lg')]: {
    '&.wide': {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      columnGap: theme.spacing(2.5),
      alignContent: 'center',
      '& > .tile-preview': {
        gridRow: '1 / span 2',
      },
      '& > .tile-title': {
        alignSelf: 'end',
        marginTop: 0,
      },
      '& > .tile-text': {
        alignSelf: 'start',
      },
    },
  },
}));

const TilePreviewStyled = styled('div')(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  gap: theme.spacing(1),
  minHeight: 130,
  padding: theme.spacing(1.5),
  borderRadius: 12,
  backgroundColor: theme.palette.grey[50],
  overflow: 'hidden',
  pointerEvents: 'none',
  userSelect: 'none',
  '.featured > &': {
    justifyContent: 'flex-start',
    minHeight: 300,
    padding: theme.spacing(1),
    [theme.breakpoints.up('sm')]: {
      // No bottom padding: the browser runs off the bottom edge, like a page that goes on.
      padding: theme.spacing(2, 2, 0),
    },
    [theme.breakpoints.up('lg')]: {
      flexGrow: 1,
    },
  },
}));

const TileTitleStyled = styled('h3')(({ theme }) => ({
  margin: theme.spacing(2, 0, 0.75),
  fontFamily: theme.typography.h1.fontFamily,
  fontWeight: 600,
  fontSize: '1.125rem',
  lineHeight: 1.3,
  color: theme.palette.primary.main,
  '.featured > &': {
    [theme.breakpoints.up('sm')]: {
      fontSize: '1.25rem',
    },
    [theme.breakpoints.up('md')]: {
      paddingRight: GENIE_ROOM,
    },
  },
}));

const TileTextStyled = styled('p')(({ theme }) => ({
  margin: 0,
  fontSize: '0.875rem',
  lineHeight: 1.6,
  color: theme.palette.text.secondary,
  '.featured > &': {
    [theme.breakpoints.up('md')]: {
      paddingRight: GENIE_ROOM,
    },
  },
}));

const TileGenieStyled = styled(Genie)(({ theme }) => ({
  position: 'absolute',
  right: 16,
  bottom: 10,
  zIndex: 1,
  display: 'none',
  [theme.breakpoints.up('md')]: {
    display: 'inline-flex',
  },
}));

/* Tile 1: the event page */

const EventBrowserStyled = styled(BrowserFrame)({
  flexGrow: 1,
  marginBottom: -16,
});

const EventPageStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1.5),
  // The browser's last 16px are cut by the tile preview.
  padding: theme.spacing(2, 2, 5),
  '&.card': {
    gap: theme.spacing(1.25),
    padding: theme.spacing(1.25),
    overflow: 'hidden',
    borderRadius: 12,
    border: `1px solid ${TILE_BORDER}`,
    backgroundColor: theme.palette.common.white,
  },
}));

const EventDescriptionStyled = styled('p')(({ theme }) => ({
  margin: 0,
  fontSize: 13,
  lineHeight: 1.4,
  color: theme.palette.text.secondary,
}));

const AttendeeRowsStyled = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr)',
  gap: theme.spacing(0.75),
  [theme.breakpoints.up('sm')]: {
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: theme.spacing(1),
  },
}));

const AttendeeRowStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  minWidth: 0,
  padding: theme.spacing(0.625, 1),
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.common.white,
}));

const AttendeeNameStyled = styled('span')(({ theme }) => ({
  flex: 1,
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fontSize: '0.8rem',
  fontWeight: 600,
  color: theme.palette.text.primary,
}));

const ListsTitleStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.75),
  marginTop: theme.spacing(0.5),
  fontFamily: theme.typography.h1.fontFamily,
  fontWeight: 600,
  fontSize: '0.95rem',
  color: theme.palette.primary.main,
  '& > .count': {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 20,
    height: 20,
    padding: '0 6px',
    borderRadius: 999,
    fontSize: '0.7rem',
    fontWeight: 700,
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
  },
}));

const EventListsStyled = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr)',
  gap: theme.spacing(0.75),
  [theme.breakpoints.up('sm')]: {
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: theme.spacing(1),
  },
  // The big tile spans the whole container on md: the four lists fit on one row.
  [theme.breakpoints.only('md')]: {
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
  },
}));

const ListCardStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  minWidth: 0,
  padding: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.common.white,
  '.card &': {
    padding: theme.spacing(0.75, 1),
  },
}));

const ListCardTextStyled = styled('span')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 1,
  minWidth: 0,
  '& > span': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  '& > .title': {
    fontFamily: theme.typography.h1.fontFamily,
    fontWeight: 600,
    fontSize: '0.85rem',
    lineHeight: 1.25,
    color: theme.palette.primary.main,
  },
  '& > .owner': {
    fontSize: '0.72rem',
    fontWeight: 500,
    color: theme.palette.text.secondary,
  },
}));

type EventMockProps = {
  date: DateTime;
};

/** "Noël en famille" event page: a browser window from sm, a plain card on phones. */
const EventMock = ({ date }: EventMockProps) => {
  const theme = useTheme();
  const inBrowser = useMediaQuery(theme.breakpoints.up('sm'), { noSsr: true });

  const page = (
    <EventPageStyled className={clsx(!inBrowser && 'card')}>
      <MockEventHeader
        emoji="🎄"
        title="Noël en famille"
        date={date}
        attendees={eventGuests}
        attendeeCount={8}
        compact={!inBrowser}
        hideDate={!inBrowser}
      />
      <EventDescriptionStyled>Chez Mamie Jo, comme chaque année.</EventDescriptionStyled>
      <AttendeeRowsStyled>
        {eventOrganizers.map(({ person, role }) => (
          <AttendeeRowStyled key={person.firstName}>
            <MockAvatar person={person} size={24} />
            <AttendeeNameStyled>{person.firstName}</AttendeeNameStyled>
            <AttendeeRoleChip role={role} />
          </AttendeeRowStyled>
        ))}
      </AttendeeRowsStyled>
      <ListsTitleStyled>
        Listes
        <span className="count">{eventLists.length}</span>
      </ListsTitleStyled>
      <EventListsStyled>
        {eventLists.map(list => (
          <ListCardStyled key={list.title}>
            <MockAvatar person={list.avatar} size={inBrowser ? 32 : 26} />
            <ListCardTextStyled>
              <span className="title">{list.title}</span>
              <span className="owner">{list.owner}</span>
            </ListCardTextStyled>
          </ListCardStyled>
        ))}
      </EventListsStyled>
    </EventPageStyled>
  );

  return inBrowser ? <EventBrowserStyled>{page}</EventBrowserStyled> : page;
};

/* Tile 2: a child's list managed by both parents */

const ChildListTitleStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.25),
  fontFamily: theme.typography.h1.fontFamily,
  fontWeight: 600,
  fontSize: '1.05rem',
  color: theme.palette.primary.main,
}));

const MockCheckboxStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing(0.75),
  fontSize: '0.75rem',
  lineHeight: 1.35,
  color: theme.palette.text.primary,
  '& > svg': {
    flexShrink: 0,
    marginTop: -1,
    fontSize: 18,
    color: theme.palette.primary.main,
  },
}));

const CoOwnerStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: theme.spacing(0.75),
  fontSize: '0.75rem',
  fontWeight: 500,
  color: theme.palette.text.primary,
  '& > .subtitle': {
    marginRight: theme.spacing(0.5),
    fontFamily: theme.typography.h1.fontFamily,
    fontSize: '0.8rem',
    color: theme.palette.primary.dark,
  },
}));

const ChildListMock = () => (
  <>
    <ChildListTitleStyled>
      <MockAvatar person={people.gabin} size={48} />
      Liste de Gabin
    </ChildListTitleStyled>
    <MockCheckboxStyled>
      <CheckBoxIcon />
      Je veux voir ce que les gens cochent sur cette liste
    </MockCheckboxStyled>
    <CoOwnerStyled>
      <span className="subtitle">Co-gestionnaire</span>
      <MockAvatar person={people.thomas} size={20} />
      {fullName(people.thomas)}
    </CoOwnerStyled>
  </>
);

/* Tile 3: the reserved gifts page */

const MiniPageTitleStyled = styled('div')(({ theme }) => ({
  textAlign: 'center',
  fontFamily: theme.typography.h1.fontFamily,
  fontWeight: 600,
  fontSize: '0.875rem',
  lineHeight: 1.2,
  color: theme.palette.primary.main,
}));

// Same look as ReservedItemsPeriodSwitch, scaled down.
const PeriodSwitchStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  gap: 2,
  width: 'fit-content',
  maxWidth: '100%',
  margin: '0 auto',
  padding: 3,
  borderRadius: 999,
  backgroundColor: theme.palette.grey[100],
  boxShadow: `inset 0 0 0 1px ${theme.palette.divider}`,
  '& > span': {
    padding: '3px 10px',
    borderRadius: 999,
    fontSize: '0.7rem',
    fontWeight: 600,
    color: theme.palette.text.secondary,
  },
  '& > .selected': {
    color: theme.palette.primary.contrastText,
    backgroundColor: theme.palette.primary.main,
    boxShadow: `0 4px 10px ${alpha(theme.palette.primary.main, 0.3)}`,
  },
}));

const ReservedRowStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.25),
  minWidth: 0,
  padding: theme.spacing(0.75),
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${TILE_BORDER}`,
  backgroundColor: theme.palette.common.white,
}));

const ProductThumbStyled = styled('span')({
  display: 'grid',
  placeItems: 'center',
  flexShrink: 0,
  width: 42,
  height: 42,
  borderRadius: 8,
  fontSize: 22,
});

const ReservedRowTextStyled = styled('span')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 1,
  minWidth: 0,
  fontSize: '0.68rem',
  color: theme.palette.text.secondary,
  '& > span': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  '& > .name': {
    fontSize: '0.78rem',
    fontWeight: 600,
    color: theme.palette.text.primary,
  },
  '& > .with': {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
}));

const ReservedGiftsMock = () => (
  <>
    <MiniPageTitleStyled>Cadeaux réservés</MiniPageTitleStyled>
    <PeriodSwitchStyled>
      <span>Tous</span>
      <span className="selected">Réservés</span>
      <span>Passés</span>
    </PeriodSwitchStyled>
    <ReservedRowStyled>
      <ProductThumbStyled style={{ backgroundColor: leaWishes.headphones.tint }}>
        {leaWishes.headphones.emoji}
      </ProductThumbStyled>
      <ReservedRowTextStyled>
        <span className="name">{leaWishes.headphones.name}</span>
        <span>Pour {people.lea.firstName} · 🎂 Anniversaire de Léa</span>
        <span className="with">
          <MockAvatar person={people.thomas} size={16} />
          avec {people.thomas.firstName}
        </span>
      </ReservedRowTextStyled>
    </ReservedRowStyled>
  </>
);

/* Tile 4: the new wishes digest email */

const MailCardStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing(1.25),
  minWidth: 0,
  marginBottom: 6,
  padding: theme.spacing(1.25),
  borderRadius: 12,
  border: `1px solid ${TILE_BORDER}`,
  backgroundColor: theme.palette.common.white,
  // A second email peeks out below, drawn with offset shadows (no extra element).
  boxShadow: [
    `0 7px 0 -4px ${theme.palette.common.white}`,
    `0 7px 0 -3px ${TILE_BORDER}`,
    `0 12px 22px -12px ${alpha(theme.palette.primary.main, 0.3)}`,
  ].join(', '),
}));

const MailIconStyled = styled('span')(({ theme }) => ({
  display: 'grid',
  placeItems: 'center',
  flexShrink: 0,
  width: 36,
  height: 36,
  borderRadius: '50%',
  color: theme.palette.primary.main,
  backgroundColor: brandColors.mistLight,
  '& > svg': {
    fontSize: 20,
  },
}));

const MailTextStyled = styled('span')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  flex: 1,
  minWidth: 0,
  fontSize: '0.7rem',
  color: theme.palette.text.secondary,
  '& > .meta': {
    display: 'flex',
    justifyContent: 'space-between',
    gap: theme.spacing(1),
  },
  '& .sender': {
    fontSize: '0.75rem',
    fontWeight: 700,
    color: theme.palette.text.primary,
  },
  '& > .subject': {
    fontSize: '0.8rem',
    fontWeight: 600,
    lineHeight: 1.3,
    color: theme.palette.primary.main,
  },
  '& > .snippet': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
}));

const NewWishesMailMock = () => (
  <MailCardStyled>
    <MailIconStyled>
      <EmailOutlinedIcon />
    </MailIconStyled>
    <MailTextStyled>
      <span className="meta">
        <span className="sender">Wishlist</span>
        <span>ce matin</span>
      </span>
      <span className="subject">{people.camille.firstName} a ajouté des souhaits</span>
      <span className="snippet">Depuis hier, des participants ont ajouté des souhaits à leurs listes</span>
    </MailTextStyled>
  </MailCardStyled>
);

/* Tile 5: birthday reminder and import of old wishes */

const BirthdayReminderStyled = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'auto minmax(0, 1fr)',
  alignItems: 'center',
  columnGap: theme.spacing(1.5),
  rowGap: theme.spacing(1.25),
}));

const CalendarPageStyled = styled('span')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  width: 58,
  overflow: 'hidden',
  textAlign: 'center',
  borderRadius: 10,
  border: `1px solid ${TILE_BORDER}`,
  backgroundColor: theme.palette.common.white,
  boxShadow: `0 6px 14px -8px ${alpha(theme.palette.primary.main, 0.35)}`,
  '& > .countdown': {
    padding: '3px 0',
    fontSize: '0.7rem',
    fontWeight: 700,
    letterSpacing: 0.3,
    color: theme.palette.primary.contrastText,
    backgroundColor: theme.palette.primary.main,
  },
  '& > .emoji': {
    padding: '5px 0 6px',
    fontSize: 26,
    lineHeight: 1.2,
  },
}));

const ReminderSubjectStyled = styled('span')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  fontSize: '0.8rem',
  fontWeight: 600,
  lineHeight: 1.3,
  color: theme.palette.primary.main,
  '& > .sender': {
    fontSize: '0.7rem',
    fontWeight: 500,
    color: theme.palette.text.secondary,
  },
}));

// Looks like an outlined MUI button, rendered as a span (mockups hold nothing focusable).
const FakeOutlinedButtonStyled = styled('span')(({ theme }) => ({
  gridColumn: '1 / -1',
  justifySelf: 'start',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  maxWidth: '100%',
  padding: '5px 10px',
  borderRadius: 8,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.5)}`,
  backgroundColor: theme.palette.common.white,
  fontSize: '0.7rem',
  fontWeight: 600,
  lineHeight: 1.3,
  color: theme.palette.primary.main,
  '& > svg': {
    flexShrink: 0,
    fontSize: 14,
  },
}));

const BirthdayMock = () => (
  <BirthdayReminderStyled>
    <CalendarPageStyled>
      <span className="countdown">J-30</span>
      <span className="emoji">🎂</span>
    </CalendarPageStyled>
    <ReminderSubjectStyled>
      <span className="sender">Wishlist</span>
      Votre anniversaire est dans 30 jours
    </ReminderSubjectStyled>
    <FakeOutlinedButtonStyled>
      <AutoFixHighIcon />
      Importer d'anciens souhaits
    </FakeOutlinedButtonStyled>
  </BirthdayReminderStyled>
);

/* Tile 6: the clothing size hint */

const MockTextFieldStyled = styled('div')(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  height: 40,
  marginTop: 6,
  padding: theme.spacing(0, 1.5),
  borderRadius: 8,
  border: `1.5px solid ${theme.palette.primary.main}`,
  backgroundColor: theme.palette.common.white,
  fontSize: '0.82rem',
  whiteSpace: 'nowrap',
  color: theme.palette.text.primary,
  // Text cursor after the typed title
  '&::after': {
    content: '""',
    width: 1.5,
    height: 16,
    marginLeft: 1,
    backgroundColor: theme.palette.primary.main,
  },
  // Floating label sitting in the border notch, like MUI's outlined TextField
  '& > .label': {
    position: 'absolute',
    top: -8,
    left: 9,
    padding: '0 4px',
    fontSize: '0.66rem',
    fontWeight: 500,
    lineHeight: '14px',
    color: theme.palette.primary.main,
    background: `linear-gradient(to bottom, ${theme.palette.grey[50]} 50%, ${theme.palette.common.white} 50%)`,
  },
}));

// The app's hint is a warning Alert; the mockup keeps it in the brand's mist and navy.
const SizeHintStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(1, 1.25),
  borderRadius: 10,
  border: `2px solid ${brandColors.mist}`,
  backgroundColor: brandColors.mistLight,
  fontSize: '0.78rem',
  fontWeight: 600,
  lineHeight: 1.3,
  color: theme.palette.primary.main,
  '& > svg': {
    flexShrink: 0,
    fontSize: 24,
  },
}));

const SizeHintMock = () => (
  <>
    <MockTextFieldStyled>
      <span className="label">Titre du souhait</span>
      Pull en laine col roulé
    </MockTextFieldStyled>
    <SizeHintStyled>
      <CheckroomIcon />
      Pensez à indiquer la taille
    </SizeHintStyled>
  </>
);

/* Under the grid */

const ExtrasListStyled = styled('ul')(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  gap: theme.spacing(1.25),
  margin: `${theme.spacing(5)} 0 0`,
  padding: 0,
  listStyle: 'none',
}));

const ExtraChipStyled = styled('li')(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  minHeight: 36,
  padding: theme.spacing(0.5, 2),
  borderRadius: 999,
  border: `1px solid ${theme.palette.primary.main}`,
  backgroundColor: theme.palette.common.white,
  fontSize: '0.875rem',
  fontWeight: 500,
  color: theme.palette.primary.main,
  '& > svg': {
    flexShrink: 0,
    fontSize: 18,
  },
}));

const CreateEventLinkStyled = styled(Link)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  width: 'fit-content',
  margin: `${theme.spacing(3)} auto 0`,
  borderRadius: 4,
  fontSize: '1rem',
  fontWeight: 600,
  color: theme.palette.primary.main,
  textDecoration: 'none',
  textUnderlineOffset: 4,
  '& > .arrow': {
    transition: 'transform 200ms ease',
  },
  '&:hover': {
    textDecoration: 'underline',
  },
  '&:hover > .arrow': {
    transform: 'translateX(3px)',
  },
  '&:focus-visible': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: 4,
  },
  '@media (prefers-reduced-motion: reduce)': {
    '& > .arrow': {
      transition: 'none',
    },
  },
}));

/* Tile */

type FeatureTileProps = {
  title: string;
  /** What the mockup shows, read by screen readers instead of the mockup. */
  summary: string;
  preview: ReactNode;
  children: ReactNode;
  /** `featured`: the big event tile with the genie. `wide`: full width on the 2-column layout. */
  layout?: 'featured' | 'wide';
};

const FeatureTile = ({ title, summary, preview, children, layout }: FeatureTileProps) => {
  const [ref, inView] = useInView<HTMLLIElement>({ threshold: 0, rootMargin: '0px 0px -10% 0px' });

  return (
    <FeatureTileStyled ref={ref} className={clsx(layout, inView && 'in-view')}>
      <TilePreviewStyled className="tile-preview" aria-hidden inert>
        {preview}
      </TilePreviewStyled>
      <TileTitleStyled className="tile-title">{title}</TileTitleStyled>
      <TileTextStyled className="tile-text">{children}</TileTextStyled>
      <VisuallyHidden>{summary}</VisuallyHidden>
      {layout === 'featured' ? <TileGenieStyled variant="calendar" size={120} grounded /> : null}
    </FeatureTileStyled>
  );
};

export const FeaturesSection = () => {
  const christmas = nextChristmasDate();

  return (
    <SectionStyled id="features" aria-labelledby="features-title">
      <Container maxWidth="lg">
        <SectionTitleStyled id="features-title">Pensé pour toute la famille</SectionTitleStyled>
        <SectionSubtitleStyled>
          Un événement pour réunir tout le monde, et des détails qui évitent les faux pas.
        </SectionSubtitleStyled>

        <BentoGridStyled>
          <FeatureTile
            layout="featured"
            title="Un événement, toutes les listes"
            preview={<EventMock date={christmas} />}
            summary={`Aperçu : la page de l'événement « Noël en famille » du ${formatEventDate(christmas)}, avec son compte à rebours et 8 participants. Mamie Jo l'a créé et Léa en est administratrice. Quatre listes y sont rattachées : celles de Léa, de Gabin, de Thomas et de Mamie Jo.`}
          >
            Anniversaire, Noël, mariage… Créez l'événement avec sa date et son emoji&nbsp;: chaque invité y ajoute sa
            liste, et le compte à rebours fait le reste. Nommez des co-organisateurs pour le gérer avec vous, et
            utilisez la même liste pour plusieurs événements.
          </FeatureTile>

          <FeatureTile
            title="La liste de votre enfant, gérée à deux"
            preview={<ChildListMock />}
            summary="Aperçu : la « Liste de Gabin », avec l'option « Je veux voir ce que les gens cochent sur cette liste » cochée et Thomas Martin en co-gestionnaire."
          >
            Créez une liste «&nbsp;Pour une autre personne&nbsp;», avec son prénom et sa photo. Si vous choisissez de
            voir les réservations, l'autre parent peut la gérer avec vous en co-gestionnaire.
          </FeatureTile>

          <FeatureTile
            title="Tous vos cadeaux réservés"
            preview={<ReservedGiftsMock />}
            summary="Aperçu : la page « Cadeaux réservés », filtrée sur « Réservés », avec le casque audio sans fil offert à Léa avec Thomas pour l'anniversaire de Léa."
          >
            Une page pour retrouver ce que vous offrez, à qui, pour quel événement et avec qui.
          </FeatureTile>

          <FeatureTile
            title="Prévenu des nouvelles envies"
            preview={<NewWishesMailMock />}
            summary="Aperçu : un email de Wishlist reçu ce matin, intitulé « Camille a ajouté des souhaits »."
          >
            Un email récapitulatif quand un proche ajoute des souhaits à sa liste. Désactivable à tout moment.
          </FeatureTile>

          <FeatureTile
            title="Votre anniversaire, anticipé"
            preview={<BirthdayMock />}
            summary="Aperçu : le rappel « Votre anniversaire est dans 30 jours », envoyé un mois avant, et le bouton « Importer d'anciens souhaits »."
          >
            Un mois avant, Wishlist vous rappelle de préparer votre liste. Les souhaits qu'on ne vous a pas offerts se
            réimportent en quelques clics.
          </FeatureTile>

          <FeatureTile
            layout="wide"
            title="La bonne taille, du premier coup"
            preview={<SizeHintMock />}
            summary="Aperçu : un souhait intitulé « Pull en laine col roulé » affiche le conseil « Pensez à indiquer la taille »."
          >
            Un vêtement, des chaussures&nbsp;? Wishlist vous rappelle d'indiquer la taille ou la pointure.
          </FeatureTile>
        </BentoGridStyled>

        <ExtrasListStyled>
          <ExtraChipStyled>
            <InstallMobileIcon />
            S'installe sur votre téléphone
          </ExtraChipStyled>
          <ExtraChipStyled>
            <GoogleIcon />
            Connexion avec Google
          </ExtraChipStyled>
          <ExtraChipStyled>
            <FavoriteIcon />
            Gratuit et sans publicité
          </ExtraChipStyled>
        </ExtrasListStyled>

        <CreateEventLinkStyled to="/register">
          Créer un événement
          <span className="arrow" aria-hidden>
            →
          </span>
        </CreateEventLinkStyled>
      </Container>
    </SectionStyled>
  );
};
