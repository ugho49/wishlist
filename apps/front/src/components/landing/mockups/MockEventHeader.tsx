import type { DateTime } from 'luxon';

import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import { Avatar, AvatarGroup, styled } from '@mui/material';

import { brandColors } from '../../../theme';
import { getCountdown } from '../../../utils/countdown.utils';
import { MetaChip } from '../../common/PageHero';
import { formatEventDate, type MockPerson } from './mock-data';

const HeaderRoot = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  '&.compact': {
    gap: theme.spacing(1),
  },
}));

const EmojiSquare = styled('span')({
  display: 'grid',
  placeItems: 'center',
  flexShrink: 0,
  width: 52,
  height: 52,
  borderRadius: 14,
  fontSize: 28,
  backgroundColor: brandColors.mistLight,
  '.compact &': {
    width: 40,
    height: 40,
    borderRadius: 12,
    fontSize: 22,
  },
});

const HeaderTitle = styled('div')(({ theme }) => ({
  fontFamily: theme.typography.h1.fontFamily,
  fontWeight: 600,
  fontSize: '1.15rem',
  lineHeight: 1.2,
  color: theme.palette.primary.main,
  '.compact &': {
    fontSize: '0.95rem',
  },
}));

const Chips = styled('div')({
  display: 'flex',
  flexWrap: 'wrap',
  gap: 6,
  marginTop: 6,
  '.compact & > span': {
    minHeight: 24,
    fontSize: '0.7rem',
    padding: '2px 8px',
  },
});

const Attendees = styled(AvatarGroup)({
  '& .MuiAvatar-root': {
    width: 20,
    height: 20,
    fontSize: '0.6rem',
    border: '1.5px solid white',
  },
});

export type MockEventHeaderProps = {
  emoji: string;
  title: string;
  date: DateTime;
  /** Shown as an avatar group with the participant count. */
  attendees?: MockPerson[];
  /** Count shown next to the avatars when more people attend than the avatars shown. */
  attendeeCount?: number;
  /** Hide the full date chip, keep the countdown (narrow mockups). */
  hideDate?: boolean;
  compact?: boolean;
  className?: string;
};

/** Event header (emoji, title, date, countdown, participants) built on the app's MetaChip and getCountdown. */
export const MockEventHeader = ({
  emoji,
  title,
  date,
  attendees,
  attendeeCount,
  hideDate = false,
  compact = false,
  className,
}: MockEventHeaderProps) => {
  const countdown = getCountdown(date.toISO() ?? '');
  const count = attendeeCount ?? attendees?.length ?? 0;

  return (
    <HeaderRoot className={[compact ? 'compact' : '', className].filter(Boolean).join(' ')}>
      <EmojiSquare>{emoji}</EmojiSquare>
      <div>
        <HeaderTitle>{title}</HeaderTitle>
        <Chips>
          {hideDate ? null : (
            <MetaChip>
              <CalendarMonthIcon />
              {formatEventDate(date)}
            </MetaChip>
          )}
          <MetaChip className={countdown.className}>
            <HourglassTopIcon />
            {countdown.label}
          </MetaChip>
          {attendees && attendees.length > 0 ? (
            <MetaChip>
              <Attendees max={4} spacing="small">
                {attendees.map(person => (
                  <Avatar key={person.firstName} sx={{ bgcolor: person.color }}>
                    {person.initial}
                  </Avatar>
                ))}
              </Attendees>
              {count} participants
            </MetaChip>
          ) : null}
        </Chips>
      </div>
    </HeaderRoot>
  );
};
