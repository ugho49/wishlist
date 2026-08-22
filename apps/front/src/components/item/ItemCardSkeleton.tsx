import { Box, Skeleton, styled } from '@mui/material';

import { Card } from '../common/Card';

const ItemCardStyled = styled(Card)(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  overflow: 'hidden',
  border: `1px solid ${theme.palette.divider}`,
  padding: 0,
}));

const ItemImageContainer = styled(Box)({
  height: '240px',
  width: '100%',
  overflow: 'hidden',
});

const ItemContent = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  padding: '16px',
  gap: '4px',
  alignItems: 'center',
});

const ItemFooter = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '8px 16px',
  borderTop: `1px solid ${theme.palette.divider}`,
  marginTop: 'auto',
}));

export const ItemCardSkeleton = () => (
  <ItemCardStyled>
    <ItemImageContainer>
      <Skeleton animation="wave" variant="rectangular" width="100%" height="100%" />
    </ItemImageContainer>

    <ItemContent>
      <Skeleton animation="wave" variant="text" width="70%" sx={{ fontSize: '1.1rem' }} />
      <Skeleton animation="wave" variant="text" width="90%" sx={{ fontSize: '0.9rem' }} />
      <Skeleton animation="wave" variant="text" width="50%" sx={{ fontSize: '0.9rem' }} />
    </ItemContent>

    <ItemFooter>
      <Skeleton animation="wave" variant="text" width={120} sx={{ fontSize: '0.75rem' }} />
    </ItemFooter>
  </ItemCardStyled>
);
