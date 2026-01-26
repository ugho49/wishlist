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
      ownerId
      owner {
        id
        firstName
        lastName
        pictureUrl
      }
      coOwnerId
      coOwner {
        id
        firstName
        lastName
        pictureUrl
      }
      events {
        id
        title
        eventDate
      }
      items {
        id
        name
        description
        url
        score
        isSuggested
        pictureUrl
        takenById
        takerUser {
          id
          firstName
          lastName
          pictureUrl
        }
        takenAt
        createdAt
      }
      config {
        hideItems
      }
    }
    ... on NotFoundRejection {
      __typename
    }
    ... on ForbiddenRejection {
      __typename
    }
    ... on UnauthorizedRejection {
      __typename
    }
    ... on InternalErrorRejection {
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
