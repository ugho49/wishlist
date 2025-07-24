import { Box, Button, Chip, Container, Fade, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useState } from 'react'

const FeaturesContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(12, 0),
  backgroundColor: '#fafafa',
  position: 'relative',
}))

const SectionTitle = styled(Typography)(({ theme }) => ({
  textAlign: 'center',
  marginBottom: theme.spacing(3),
  fontSize: '3rem',
  fontWeight: 700,
  color: theme.palette.text.primary,
  [theme.breakpoints.down('md')]: {
    fontSize: '2.5rem',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '2rem',
  },
}))

const SectionSubtitle = styled(Typography)(({ theme }) => ({
  textAlign: 'center',
  fontSize: '1.25rem',
  color: theme.palette.text.secondary,
  maxWidth: '600px',
  margin: `0 auto ${theme.spacing(10)}`,
  [theme.breakpoints.down('md')]: {
    fontSize: '1.1rem',
    margin: `0 auto ${theme.spacing(8)}`,
  },
}))

const FeaturesGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: theme.spacing(4),
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: theme.spacing(3),
  },
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
    gap: theme.spacing(3),
  },
}))

const FeatureCard = styled(Box)(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: theme.spacing(2),
  padding: theme.spacing(4),
  boxShadow: '0 2px 20px rgba(0, 0, 0, 0.06)',
  transition: 'all 0.3s ease',
  border: '1px solid rgba(0, 0, 0, 0.05)',
  position: 'relative',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 40px rgba(0, 0, 0, 0.12)',
  },
}))

const FeatureIconWrapper = styled(Box)(({ theme }) => ({
  width: 64,
  height: 64,
  borderRadius: theme.spacing(1.5),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(3),
  fontSize: '2rem',
}))

const FeatureTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '1.25rem',
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(2),
}))

const FeatureDescription = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  lineHeight: 1.6,
  fontSize: '0.95rem',
}))

const BadgeChip = styled(Chip)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  right: theme.spacing(2),
  fontSize: '0.75rem',
  height: 24,
  fontWeight: 600,
}))

const PopularBadge = styled(BadgeChip)(() => ({
  backgroundColor: '#fef3c7',
  color: '#d97706',
  border: '1px solid #fcd34d',
}))

const NewBadge = styled(BadgeChip)(() => ({
  backgroundColor: '#dcfce7',
  color: '#16a34a',
  border: '1px solid #86efac',
}))

const EssentialBadge = styled(BadgeChip)(() => ({
  backgroundColor: '#fce7f3',
  color: '#be185d',
  border: '1px solid #f9a8d4',
}))

const ProBadge = styled(BadgeChip)(() => ({
  backgroundColor: '#e0e7ff',
  color: '#4338ca',
  border: '1px solid #a5b4fc',
}))

const ComingSoonBadge = styled(BadgeChip)(() => ({
  backgroundColor: '#f3e8ff',
  color: '#7c3aed',
  border: '1px solid #c4b5fd',
}))

const ShowMoreButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(6),
  padding: theme.spacing(1.5, 4),
  borderRadius: theme.spacing(3),
  fontSize: '1rem',
  fontWeight: 600,
  textTransform: 'none',
  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
  color: 'white',
  boxShadow: '0 4px 20px rgba(59, 130, 246, 0.25)',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 30px rgba(59, 130, 246, 0.35)',
  },
  '&:active': {
    transform: 'translateY(0)',
  },
}))

const ShowMoreContainer = styled(Box)(() => ({
  display: 'flex',
  justifyContent: 'center',
  width: '100%',
}))

interface Feature {
  icon: string
  title: string
  description: string
  iconBg: string
  badge?: 'Populaire' | 'Nouveau' | 'Essentiel' | 'Pro' | 'Bientôt'
  priority?: number // pour l'ordre d'affichage
}

