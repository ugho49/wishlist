import { createFileRoute } from '@tanstack/react-router';
import { SEO } from '@wishlist/front-components/SEO';
import z from 'zod';

import { NotificationsPage } from '../../../../components/notification/NotificationsPage';

export const Route = createFileRoute('/_authenticated/_with-layout/notifications/')({
  validateSearch: z.object({
    page: z.number().optional().catch(1).default(1),
  }),
  component: () => (
    <>
      <SEO
        title="Notifications"
        description="Retrouvez les réservations, nouveaux invités, Secret Santa et rappels d’événements."
        canonical="/notifications"
      />
      <NotificationsPage />
    </>
  ),
});
