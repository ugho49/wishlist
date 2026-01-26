import type * as Types from './types'
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { fetchGql } from '../fetcher';


export const WishlistPageDocument = `
    query WishlistPage($wishlistId: WishlistId!) {
  getWishlistById(id: $wishlistId) {
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
