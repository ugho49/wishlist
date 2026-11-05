import type { AttendeeId, EventId, UserId } from '@wishlist/common';
import type { EventDetail } from './event.types';

import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import CloseIcon from '@mui/icons-material/Close';
import EuroIcon from '@mui/icons-material/Euro';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import PeopleIcon from '@mui/icons-material/People';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import { Avatar, alpha, Dialog, DialogContent, IconButton, styled, useMediaQuery } from '@mui/material';
import { DateTime } from 'luxon';
import { useCallback, useRef, useState } from 'react';

import { SecretSantaStatus } from '../../gql';
import { useMySecretSantaDraw, useSecretSantaDrawReveal } from '../../hooks';
import { wholeEurosFormatter } from '../../utils/currency.utils';
import { MarkdownContent } from '../common/MarkdownContent';
import { PageHeroRow } from '../common/PageHero';
import { SecretSantaBaubleScratch } from './SecretSantaBaubleScratch';

const EASTER_EGG_CLICKS = 4;
const EASTER_EGG_CLICK_MS = 450;

const GOLD = '#e8c547';
const CREAM = '#f6ecd0';
const FOREST_GRADIENT = `
  radial-gradient(120% 160% at 100% 0%, ${alpha(GOLD, 0.2)} 0%, transparent 45%),
  linear-gradient(135deg, #1f5a3a 0%, #123526 60%, #0a2418 100%)
`;

const Band = styled(PageHeroRow)(({ theme }) => ({
  position: 'relative',
  isolation: 'isolate',
  overflow: 'hidden',
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: theme.spacing(1.5),
  padding: theme.spacing(1.5),
  borderRadius: 16,
  color: CREAM,
  userSelect: 'none',
  background: FOREST_GRADIENT,
  boxShadow: `0 10px 24px -16px ${alpha('#0a2418', 0.8)}, inset 0 0 0 1px ${alpha(GOLD, 0.25)}`,

  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    zIndex: -1,
    backgroundImage: `radial-gradient(${alpha('#ffffff', 0.2)} 1px, transparent 1.6px)`,
    backgroundSize: '22px 22px',
    maskImage: 'linear-gradient(to left, #000 0%, transparent 70%)',
    pointerEvents: 'none',
  },

  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(1.5, 2.5),
  },
}));

const Recipient = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  minWidth: 0,
}));

const RecipientAvatar = styled(Avatar)(({ theme }) => ({
  width: 40,
  height: 40,
  flexShrink: 0,
  fontWeight: 700,
  color: '#3d1f14',
  backgroundColor: '#f3e0b0',
  boxShadow: `0 0 0 2px ${GOLD}, 0 0 0 5px ${alpha(GOLD, 0.2)}`,
  [theme.breakpoints.up('md')]: {
    width: 44,
    height: 44,
  },
}));

const Eyebrow = styled('div')({
  fontSize: '0.68rem',
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: GOLD,
});

const RecipientName = styled('div')(({ theme }) => ({
  fontFamily: 'Palatino, "Palatino Linotype", "Book Antiqua", Georgia, serif',
  fontSize: '1.1rem',
  fontWeight: 700,
  lineHeight: 1.25,
  color: '#ffffff',
  overflowWrap: 'anywhere',
  [theme.breakpoints.up('md')]: {
    fontSize: '1.25rem',
  },
}));

const Facts = styled('div')(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1),
}));

const factStyles = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  minHeight: 30,
  padding: '4px 10px',
  borderRadius: 999,
  fontFamily: 'inherit',
  fontSize: '0.75rem',
  fontWeight: 600,
  lineHeight: 1.2,
  whiteSpace: 'nowrap',
  color: CREAM,
  backgroundColor: alpha('#ffffff', 0.08),
  border: `1px solid ${alpha(GOLD, 0.3)}`,
  '& > .MuiSvgIcon-root': {
    fontSize: 16,
    color: GOLD,
  },
} as const;

const Fact = styled('span')(({ theme }) => ({
  ...factStyles,
  '&.highlight': {
    color: '#3d1f14',
    backgroundColor: GOLD,
    borderColor: GOLD,
    '& > .MuiSvgIcon-root': { color: '#3d1f14' },
  },
  [theme.breakpoints.up('sm')]: {
    fontSize: '0.8125rem',
    padding: '4px 12px',
  },
}));

const FactButton = styled('button')(({ theme }) => ({
  ...factStyles,
  cursor: 'pointer',
  transition: 'background-color 0.2s ease, border-color 0.2s ease',
  '&:hover': {
    backgroundColor: alpha('#ffffff', 0.16),
    borderColor: GOLD,
  },
  '&:focus-visible': {
    outline: `2px solid ${GOLD}`,
    outlineOffset: 2,
  },
  [theme.breakpoints.up('sm')]: {
    fontSize: '0.8125rem',
    padding: '4px 12px',
  },
}));

const NoteHeader = styled('div')(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  padding: theme.spacing(2.5, 6, 2.5, 3),
  color: CREAM,
  background: FOREST_GRADIENT,
}));

const NoteTitle = styled('h2')({
  margin: 0,
  fontFamily: 'Palatino, "Palatino Linotype", "Book Antiqua", Georgia, serif',
  fontSize: '1.25rem',
  fontWeight: 700,
  color: '#ffffff',
});

const NoteCloseButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1.5),
  right: theme.spacing(1.5),
  color: CREAM,
}));

const NoteContent = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(3),
  fontSize: '0.95rem',
  lineHeight: 1.65,
}));

const getBudgetLabel = (budget: string | undefined, long: boolean) => {
  if (!budget) return 'Budget libre';
  return long ? `Budget max ${budget}` : `${budget} max`;
};

