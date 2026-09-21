import { createFileRoute } from '@tanstack/react-router';
import { SEO } from '@wishlist/front-components/SEO';
import z from 'zod';

import { SecretSantaListPage } from '../../../../components/secret-santa/SecretSantaListPage';

export const Route = createFileRoute('/_authenticated/_with-layout/secret-santas/')({
  validateSearch: z.object({
    page: z.number().optional().default(1),
  }),
  component: () => (
    <>
      <SEO
        title="Mes Secret Santa"
        description="Retrouvez tous les Secret Santa auxquels vous participez."
        canonical="/secret-santas"
      />
      <SecretSantaListPage />
    </>
  ),
});
