import { ArrowBack } from '@mui/icons-material'
import { Box, Button, Container, Divider, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import { Link, useNavigate } from '@tanstack/react-router'

const PageContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  backgroundColor: '#fafafa',
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(8),
}))

const ContentWrapper = styled(Container)(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: theme.spacing(2),
  padding: theme.spacing(6),
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(4),
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(3),
  },
}))

const BackButton = styled(Button)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  color: theme.palette.primary.main,
  '&:hover': {
    backgroundColor: 'rgba(25, 118, 210, 0.04)',
  },
}))

const PageTitle = styled(Typography)(({ theme }) => ({
  fontSize: '2.5rem',
  fontWeight: 700,
  color: theme.palette.text.primary,
  marginBottom: theme.spacing(2),
  [theme.breakpoints.down('md')]: {
    fontSize: '2rem',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.75rem',
  },
}))

const LastUpdated = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(4),
  fontStyle: 'italic',
}))

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.5rem',
  fontWeight: 600,
  color: theme.palette.text.primary,
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(2),
}))

const SectionContent = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
  lineHeight: 1.7,
  marginBottom: theme.spacing(2),
}))

const ContactBox = styled(Box)(({ theme }) => ({
  backgroundColor: '#f5f5f5',
  borderRadius: theme.spacing(1),
  padding: theme.spacing(3),
  marginTop: theme.spacing(4),
}))

const HighlightBox = styled(Box)(({ theme }) => ({
  backgroundColor: '#e3f2fd',
  borderLeft: `4px solid ${theme.palette.primary.main}`,
  borderRadius: theme.spacing(1),
  padding: theme.spacing(2),
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
}))

