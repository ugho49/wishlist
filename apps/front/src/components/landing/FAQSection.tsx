import { Box, Container, Typography, useMediaQuery, useTheme } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useEffect, useMemo, useRef } from 'react'

const FAQSectionContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(8, 0, 12),
  backgroundColor: 'white',
  borderTop: '1px solid #e5e7eb',
  borderBottom: '1px solid #e5e7eb',
}))

const FAQTitle = styled(Typography)(({ theme }) => ({
  textAlign: 'center',
  marginBottom: theme.spacing(6),
  fontSize: '2.25rem',
  fontWeight: 600,
  color: theme.palette.text.primary,
  [theme.breakpoints.down('md')]: {
    fontSize: '1.75rem',
    marginBottom: theme.spacing(5),
  },
}))

const FAQContainerWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  // Masques de fondu sur les côtés
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: `${FAQ_ANIMATION_CONFIG.FADE_WIDTH}px`,
    height: '100%',
    background: 'linear-gradient(to right, white 0%, rgba(255, 255, 255, 0) 100%)',
    zIndex: 10,
    pointerEvents: 'none',
    [theme.breakpoints.down('sm')]: {
      width: `${FAQ_ANIMATION_CONFIG.FADE_WIDTH_MOBILE}px`,
    },
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    width: `${FAQ_ANIMATION_CONFIG.FADE_WIDTH}px`,
    height: '100%',
    background: 'linear-gradient(to left, white 0%, rgba(255, 255, 255, 0) 100%)',
    zIndex: 10,
    pointerEvents: 'none',
    [theme.breakpoints.down('sm')]: {
      width: `${FAQ_ANIMATION_CONFIG.FADE_WIDTH_MOBILE}px`,
    },
  },
}))

const FAQContainer = styled(Box)(() => ({
  overflowX: 'auto',
  overflowY: 'hidden',
  position: 'relative',
  paddingBottom: '16px',
  scrollbarWidth: 'none',
  msOverflowStyle: 'none',
  WebkitOverflowScrolling: 'touch',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
  '&:hover': {
    cursor: 'grab',
  },
  '&:active': {
    cursor: 'grabbing',
  },
}))

const FAQScrollWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: `${FAQ_ANIMATION_CONFIG.CARD_GAP}px`,
  [theme.breakpoints.down('md')]: {
    gap: theme.spacing(3),
  },
  [theme.breakpoints.down('sm')]: {
    gap: `${FAQ_ANIMATION_CONFIG.CARD_GAP_MOBILE}px`,
  },
}))

const FAQCard = styled(Box)(({ theme }) => ({
  backgroundColor: '#fafafa',
  borderRadius: theme.spacing(2),
  padding: theme.spacing(4),
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  border: '1px solid #e5e7eb',
  transition: 'all 0.3s ease',
  minWidth: `${FAQ_ANIMATION_CONFIG.CARD_WIDTH}px`,
  maxWidth: `${FAQ_ANIMATION_CONFIG.CARD_WIDTH}px`,
  scrollSnapAlign: 'start',
  flexShrink: 0,
  [theme.breakpoints.down('md')]: {
    minWidth: '320px',
    maxWidth: '320px',
  },
  [theme.breakpoints.down('sm')]: {
    minWidth: `${FAQ_ANIMATION_CONFIG.CARD_WIDTH_MOBILE}px`,
    maxWidth: `${FAQ_ANIMATION_CONFIG.CARD_WIDTH_MOBILE}px`,
    padding: theme.spacing(3),
  },
}))

const FAQQuestion = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(2),
  color: theme.palette.text.primary,
  fontSize: '1.1rem',
  [theme.breakpoints.down('sm')]: {
    fontSize: '1rem',
    marginBottom: theme.spacing(1.5),
  },
}))

const FAQAnswer = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  lineHeight: 1.6,
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.9rem',
    lineHeight: 1.5,
  },
}))

