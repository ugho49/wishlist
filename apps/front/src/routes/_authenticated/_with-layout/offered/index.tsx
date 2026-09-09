import { createFileRoute } from '@tanstack/react-router';
import { SEO } from '@wishlist/front-components/SEO';
import z from 'zod';

import { TakenItemsPage } from '../../../../components/offered/TakenItemsPage';
import { TakenItemsScope } from '../../../../gql';

export const Route = createFileRoute('/_authenticated/_with-layout/offered/')({
  validateSearch: z.object({
    page: z.number().optional().catch(1).default(1),
    scope: z.enum(TakenItemsScope).optional().catch(TakenItemsScope.All).default(TakenItemsScope.All),
  }),
  component: () => (
    <>
      <SEO
        title="Cadeaux offerts"
        description="Retrouvez les cadeaux que vous avez réservés et ce que vous avez déjà offert."
        canonical="/offered"
      />
      <TakenItemsPage />
    </>
  ),
});
