import { Tab, Tabs } from '@mui/material'
import { styled } from '@mui/material/styles'

export const StyledTabs = styled(Tabs)(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: '12px',
  padding: theme.spacing(1),
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
  '& .MuiTabs-scroller': {
    borderBottom: 'none',
  },
  '& .MuiTabs-indicator': {
    height: '100%',
    borderRadius: '8px',
    backgroundColor: theme.palette.primary.main + '10',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    zIndex: 0,
  },
}))

export const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 500,
  fontSize: '0.95rem',
  minHeight: '48px',
  marginRight: theme.spacing(1.5),
  borderRadius: '8px',
  transition: 'all 0.2s ease',
  color: theme.palette.text.secondary,
  position: 'relative',
  zIndex: 1,
  '&:last-child': {
    marginRight: 0,
  },
  '&.Mui-selected': {
    color: theme.palette.primary.main,
    fontWeight: 600,
  },
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  [theme.breakpoints.down('sm')]: {
    minWidth: 'auto',
    fontSize: '0.875rem',
    marginRight: theme.spacing(1),
  },
}))
