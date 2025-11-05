import 'reflect-metadata'

import { CssBaseline, ThemeProvider } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { fr } from 'date-fns/locale/fr'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { RouterProvider } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { LDProvider } from 'launchdarkly-react-client-sdk'
import * as ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import { Provider as ReduxProvider } from 'react-redux'

import { ApiProvider } from './context/ApiContext'
import { store } from './core'
import { environment } from './environment'
import { router } from './router'
import { theme } from './theme'

function main() {
  const needRedirect =
    window.location.hostname === 'wishlist-stephan.web.app' ||
    window.location.hostname === 'wishlist-stephan.firebaseapp.com'

  if (needRedirect) {
    // Set referrer policy to no-referrer
    const meta = document.createElement('meta')
    meta.name = 'referrer'
    meta.content = 'no-referrer'
    document.head.appendChild(meta)

    // Use replace() to redirect without adding to browser history and without referrer
    window.location.replace('https://wishlistapp.fr')
    return
  }

  const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
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

  root.render(
    <LDProvider clientSideID={environment.launchdarklyClientSideiD} reactOptions={{ useCamelCaseFlagKeys: false }}>
      <Toaster position="top-right" toastOptions={{ duration: 3_000 }} />
      <QueryClientProvider client={queryClient}>
        <ApiProvider>
          <ReduxProvider store={store}>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
                <RouterProvider router={router} context={{ queryClient }} />
                <TanStackRouterDevtools router={router} />
              </LocalizationProvider>
            </ThemeProvider>
          </ReduxProvider>
        </ApiProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </LDProvider>,
  )
}

main()
