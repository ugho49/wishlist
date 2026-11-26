import { Button, styled } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';

import { SEO } from '../SEO';
import { GenieScreen } from './GenieScreen';

const HomeButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.common.white,
  color: theme.palette.primary.main,
  '&:hover': {
    backgroundColor: theme.palette.grey[100],
  },
}));

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <SEO title="Page introuvable" indexByRobots={false} />
      <GenieScreen
        genieVariant="lost"
        eyebrow="404"
        title="Ce vœu n'existe pas"
        subtitle="La page que vous cherchez s'est volatilisée. Le génie vous ramène en lieu sûr."
        action={
          <HomeButton variant="contained" size="large" onClick={() => navigate({ to: '/' })}>
            Retour à l'accueil
          </HomeButton>
        }
      />
    </>
  );
};
