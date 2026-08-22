import { Box, Container, Skeleton, Stack, styled } from '@mui/material';

const HeaderContent = styled(Box)(({ theme }) => ({
  display: 'flex',
  paddingBottom: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing(3),

  [theme.breakpoints.down('sm')]: {
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

const MetadataStack = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  gap: theme.spacing(3),
  flexWrap: 'wrap',
  alignItems: 'center',

  [theme.breakpoints.down('lg')]: {
    flexDirection: 'column',
    gap: theme.spacing(1),
    alignItems: 'flex-start',
  },
}));

export const EventHeaderSkeleton = () => (
  <Container maxWidth="lg">
    <HeaderContent>
      <LeftSection>
        <Skeleton animation="wave" variant="circular" width={48} height={48} />

        <TitleContainer>
          <Skeleton animation="wave" variant="text" width="40%" sx={{ fontSize: '1.5rem' }} />

          <MetadataStack>
            <Skeleton animation="wave" variant="text" width={180} sx={{ fontSize: '0.875rem' }} />
            <Skeleton animation="wave" variant="text" width={120} sx={{ fontSize: '0.875rem' }} />
          </MetadataStack>
        </TitleContainer>
      </LeftSection>
    </HeaderContent>
  </Container>
);
