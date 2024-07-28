import { createTheme } from '@mui/material/styles'

// A custom theme for this app
export const theme = createTheme({
  palette: {
    mode: 'light',
    text: {
      secondary: '#4e4e4e',
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    },
    primary: {
      main: '#255376',
    },
    secondary: {
      main: '#ffd21c',
    },
  },
  shape: {
    borderRadius: 4,
  },
})
