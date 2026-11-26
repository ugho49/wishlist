import { createTheme } from '@mui/material/styles';

/** Colors of the genie logo (`src/assets/logo`). */
export const brandColors = {
  navy: '#255376',
  mist: '#BFD4D7',
  mistLight: '#E8F0F2',
} as const;

const headingFontFamily = '"Fredoka", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

// Navy-dominant theme built around the genie logo: navy for text and actions,
// its blue-grey "mist" for soft surfaces, Fredoka for headings.
export const theme = createTheme({
  palette: {
    mode: 'light',
    text: {
      primary: '#1f2937', // Dark gray for primary text
      secondary: '#6b7280', // Medium gray for secondary text
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    primary: {
      main: brandColors.navy,
    },
    secondary: {
      main: '#64748b', // Slate gray
      light: '#94a3b8',
      dark: '#475569',
    },
    grey: {
      // 50/100 are tinted with the logo blue-grey so soft surfaces echo the genie
      50: '#f6f9fa',
      100: '#eef3f5',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
  },
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontFamily: headingFontFamily,
      fontWeight: 600,
    },
    h2: {
      fontFamily: headingFontFamily,
      fontWeight: 600,
    },
    h3: {
      fontFamily: headingFontFamily,
      fontWeight: 600,
    },
    h4: {
      fontFamily: headingFontFamily,
      fontWeight: 600,
    },
    h5: {
      fontFamily: headingFontFamily,
      fontWeight: 600,
    },
    h6: {
      fontFamily: headingFontFamily,
      fontWeight: 600,
    },
    button: {
      fontWeight: 500,
      textTransform: 'none',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '10px 20px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(37, 83, 118, 0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
          '&:hover': {
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '&:hover fieldset': {
              borderColor: brandColors.navy,
            },
          },
        },
      },
    },
  },
});
