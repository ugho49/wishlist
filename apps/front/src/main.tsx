import 'reflect-metadata'

import type { AppState } from '@auth0/auth0-react'

import { Auth0Provider } from '@auth0/auth0-react'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { SnackbarProvider } from 'notistack'
import { PostHogProvider } from 'posthog-js/react'
import * as ReactDOM from 'react-dom/client'
import { Provider as ReduxProvider } from 'react-redux'
import { BrowserRouter, useNavigate } from 'react-router-dom'

import { App } from './App'
import { ApiProvider } from './context/ApiContext'
import { store } from './core'
import { AxiosInterceptor } from './core/router/AxiosInterceptor'
import { environment } from './environment'
import { theme } from './theme'

const Auth0ProviderWithRedirectCallback = ({ children }: React.PropsWithChildren) => {
  const navigate = useNavigate()

  const onRedirectCallback = (appState?: AppState) => {
    navigate(appState?.returnTo ?? '/')
  }

  return (
    <Auth0Provider
      domain="auth.wishlistapp.fr"
      clientId="csZyR7SPs0z3V72t6ukrHtAexVVX2khg"
      authorizationParams={{ redirect_uri: typeof window !== 'undefined' ? window.location.origin : undefined }}
      cacheLocation="localstorage"
      onRedirectCallback={onRedirectCallback}
    >
      {children}
    </Auth0Provider>
  )
}

function main() {
  const needRedirect =
    window.location.hostname === 'wishlist-stephan.web.app' ||
    window.location.hostname === 'wishlist-stephan.firebaseapp.com'

  if (needRedirect) {
    window.location.href = 'https://wishlistapp.fr'
    return
  }

  const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  })

  root.render(
    <PostHogProvider apiKey={environment.posthogKey} options={{ api_host: environment.posthogHost }}>
      <BrowserRouter>
        <Auth0ProviderWithRedirectCallback>
          <QueryClientProvider client={queryClient}>
            <ApiProvider>
              <ReduxProvider store={store}>
                <ThemeProvider theme={theme}>
                  <CssBaseline />
                  <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale="fr">
                    <SnackbarProvider
                      maxSnack={3}
                      autoHideDuration={1_500}
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      preventDuplicate
                    >
                      <AxiosInterceptor />
                      <GoogleOAuthProvider clientId={environment.googleClientId}>
                        <App />
                      </GoogleOAuthProvider>
                    </SnackbarProvider>
                  </LocalizationProvider>
                </ThemeProvider>
              </ReduxProvider>
            </ApiProvider>
            <ReactQueryDevtools initialIsOpen={false} />
          </QueryClientProvider>
        </Auth0ProviderWithRedirectCallback>
      </BrowserRouter>
    </PostHogProvider>,
  )
}

main()
