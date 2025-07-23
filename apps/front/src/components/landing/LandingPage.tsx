import { Box, Button, Container, Stack, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'

import { Logo } from '../common/Logo'

export const LandingPage = () => {
  const navigate = useNavigate()

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
      }}
    >
      <Container maxWidth="lg" sx={{ py: { xs: 4, sm: 6, md: 8 } }}>
        {/* Hero Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', minHeight: { xs: 'auto', md: '80vh' } }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={{ xs: 6, md: 8 }}
            alignItems="center"
            justifyContent="center"
            sx={{ width: '100%' }}
          >
            {/* Hero Content */}
            <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' }, px: { xs: 2, sm: 0 } }}>
              <Logo height={48} variant="full" sx={{ mb: 4, justifyContent: { xs: 'center', md: 'flex-start' } }} />

              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' },
                  fontWeight: 700,
                  mb: 3,
                  color: 'text.primary',
                  lineHeight: 1.2,
                }}
              >
                Créez vos listes de souhaits
                <br />
                <Typography
                  component="span"
                  variant="h1"
                  sx={{
                    fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' },
                    fontWeight: 700,
                    color: 'primary.main',
                  }}
                >
                  en toute simplicité
                </Typography>
              </Typography>

              <Typography
                variant="h2"
                sx={{
                  fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
                  fontWeight: 400,
                  mb: 4,
                  color: 'text.secondary',
                  maxWidth: '500px',
                  mx: { xs: 'auto', md: 0 },
                  lineHeight: 1.6,
                }}
              >
                Organisez vos événements, partagez vos souhaits avec vos proches et découvrez leurs envies. Parfait pour
                les anniversaires, Noël, mariages et plus encore.
              </Typography>

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                sx={{ justifyContent: { xs: 'center', md: 'flex-start' } }}
              >
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/register')}
                  sx={{
                    py: 1.5,
                    px: 4,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                  }}
                >
                  Commencer gratuitement
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/login')}
                  sx={{
                    py: 1.5,
                    px: 4,
                    fontSize: '1.1rem',
                    fontWeight: 500,
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    '&:hover': {
                      borderColor: 'primary.dark',
                      backgroundColor: 'primary.50',
                    },
                  }}
                >
                  Se connecter
                </Button>
              </Stack>
            </Box>

            {/* Hero Visual */}
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                justifyContent: 'center',
                maxWidth: { xs: '100%', md: '500px' },
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  maxWidth: 400,
                  aspectRatio: '1/1',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  borderRadius: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 20px 25px -5px rgba(37, 99, 235, 0.1), 0 10px 10px -5px rgba(37, 99, 235, 0.04)',
                }}
              >
                {/* Decorative gift boxes */}
                <Stack spacing={3} alignItems="center">
                  {[1, 2, 3].map(index => (
                    <Box
                      key={index}
                      sx={{
                        width: 60 + index * 10,
                        height: 60 + index * 10,
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        transform: `rotate(${index * 5 - 10}deg)`,
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: '50%',
                          left: 0,
                          right: 0,
                          height: 4,
                          backgroundColor: '#10b981',
                          transform: 'translateY(-50%)',
                        },
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          left: '50%',
                          top: 0,
                          bottom: 0,
                          width: 4,
                          backgroundColor: '#10b981',
                          transform: 'translateX(-50%)',
                        },
                      }}
                    >
                      {/* Bow */}
                      <Box
                        sx={{
                          width: 16,
                          height: 8,
                          backgroundColor: '#10b981',
                          borderRadius: '50%',
                          position: 'absolute',
                          top: -4,
                          left: '50%',
                          transform: 'translateX(-50%)',
                        }}
                      />
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Box>
          </Stack>
        </Box>

        {/* Features Section */}
        <Box sx={{ py: { xs: 8, md: 12 } }}>
          <Typography
            variant="h3"
            sx={{
              textAlign: 'center',
              mb: 6,
              fontSize: { xs: '1.75rem', md: '2.25rem' },
              fontWeight: 600,
              color: 'text.primary',
            }}
          >
            Pourquoi choisir Wishlist ?
          </Typography>

          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={4}
            sx={{ maxWidth: '900px', mx: 'auto', px: { xs: 2, sm: 0 } }}
          >
            {[
              {
                title: 'Simple à utiliser',
                description: 'Interface intuitive pour créer et gérer vos listes en quelques clics',
                icon: '✨',
              },
              {
                title: 'Partage facile',
                description: 'Invitez vos proches à voir vos souhaits et découvrir les leurs',
                icon: '🎁',
              },
              {
                title: 'Secret Santa',
                description: 'Organisez facilement vos tirages au sort pour les fêtes',
                icon: '🎅',
              },
            ].map((feature, index) => (
              <Box
                key={index}
                sx={{
                  textAlign: 'center',
                  p: { xs: 3, sm: 4 },
                  backgroundColor: 'white',
                  borderRadius: 3,
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  flex: 1,
                  transition: 'transform 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  },
                }}
              >
                <Typography sx={{ fontSize: '3rem', mb: 2 }}>{feature.icon}</Typography>
                <Typography
                  variant="h4"
                  sx={{
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    mb: 2,
                    color: 'text.primary',
                  }}
                >
                  {feature.title}
                </Typography>
                <Typography
                  sx={{
                    color: 'text.secondary',
                    lineHeight: 1.6,
                  }}
                >
                  {feature.description}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>

        {/* Screenshots Section */}
        <Box sx={{ py: { xs: 8, md: 12 }, px: { xs: 2, sm: 0 } }}>
          <Typography
            variant="h3"
            sx={{
              textAlign: 'center',
              mb: 2,
              fontSize: { xs: '1.75rem', md: '2.25rem' },
              fontWeight: 600,
              color: 'text.primary',
            }}
          >
            Découvrez l'application
          </Typography>
          <Typography
            sx={{
              textAlign: 'center',
              mb: 8,
              fontSize: { xs: '1rem', md: '1.1rem' },
              color: 'text.secondary',
              maxWidth: '600px',
              mx: 'auto',
            }}
          >
            Une interface moderne et intuitive pour gérer vos listes de souhaits en toute simplicité.
          </Typography>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems="center">
            {/* Placeholder for screenshots */}
            {[1, 2, 3].map(index => (
              <Box
                key={index}
                sx={{
                  flex: 1,
                  aspectRatio: '3/4',
                  backgroundColor: 'white',
                  borderRadius: 3,
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px dashed #e5e7eb',
                  maxWidth: { xs: '280px', md: '200px' },
                }}
              >
                <Stack alignItems="center" spacing={2}>
                  <Typography sx={{ fontSize: '3rem', opacity: 0.5 }}>📱</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Screenshot {index}
                  </Typography>
                </Stack>
              </Box>
            ))}
          </Stack>
        </Box>

        {/* FAQ Section */}
        <Box sx={{ py: { xs: 8, md: 12 }, px: { xs: 2, sm: 0 } }}>
          <Typography
            variant="h3"
            sx={{
              textAlign: 'center',
              mb: 8,
              fontSize: { xs: '1.75rem', md: '2.25rem' },
              fontWeight: 600,
              color: 'text.primary',
            }}
          >
            Questions fréquentes
          </Typography>

          <Stack spacing={3} sx={{ maxWidth: '700px', mx: 'auto' }}>
            {[
              {
                question: 'Est-ce que Wishlist est gratuit ?',
                answer:
                  'Oui, Wishlist est entièrement gratuit à utiliser pour tous vos événements et listes de souhaits.',
              },
              {
                question: 'Comment inviter mes proches ?',
                answer:
                  'Vous pouvez facilement inviter vos proches par email ou en partageant un lien vers votre événement.',
              },
              {
                question: 'Puis-je créer plusieurs listes ?',
                answer: 'Absolument ! Vous pouvez créer autant de listes que vous voulez pour différents événements.',
              },
              {
                question: 'Comment fonctionne le Secret Santa ?',
                answer:
                  'Notre système effectue automatiquement le tirage au sort en respectant vos contraintes et exclusions.',
              },
            ].map((faq, index) => (
              <Box
                key={index}
                sx={{
                  backgroundColor: 'white',
                  borderRadius: 2,
                  p: { xs: 3, sm: 4 },
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    mb: 2,
                    color: 'text.primary',
                  }}
                >
                  {faq.question}
                </Typography>
                <Typography
                  sx={{
                    color: 'text.secondary',
                    lineHeight: 1.6,
                  }}
                >
                  {faq.answer}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>

        {/* CTA Section */}
        <Box sx={{ py: { xs: 8, md: 12 }, px: { xs: 2, sm: 0 }, textAlign: 'center' }}>
          <Typography
            variant="h3"
            sx={{
              mb: 3,
              fontSize: { xs: '1.75rem', md: '2.25rem' },
              fontWeight: 600,
              color: 'text.primary',
            }}
          >
            Prêt à commencer ?
          </Typography>
          <Typography
            sx={{
              mb: 4,
              fontSize: { xs: '1rem', md: '1.1rem' },
              color: 'text.secondary',
              maxWidth: '500px',
              mx: 'auto',
            }}
          >
            Rejoignez des milliers d'utilisateurs qui utilisent déjà Wishlist pour leurs événements.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/register')}
            sx={{
              py: 2,
              px: 6,
              fontSize: '1.1rem',
              fontWeight: 600,
            }}
          >
            Créer mon compte gratuitement
          </Button>
        </Box>
      </Container>

      {/* Footer */}
      <Box
        sx={{
          backgroundColor: '#1f2937',
          color: 'white',
          py: { xs: 6, md: 8 },
          px: { xs: 2, sm: 0 },
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={{ xs: 4, md: 8 }}
            justifyContent="space-between"
            alignItems={{ xs: 'center', md: 'flex-start' }}
          >
            <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              <Logo height={40} variant="full" sx={{ mb: 2, justifyContent: { xs: 'center', md: 'flex-start' } }} />
              <Typography variant="body2" sx={{ mb: 2, maxWidth: '300px' }}>
                L'application de listes de souhaits qui facilite l'organisation de vos événements.
              </Typography>
              <Typography variant="body2" color="grey.400">
                © 2025 Wishlist. Tous droits réservés.
              </Typography>
            </Box>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={{ xs: 3, sm: 6 }}
              sx={{ textAlign: { xs: 'center', md: 'left' } }}
            >
              <Stack spacing={2}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Produit
                </Typography>
                <Typography
                  variant="body2"
                  component="a"
                  href="#"
                  sx={{
                    color: 'grey.300',
                    textDecoration: 'none',
                    '&:hover': { color: 'white' },
                  }}
                >
                  Fonctionnalités
                </Typography>
                <Typography
                  variant="body2"
                  component="a"
                  href="#"
                  sx={{
                    color: 'grey.300',
                    textDecoration: 'none',
                    '&:hover': { color: 'white' },
                  }}
                >
                  Tarifs
                </Typography>
                <Typography
                  variant="body2"
                  component="a"
                  href="#"
                  sx={{
                    color: 'grey.300',
                    textDecoration: 'none',
                    '&:hover': { color: 'white' },
                  }}
                >
                  FAQ
                </Typography>
              </Stack>

              <Stack spacing={2}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Support
                </Typography>
                <Typography
                  variant="body2"
                  component="a"
                  href="#"
                  sx={{
                    color: 'grey.300',
                    textDecoration: 'none',
                    '&:hover': { color: 'white' },
                  }}
                >
                  Aide
                </Typography>
                <Typography
                  variant="body2"
                  component="a"
                  href="#"
                  sx={{
                    color: 'grey.300',
                    textDecoration: 'none',
                    '&:hover': { color: 'white' },
                  }}
                >
                  Contact
                </Typography>
                <Typography
                  variant="body2"
                  component="a"
                  href="#"
                  sx={{
                    color: 'grey.300',
                    textDecoration: 'none',
                    '&:hover': { color: 'white' },
                  }}
                >
                  Statut
                </Typography>
              </Stack>

              <Stack spacing={2}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Légal
                </Typography>
                <Typography
                  variant="body2"
                  component="a"
                  href="#"
                  sx={{
                    color: 'grey.300',
                    textDecoration: 'none',
                    '&:hover': { color: 'white' },
                  }}
                >
                  Confidentialité
                </Typography>
                <Typography
                  variant="body2"
                  component="a"
                  href="#"
                  sx={{
                    color: 'grey.300',
                    textDecoration: 'none',
                    '&:hover': { color: 'white' },
                  }}
                >
                  Conditions
                </Typography>
                <Typography
                  variant="body2"
                  component="a"
                  href="#"
                  sx={{
                    color: 'grey.300',
                    textDecoration: 'none',
                    '&:hover': { color: 'white' },
                  }}
                >
                  Cookies
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  )
}
