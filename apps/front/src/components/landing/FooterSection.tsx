import { Container, styled } from '@mui/material';
import { Link } from '@tanstack/react-router';

import { Logo } from '../common/Logo';

const DIVIDER_COLOR = '#E3ECEF';

const FooterStyled = styled('footer')(({ theme }) => ({
  borderTop: `1px solid ${DIVIDER_COLOR}`,
  backgroundColor: theme.palette.common.white,
}));

const FooterContentStyled = styled(Container)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(3),
  paddingTop: theme.spacing(5),
  paddingBottom: theme.spacing(5),
  textAlign: 'center',
  [theme.breakpoints.up('md')]: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: theme.spacing(2),
    textAlign: 'left',
  },
}));

const FooterBrandStyled = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(1),
  [theme.breakpoints.up('md')]: {
    flexDirection: 'row',
    gap: theme.spacing(2),
  },
}));

const TaglineStyled = styled('p')(({ theme }) => ({
  margin: 0,
  fontSize: 14,
  color: theme.palette.text.secondary,
}));

const FooterLinksStyled = styled('ul')(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  gap: theme.spacing(0.5, 2),
  margin: 0,
  padding: 0,
  listStyle: 'none',
  '& a': {
    display: 'inline-block',
    padding: theme.spacing(0.75, 0.5),
    fontSize: 14,
    color: theme.palette.text.secondary,
    textDecoration: 'none',
    borderRadius: 4,
    transition: theme.transitions.create('color', { duration: theme.transitions.duration.shorter }),
    '&:hover': {
      color: theme.palette.primary.main,
    },
    '&:focus-visible': {
      color: theme.palette.primary.main,
      outline: `2px solid ${theme.palette.primary.main}`,
      outlineOffset: 2,
    },
  },
}));

const CopyrightStyled = styled('p')(({ theme }) => ({
  margin: 0,
  fontSize: 13,
  color: theme.palette.grey[500],
  [theme.breakpoints.up('md')]: {
    flexBasis: '100%',
  },
}));

export const FooterSection = () => (
  <FooterStyled>
    <FooterContentStyled maxWidth="lg">
      <FooterBrandStyled>
        <Logo variant="wordmark" tone="light" height={24} />
        <TaglineStyled>Les listes de souhaits qui gardent la surprise.</TaglineStyled>
      </FooterBrandStyled>

      <nav aria-label="Liens du pied de page">
        <FooterLinksStyled>
          <li>
            <a href="#comment-ca-marche">Comment ça marche</a>
          </li>
          <li>
            <a href="#faq">FAQ</a>
          </li>
          <li>
            <Link to="/privacy">Confidentialité</Link>
          </li>
          <li>
            <Link to="/terms">Conditions</Link>
          </li>
          <li>
            <a href="mailto:contact@wishlistapp.fr">Contact</a>
          </li>
        </FooterLinksStyled>
      </nav>

      <CopyrightStyled>© {new Date().getFullYear()} Wishlist</CopyrightStyled>
    </FooterContentStyled>
  </FooterStyled>
);