export const TermsOfServicePage = () => {
  const navigate = useNavigate()

  return (
    <PageContainer>
      <ContentWrapper maxWidth="md">
        <BackButton startIcon={<ArrowBack />} onClick={() => navigate({ to: '/' })} variant="text">
          Retour à l'accueil
        </BackButton>

        <PageTitle>Conditions Générales d'Utilisation</PageTitle>
        <LastUpdated>Dernière mise à jour : 25 juillet 2025</LastUpdated>

        <Divider sx={{ mb: 4 }} />

        <SectionContent>
          Bienvenue sur Wishlist ! Ces conditions générales d'utilisation régissent votre accès et votre utilisation de
          notre plateforme de partage de listes de souhaits et d'organisation d'événements.
        </SectionContent>

        <HighlightBox>
          <SectionContent sx={{ mb: 0, fontWeight: 500 }}>
            En utilisant Wishlist, vous acceptez d'être lié par ces conditions. Si vous n'acceptez pas ces termes,
            veuillez ne pas utiliser notre service.
          </SectionContent>
        </HighlightBox>

        <SectionTitle>1. Description du service</SectionTitle>

        <SectionContent>Wishlist est une plateforme gratuite qui permet aux utilisateurs de :</SectionContent>

        <Box component="ul" sx={{ pl: 3, color: 'text.primary', lineHeight: 1.7, mb: 2 }}>
          <li>Créer et gérer des listes de souhaits personnalisées</li>
          <li>Organiser des événements et inviter famille et amis</li>
          <li>Partager des listes de souhaits pour des occasions spéciales</li>
          <li>Participer à des tirages au sort Secret Santa</li>
          <li>Réserver des cadeaux pour éviter les doublons</li>
        </Box>

        <SectionTitle>2. Conditions d'utilisation</SectionTitle>

        <SectionContent>
          <strong>Âge minimum :</strong> Vous devez avoir au moins 13 ans pour utiliser Wishlist. Les utilisateurs de
          moins de 16 ans doivent obtenir le consentement parental.
        </SectionContent>

        <SectionContent>
          <strong>Compte utilisateur :</strong> Vous êtes responsable de maintenir la confidentialité de vos
          identifiants de connexion et de toutes les activités qui se produisent sous votre compte.
        </SectionContent>

        <SectionContent>
          <strong>Utilisation appropriée :</strong> Vous vous engagez à utiliser Wishlist de manière respectueuse et
          légale, sans porter atteinte aux droits d'autrui.
        </SectionContent>

        <SectionTitle>3. Contenu utilisateur</SectionTitle>

        <SectionContent>
          <strong>Propriété :</strong> Vous conservez tous les droits sur le contenu que vous publiez (listes,
          descriptions, photos). En publiant du contenu, vous nous accordez une licence d'utilisation nécessaire au
          fonctionnement du service.
        </SectionContent>

        <SectionContent>
          <strong>Responsabilité :</strong> Vous êtes seul responsable du contenu que vous publiez. Vous garantissez que
          ce contenu ne porte pas atteinte aux droits de tiers et respecte la législation applicable.
        </SectionContent>

        <SectionContent>
          <strong>Contenu interdit :</strong> Il est strictement interdit de publier du contenu :
        </SectionContent>

        <Box component="ul" sx={{ pl: 3, color: 'text.primary', lineHeight: 1.7, mb: 2 }}>
          <li>Illégal, diffamatoire, ou portant atteinte aux droits d'autrui</li>
          <li>À caractère violent, haineux, ou discriminatoire</li>
          <li>Contenant des virus ou codes malveillants</li>
          <li>Violant la propriété intellectuelle de tiers</li>
        </Box>

        <SectionTitle>4. Gratuite du service</SectionTitle>

        <SectionContent>
          Wishlist est actuellement un service entièrement gratuit. Nous nous réservons le droit d'introduire des
          fonctionnalités premium payantes à l'avenir, mais les fonctionnalités de base resteront gratuites.
        </SectionContent>

        <SectionTitle>5. Disponibilité du service</SectionTitle>

        <SectionContent>
          Nous nous efforçons de maintenir Wishlist disponible 24h/24 et 7j/7, mais nous ne pouvons garantir une
          disponibilité ininterrompue. Des interruptions peuvent survenir pour maintenance, mises à jour, ou en cas de
          problèmes techniques.
        </SectionContent>

        <SectionTitle>6. Protection des données</SectionTitle>

        <SectionContent>
          Le traitement de vos données personnelles est régi par notre{' '}
          <Link to="/privacy" style={{ color: 'inherit', textDecoration: 'underline' }}>
            Politique de Confidentialité
          </Link>
          . Nous nous engageons à protéger votre vie privée conformément au RGPD.
        </SectionContent>

        <SectionTitle>7. Limitation de responsabilité</SectionTitle>

        <SectionContent>
          Wishlist est fourni "en l'état". Nous déclinons toute responsabilité concernant :
        </SectionContent>

        <Box component="ul" sx={{ pl: 3, color: 'text.primary', lineHeight: 1.7, mb: 2 }}>
          <li>La perte de données utilisateur</li>
          <li>Les dommages indirects résultant de l'utilisation du service</li>
          <li>Les contenus publiés par d'autres utilisateurs</li>
          <li>Les interruptions temporaires du service</li>
        </Box>

        <SectionTitle>8. Résiliation</SectionTitle>

        <SectionContent>
          <strong>Par vous :</strong> Vous pouvez supprimer votre compte à tout moment depuis les paramètres de votre
          profil. Cette action entraînera la suppression définitive de vos données personnelles.
        </SectionContent>

        <SectionContent>
          <strong>Par nous :</strong> Nous nous réservons le droit de suspendre ou supprimer votre compte en cas de
          violation de ces conditions, avec ou sans préavis.
        </SectionContent>

        <SectionTitle>9. Modifications des conditions</SectionTitle>

        <SectionContent>
          Nous pouvons modifier ces conditions générales à tout moment. Les modifications importantes vous seront
          notifiées par e-mail ou via l'interface de l'application. Votre utilisation continue du service après
          modification constitue votre acceptation des nouvelles conditions.
        </SectionContent>

        <SectionTitle>10. Droit applicable</SectionTitle>

        <SectionContent>
          Ces conditions sont régies par le droit français. Tout litige sera soumis à la juridiction des tribunaux
          français compétents.
        </SectionContent>

        <ContactBox>
          <SectionTitle sx={{ mt: 0, mb: 2 }}>Contact</SectionTitle>
          <SectionContent sx={{ mb: 0 }}>
            Pour toute question concernant ces conditions générales d'utilisation, vous pouvez nous contacter à
            l'adresse <strong>contact@wishlistapp.fr</strong>
          </SectionContent>
        </ContactBox>
      </ContentWrapper>
    </PageContainer>
  )
}