const features: Feature[] = [
  {
    icon: '🎁',
    title: 'Listes de souhaits intelligentes',
    description: 'Créez et organisez vos souhaits par priorités',
    iconBg: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    badge: 'Populaire',
    priority: 1,
  },
  {
    icon: '📅',
    title: "Gestion d'événements",
    description: 'Organisez anniversaires, mariages, Noël et tous vos moments spéciaux.',
    iconBg: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
    priority: 2,
  },
  {
    icon: '👨‍👩‍👧‍👦',
    title: 'Partage familial',
    description: 'Invitez famille et amis à consulter vos listes et partager les leurs.',
    iconBg: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
    badge: 'Essentiel',
    priority: 3,
  },
  {
    icon: '🎅🏻',
    title: 'Secret Santa',
    description: 'Organisez un Secret Santa avec vos proches pour vos Noël',
    iconBg: 'linear-gradient(135deg, #22c55e 0%, #ef4444 100%)',
    badge: 'Nouveau',
    priority: 4,
  },
  {
    icon: '🐣',
    title: 'Listes de proches et enfants',
    description: 'Gérez la liste de vos proches et enfants',
    iconBg: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
    badge: 'Populaire',
    priority: 5,
  },
  {
    icon: '🔒',
    title: 'Confidentialité garantie',
    description: 'Contrôlez qui peut voir vos listes avec des paramètres de confidentialité avancés.',
    iconBg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    priority: 6,
  },
  {
    icon: '🔔',
    title: 'Notifications intelligentes',
    description: 'Recevez des rappels pour les événements importants de vos proches.',
    iconBg: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
  },
  {
    icon: '💝',
    title: 'Favoris et recommandations',
    description: 'Découvrez des idées cadeaux basées sur les goûts de vos proches.',
    iconBg: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
  },
  {
    icon: '🔗',
    title: 'Listes partagée',
    description: 'Partagez vos listes sur différents événements',
    iconBg: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
  },
  {
    icon: '⚡',
    title: 'Synchronisation temps réel',
    description: 'Mises à jour instantanées pour tous les membres de la famille.',
    iconBg: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
  },
]

const getBadgeComponent = (badge: Feature['badge']) => {
  switch (badge) {
    case 'Populaire':
      return <PopularBadge label="Populaire" size="small" />
    case 'Nouveau':
      return <NewBadge label="Nouveau" size="small" />
    case 'Essentiel':
      return <EssentialBadge label="Essentiel" size="small" />
    case 'Pro':
      return <ProBadge label="Pro" size="small" />
    case 'Bientôt':
      return <ComingSoonBadge label="Bientôt" size="small" />
    default:
      return null
  }
}

export const FeaturesGridSection = () => {
  const [showAll, setShowAll] = useState(false)

  // Nombre de features à afficher initialement
  const INITIAL_FEATURES_COUNT = 6

  // Séparer les features prioritaires et les autres
  const sortedFeatures = [...features].sort((a, b) => {
    if (a.priority && b.priority) return a.priority - b.priority
    if (a.priority) return -1
    if (b.priority) return 1
    return 0
  })

  const displayedFeatures = showAll ? sortedFeatures : sortedFeatures.slice(0, INITIAL_FEATURES_COUNT)
  const hasMoreFeatures = sortedFeatures.length > INITIAL_FEATURES_COUNT

  const handleToggle = () => {
    if (showAll) {
      // Smooth scroll vers le haut de la section quand on réduit
      const featuresSection = document.getElementById('features')
      if (featuresSection) {
        featuresSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
    setShowAll(!showAll)
  }

  return (
    <FeaturesContainer id="features">
      <Container maxWidth="lg">
        <SectionTitle>
          Tout ce dont vous avez besoin pour{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #3d7ea8 0%, #60a5fa 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            des moments parfaits
          </span>
        </SectionTitle>

        <SectionSubtitle>
          Découvrez toutes les fonctionnalités qui rendent WishList unique pour organiser vos événements et partager vos
          souhaits en toute simplicité.
        </SectionSubtitle>

        <FeaturesGrid>
          {displayedFeatures.map((feature, index) => (
            <Fade
              key={index}
              in={true}
              timeout={showAll && index >= INITIAL_FEATURES_COUNT ? 800 + (index - INITIAL_FEATURES_COUNT) * 100 : 0}
            >
              <FeatureCard>
                {feature.badge && getBadgeComponent(feature.badge)}

                <FeatureIconWrapper style={{ background: feature.iconBg }}>{feature.icon}</FeatureIconWrapper>

                <FeatureTitle>{feature.title}</FeatureTitle>
                <FeatureDescription>{feature.description}</FeatureDescription>
              </FeatureCard>
            </Fade>
          ))}
        </FeaturesGrid>

        {hasMoreFeatures && (
          <ShowMoreContainer>
            <ShowMoreButton
              onClick={handleToggle}
              endIcon={
                <span
                  style={{
                    fontSize: '1.2rem',
                    transition: 'transform 0.3s ease',
                    transform: showAll ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                >
                  ↓
                </span>
              }
            >
              {showAll ? 'Voir moins' : `Voir ${sortedFeatures.length - INITIAL_FEATURES_COUNT} autres fonctionnalités`}
            </ShowMoreButton>
          </ShowMoreContainer>
        )}
      </Container>
    </FeaturesContainer>
  )
}
