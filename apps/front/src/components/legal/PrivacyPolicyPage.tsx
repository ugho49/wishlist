import { ArrowBack } from '@mui/icons-material'
import { Box, Button, Container, Divider, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import { useNavigate } from '@tanstack/react-router'

import { SEO } from '../SEO'

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

export const PrivacyPolicyPage = () => {
  const navigate = useNavigate()

  return (
    <>
      <SEO
        title="Politique de Confidentialité"
        description="Découvrez comment Wishlist collecte, utilise et protège vos données personnelles. Votre vie privée est notre priorité."
        canonical="/privacy"
      />
      <PageContainer>
        <ContentWrapper maxWidth="md">
          <BackButton startIcon={<ArrowBack />} onClick={() => navigate({ to: '/' })} variant="text">
            Retour à l'accueil
          </BackButton>

          <PageTitle>Politique de Confidentialité</PageTitle>
          <LastUpdated>Dernière mise à jour : 25 juillet 2025</LastUpdated>

          <Divider sx={{ mb: 4 }} />

          <SectionContent>
            Chez Wishlist, nous nous engageons à protéger votre vie privée et vos données personnelles. Cette politique
            de confidentialité explique comment nous collectons, utilisons, stockons et protégeons vos informations
            lorsque vous utilisez notre plateforme.
          </SectionContent>

          <SectionTitle>1. Informations que nous collectons</SectionTitle>

          <SectionContent>
            <strong>Informations d'identification :</strong> Nom, prénom, adresse e-mail, photo de profil (optionnelle).
          </SectionContent>

          <SectionContent>
            <strong>Informations de contenu :</strong> Listes de souhaits, descriptions d'articles, commentaires et
            informations relatives aux événements que vous créez ou auxquels vous participez.
          </SectionContent>

          <SectionContent>
            <strong>Informations techniques :</strong> Adresse IP, type de navigateur, système d'exploitation, données
            de connexion et d'utilisation du service.
          </SectionContent>

          <SectionTitle>2. Comment nous utilisons vos informations</SectionTitle>

          <SectionContent>Nous utilisons vos données personnelles pour :</SectionContent>

          <Box component="ul" sx={{ pl: 3, color: 'text.primary', lineHeight: 1.7, mb: 2 }}>
            <li>Fournir et améliorer nos services</li>
            <li>Créer et gérer votre compte utilisateur</li>
            <li>Faciliter le partage de listes de souhaits avec vos proches</li>
            <li>Organiser les événements et le système de Secret Santa</li>
            <li>Vous envoyer des notifications importantes concernant votre compte</li>
            <li>Assurer la sécurité de la plateforme</li>
          </Box>

          <SectionTitle>3. Partage des informations</SectionTitle>

          <SectionContent>
            Nous ne vendons jamais vos données personnelles. Nous pouvons partager vos informations uniquement dans les
            cas suivants :
          </SectionContent>

          <Box component="ul" sx={{ pl: 3, color: 'text.primary', lineHeight: 1.7, mb: 2 }}>
            <li>Avec les utilisateurs que vous invitez à vos événements (nom, listes de souhaits partagées)</li>
            <li>Avec nos prestataires de services techniques (hébergement, analytics)</li>
            <li>Si la loi l'exige ou pour protéger nos droits légaux</li>
          </Box>

          <SectionTitle>4. Conservation des données</SectionTitle>

          <SectionContent>
            Nous conservons vos données personnelles aussi longtemps que votre compte est actif ou selon les besoins
            pour vous fournir nos services. Vous pouvez demander la suppression de votre compte et de vos données à tout
            moment.
          </SectionContent>

          <SectionTitle>5. Sécurité</SectionTitle>

          <SectionContent>
            Nous mettons en place des mesures de sécurité techniques et organisationnelles appropriées pour protéger vos
            données contre l'accès non autorisé, la modification, la divulgation ou la destruction. Cela inclut le
            chiffrement des données sensibles et l'accès restreint aux informations personnelles.
          </SectionContent>

          <SectionTitle>6. Vos droits (RGPD)</SectionTitle>

          <SectionContent>
            Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants :
          </SectionContent>

          <Box component="ul" sx={{ pl: 3, color: 'text.primary', lineHeight: 1.7, mb: 2 }}>
            <li>
              <strong>Droit d'accès :</strong> Connaître les données que nous détenons sur vous
            </li>
            <li>
              <strong>Droit de rectification :</strong> Corriger des données inexactes
            </li>
            <li>
              <strong>Droit à l'effacement :</strong> Demander la suppression de vos données
            </li>
            <li>
              <strong>Droit à la portabilité :</strong> Récupérer vos données dans un format lisible
            </li>
            <li>
              <strong>Droit d'opposition :</strong> Vous opposer au traitement de vos données
            </li>
          </Box>

          <SectionTitle>7. Cookies</SectionTitle>

          <SectionContent>
            Nous utilisons des cookies essentiels pour le fonctionnement du site (authentification, préférences). Nous
            n'utilisons pas de cookies publicitaires ou de tracking tiers. Vous pouvez gérer les cookies dans les
            paramètres de votre navigateur.
          </SectionContent>

          <SectionTitle>8. Modifications de cette politique</SectionTitle>

          <SectionContent>
            Nous pouvons mettre à jour cette politique de confidentialité occasionnellement. Nous vous informerons de
            tout changement significatif par e-mail ou via notre plateforme.
          </SectionContent>

          <ContactBox>
            <SectionTitle sx={{ mt: 0, mb: 2 }}>Contact</SectionTitle>
            <SectionContent sx={{ mb: 0 }}>
              Pour toute question concernant cette politique de confidentialité ou pour exercer vos droits, vous pouvez
              nous contacter à l'adresse <strong>contact@wishlistapp.fr</strong>
            </SectionContent>
          </ContactBox>
        </ContentWrapper>
      </PageContainer>
    </>
  )
}
