import { Chip, Skeleton, styled } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';
import clsx from 'clsx';
import { DateTime } from 'luxon';
import { match } from 'ts-pattern';

import { type SecretSantaListPageQuery, SecretSantaStatus } from '../../gql';
import { TabValues } from '../../routes/_authenticated/_with-layout/events/$eventId/edit';
import { eurosFormatter } from '../../utils/currency.utils';
import { EventIcon } from '../event/EventIcon';

type SecretSantaListItem = Extract<
  SecretSantaListPageQuery['mySecretSantas'],
  { __typename: 'GetSecretSantasPagedResponse' }
>['data'][number];

const TimelineRow = styled('li')(({ theme }) => ({
  display: 'flex',
  alignItems: 'stretch',
  gap: theme.spacing(2),
  listStyle: 'none',
  '&:last-of-type': {
    '& .timeline-line': {
      display: 'none',
    },
    '& .timeline-content': {
      paddingBottom: 0,
    },
  },
}));

const TimelineRail = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: 72,
  flexShrink: 0,
  paddingTop: theme.spacing(1.5),
}));

const TimelineContent = styled('div')(({ theme }) => ({
  flex: 1,
  minWidth: 0,
  paddingBottom: theme.spacing(3),
}));

const TimelineDate = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  lineHeight: 1.1,
});

const TimelineLine = styled('span')(({ theme }) => ({
  flex: 1,
  width: 2,
  minHeight: theme.spacing(1.5),
  marginTop: theme.spacing(1),
  backgroundColor: theme.palette.divider,
}));

const TimelineDay = styled('span')(({ theme }) => ({
  fontSize: '1.35rem',
  fontWeight: 700,
  color: theme.palette.primary.main,
}));

const TimelineMonth = styled('span')(({ theme }) => ({
  fontSize: '0.7rem',
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: theme.palette.text.secondary,
}));

const TimelineYear = styled('span')(({ theme }) => ({
  fontSize: '0.7rem',
  fontWeight: 500,
  letterSpacing: '0.04em',
  color: theme.palette.text.secondary,
  marginTop: 2,
}));

const TimelineButton = styled('button')(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(1.5, 2),
  border: 'none',
  borderRadius: theme.spacing(1),
  backgroundColor: 'transparent',
  textAlign: 'left',
  cursor: 'pointer',
  transition: 'background-color 0.2s ease-in-out',
  '&:hover, &:focus-visible': {
    backgroundColor: theme.palette.action.hover,
    outline: 'none',
  },
  '&.past': {
    opacity: 0.55,
    '& .event-title': {
      textDecoration: 'line-through',
    },
  },
}));

const RowHeader = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  marginBottom: 8,
});

const RowText = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minWidth: 0,
});

const EventTitle = styled('div')(({ theme }) => ({
  color: theme.palette.text.primary,
  fontWeight: 600,
  fontSize: '1rem',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}));

const EventMeta = styled('div')(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(1.5),
  fontSize: '0.8rem',
  color: theme.palette.text.secondary,
  fontWeight: 500,
}));

const StatusChip = styled(Chip)({
  flexShrink: 0,
});

export type SecretSantaTimelineItemProps = {
  secretSanta: SecretSantaListItem;
};

export const SecretSantaTimelineItem = ({ secretSanta }: SecretSantaTimelineItemProps) => {
  const { event } = secretSanta;
  const eventDate = DateTime.fromISO(event.eventDate);
  const numberOfParticipants = secretSanta.users.length;
  const past = eventDate < DateTime.now().minus({ days: 1 });
  const navigate = useNavigate();

  const action = match(secretSanta.status)
    .with(SecretSantaStatus.Created, () => ({
      label: 'Tirage non effectué',
      color: 'default' as const,
      go: () =>
        navigate({
          to: '/events/$eventId/edit',
          params: { eventId: event.id },
          search: { tab: TabValues.secretSanta },
        }),
    }))
    .with(SecretSantaStatus.Started, () => ({
      label: 'Voir mon tirage',
      color: 'primary' as const,
      go: () => navigate({ to: '/events/$eventId', params: { eventId: event.id } }),
    }))
    .exhaustive();

  return (
    <TimelineRow>
      <TimelineRail>
        <TimelineDate>
          <TimelineDay>{eventDate.toFormat('dd')}</TimelineDay>
          <TimelineMonth>{eventDate.toFormat('LLL')}</TimelineMonth>
          <TimelineYear>{eventDate.toFormat('yyyy')}</TimelineYear>
        </TimelineDate>
        <TimelineLine className="timeline-line" />
      </TimelineRail>
      <TimelineContent className="timeline-content">
        <TimelineButton type="button" className={clsx(past && 'past', 'animated fadeIn fast')} onClick={action.go}>
          <RowHeader>
            <EventIcon icon={event.icon ?? undefined} size="small" />
            <RowText>
              <EventTitle className="event-title">{event.title}</EventTitle>
            </RowText>
            <StatusChip size="small" label={action.label} color={action.color} variant="outlined" />
          </RowHeader>
          <EventMeta>
            <span>
              {numberOfParticipants} {numberOfParticipants > 1 ? 'participants' : 'participant'}
            </span>
            <span>
              {secretSanta.budget ? `Budget ${eurosFormatter.format(secretSanta.budget)}` : 'Budget non défini'}
            </span>
          </EventMeta>
        </TimelineButton>
      </TimelineContent>
    </TimelineRow>
  );
};

export const SecretSantaTimelineSkeleton = () => (
  <TimelineRow aria-hidden>
    <TimelineRail>
      <TimelineDate>
        <Skeleton variant="text" width={32} height={28} />
        <Skeleton variant="text" width={28} height={16} />
        <Skeleton variant="text" width={32} height={14} />
      </TimelineDate>
      <TimelineLine className="timeline-line" />
    </TimelineRail>
    <TimelineContent className="timeline-content">
      <TimelineButton type="button" disabled>
        <RowHeader>
          <Skeleton variant="circular" width={19} height={19} />
          <RowText>
            <Skeleton variant="text" width="50%" sx={{ fontSize: '1rem' }} />
          </RowText>
          <Skeleton variant="rounded" width={140} height={24} />
        </RowHeader>
        <EventMeta>
          <Skeleton variant="text" width={90} sx={{ fontSize: '0.8rem' }} />
          <Skeleton variant="text" width={80} sx={{ fontSize: '0.8rem' }} />
        </EventMeta>
      </TimelineButton>
    </TimelineContent>
  </TimelineRow>
);
