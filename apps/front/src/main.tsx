import * as ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { ApiProvider } from '@wishlist/common-front';
import { apis, store } from './core';
import { App } from './App';
import { theme } from './theme';
import { AxiosInterceptor } from './core/router/AxiosInterceptor';
import './styles.scss';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <ApiProvider apis={apis}>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LocalizationProvider dateAdapter={AdapterLuxon} adapterLocale="fr">
          <BrowserRouter>
            <AxiosInterceptor />
            <App />
          </BrowserRouter>
        </LocalizationProvider>
      </ThemeProvider>
    </Provider>
  </ApiProvider>
);
