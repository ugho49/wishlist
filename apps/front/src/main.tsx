import 'reflect-metadata';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider as ReduxProvider } from 'react-redux';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { store } from './core';
import { ApiProvider } from './context/ApiContext';
import { App } from './App';
import { theme } from './theme';
import { AxiosInterceptor } from './core/router/AxiosInterceptor';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { SnackbarProvider } from 'notistack';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { environment } from './environment';
import { ApiClient } from '@wishlist/api-client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

function main() {
  const needRedirect =
    window.location.hostname === 'wishlist-stephan.web.app' ||
    window.location.hostname === 'wishlist-stephan.firebaseapp.com';

  if (needRedirect) {
    window.location.href = 'https://wishlistapp.fr';
    return;
  }

  const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
      },
      mutations: {
        retry: false,
      },
    },
  });
  const api = new ApiClient({
    baseURL: environment.baseUrl,
    timeoutInMs: 10_000, // 10 seconds
  });

  root.render(
    <QueryClientProvider client={queryClient}>
      <ApiProvider api={api}>
        <ReduxProvider store={store}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale="fr">
              <BrowserRouter>
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
              </BrowserRouter>
            </LocalizationProvider>
          </ThemeProvider>
        </ReduxProvider>
      </ApiProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>,
  );
}

main();
