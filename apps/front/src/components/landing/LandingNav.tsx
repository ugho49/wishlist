import type { Theme } from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import {
  AppBar,
  alpha,
  Button,
  Drawer,
  drawerClasses,
  GlobalStyles,
  IconButton,
  styled,
  useMediaQuery,
  useScrollTrigger,
} from '@mui/material';
import { createLink } from '@tanstack/react-router';
import clsx from 'clsx';
import { useEffect, useState } from 'react';

import { brandColors } from '../../theme';
import { Logo } from '../common/Logo';

const NAV_BORDER = '#E3ECEF';

const MENU_ID = 'landing-menu';

/** Anchors to the landing sections; each section sets `scrollMarginTop` so it lands below this bar. */
const SECTION_LINKS = [
  { href: '#comment-ca-marche', label: 'Comment ça marche' },
  { href: '#features', label: 'Fonctionnalités' },
  { href: '#secret-santa', label: 'Secret Santa' },
  { href: '#faq', label: 'FAQ' },
] as const;

// The anchors scroll smoothly, unless the visitor asked for reduced motion. Scoped to the landing:
// the global style goes away with the page.
const smoothScrollStyles = {
  '@media (prefers-reduced-motion: no-preference)': {
    html: { scrollBehavior: 'smooth' },
  },
} as const;

/** MUI button rendered as a router link: a real <a href>, so it opens in a new tab like any link. */
const ButtonLink = createLink(Button);

const NavBarStyled = styled(AppBar)(({ theme }) => ({
  color: theme.palette.primary.main,
  backgroundColor: alpha(theme.palette.common.white, 0.9),
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  boxShadow: 'none',
  // Bottom border shown once the page scrolls (opacity only, so it fades without repainting the bar)
  '&::after': {
    content: '""',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 1,
    backgroundColor: NAV_BORDER,
    opacity: 0,
    transition: 'opacity 200ms ease',
  },
  '&.scrolled::after': {
    opacity: 1,
  },
  '@media (prefers-reduced-motion: reduce)': {
    '&::after': {
      transition: 'none',
    },
  },
}));

// Same width and gutters as a Container lg, on a <nav> element
const NavInner = styled('nav')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  boxSizing: 'border-box',
  width: '100%',
  maxWidth: theme.breakpoints.values.lg,
  height: 56,
  marginInline: 'auto',
  paddingInline: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    height: 64,
    paddingInline: theme.spacing(3),
  },
}));

const BrandLink = styled('a')(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  flexShrink: 0,
  borderRadius: 6,
  '&:focus-visible': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: 4,
  },
}));

const NavLinkList = styled('ul')(({ theme }) => ({
  display: 'none',
  [theme.breakpoints.up('md')]: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(3),
    margin: 0,
    marginLeft: 'auto',
    padding: 0,
    listStyle: 'none',
  },
  [theme.breakpoints.up('lg')]: {
    gap: theme.spacing(4),
  },
}));

const NavAnchor = styled('a')(({ theme }) => ({
  position: 'relative',
  display: 'inline-block',
  padding: theme.spacing(1, 0),
  borderRadius: 4,
  fontSize: 15,
  fontWeight: 500,
  lineHeight: 1.4,
  whiteSpace: 'nowrap',
  textDecoration: 'none',
  color: alpha(theme.palette.primary.main, 0.8),
  // Mist underline drawn from the left on hover
  '&::after': {
    content: '""',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: brandColors.mist,
    transform: 'scaleX(0)',
    transformOrigin: 'left',
    transition: 'transform 200ms ease',
  },
  '&:hover, &:focus-visible': {
    color: theme.palette.primary.main,
  },
  '&:hover::after, &:focus-visible::after': {
    transform: 'scaleX(1)',
  },
  '&:focus-visible': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: 4,
  },
  '@media (prefers-reduced-motion: reduce)': {
    '&::after': {
      transition: 'none',
    },
  },
}));

const NavActions = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  marginLeft: 'auto',
  [theme.breakpoints.up('md')]: {
    gap: theme.spacing(1),
    marginLeft: theme.spacing(3),
  },
}));

const LoginButtonStyled = styled(Button)({
  padding: '6px 12px',
  fontWeight: 600,
  whiteSpace: 'nowrap',
});

const LoginButtonLink = createLink(LoginButtonStyled);

