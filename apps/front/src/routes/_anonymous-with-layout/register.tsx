import { createFileRoute } from '@tanstack/react-router';
import { SEO } from '@wishlist/front-components/SEO';
import z from 'zod';

import { RegisterPage } from '../../components/auth/RegisterPage';

export const Route = createFileRoute('/_anonymous-with-layout/register')({
  validateSearch: z.object({
    redirectUrl: z.string().optional(),
  }),
  component: () => (
    <>
      <SEO
        title="Créer un compte"
        description="Inscrivez-vous gratuitement sur Wishlist pour créer et partager vos listes de souhaits avec vos proches en toute simplicité."
        canonical="/register"
        indexByRobots
      />
      <RegisterPage />
    </>
  ),
});
