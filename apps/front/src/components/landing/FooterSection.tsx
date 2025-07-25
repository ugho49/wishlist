import { Box, Stack, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import { Link } from 'react-router-dom'

const FooterContainer = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.primary.dark,
  color: 'white',
  padding: theme.spacing(2, 0),
  gap: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
}))

const FooterLinkItem = styled(Typography)(() => ({
  color: '#d1d5db',
  textDecoration: 'none',
  cursor: 'pointer',
  transition: 'color 0.3s ease',
  '&:hover': {
    color: 'white',
  },
  '& a': {
    color: 'inherit',
    textDecoration: 'none',
  },
}))

export const FooterSection = () => {
  return (
    <FooterContainer>
      <Stack direction="row" spacing={3} justifyContent="center" alignItems="center">
        <FooterLinkItem variant="body2">
          <Link to="/privacy">Confidentialité</Link>
        </FooterLinkItem>
        <FooterLinkItem variant="body2">
          <Link to="/terms">Conditions</Link>
        </FooterLinkItem>
      </Stack>
      <Typography variant="body2" color="grey.400" textAlign="center">
        © {new Date().getFullYear()} Wishlist. Tous droits réservés.
      </Typography>
    </FooterContainer>
  )
}
