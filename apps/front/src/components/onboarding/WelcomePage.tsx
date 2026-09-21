import type { RootState } from '../../core/store';

import { Box, Button, Stack, styled, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { match } from 'ts-pattern';

import { uploadUserPicture } from '../../api/upload';
import { OnboardingService } from '../../core/services/onboarding.service';
import { updatePicture } from '../../core/store/features/userProfileSlice';
import {
  rejectionMessage,
  rejectionPattern,
  useRemoveCurrentUserPictureMutation,
  useUpdateUserPictureFromAccountMutation,
  useUserProfileCurrentUserQuery,
} from '../../gql';
import { useToast } from '../../hooks/useToast';
import { AvatarUpdateButton } from '../user/AvatarUpdateButton';
import { ProfilePicturePromptModal } from '../user/ProfilePicturePromptModal';
import { WelcomeBirthdayStep, type WelcomeBirthdayStepHandle } from './WelcomeBirthdayStep';
import { WelcomeSignupSourceStep, type WelcomeSignupSourceStepHandle } from './WelcomeSignupSourceStep';

const mapState = (state: RootState) => ({
  pictureUrl: state.userProfile.pictureUrl,
  userId: state.auth.user?.id,
});

const WelcomeStage = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(3),
  background: `radial-gradient(900px 420px at 50% -8%, ${alpha(theme.palette.primary.main, 0.18)}, transparent 62%), ${theme.palette.grey[50]}`,
}));

const Panel = styled(Stack)(({ theme }) => ({
  position: 'relative',
  overflow: 'hidden',
  width: '100%',
  maxWidth: 520,
  gap: theme.spacing(3),
  padding: theme.spacing(4),
  borderRadius: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
  boxShadow: '0 24px 60px rgba(37, 83, 118, 0.12)',
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(5),
  },
}));

const confettiPieces = [
  { emoji: '🎉', left: '8%', delay: '0s', duration: '1.5s' },
  { emoji: '✨', left: '22%', delay: '0.12s', duration: '1.7s' },
  { emoji: '🎁', left: '40%', delay: '0.05s', duration: '1.45s' },
  { emoji: '🎂', left: '58%', delay: '0.18s', duration: '1.6s' },
  { emoji: '✨', left: '74%', delay: '0.08s', duration: '1.55s' },
  { emoji: '🎉', left: '88%', delay: '0.22s', duration: '1.65s' },
];

const ConfettiPiece = styled('span', {
  shouldForwardProp: prop => prop !== 'left' && prop !== 'delay' && prop !== 'duration',
})<{ left: string; delay: string; duration: string }>(({ left, delay, duration }) => ({
  position: 'absolute',
  top: -24,
  left,
  zIndex: 1,
  fontSize: '1.35rem',
  pointerEvents: 'none',
  animationName: 'welcomeConfetti',
  animationDuration: duration,
  animationDelay: delay,
  animationTimingFunction: 'ease-in',
  animationFillMode: 'forwards',
  '@keyframes welcomeConfetti': {
    from: { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
    to: { transform: 'translateY(420px) rotate(18deg)', opacity: 0 },
  },
}));

const Celebration = styled(Stack)(({ theme }) => ({
  position: 'relative',
  zIndex: 2,
  alignItems: 'center',
  textAlign: 'center',
  gap: theme.spacing(1.5),
  padding: theme.spacing(4, 0, 2),
}));

const CelebrationMark = styled(Box)({
  fontSize: '4.5rem',
  lineHeight: 1,
  animation: 'welcomePop 520ms cubic-bezier(0.2, 0.8, 0.2, 1)',
  '@keyframes welcomePop': {
    from: { transform: 'scale(0.35)', opacity: 0 },
    to: { transform: 'scale(1)', opacity: 1 },
  },
});

const Progress = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  gap: theme.spacing(1),
}));

const ProgressSegment = styled('span', { shouldForwardProp: prop => prop !== 'active' })<{ active: boolean }>(
  ({ theme, active }) => ({
    flex: 1,
    height: 4,
    borderRadius: 999,
    backgroundColor: active ? theme.palette.primary.main : theme.palette.grey[200],
    transition: 'background-color 200ms ease',
  }),
);

