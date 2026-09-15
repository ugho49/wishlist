import type { EventId } from '@wishlist/common';

import { createFileRoute } from '@tanstack/react-router';
import z from 'zod';

import { AdminEventPage, AdminEventTab } from '../../../../../components/event/admin/AdminEventPage';

export const Route = createFileRoute('/_authenticated/_with-layout/admin/events/$eventId')({
  params: {
    parse: params => ({ eventId: params.eventId as EventId }),
  },
  validateSearch: z.object({
    tab: z.enum(AdminEventTab).optional().catch(AdminEventTab.info).default(AdminEventTab.info),
  }),
  component: () => {
    const { eventId } = Route.useParams();
    return <AdminEventPage eventId={eventId} />;
  },
});
