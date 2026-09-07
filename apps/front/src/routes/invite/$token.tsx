import { createFileRoute } from '@tanstack/react-router';

import { EventInvitePage } from '../../components/event/EventInvitePage';

export const Route = createFileRoute('/invite/$token')({
  component: () => {
    const { token } = Route.useParams();
    return <EventInvitePage token={token} />;
  },
});
