import { styled, Tabs } from '@mui/material';

export const AdminTabs = styled(Tabs)(({ theme }) => ({
  minHeight: 44,
  marginBottom: theme.spacing(3),
  borderBottom: `1px solid ${theme.palette.grey[200]}`,
  '& .MuiTab-root': {
    minHeight: 44,
    textTransform: 'none',
    fontWeight: 500,
  },
}));
