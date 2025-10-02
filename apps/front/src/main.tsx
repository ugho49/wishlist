import 'reflect-metadata'

import type { RouterContext } from './routes/__root'

import { QueryClient } from '@tanstack/react-query'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import * as ReactDOM from 'react-dom/client'

import { store } from './core'
import { routeTree } from './routeTree.gen'

function main() {
  const needRedirect =
    window.location.hostname === 'wishlist-stephan.web.app' ||
    window.location.hostname === 'wishlist-stephan.firebaseapp.com'

  if (needRedirect) {
    window.location.href = 'https://wishlistapp.fr'
    return
  }

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
      },
      mutations: {
        retry: false,
      },
    },
  })

  const router = createRouter({
    routeTree,
    context: {
      queryClient,
      isAuthenticated: false,
      accessToken: undefined,
    } satisfies RouterContext,
  })

  // Update router context when auth state changes
  store.subscribe(() => {
    const state = store.getState()
    router.update({
      context: {
        queryClient,
        isAuthenticated: state.auth.accessToken !== undefined,
        accessToken: state.auth.accessToken,
      },
    })
  })

  const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
  root.render(<RouterProvider router={router} />)
}

main()
