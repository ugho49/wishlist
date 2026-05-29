import type { RootState } from '../../core'

import ExploreIcon from '@mui/icons-material/Explore'
import { Box, Button, Container, Stack, Step, StepLabel, Stepper, styled, Typography } from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { uploadUserPicture } from '../../api/upload'
import { OnboardingService } from '../../core/services/onboarding.service'
import { updatePicture } from '../../core/store/features'
import {
  useRemoveCurrentUserPictureMutation,
  useUpdateUserPictureFromSocialMutation,
  useUserProfileCurrentUserQuery,
} from '../../gql'
import { unwrapResult } from '../../gql/result'
import { AvatarUpdateButton } from '../user/AvatarUpdateButton'
import { ProfilePicturePromptModal } from '../user/ProfilePicturePromptModal'

const mapState = (state: RootState) => ({
  pictureUrl: state.userProfile.pictureUrl,
  userId: state.auth.user?.id,
})

const WelcomeContainer = styled(Container)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(3),
}))

const HeroSection = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginBottom: theme.spacing(6),
}))

const WelcomeTitle = styled(Typography)(({ theme }) => ({
  fontSize: '2.5rem',
  fontWeight: 700,
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(2),
  [theme.breakpoints.down('md')]: {
    fontSize: '2rem',
  },
}))

const WelcomeSubtitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.25rem',
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(4),
  maxWidth: 600,
  margin: '0 auto',
}))

const StepsContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: 800,
  marginBottom: theme.spacing(6),
}))

const StepCard = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(4),
  borderRadius: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[2],
}))

const StepIcon = styled(Box)(({ theme }) => ({
  width: 80,
  height: 80,
  borderRadius: '50%',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
  fontSize: '2rem',
}))

const StepTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.5rem',
  marginRight: 'auto',
  fontWeight: 600,
  marginBottom: theme.spacing(1),
}))

const StepDescription = styled(Typography)(({ theme }) => ({
  textAlign: 'left',
  color: theme.palette.text.secondary,
  maxWidth: 300,
}))

const ActionButtons = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  gap: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    width: '100%',
  },
}))

const ProfileStep = () => {
  const { pictureUrl, userId } = useSelector(mapState)
  const [openModal, setOpenModal] = useState(false)
  const { data: user } = useUserProfileCurrentUserQuery(undefined, {
    select: d => unwrapResult(d.currentUser, 'User'),
  })
  const dispatch = useDispatch()
  const queryClient = useQueryClient()

  const { mutateAsync: updatePictureFromSocial } = useUpdateUserPictureFromSocialMutation()
  const { mutateAsync: removePicture } = useRemoveCurrentUserPictureMutation()

  useEffect(() => {
    if (userId) {
      const onboardingService = new OnboardingService(userId)
      onboardingService.markSetProfilePictureAsShown()
    }
  }, [userId])

  const handlePictureUpdated = (newPictureUrl: string | undefined) => {
    dispatch(updatePicture(newPictureUrl))
    void queryClient.invalidateQueries({ queryKey: ['UserProfileCurrentUser'] })
  }

  return (
    <>
      <StepCard>
        <StepTitle variant="h4">Personnalisez votre profil</StepTitle>
        <StepDescription variant="body1">
          Ajoutez votre photo de profil pour que vos amis vous reconnaissent facilement.
        </StepDescription>

        <Stack alignItems="center" sx={{ mt: 2 }}>
          <AvatarUpdateButton
            pictureUrl={pictureUrl || user?.pictureUrl || undefined}
            socials={user?.socials || []}
            onPictureUpdated={handlePictureUpdated}
            uploadPictureHandler={file => uploadUserPicture(file)}
            updatePictureFromSocialHandler={async socialId => {
              const res = await updatePictureFromSocial({ input: { socialId } })
              unwrapResult(res.updateUserPictureFromSocial, 'VoidOutput')
            }}
            deletePictureHandler={async () => {
              const res = await removePicture({})
              unwrapResult(res.removeUserPicture, 'VoidOutput')
            }}
            size="120px"
          />
        </Stack>
      </StepCard>

      <ProfilePicturePromptModal open={openModal} onClose={() => setOpenModal(false)} />
    </>
  )
}

const ExploreStep = () => {
  return (
    <StepCard>
      <StepIcon>
        <ExploreIcon />
      </StepIcon>
      <StepTitle variant="h4">Explorez les fonctionnalités</StepTitle>
      <StepDescription variant="body1">
        Créez des évènements, partagez vos wishlists et organisez des Secret Santa !
      </StepDescription>
    </StepCard>
  )
}

const profileStep = {
  id: 'profile',
  title: 'Personnalisez votre profil',
  component: <ProfileStep />,
}

const exploreStep = {
  id: 'explore',
  title: 'Explorez les fonctionnalités',
  component: <ExploreStep />,
}

const steps = [profileStep, exploreStep]

export const WelcomePage = () => {
  const navigate = useNavigate()
  const { data: user } = useUserProfileCurrentUserQuery(undefined, {
    select: d => unwrapResult(d.currentUser, 'User'),
  })
  const [activeStep, setActiveStep] = useState(0)
  const currentStep = useMemo(() => steps[activeStep], [activeStep])

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1)
    }

    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1)
    }
  }

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1)
    }
  }

  const handleFinishOnboarding = () => {
    void navigate({ to: '/events' })
  }

  return (
    <WelcomeContainer>
      <HeroSection>
        <WelcomeTitle variant="h1">Bienvenue{user?.firstName ? `, ${user.firstName}` : ''} ! 🎉</WelcomeTitle>
        <WelcomeSubtitle variant="h6">Nous sommes ravis de vous accueillir sur Wishlist.</WelcomeSubtitle>
      </HeroSection>

      <StepsContainer>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map(step => (
            <Step key={step.id}>
              <StepLabel>{step.title}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </StepsContainer>

      {currentStep?.component}

      <ActionButtons sx={{ mt: 4 }}>
        {activeStep > 0 && (
          <Button variant="text" onClick={handleBack} size="large">
            Précédent
          </Button>
        )}

        {activeStep < steps.length - 1 ? (
          <Button variant="contained" onClick={handleNext} size="large">
            Suivant
          </Button>
        ) : (
          <Button variant="contained" onClick={handleFinishOnboarding} size="large">
            Commencer à utiliser Wishlist
          </Button>
        )}
      </ActionButtons>
    </WelcomeContainer>
  )
}