const Kicker = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontSize: '0.8rem',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
}));

const Headline = styled(Typography)(({ theme }) => ({
  fontSize: '2rem',
  fontWeight: 700,
  lineHeight: 1.15,
  letterSpacing: '-0.03em',
  color: theme.palette.text.primary,
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.7rem',
  },
}));

const Lead = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '1.05rem',
  lineHeight: 1.5,
}));

const StepBody = styled(Box)({
  minHeight: 180,
  animation: 'welcomeStepIn 280ms ease',
  '@keyframes welcomeStepIn': {
    from: { opacity: 0, transform: 'translateY(8px)' },
    to: { opacity: 1, transform: 'translateY(0)' },
  },
});

const AvatarHalo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 176,
  height: 176,
  margin: '8px auto 0',
  borderRadius: '50%',
  background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.16)}, transparent 68%)`,
}));

const SkipHint = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(1),
  color: theme.palette.text.secondary,
  fontSize: '0.8rem',
  lineHeight: 1.4,
  textAlign: 'right',
}));

const ActionButtons = styled(Stack)(({ theme }) => ({
  flexDirection: 'row',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const PrimaryAction = styled(Button)({
  flex: 1,
});

const ProfileStep = () => {
  const { pictureUrl, userId } = useSelector(mapState);
  const { addToast } = useToast();
  const [openModal, setOpenModal] = useState(false);
  const { data } = useUserProfileCurrentUserQuery(undefined, {
    select: d => d.currentUser,
  });
  const user = data?.__typename === 'User' ? data : undefined;
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const { mutateAsync: updatePictureFromAccount } = useUpdateUserPictureFromAccountMutation();
  const { mutateAsync: removePicture } = useRemoveCurrentUserPictureMutation();

  useEffect(() => {
    if (userId) {
      const onboardingService = new OnboardingService(userId);
      onboardingService.markSetProfilePictureAsShown();
    }
  }, [userId]);

  const handlePictureUpdated = (newPictureUrl: string | undefined) => {
    dispatch(updatePicture(newPictureUrl));
    void queryClient.invalidateQueries({ queryKey: ['UserProfileCurrentUser'] });
  };

  return (
    <>
      <AvatarHalo>
        <AvatarUpdateButton
          pictureUrl={pictureUrl || user?.pictureUrl || undefined}
          accounts={user?.accounts || []}
          onPictureUpdated={handlePictureUpdated}
          uploadPictureHandler={file => uploadUserPicture(file)}
          updatePictureFromAccountHandler={async accountId => {
            const res = await updatePictureFromAccount({ input: { accountId } });
            match(res.updateUserPictureFromAccount)
              .with({ __typename: 'VoidOutput' }, () => undefined)
              .with(rejectionPattern, rejection => {
                addToast({ message: rejectionMessage(rejection), variant: 'error' });
                // AvatarUpdateButton applies the new picture unless the handler throws
                throw new Error(rejectionMessage(rejection));
              })
              .exhaustive();
          }}
          deletePictureHandler={async () => {
            const res = await removePicture({});
            match(res.removeUserPicture)
              .with({ __typename: 'VoidOutput' }, () => undefined)
              .with(rejectionPattern, rejection => {
                addToast({ message: rejectionMessage(rejection), variant: 'error' });
                // AvatarUpdateButton removes the picture unless the handler throws
                throw new Error(rejectionMessage(rejection));
              })
              .exhaustive();
          }}
          size="128px"
        />
      </AvatarHalo>

      <ProfilePicturePromptModal open={openModal} onClose={() => setOpenModal(false)} />
    </>
  );
};

function welcomeCopy(stepId: string | undefined, firstName?: string) {
  if (stepId === 'birthday') {
    return {
      kicker: '🎂 Votre anniversaire',
      title: 'On pense à vous',
      lead: 'Trente jours avant votre anniversaire, vous recevrez un e-mail pour préparer l’évènement.',
      optional: true,
    };
  }

  if (stepId === 'source') {
    return {
      kicker: '✨ Une dernière chose',
      title: 'Comment nous avez-vous trouvés ?',
      lead: 'Cela nous aide à comprendre ce qui vous a amené ici.',
      optional: true,
    };
  }

  return {
    kicker: '👋 Bienvenue',
    title: `Bonjour${firstName ? ` ${firstName}` : ''}`,
    lead: 'Une photo, et vos proches vous reconnaissent tout de suite.',
    optional: false,
  };
}

const profileStep = {
  id: 'profile',
  title: 'Profil',
  component: <ProfileStep />,
};

export const WelcomePage = () => {
  const navigate = useNavigate();
  const birthdayStepRef = useRef<WelcomeBirthdayStepHandle>(null);
  const sourceStepRef = useRef<WelcomeSignupSourceStepHandle>(null);
  const { data } = useUserProfileCurrentUserQuery(undefined, {
    select: d => d.currentUser,
  });
  const user = data?.__typename === 'User' ? data : undefined;
  const [activeStep, setActiveStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const steps = useMemo(
    () => [
      profileStep,
      {
        id: 'birthday',
        title: 'Anniversaire',
        component: <WelcomeBirthdayStep ref={birthdayStepRef} disabled={saving} />,
      },
      {
        id: 'source',
        title: 'Découverte',
        component: <WelcomeSignupSourceStep ref={sourceStepRef} disabled={saving} />,
      },
    ],
    [saving],
  );
  const currentStep = steps[activeStep];

  const handleNext = async () => {
    if (currentStep?.id === 'birthday') {
      const birthdayStep = birthdayStepRef.current;
      if (!birthdayStep) {
        return;
      }

      setSaving(true);
      try {
        const saved = await birthdayStep.save();
        if (!saved) {
          return;
        }
      } finally {
        setSaving(false);
      }
    }

    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleFinishOnboarding = async () => {
    const sourceStep = sourceStepRef.current;
    if (!sourceStep) {
      return;
    }

    setSaving(true);
    try {
      const saved = await sourceStep.save();
      if (!saved) {
        setSaving(false);
        return;
      }
      setCelebrating(true);
    } catch {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!celebrating) {
      return;
    }

    const timeout = window.setTimeout(() => {
      void navigate({ to: '/events' });
    }, 1700);

    return () => window.clearTimeout(timeout);
  }, [celebrating, navigate]);

  const copy = welcomeCopy(currentStep?.id, user?.firstName);

  return (
    <WelcomeStage>
      <Panel>
        {celebrating
          ? confettiPieces.map(piece => (
              <ConfettiPiece key={piece.left} left={piece.left} delay={piece.delay} duration={piece.duration}>
                {piece.emoji}
              </ConfettiPiece>
            ))
          : null}
        {celebrating ? (
          <Celebration>
            <CelebrationMark>🎉</CelebrationMark>
            <Kicker>Bravo</Kicker>
            <Headline variant="h1">Vous y êtes{user?.firstName ? `, ${user.firstName}` : ''} !</Headline>
            <Lead>Wishlist vous attend. On vous emmène vers vos évènements.</Lead>
          </Celebration>
        ) : (
          <>
            <Progress>
              {steps.map((step, index) => (
                <ProgressSegment key={step.id} active={index <= activeStep} />
              ))}
            </Progress>

            <Stack spacing={1}>
              <Kicker>{copy.kicker}</Kicker>
              <Headline variant="h1">{copy.title}</Headline>
              <Lead>{copy.lead}</Lead>
            </Stack>

            <StepBody key={currentStep?.id}>{currentStep?.component}</StepBody>

            {copy.optional && <SkipHint>Vous pouvez continuer sans répondre.</SkipHint>}

            <ActionButtons>
              {activeStep > 0 && (
                <Button variant="text" onClick={handleBack} size="large" disabled={saving}>
                  Retour
                </Button>
              )}
              {activeStep < steps.length - 1 ? (
                <PrimaryAction variant="contained" onClick={handleNext} size="large" loading={saving} disabled={saving}>
                  Continuer
                </PrimaryAction>
              ) : (
                <PrimaryAction
                  variant="contained"
                  onClick={handleFinishOnboarding}
                  size="large"
                  loading={saving}
                  disabled={saving}
                >
                  C’est parti
                </PrimaryAction>
              )}
            </ActionButtons>
          </>
        )}
      </Panel>
    </WelcomeStage>
  );
};
