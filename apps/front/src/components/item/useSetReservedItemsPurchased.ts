import type { ItemId } from '@wishlist/common';
import type { RootState } from '../../core/store';
import type { ReservedItemsListPageQuery, ReservedItemsListPageQueryVariables } from '../../gql';

import { useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { match } from 'ts-pattern';

import { rejectionMessage, rejectionPattern, useSetItemsPurchasedMutation } from '../../gql';
import { useToast } from '../../hooks';
import { applyPurchaseChanges, type PurchaseChanges, snapshotPurchases } from './reserved-items-purchase';

const QUERY_NAME = 'ReservedItemsListPage';

const mapState = (state: RootState) => state.auth.user?.id;

export type SetReservedItemsPurchased = (params: { itemIds: ItemId[]; purchased: boolean }) => void;

/**
 * Checks or unchecks reserved gifts of the page `variables` loads. The cache is patched before the call
 * returns, and each change rolls back on its own when the API refuses it.
 */
export const useSetReservedItemsPurchased = (
  variables: ReservedItemsListPageQueryVariables,
): SetReservedItemsPurchased => {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const currentUserId = useSelector(mapState);
  const queryKey = [QUERY_NAME, variables];

  const patchPage = (changes: PurchaseChanges) =>
    queryClient.setQueryData<ReservedItemsListPageQuery>(queryKey, query =>
      query ? applyPurchaseChanges({ query, changes, currentUserId }) : query,
    );

  const rollBack = (previous: PurchaseChanges | undefined, message: string) => {
    if (previous) patchPage(previous);
    addToast({ message, variant: 'error' });
  };

  const { mutate } = useSetItemsPurchasedMutation<unknown, { previous: PurchaseChanges }>({
    onMutate: async ({ input }) => {
      await queryClient.cancelQueries({ queryKey });
      const query = queryClient.getQueryData<ReservedItemsListPageQuery>(queryKey);
      const previous = query ? snapshotPurchases(query, input.itemIds) : new Map();
      const purchasedAt = input.purchased ? new Date().toISOString() : null;
      patchPage(new Map(input.itemIds.map(itemId => [itemId, purchasedAt])));
      return { previous };
    },
    onSuccess: (res, _variables, context) =>
      match(res.setItemsPurchased)
        .with({ __typename: 'SetItemsPurchasedOutput' }, output =>
          patchPage(new Map(output.items.map(item => [item.itemId, item.purchasedAt ?? null]))),
        )
        .with(rejectionPattern, rejection => rollBack(context?.previous, rejectionMessage(rejection)))
        .exhaustive(),
    onError: (_error, _variables, context) => rollBack(context?.previous, "Une erreur s'est produite"),
    // Other periods and pages are stale now; the current one keeps its order until the next fetch.
    onSettled: () => queryClient.invalidateQueries({ queryKey: [QUERY_NAME], refetchType: 'none' }),
  });

  return ({ itemIds, purchased }) => {
    if (itemIds.length === 0) return;
    mutate({ input: { itemIds, purchased } });
  };
};
