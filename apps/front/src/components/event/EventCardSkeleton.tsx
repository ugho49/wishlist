import { Skeleton, styled } from '@mui/material';

import { Card } from '../common/Card';

const EventCardContent = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100px',
  border: `1px solid ${theme.palette.divider}`,
  padding: 16,
}));

const EventHeader = styled('div')({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  marginBottom: '12px',
});

const EventTextContent = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minWidth: 0,
});

const EventInfos = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginTop: 'auto',
  paddingTop: '12px',
  borderTop: `1px solid ${theme.palette.divider}`,
}));

export const EventCardSkeleton = () => (
  <EventCardContent>
    <EventHeader>
      <Skeleton animation="wave" variant="circular" width={29} height={29} />
      <EventTextContent>
        <Skeleton animation="wave" variant="text" width="60%" sx={{ fontSize: '1rem' }} />
        <Skeleton animation="wave" variant="text" width="30%" sx={{ fontSize: '0.8rem' }} />
      </EventTextContent>
    </EventHeader>

    <EventInfos>
      <Skeleton animation="wave" variant="text" width={90} sx={{ fontSize: '0.8rem' }} />
      <Skeleton animation="wave" variant="text" width={60} sx={{ fontSize: '0.8rem' }} />
    </EventInfos>
  </EventCardContent>
);
