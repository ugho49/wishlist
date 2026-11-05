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
import { MetaChip, MetaChipButton } from '../common/PageHero';
import { SecretSantaBaubleScratch } from './SecretSantaBaubleScratch';
import { SecretSantaRow, SecretSantaRowActions, SecretSantaRowLead } from './SecretSantaHeroRow';

const EASTER_EGG_CLICKS = 4;
const EASTER_EGG_CLICK_MS = 450;

const NoteHeader = styled('div')(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  padding: theme.spacing(2.5, 6, 2, 3),
  borderBottom: `1px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
  background: `linear-gradient(160deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${theme.palette.background.paper} 100%)`,
}));

const NoteIcon = styled('div')(({ theme }) => ({
  width: 40,
  height: 40,
  borderRadius: 12,
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.primary.main,
  backgroundColor: theme.palette.background.paper,
  boxShadow: `0 4px 14px -4px ${alpha(theme.palette.primary.main, 0.3)}`,
}));

const NoteEyebrow = styled('div')(({ theme }) => ({
  fontSize: '0.68rem',
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: theme.palette.primary.main,
}));

const NoteTitle = styled('h2')(({ theme }) => ({
  margin: 0,
  fontSize: '1.15rem',
  fontWeight: 700,
  color: theme.palette.text.primary,
}));

const NoteCloseButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1.5),
  right: theme.spacing(1.5),
}));

const NoteContent = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(3),
  fontSize: '0.95rem',
  lineHeight: 1.65,
}));

type OrganizerNoteDialogProps = {
  open: boolean;
  onClose: () => void;
  note: string;
};

const OrganizerNoteDialog = ({ open, onClose, note }: OrganizerNoteDialogProps) => (
  <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" aria-labelledby="organizer-note-title">
    <NoteHeader>
      <NoteIcon>
        <CardGiftcardIcon />
      </NoteIcon>
      <div>
        <NoteEyebrow>Secret Santa</NoteEyebrow>
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

const getBudgetLabel = (budget: string | undefined, long: boolean) => {
  if (!budget) return 'Budget libre';
  return long ? `Budget max ${budget}` : `${budget} max`;
};

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

  const handleRowClick = useCallback(() => {
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
  const facts = secretSanta && (
    <SecretSantaRowActions>
      <MetaChip className={budget ? 'success' : undefined}>
        <EuroIcon />
        {getBudgetLabel(budget, isUpSm)}
      </MetaChip>
      {note ? (
        <MetaChipButton
          type="button"
          aria-haspopup="dialog"
          onClick={event => {
            event.stopPropagation();
            setNoteOpen(true);
          }}
        >
          <RateReviewOutlinedIcon />
          Le mot de l'organisateur
        </MetaChipButton>
      ) : (
        <MetaChip>
          <PeopleIcon />
          {secretSanta.users.length} participants
        </MetaChip>
      )}
    </SecretSantaRowActions>
  );
  const noteDialog = note && <OrganizerNoteDialog open={noteOpen} onClose={() => setNoteOpen(false)} note={note} />;

  if (!draw) {
    return (
      <>
        <SecretSantaRow as="section" aria-label="Secret Santa">
          <SecretSantaRowLead
            visual={<HourglassTopIcon />}
            eyebrow="Secret Santa · tirage en préparation"
            title="Tu découvriras bientôt à qui offrir"
          />
          {facts}
        </SecretSantaRow>
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
      <SecretSantaRow as="section" aria-label="Mon Secret Santa" onClick={handleRowClick}>
        <SecretSantaRowLead
          visual={
            <Avatar src={pictureUrl} alt="">
              {initials}
            </Avatar>
          }
          eyebrow="Secret Santa · tu offres à"
          title={displayName}
        />
        {facts}
      </SecretSantaRow>
      {noteDialog}
    </>
  );
};