const SignUpButtonStyled = styled(Button)(({ theme }) => ({
  display: 'none',
  padding: '6px 16px',
  fontWeight: 600,
  whiteSpace: 'nowrap',
  [theme.breakpoints.up('md')]: {
    display: 'inline-flex',
  },
}));

const SignUpButtonLink = createLink(SignUpButtonStyled);

const MenuButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.primary.main,
  [theme.breakpoints.up('md')]: {
    display: 'none',
  },
}));

const MenuDrawer = styled(Drawer)(({ theme }) => ({
  [`& .${drawerClasses.paper}`]: {
    gap: theme.spacing(1),
    padding: theme.spacing(0, 2, 3),
    backgroundColor: theme.palette.common.white,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  height: 56,
  [theme.breakpoints.up('sm')]: {
    height: 64,
  },
}));

const DrawerLinkList = styled('ul')(({ theme }) => ({
  margin: theme.spacing(0, 0, 2),
  padding: 0,
  listStyle: 'none',
}));

const DrawerLink = styled('a')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  minHeight: 48,
  borderBottom: `1px solid ${NAV_BORDER}`,
  fontSize: 16,
  fontWeight: 500,
  textDecoration: 'none',
  color: theme.palette.primary.main,
  '&:focus-visible': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: -2,
    borderRadius: 4,
  },
}));

const isDesktopQuery = (theme: Theme) => theme.breakpoints.up('md');
const isPhoneQuery = (theme: Theme) => theme.breakpoints.down('sm');

/** Sticky white bar of the landing page: wordmark, section anchors, sign in and sign up. */
export const LandingNav = () => {
  const isDesktop = useMediaQuery(isDesktopQuery, { noSsr: true });
  const isPhone = useMediaQuery(isPhoneQuery, { noSsr: true });
  const scrolled = useScrollTrigger({ disableHysteresis: true, threshold: 8 });
  const [menuOpen, setMenuOpen] = useState(false);

  const openMenu = () => setMenuOpen(true);
  const closeMenu = () => setMenuOpen(false);

  // The drawer only exists below md: close the menu once the window grows past it, so it does not
  // reopen by itself when the window shrinks again.
  useEffect(() => {
    if (isDesktop) setMenuOpen(false);
  }, [isDesktop]);

  return (
    <>
      <GlobalStyles styles={smoothScrollStyles} />

      <NavBarStyled position="sticky" elevation={0} color="transparent" className={clsx(scrolled && 'scrolled')}>
        <NavInner aria-label="Navigation principale">
          <BrandLink href="#top">
            <Logo variant="wordmark" tone="light" height={isPhone ? 26 : 30} />
          </BrandLink>

          <NavLinkList>
            {SECTION_LINKS.map(link => (
              <li key={link.href}>
                <NavAnchor href={link.href}>{link.label}</NavAnchor>
              </li>
            ))}
          </NavLinkList>

          <NavActions>
            <LoginButtonLink to="/login">Connexion</LoginButtonLink>
            <SignUpButtonLink to="/register" variant="contained" size="small" disableElevation>
              Créer ma liste
            </SignUpButtonLink>
            <MenuButton
              aria-label="Ouvrir le menu"
              aria-haspopup="dialog"
              aria-expanded={menuOpen}
              aria-controls={MENU_ID}
              onClick={openMenu}
            >
              <MenuIcon />
            </MenuButton>
          </NavActions>
        </NavInner>
      </NavBarStyled>

      <MenuDrawer
        anchor="top"
        open={menuOpen && !isDesktop}
        onClose={closeMenu}
        slotProps={{ paper: { id: MENU_ID, role: 'dialog', 'aria-modal': true, 'aria-label': 'Menu' } }}
      >
        <DrawerHeader>
          <Logo variant="wordmark" tone="light" height={26} />
          <IconButton aria-label="Fermer le menu" color="primary" onClick={closeMenu}>
            <CloseIcon />
          </IconButton>
        </DrawerHeader>

        <nav aria-label="Sections de la page">
          <DrawerLinkList>
            {SECTION_LINKS.map(link => (
              <li key={link.href}>
                <DrawerLink href={link.href} onClick={closeMenu}>
                  {link.label}
                </DrawerLink>
              </li>
            ))}
          </DrawerLinkList>
        </nav>

        <ButtonLink to="/register" variant="contained" size="large" fullWidth disableElevation>
          Créer ma liste
        </ButtonLink>
        <ButtonLink to="/login" size="large" fullWidth>
          J'ai déjà un compte
        </ButtonLink>
      </MenuDrawer>
    </>
  );
};
