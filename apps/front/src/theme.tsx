import { red } from '@mui/material/colors';
import { createTheme } from '@mui/material/styles';

// A custom theme for this app
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#146551',
    },
    secondary: {
      main: '#007566',
    },
    error: {
      main: red.A400,
    },
  },
});
