import type * as Types from './types'
import { useMutation, useQuery, UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';
import { fetchGql } from '../fetcher';


export const UpdateWishlistDocument = `
    mutation UpdateWishlist($id: WishlistId!, $input: UpdateWishlistInput!) {
  updateWishlist(id: $id, input: $input) {
    __typename
    ... on VoidOutput {
      success
    }
    ... on ValidationRejection {
      errors {
        field
        message
      }
    }
  }
}
    `;

export const useUpdateWishlistMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<Types.UpdateWishlistMutation, TError, Types.UpdateWishlistMutationVariables, TContext>) => {
    
    return useMutation<Types.UpdateWishlistMutation, TError, Types.UpdateWishlistMutationVariables, TContext>(
      {
    mutationKey: ['UpdateWishlist'],
    mutationFn: (variables?: Types.UpdateWishlistMutationVariables) => fetchGql<Types.UpdateWishlistMutation, Types.UpdateWishlistMutationVariables>(UpdateWishlistDocument, variables)(),
    ...options
  }
    )};

export const DeleteWishlistDocument = `
    mutation DeleteWishlist($id: WishlistId!) {
  deleteWishlist(id: $id) {
    __typename
    ... on VoidOutput {
      success
    }
  }
}
    `;

export const useDeleteWishlistMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<Types.DeleteWishlistMutation, TError, Types.DeleteWishlistMutationVariables, TContext>) => {
    
    return useMutation<Types.DeleteWishlistMutation, TError, Types.DeleteWishlistMutationVariables, TContext>(
      {
    mutationKey: ['DeleteWishlist'],
    mutationFn: (variables?: Types.DeleteWishlistMutationVariables) => fetchGql<Types.DeleteWishlistMutation, Types.DeleteWishlistMutationVariables>(DeleteWishlistDocument, variables)(),
    ...options
  }
    )};

export const WishlistPageDocument = `
    query WishlistPage($wishlistId: WishlistId!) {
  wishlist(id: $wishlistId) {
    ... on Wishlist {
      id
      title
      description
      logoUrl
      owner {
        id
        firstName
        lastName
      }
    }
    ... on NotFoundRejection {
      __typename
    }
  }
}
    `;

export const useWishlistPageQuery = <
      TData = Types.WishlistPageQuery,
      TError = unknown
    >(
      variables: Types.WishlistPageQueryVariables,
      options?: Omit<UseQueryOptions<Types.WishlistPageQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<Types.WishlistPageQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<Types.WishlistPageQuery, TError, TData>(
      {
    queryKey: ['WishlistPage', variables],
    queryFn: fetchGql<Types.WishlistPageQuery, Types.WishlistPageQueryVariables>(WishlistPageDocument, variables),
    ...options
  }
    )};
