import type { QueryFunctionContext } from '@tanstack/react-query'

import { LS_KEYS } from '../core/services/auth.service'
import { environment } from '../environment'

const GRAPHQL_ENDPOINT = `${environment.apiBaseUrl}/graphql`

export const fetchGql = <TData, TVariables>(
  query: string,
  variables?: TVariables,
): ((context?: QueryFunctionContext) => Promise<TData>) => {
  return async context => {
    const token = localStorage.getItem(LS_KEYS.ACCESS_TOKEN)

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, variables }),
      signal: context?.signal,
    })

    const json = await response.json()

    if (json.errors) {
      const { message } = json.errors[0] || {}
      throw new Error(message || 'An error occurred')
    }

    return json.data
  }
}
