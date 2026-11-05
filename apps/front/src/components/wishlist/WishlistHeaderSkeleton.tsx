import { Container, Skeleton, styled } from '@mui/material';

import { PageHero, PageHeroMedia, PageHeroMeta, PageHeroTitle } from '../common/PageHero';

const BreadcrumbSkeleton = styled(Skeleton)(({ theme }) => ({
  fontSize: '0.75rem',
  width: 140,
  marginBottom: theme.spacing(2),
}));

export const WishlistHeaderSkeleton = () => (
  <Container maxWidth="lg">
    <BreadcrumbSkeleton animation="wave" variant="text" />
    <PageHero aria-busy>
      <PageHeroMedia className="round">
        <Skeleton animation="wave" variant="circular" width="100%" height="100%" />
      </PageHeroMedia>
      <PageHeroTitle>
        <Skeleton animation="wave" variant="text" width="50%" />
      </PageHeroTitle>
      <PageHeroMeta>
        <Skeleton animation="wave" variant="rounded" width={150} height={30} sx={{ borderRadius: 999 }} />
        <Skeleton animation="wave" variant="rounded" width={120} height={30} sx={{ borderRadius: 999 }} />
      </PageHeroMeta>
    </PageHero>
  </Container>
);
