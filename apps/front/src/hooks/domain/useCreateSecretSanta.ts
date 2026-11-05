import type { EventId } from '@wishlist/common';

import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { match } from 'ts-pattern';

import { rejectionMessage, rejectionPattern, useCreateSecretSantaMutation } from '../../gql';
import { useToast } from '../useToast';

export type CreateSecretSantaInput = {
  budget?: number;
  description?: string;
};

export const useCreateSecretSanta = (eventId: EventId) => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const { mutateAsync, isPending } = useCreateSecretSantaMutation({
    onError: () => addToast({ message: "Une erreur s'est produite", variant: 'error' }),
  });

  const createSecretSanta = useCallback(
    async (input: CreateSecretSantaInput): Promise<boolean> => {
      const res = await mutateAsync({
        input: { eventId, budget: input.budget, description: input.description },
      });
      return match(res.createSecretSanta)
        .with({ __typename: 'SecretSanta' }, async () => {
          addToast({ message: 'Secret santa créé avec succès', variant: 'success' });
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['GetSecretSantaForEvent', { eventId }] }),
            queryClient.invalidateQueries({ queryKey: ['EventPageGetEvent', { eventId }] }),
          ]);
          return true;
        })
        .with({ __typename: 'ValidationRejection' }, rejection => {
          addToast({
            message:
              rejection.errors.length > 0
                ? rejection.errors.map(error => error.message).join(', ')
                : rejectionMessage(rejection),
            variant: 'error',
          });
          return false;
        })
        .with(rejectionPattern, rejection => {
          addToast({ message: rejectionMessage(rejection), variant: 'error' });
          return false;
        })
        .exhaustive();
    },
    [mutateAsync, eventId, addToast, queryClient],
  );

  return { createSecretSanta, loading: isPending };
};