// Configuration de l'animation FAQ
const FAQ_ANIMATION_CONFIG = {
  SCROLL_SPEED: 0.3, // pixels par frame
  SCROLL_SPEED_MOBILE: 0.2, // pixels par frame sur mobile (plus lent)
  CARD_WIDTH: 380, // largeur des cartes FAQ
  CARD_GAP: 32, // espacement entre les cartes
  PAUSE_AFTER_INTERACTION: 500, // délai avant reprise de l'animation (ms)
  USER_SCROLL_DETECTION_DELAY: 100, // délai pour détecter la fin du scroll utilisateur (ms)
  DRAG_SENSITIVITY: 1, // multiplicateur de sensibilité pour le drag
  INITIAL_DELAY: 3000, // délai initial avant démarrage de l'animation (ms)
  FADE_WIDTH: 80, // largeur du fondu sur les côtés (px)
  FADE_WIDTH_MOBILE: 20, // largeur du fondu sur les côtés sur mobile (px)
  CARD_WIDTH_MOBILE: 260, // largeur des cartes FAQ sur mobile
  CARD_GAP_MOBILE: 16, // espacement entre les cartes sur mobile
} as const

const InfiniteScrollFAQ = ({ faqs }: { faqs: Array<{ question: string; answer: string }> }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>(0)
  const isUserScrollingRef = useRef(false)
  const isHoveringRef = useRef(false)
  const lastUserScrollTime = useRef(Date.now() - FAQ_ANIMATION_CONFIG.INITIAL_DELAY)
  const isDraggingRef = useRef(false)
  const startXRef = useRef(0)
  const scrollLeftRef = useRef(0)
  const scrollAccumulator = useRef(0)

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const scrollSpeed = useMemo(
    () => (isMobile ? FAQ_ANIMATION_CONFIG.SCROLL_SPEED_MOBILE : FAQ_ANIMATION_CONFIG.SCROLL_SPEED),
    [isMobile],
  )

  const cardWidth = useMemo(
    () =>
      (isMobile ? FAQ_ANIMATION_CONFIG.CARD_WIDTH_MOBILE : FAQ_ANIMATION_CONFIG.CARD_WIDTH) +
      (isMobile ? FAQ_ANIMATION_CONFIG.CARD_GAP_MOBILE : FAQ_ANIMATION_CONFIG.CARD_GAP),
    [isMobile],
  )

  useEffect(() => {
    const container = containerRef.current
    const wrapper = wrapperRef.current
    if (!container || !wrapper) return

    const totalWidth = cardWidth * faqs.length

    const animate = () => {
      const currentTime = Date.now()

      // Si l'utilisateur a scrollé récemment ou hover, attendre avant de reprendre l'animation
      if (
        currentTime - lastUserScrollTime.current < FAQ_ANIMATION_CONFIG.PAUSE_AFTER_INTERACTION ||
        isDraggingRef.current ||
        isHoveringRef.current
      ) {
        animationRef.current = requestAnimationFrame(animate)
        return
      }

      if (!isUserScrollingRef.current && !isDraggingRef.current && !isHoveringRef.current) {
        // Accumuler les petites valeurs de scroll pour gérer les vitesses très lentes
        scrollAccumulator.current += scrollSpeed

        // N'appliquer le scroll que quand on a au moins 1 pixel à déplacer
        if (scrollAccumulator.current >= 1) {
          const scrollAmount = Math.floor(scrollAccumulator.current)
          container.scrollLeft += scrollAmount
          scrollAccumulator.current -= scrollAmount
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    // Détecter le scroll utilisateur (wheel, touch)
    const handleWheel = () => {
      isUserScrollingRef.current = true
      lastUserScrollTime.current = Date.now()
      setTimeout(() => {
        isUserScrollingRef.current = false
      }, FAQ_ANIMATION_CONFIG.USER_SCROLL_DETECTION_DELAY)
    }

    // Gérer le scroll infini sans interférer avec l'animation
    const handleScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = container

      if (scrollLeft <= 0) {
        container.scrollLeft = totalWidth - 1
      } else if (scrollLeft >= scrollWidth - clientWidth - 1) {
        container.scrollLeft = totalWidth + 1
      }
    }

    // Gestionnaires pour le drag scroll
    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true
      startXRef.current = e.pageX - container.offsetLeft
      scrollLeftRef.current = container.scrollLeft
      lastUserScrollTime.current = Date.now()
      container.style.cursor = 'grabbing'
      container.style.userSelect = 'none'
    }

    const handleMouseUp = () => {
      isDraggingRef.current = false
      container.style.cursor = 'grab'
      container.style.userSelect = 'auto'
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return
      e.preventDefault()
      const x = e.pageX - container.offsetLeft
      const walk = (x - startXRef.current) * FAQ_ANIMATION_CONFIG.DRAG_SENSITIVITY
      container.scrollLeft = scrollLeftRef.current - walk
      lastUserScrollTime.current = Date.now()
    }

    // Gestionnaires pour le hover
    const handleMouseEnter = () => {
      isHoveringRef.current = true
      lastUserScrollTime.current = Date.now()
    }

    const handleMouseLeaveContainer = () => {
      isHoveringRef.current = false
      // Arrêter le drag si on sort du container
      if (isDraggingRef.current) {
        isDraggingRef.current = false
        container.style.cursor = 'grab'
        container.style.userSelect = 'auto'
      }
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    container.addEventListener('wheel', handleWheel, { passive: true })
    container.addEventListener('touchstart', handleWheel, { passive: true })
    container.addEventListener('mouseenter', handleMouseEnter, { passive: true })
    container.addEventListener('mouseleave', handleMouseLeaveContainer, { passive: true })
    container.addEventListener('mousedown', handleMouseDown)
    container.addEventListener('mouseup', handleMouseUp)
    container.addEventListener('mousemove', handleMouseMove)

    // Positionner au milieu au démarrage
    container.scrollLeft = totalWidth

    // Démarrer l'animation immédiatement
    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      container.removeEventListener('scroll', handleScroll)
      container.removeEventListener('wheel', handleWheel)
      container.removeEventListener('touchstart', handleWheel)
      container.removeEventListener('mouseenter', handleMouseEnter)
      container.removeEventListener('mouseleave', handleMouseLeaveContainer)
      container.removeEventListener('mousedown', handleMouseDown)
      container.removeEventListener('mouseup', handleMouseUp)
      container.removeEventListener('mousemove', handleMouseMove)
    }
  }, [faqs.length, cardWidth, scrollSpeed])

  return (
    <FAQContainerWrapper>
      <FAQContainer ref={containerRef}>
        <FAQScrollWrapper ref={wrapperRef}>
          {/* Première série */}
          {faqs.map((faq, index) => (
            <FAQCard key={`first-${index}`}>
              <FAQQuestion>{faq.question}</FAQQuestion>
              <FAQAnswer>{faq.answer}</FAQAnswer>
            </FAQCard>
          ))}
          {/* Série dupliquée pour l'effet infini */}
          {faqs.map((faq, index) => (
            <FAQCard key={`second-${index}`}>
              <FAQQuestion>{faq.question}</FAQQuestion>
              <FAQAnswer>{faq.answer}</FAQAnswer>
            </FAQCard>
          ))}
          {/* Troisième série pour un scroll plus fluide */}
          {faqs.map((faq, index) => (
            <FAQCard key={`third-${index}`}>
              <FAQQuestion>{faq.question}</FAQQuestion>
              <FAQAnswer>{faq.answer}</FAQAnswer>
            </FAQCard>
          ))}
        </FAQScrollWrapper>
      </FAQContainer>
    </FAQContainerWrapper>
  )
}

const DEFAULT_FAQS = [
  {
    question: 'Est-ce que Wishlist est gratuit ?',
    answer: 'Oui, Wishlist est entièrement gratuit à utiliser pour tous vos événements et listes de souhaits.',
  },
  {
    question: 'Comment inviter mes proches ?',
    answer: 'Vous pouvez facilement inviter vos proches par email ou en partageant un lien vers votre événement.',
  },
  {
    question: 'Puis-je créer plusieurs listes ?',
    answer: 'Absolument ! Vous pouvez créer autant de listes que vous voulez pour différents événements.',
  },
  {
    question: 'Comment fonctionne le Secret Santa ?',
    answer: 'Notre système effectue automatiquement le tirage au sort en respectant vos contraintes et exclusions.',
  },
  {
    question: 'Mes données sont-elles sécurisées ?',
    answer:
      'Absolument ! Nous utilisons un chiffrement de niveau bancaire pour protéger toutes vos informations personnelles.',
  },
  {
    question: 'Puis-je modifier mes listes après création ?',
    answer: 'Oui, vous pouvez modifier, ajouter ou supprimer des articles de vos listes à tout moment.',
  },
  {
    question: 'Comment réserver un cadeau ?',
    answer: 'Cliquez simplement sur un article dans une liste pour le réserver et éviter les doublons.',
  },
]

interface FAQSectionProps {
  faqs?: Array<{ question: string; answer: string }>
}

export const FAQSection = ({ faqs = DEFAULT_FAQS }: FAQSectionProps) => {
  return (
    <FAQSectionContainer id="faq">
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
        <FAQTitle>Questions fréquentes</FAQTitle>
        <InfiniteScrollFAQ faqs={faqs} />
      </Container>
    </FAQSectionContainer>
  )
}
