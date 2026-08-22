import type { EventId } from '@wishlist/common';

import { useEffect } from 'react';

import { isRejection, rejectionMessage, useGetSecretSantaForEventQuery } from '../../gql';
import { useToast } from '../useToast';

type Options = {
  enabled: boolean;
};

export const useSecretSanta = (eventId: EventId | undefined, options: Options = { enabled: true }) => {
  const { addToast } = useToast();
  const { data, isLoading } = useGetSecretSantaForEventQuery(
    { eventId: eventId as EventId },
    {
      enabled: options.enabled && !!eventId,
      // The `secretSanta` field is nullable: it resolves to null when no secret
      // santa exists for the event, a normal state exposed as `undefined`.
      select: d => d.secretSanta ?? undefined,
    },
  );

  const rejection = data && isRejection(data) ? data : undefined;
  const secretSanta = data && !isRejection(data) ? data : undefined;

  useEffect(() => {
    if (rejection) {
      addToast({ message: rejectionMessage(rejection), variant: 'error' });
    }
  }, [rejection, addToast]);

  return { secretSanta, rejection, loading: isLoading };
};
