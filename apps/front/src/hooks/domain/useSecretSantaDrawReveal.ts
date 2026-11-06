import type { EventId } from '@wishlist/common';
import type { GetMySecretSantaDrawQuery } from '../../gql';

import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { match } from 'ts-pattern';

import { rejectionMessage, rejectionPattern, useRevealMySecretSantaDrawMutation } from '../../gql';
import { useToast } from '../useToast';

export function useSecretSantaDrawReveal(
  eventId: EventId,
  revealed: boolean,
): {
  isRevealed: boolean;
  markRevealed: () => void;
} {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const [optimisticRevealed, setOptimisticRevealed] = useState(false);

  useEffect(() => {
    setOptimisticRevealed(false);
  }, [eventId, revealed]);

  const { mutate } = useRevealMySecretSantaDrawMutation({
    onError: () => {
      setOptimisticRevealed(false);
      addToast({ message: "Une erreur s'est produite", variant: 'error' });
    },
  });

  const markRevealed = useCallback(() => {
    setOptimisticRevealed(true);
    queryClient.setQueryData<GetMySecretSantaDrawQuery>(['GetMySecretSantaDraw', { eventId }], current => {
      if (current?.mySecretSantaDraw?.__typename !== 'MySecretSantaDraw') return current;
      return {
        ...current,
        mySecretSantaDraw: { ...current.mySecretSantaDraw, revealed: true },
      };
    });

    mutate(
      { eventId },
      {
        onSuccess: res => {
          match(res.revealMySecretSantaDraw)
            .with({ __typename: 'VoidOutput' }, () => undefined)
            .with(rejectionPattern, rejection => {
              setOptimisticRevealed(false);
              addToast({ message: rejectionMessage(rejection), variant: 'error' });
              void queryClient.invalidateQueries({ queryKey: ['GetMySecretSantaDraw', { eventId }] });
            })
            .exhaustive();
        },
      },
    );
  }, [addToast, eventId, mutate, queryClient]);

  return { isRevealed: revealed || optimisticRevealed, markRevealed };
}
