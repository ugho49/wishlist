import { Box, Container, Skeleton, Stack, styled } from '@mui/material';

const HeaderContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  paddingBottom: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing(3),

  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
}));

const LeftSection = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  gap: theme.spacing(3),
  alignItems: 'center',
  flex: 1,
  width: '100%',
}));

const TitleContainer = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(1),
  flex: 1,
  minWidth: 0,
}));

export const WishlistHeaderSkeleton = () => (
  <Container maxWidth="lg">
    <HeaderContent>
      <LeftSection>
        <Skeleton animation="wave" variant="circular" width={75} height={75} />

        <TitleContainer>
          <Skeleton animation="wave" variant="text" width="45%" sx={{ fontSize: '1.5rem' }} />
          <Skeleton animation="wave" variant="text" width={160} sx={{ fontSize: '0.875rem' }} />
        </TitleContainer>
      </LeftSection>
    </HeaderContent>
  </Container>
);
