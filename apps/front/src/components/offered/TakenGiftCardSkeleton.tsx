import { Skeleton, styled } from '@mui/material';

import { Card } from '../common/Card';

const CardContent = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(1.5),
  border: `1px solid ${theme.palette.divider}`,
  minHeight: '6.5rem',
}));

export const TakenGiftCardSkeleton = () => (
  <CardContent>
    <Skeleton animation="wave" variant="rounded" width={88} height={88} />
    <div style={{ flex: 1, minWidth: 0 }}>
      <Skeleton animation="wave" variant="text" width="70%" sx={{ fontSize: '1rem' }} />
      <Skeleton animation="wave" variant="text" width="45%" sx={{ fontSize: '0.85rem' }} />
      <Skeleton animation="wave" variant="text" width="55%" sx={{ fontSize: '0.8rem' }} />
    </div>
  </CardContent>
);
