import 'reflect-metadata'

import { CssBaseline, ThemeProvider } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { LDProvider } from 'launchdarkly-react-client-sdk'
import { NuqsAdapter } from 'nuqs/adapters/react-router/v7'
import * as ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import { Provider as ReduxProvider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'

import { App } from './App'
import { ScrollToTop } from './components/common/ScrollToTop'
import { ApiProvider } from './context/ApiContext'
import { store } from './core'
import { AxiosInterceptor } from './core/router/AxiosInterceptor'
import { environment } from './environment'
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
              <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale="fr">
                <BrowserRouter>
                  <NuqsAdapter>
                    <ScrollToTop />
                    <AxiosInterceptor />
                    <GoogleOAuthProvider clientId={environment.googleClientId}>
                      <App />
                    </GoogleOAuthProvider>
                  </NuqsAdapter>
                </BrowserRouter>
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
