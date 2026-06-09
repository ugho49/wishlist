import type { ButtonProps } from '@mui/material'
import type { LinkProps } from '@tanstack/react-router'

import { CalendarMonthRounded, RedeemRounded, ShuffleRounded } from '@mui/icons-material'
import { Box, Button, Container, Typography } from '@mui/material'
import { keyframes, styled } from '@mui/material/styles'
import { Link } from '@tanstack/react-router'

import { landingTokens } from './landing.tokens'

const fadeUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const HeroContainer = styled(Box)(() => ({
  backgroundColor: landingTokens.paper,
  backgroundImage: `radial-gradient(ellipse 60% 50% at 85% 10%, ${landingTokens.blueTint} 0%, transparent 70%)`,
  position: 'relative',
  overflow: 'hidden',
}))

const ContentWrapper = styled(Container)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1.05fr 0.95fr',
  gap: theme.spacing(10),
  alignItems: 'center',
  paddingTop: theme.spacing(12),
  paddingBottom: theme.spacing(14),
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
    gap: theme.spacing(8),
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(10),
  },
}))

const MainContent = styled(Box)(({ theme }) => ({
  '& > *': {
    animation: `${fadeUp} 0.7s ease both`,
  },
  '& > *:nth-of-type(2)': { animationDelay: '0.1s' },
  '& > *:nth-of-type(3)': { animationDelay: '0.2s' },
  '& > *:nth-of-type(4)': { animationDelay: '0.3s' },
  '& > *:nth-of-type(5)': { animationDelay: '0.4s' },
  '@media (prefers-reduced-motion: reduce)': {
    '& > *': { animation: 'none' },
  },
  [theme.breakpoints.down('md')]: {
    textAlign: 'center',
  },
}))

const Kicker = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  marginBottom: theme.spacing(3),
  [theme.breakpoints.down('md')]: {
    justifyContent: 'center',
  },
}))

const KickerRule = styled(Box)(() => ({
  width: 28,
  height: 1,
  backgroundColor: landingTokens.accent,
}))

const KickerText = styled(Typography)(() => ({
  color: landingTokens.accent,
  fontSize: '0.8rem',
  fontWeight: 600,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
}))

const HeroTitle = styled(Typography)(({ theme }) => ({
  fontFamily: landingTokens.displayFont,
  fontWeight: 500,
  fontSize: 'clamp(2.5rem, 5vw, 4rem)',
  lineHeight: 1.12,
  letterSpacing: '-0.02em',
  color: landingTokens.ink,
  marginBottom: theme.spacing(3),
  '& em': {
    fontStyle: 'italic',
    color: theme.palette.primary.main,
  },
}))

const Subtitle = styled(Typography)(({ theme }) => ({
  color: landingTokens.inkMuted,
  fontSize: '1.15rem',
  lineHeight: 1.7,
  marginBottom: theme.spacing(5),
  maxWidth: 480,
  [theme.breakpoints.down('md')]: {
    margin: `0 auto ${theme.spacing(5)}`,
  },
}))

const ButtonGroup = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
  [theme.breakpoints.down('md')]: {
    justifyContent: 'center',
  },
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
  },
}))

const PrimaryButton = styled(Button)<ButtonProps & LinkProps>(({ theme }) => ({
  fontWeight: 600,
  fontSize: '1.05rem',
  padding: theme.spacing(1.5, 4),
  boxShadow: '0 8px 24px -8px rgba(37, 83, 118, 0.5)',
  '&:hover': {
    boxShadow: '0 12px 28px -8px rgba(37, 83, 118, 0.55)',
    transform: 'translateY(-1px)',
  },
}))

const SecondaryButton = styled(Button)<ButtonProps & LinkProps>(({ theme }) => ({
  fontWeight: 600,
  fontSize: '1.05rem',
  padding: theme.spacing(1.5, 4),
  color: landingTokens.ink,
  borderColor: landingTokens.hairline,
  backgroundColor: landingTokens.surface,
  '&:hover': {
    borderColor: landingTokens.ink,
    backgroundColor: landingTokens.surface,
  },
}))

const TrustLine = styled(Typography)(() => ({
  color: landingTokens.inkMuted,
  fontSize: '0.85rem',
}))

// --- Product mock ---------------------------------------------------------

const MockArea = styled(Box)(({ theme }) => ({
  position: 'relative',
  animation: `${fadeUp} 0.7s ease 0.25s both`,
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none',
  },
  [theme.breakpoints.down('md')]: {
    maxWidth: 440,
    margin: '0 auto',
    width: '100%',
  },
}))

const BackCard = styled(Box)(({ theme }) => ({
  position: 'absolute',
  inset: theme.spacing(3, -2, -3, 2),
  backgroundColor: landingTokens.surface,
  border: `1px solid ${landingTokens.hairline}`,
  borderRadius: theme.spacing(2.5),
  transform: 'rotate(3deg)',
  opacity: 0.7,
}))

const MainCard = styled(Box)(({ theme }) => ({
  position: 'relative',
  backgroundColor: landingTokens.surface,
  border: `1px solid ${landingTokens.hairline}`,
  borderRadius: theme.spacing(2.5),
  padding: theme.spacing(3.5),
  boxShadow: '0 32px 64px -32px rgba(28, 43, 54, 0.3)',
}))

const CardHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  paddingBottom: theme.spacing(2.5),
  borderBottom: `1px solid ${landingTokens.hairline}`,
}))

const IconChip = styled(Box)(({ theme }) => ({
  width: 44,
  height: 44,
  borderRadius: theme.spacing(1.5),
  backgroundColor: landingTokens.blueTint,
  color: theme.palette.primary.main,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
}))

const CardHeaderText = styled(Box)(() => ({
  flex: 1,
  minWidth: 0,
}))

