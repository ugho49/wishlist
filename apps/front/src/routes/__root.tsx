import type { QueryClient } from '@tanstack/react-query'

import { CssBaseline, ThemeProvider } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { NuqsAdapter } from 'nuqs/adapters/tanstack-router'
import { PostHogProvider } from 'posthog-js/react'
import { Toaster } from 'react-hot-toast'
import { Provider as ReduxProvider } from 'react-redux'

import { ScrollToTop } from '../components/common/ScrollToTop'
import { ApiProvider } from '../context/ApiContext'
import { store } from '../core'
import { AxiosInterceptor } from '../core/router/AxiosInterceptor'
import { environment } from '../environment'
import { theme } from '../theme'

export interface RouterContext {
  queryClient: QueryClient
  isAuthenticated: boolean
  accessToken?: string
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
})

function RootComponent() {
  return (
    <PostHogProvider apiKey={environment.posthogKey} options={{ api_host: environment.posthogHost }}>
      <Toaster position="top-right" toastOptions={{ duration: 3_000 }} />
      <QueryClientProvider client={Route.useRouteContext().queryClient}>
        <ApiProvider>
          <ReduxProvider store={store}>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale="fr">
                <NuqsAdapter>
                  <ScrollToTop />
                  <AxiosInterceptor />
                  <GoogleOAuthProvider clientId={environment.googleClientId}>
                    <Outlet />
                  </GoogleOAuthProvider>
                </NuqsAdapter>
              </LocalizationProvider>
            </ThemeProvider>
          </ReduxProvider>
        </ApiProvider>
        <ReactQueryDevtools initialIsOpen={false} />
        <TanStackRouterDevtools />
      </QueryClientProvider>
    </PostHogProvider>
  )
}
