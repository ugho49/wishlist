import * as ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { ApiProvider } from '@wishlist/common-front';
import { apis, store } from './core';
import { App } from './App';
import { theme } from './theme';
import { AxiosInterceptor } from './core/router/AxiosInterceptor';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { SnackbarProvider } from 'notistack';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <ApiProvider apis={apis}>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale="fr">
          <BrowserRouter>
            <SnackbarProvider
              maxSnack={3}
              autoHideDuration={3_000}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              preventDuplicate
            >
              <AxiosInterceptor />
              <App />
            </SnackbarProvider>
          </BrowserRouter>
        </LocalizationProvider>
      </ThemeProvider>
    </Provider>
  </ApiProvider>
);