const EventTitle = styled(Typography)(() => ({
  fontWeight: 600,
  color: landingTokens.ink,
  fontSize: '1.05rem',
  lineHeight: 1.3,
}))

const EventMeta = styled(Typography)(() => ({
  color: landingTokens.inkMuted,
  fontSize: '0.85rem',
}))

const AvatarRow = styled(Box)(() => ({
  display: 'flex',
  '& > *:not(:first-of-type)': {
    marginLeft: -8,
  },
}))

const InitialAvatar = styled(Box, {
  shouldForwardProp: prop => prop !== 'bg' && prop !== 'fg',
})<{ bg: string; fg: string }>(({ bg, fg }) => ({
  width: 30,
  height: 30,
  borderRadius: '50%',
  backgroundColor: bg,
  color: fg,
  border: `2px solid ${landingTokens.surface}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.7rem',
  fontWeight: 600,
}))

const ItemRow = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.75),
  padding: theme.spacing(2, 0),
  '&:not(:last-of-type)': {
    borderBottom: `1px solid ${landingTokens.hairline}`,
  },
}))

const ItemIcon = styled(Box)(({ theme }) => ({
  width: 34,
  height: 34,
  borderRadius: theme.spacing(1),
  backgroundColor: landingTokens.paper,
  color: landingTokens.inkMuted,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
}))

const ItemName = styled(Typography)(() => ({
  flex: 1,
  fontWeight: 500,
  fontSize: '0.95rem',
  color: landingTokens.ink,
}))

const StatusChip = styled(Box, {
  shouldForwardProp: prop => prop !== 'reserved',
})<{ reserved?: boolean }>(({ reserved }) => ({
  padding: '3px 12px',
  borderRadius: 999,
  fontSize: '0.75rem',
  fontWeight: 600,
  whiteSpace: 'nowrap',
  ...(reserved
    ? { backgroundColor: '#e7f2eb', color: '#2f7a52' }
    : { border: `1px solid ${landingTokens.hairline}`, color: landingTokens.inkMuted }),
}))

const FloatingBadge = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(-2.5),
  right: theme.spacing(-1.5),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  backgroundColor: landingTokens.surface,
  border: `1px solid ${landingTokens.hairline}`,
  borderRadius: 999,
  padding: theme.spacing(1, 2),
  boxShadow: '0 12px 24px -12px rgba(28, 43, 54, 0.25)',
  transform: 'rotate(2deg)',
  zIndex: 1,
  [theme.breakpoints.down('sm')]: {
    right: theme.spacing(0.5),
  },
}))

const FloatingBadgeText = styled(Typography)(() => ({
  fontSize: '0.8rem',
  fontWeight: 600,
  color: landingTokens.ink,
}))

const mockItems = [
  { name: 'Machine à expresso', reserved: true },
  { name: 'Plaid en laine mérinos', reserved: true },
  { name: 'Coffret de thés verts', reserved: false },
]

const mockAvatars = [
  { initials: 'CL', bg: '#edf2f6', fg: '#255376' },
  { initials: 'MA', bg: '#f3eee4', fg: '#a87b2d' },
  { initials: 'JD', bg: '#e7f2eb', fg: '#2f7a52' },
]

export const HeroSection = () => {
  return (
    <HeroContainer>
      <ContentWrapper maxWidth="lg">
        <MainContent>
          <Kicker>
            <KickerRule />
            <KickerText>Listes de souhaits partagées</KickerText>
          </Kicker>

          <HeroTitle variant="h1">
            Le bon cadeau,
            <br />à <em>chaque</em> occasion.
          </HeroTitle>

          <Subtitle>
            Créez vos listes de souhaits, partagez-les avec vos proches et réservez les cadeaux en toute discrétion.
            Anniversaires, Noël, mariages — tout au même endroit.
          </Subtitle>

          <ButtonGroup>
            <PrimaryButton variant="contained" size="large" component={Link} to="/register">
              Créer ma liste gratuitement
            </PrimaryButton>
            <SecondaryButton variant="outlined" size="large" component={Link} to="/login">
              Se connecter
            </SecondaryButton>
          </ButtonGroup>

          <TrustLine>Gratuit · Réservations discrètes · Secret Santa intégré</TrustLine>
        </MainContent>

        <MockArea aria-hidden="true">
          <BackCard />
          <FloatingBadge>
            <ShuffleRounded sx={{ fontSize: 18, color: 'primary.main' }} />
            <FloatingBadgeText>Secret Santa · tirage effectué</FloatingBadgeText>
          </FloatingBadge>
          <MainCard>
            <CardHeader>
              <IconChip>
                <CalendarMonthRounded fontSize="small" />
              </IconChip>
              <CardHeaderText>
                <EventTitle>Noël en famille</EventTitle>
                <EventMeta>25 décembre · 8 participants</EventMeta>
              </CardHeaderText>
              <AvatarRow>
                {mockAvatars.map(avatar => (
                  <InitialAvatar key={avatar.initials} bg={avatar.bg} fg={avatar.fg}>
                    {avatar.initials}
                  </InitialAvatar>
                ))}
              </AvatarRow>
            </CardHeader>

            <Box>
              {mockItems.map(item => (
                <ItemRow key={item.name}>
                  <ItemIcon>
                    <RedeemRounded sx={{ fontSize: 18 }} />
                  </ItemIcon>
                  <ItemName>{item.name}</ItemName>
                  <StatusChip reserved={item.reserved}>{item.reserved ? 'Réservé' : 'Disponible'}</StatusChip>
                </ItemRow>
              ))}
            </Box>
          </MainCard>
        </MockArea>
      </ContentWrapper>
    </HeroContainer>
  )
}