type OrganizerNoteDialogProps = {
  open: boolean;
  onClose: () => void;
  note: string;
};

const OrganizerNoteDialog = ({ open, onClose, note }: OrganizerNoteDialogProps) => (
  <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" aria-labelledby="organizer-note-title">
    <NoteHeader>
      <CardGiftcardIcon sx={{ color: GOLD }} />
      <div>
        <Eyebrow>Secret Santa</Eyebrow>
        <NoteTitle id="organizer-note-title">Le mot de l'organisateur</NoteTitle>
      </div>
      <NoteCloseButton aria-label="Fermer" onClick={onClose}>
        <CloseIcon />
      </NoteCloseButton>
    </NoteHeader>
    <NoteContent>
      <MarkdownContent text={note} />
    </NoteContent>
  </Dialog>
);

type MySecretSantaDrawProps = {
  eventId: EventId;
  eventTitle: string;
  eventDate: string;
  secretSanta?: EventDetail['secretSanta'];
  currentAttendeeId?: AttendeeId;
  currentUserId?: UserId;
};

export const MySecretSantaDraw = ({
  eventId,
  eventTitle,
  eventDate,
  secretSanta,
  currentAttendeeId,
  currentUserId,
}: MySecretSantaDrawProps) => {
  const { mySecretSantaDraw: draw } = useMySecretSantaDraw(eventId);
  const { isRevealed, markRevealed } = useSecretSantaDrawReveal(eventId, currentUserId);
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const isUpSm = useMediaQuery(theme => theme.breakpoints.up('sm'));
  const [replayScratch, setReplayScratch] = useState(false);
  const [noteOpen, setNoteOpen] = useState(false);
  const clickStreakRef = useRef({ count: 0, lastAt: 0 });

  const handleBandClick = useCallback(() => {
    const now = Date.now();
    const { count, lastAt } = clickStreakRef.current;
    const nextCount = now - lastAt > EASTER_EGG_CLICK_MS ? 1 : count + 1;
    clickStreakRef.current = { count: nextCount, lastAt: now };
    if (nextCount >= EASTER_EGG_CLICKS) {
      clickStreakRef.current = { count: 0, lastAt: 0 };
      setReplayScratch(true);
    }
  }, []);

  const isPendingParticipant =
    !draw &&
    secretSanta?.status === SecretSantaStatus.Created &&
    secretSanta.users.some(user => user.attendeeId === currentAttendeeId);

  if (!draw && !isPendingParticipant) {
    return;
  }

  const note = secretSanta?.description;
  const budget = secretSanta?.budget ? wholeEurosFormatter.format(secretSanta.budget) : undefined;
  const budgetLabel = getBudgetLabel(budget, isUpSm);
  const facts = secretSanta && (
    <Facts>
      <Fact className={budget ? 'highlight' : undefined}>
        <EuroIcon />
        {budgetLabel}
      </Fact>
      {note ? (
        <FactButton
          type="button"
          aria-haspopup="dialog"
          onClick={event => {
            event.stopPropagation();
            setNoteOpen(true);
          }}
        >
          <RateReviewOutlinedIcon />
          {isUpSm ? "Le mot de l'organisateur" : "Mot de l'orga"}
        </FactButton>
      ) : (
        <Fact>
          <PeopleIcon />
          {secretSanta.users.length} participants
        </Fact>
      )}
    </Facts>
  );
  const noteDialog = note && <OrganizerNoteDialog open={noteOpen} onClose={() => setNoteOpen(false)} note={note} />;

  if (!draw) {
    return (
      <>
        <Band as="section" aria-label="Secret Santa">
          <Recipient>
            <RecipientAvatar>
              <HourglassTopIcon fontSize="small" />
            </RecipientAvatar>
            <div>
              <Eyebrow>Secret Santa · tirage en préparation</Eyebrow>
              <RecipientName>Tu découvriras bientôt à qui offrir</RecipientName>
            </div>
          </Recipient>
          {facts}
        </Band>
        {noteDialog}
      </>
    );
  }

  const displayName = draw.pendingEmail ? draw.pendingEmail : `${draw.user?.firstName} ${draw.user?.lastName}`;
  const pictureUrl = draw.user?.pictureUrl ?? undefined;
  const initials = draw.user ? `${draw.user.firstName[0] ?? ''}${draw.user.lastName[0] ?? ''}`.toUpperCase() : '?';
  const eventIsPast = DateTime.fromISO(eventDate).startOf('day') < DateTime.now().startOf('day');
  const firstVisitScratch = Boolean(currentUserId) && !isRevealed && !prefersReducedMotion && !eventIsPast;

  if (firstVisitScratch) {
    return (
      <SecretSantaBaubleScratch
        displayName={displayName}
        eventTitle={eventTitle}
        pictureUrl={pictureUrl}
        onRevealed={markRevealed}
      />
    );
  }

  return (
    <>
      {replayScratch && (
        <SecretSantaBaubleScratch
          displayName={displayName}
          eventTitle={eventTitle}
          pictureUrl={pictureUrl}
          onRevealed={() => setReplayScratch(false)}
        />
      )}
      <Band as="section" aria-label="Mon Secret Santa" onClick={handleBandClick}>
        <Recipient>
          <RecipientAvatar src={pictureUrl} alt="">
            {initials}
          </RecipientAvatar>
          <div>
            <Eyebrow>Secret Santa · tu offres à</Eyebrow>
            <RecipientName>{displayName}</RecipientName>
          </div>
        </Recipient>
        {facts}
      </Band>
      {noteDialog}
    </>
  );
};
