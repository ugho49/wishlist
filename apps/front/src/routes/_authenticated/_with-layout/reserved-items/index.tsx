import { createFileRoute } from '@tanstack/react-router';
import { SEO } from '@wishlist/front-components/SEO';
import z from 'zod';

import { ReservedItemsListPage } from '../../../../components/item/ReservedItemsListPage';

export const Route = createFileRoute('/_authenticated/_with-layout/reserved-items/')({
  validateSearch: z.object({
    page: z.number().optional().default(1),
  }),
  component: () => (
    <>
      <SEO
        title="Cadeaux réservés"
        description="Retrouvez les cadeaux que vous avez réservés."
        canonical="/reserved-items"
      />
      <ReservedItemsListPage />
    </>
  ),
});
