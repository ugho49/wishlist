import type { ReactNode } from 'react';

import CheckIcon from '@mui/icons-material/Check';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import ForestIcon from '@mui/icons-material/Forest';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import ReplayIcon from '@mui/icons-material/Replay';
import { alpha, styled } from '@mui/material';

import { ConfirmButton } from '../common/ConfirmButton';

const Card = styled('section')(({ theme }) => ({
  position: 'relative',
  isolation: 'isolate',
  overflow: 'hidden',
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr)',
  gridTemplateAreas: `
    "lead"
    "steps"
    "action"
  `,
  gap: theme.spacing(2.5),
  padding: theme.spacing(2.5, 2),
  borderRadius: 20,
  border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
  background: `linear-gradient(160deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.main, 0.03)} 55%, ${theme.palette.background.paper} 100%)`,
  '&::after': {
    content: '""',
    position: 'absolute',
    zIndex: -1,
    top: -120,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: '50%',
    background: `radial-gradient(circle, ${alpha(theme.palette.success.main, 0.14)} 0%, transparent 70%)`,
    pointerEvents: 'none',
  },
  '&.muted': {
    borderColor: theme.palette.divider,
    background: `linear-gradient(160deg, ${alpha(theme.palette.text.secondary, 0.08)} 0%, ${theme.palette.background.paper} 100%)`,
    '&::after': { display: 'none' },
  },
  [theme.breakpoints.up('sm')]: {
    gridTemplateColumns: 'minmax(0, 1fr) auto',
    gridTemplateAreas: `
      "lead action"
      "steps steps"
    `,
    alignItems: 'center',
    columnGap: theme.spacing(3),
  },
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(3),
  },
}));

const Lead = styled('div')(({ theme }) => ({
  gridArea: 'lead',
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing(1.5),
  minWidth: 0,
}));

const Visual = styled('div')(({ theme }) => ({
  flexShrink: 0,
  width: 48,
  height: 48,
  borderRadius: 14,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: theme.palette.success.main,
  backgroundColor: theme.palette.background.paper,
  boxShadow: `0 0 0 1px ${alpha(theme.palette.success.main, 0.18)}, 0 4px 14px -4px ${alpha(theme.palette.success.main, 0.35)}`,
  '.muted &': {
    color: theme.palette.text.secondary,
    boxShadow: `0 0 0 1px ${theme.palette.divider}`,
  },
  [theme.breakpoints.up('md')]: {
    width: 56,
    height: 56,
    borderRadius: 16,
  },
}));

const Eyebrow = styled('div')(({ theme }) => ({
  fontSize: '0.68rem',
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: theme.palette.success.main,
  '.muted &': { color: theme.palette.text.secondary },
}));

const Title = styled('h2')(({ theme }) => ({
  margin: 0,
  fontSize: '1.15rem',
  fontWeight: 700,
  lineHeight: 1.3,
  color: theme.palette.success.dark,
  '.muted &': { color: theme.palette.text.primary },
  [theme.breakpoints.up('md')]: {
    fontSize: '1.35rem',
  },
}));

const Subtitle = styled('p')(({ theme }) => ({
  margin: theme.spacing(0.25, 0, 0),
  fontSize: '0.8125rem',
  lineHeight: 1.45,
  color: theme.palette.text.secondary,
}));

const Action = styled('div')(({ theme }) => ({
  gridArea: 'action',
  display: 'flex',
  justifyContent: 'center',
  '& > .MuiButton-root': {
    height: 36,
    padding: theme.spacing(0, 2.25),
    borderRadius: 999,
    fontSize: '0.875rem',
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  '& > .MuiButton-outlined': {
    backgroundColor: theme.palette.background.paper,
  },
}));

const Steps = styled('ol')(({ theme }) => ({
  gridArea: 'steps',
  listStyle: 'none',
  margin: 0,
  padding: theme.spacing(2, 0, 0),
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  borderTop: `1px dashed ${alpha(theme.palette.success.main, 0.25)}`,
}));

const Step = styled('li')(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  textAlign: 'center',
  '&:not(:last-of-type)::after': {
    content: '""',
    position: 'absolute',
    top: 13,
    left: 'calc(50% + 20px)',
    right: 'calc(-50% + 20px)',
    height: 2,
    borderRadius: 1,
    backgroundColor: theme.palette.divider,
  },
  '&.done:not(:last-of-type)::after': {
    backgroundColor: alpha(theme.palette.success.main, 0.5),
  },
}));

const StepDot = styled('span')(({ theme }) => ({
  width: 28,
  height: 28,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '0.8rem',
  fontWeight: 700,
  color: theme.palette.text.secondary,
  backgroundColor: theme.palette.background.paper,
  border: `2px solid ${theme.palette.divider}`,
  '& > .MuiSvgIcon-root': { fontSize: 16 },
  '.done > &': {
    color: theme.palette.common.white,
    backgroundColor: theme.palette.success.main,
    borderColor: theme.palette.success.main,
  },
  '.current > &': {
    color: theme.palette.success.dark,
    borderColor: theme.palette.success.main,
    boxShadow: `0 0 0 4px ${alpha(theme.palette.success.main, 0.15)}`,
  },
}));

const StepLabel = styled('span')(({ theme }) => ({
  fontSize: '0.78rem',
  fontWeight: 600,
  color: theme.palette.text.primary,
}));

const StepHint = styled('span')(({ theme }) => ({
  fontSize: '0.7rem',
  lineHeight: 1.3,
  color: theme.palette.text.secondary,
}));

export type SecretSantaStep = {
  label: string;
  hint: string;
  state: 'done' | 'current' | 'todo';
};

type SecretSantaStatusCardProps = {
  started: boolean;
  eventInPast: boolean;
  drawBlockedReason?: string;
  steps: SecretSantaStep[];
  loading: boolean;
  onStart: () => void;
  onCancel: () => void;
};

type StatusContent = {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  subtitle: string;
  muted?: boolean;
};

const getStatusContent = ({
  started,
  eventInPast,
  drawBlockedReason,
}: Pick<SecretSantaStatusCardProps, 'started' | 'eventInPast' | 'drawBlockedReason'>): StatusContent => {
  if (started) {
    return {
      icon: <CheckCircleOutlineIcon />,
      eyebrow: 'Secret Santa · tirage effectué',
      title: 'Le tirage est fait\u00a0!',
      subtitle:
        'Chaque participant a reçu par email le nom de la personne à qui offrir. Pour changer la liste, annulez le tirage puis relancez-le : tout le monde recevra un nouveau tirage.',
    };
  }
  if (eventInPast) {
    return {
      icon: <EventBusyIcon />,
      eyebrow: 'Secret Santa · brouillon',
      title: "L'évènement est passé",
      subtitle: 'Le tirage ne peut plus être lancé.',
      muted: true,
    };
  }
  if (drawBlockedReason) {
    return {
      icon: <ForestIcon />,
      eyebrow: 'Secret Santa · brouillon',
      title: 'Encore un petit effort',
      subtitle: drawBlockedReason,
    };
  }
  return {
    icon: <ForestIcon />,
    eyebrow: 'Secret Santa · brouillon',
    title: 'Tout est prêt pour le tirage\u00a0!',
    subtitle:
      'Au lancement, chacun reçoit par email le nom de la personne à qui offrir. Réglages et participants seront ensuite figés.',
  };
};

export const SecretSantaStatusCard = ({
  started,
  eventInPast,
  drawBlockedReason,
  steps,
  loading,
  onStart,
  onCancel,
}: SecretSantaStatusCardProps) => {
  const content = getStatusContent({ started, eventInPast, drawBlockedReason });

  return (
    <Card className={content.muted ? 'muted' : undefined} aria-label="Statut du Secret Santa">
      <Lead>
        <Visual>{content.icon}</Visual>
        <div>
          <Eyebrow>{content.eyebrow}</Eyebrow>
          <Title>{content.title}</Title>
          <Subtitle>{content.subtitle}</Subtitle>
        </div>
      </Lead>
      <Action>
        {started ? (
          <ConfirmButton
            confirmTitle="Annuler le tirage ?"
            confirmText="Le tirage actuel sera perdu. Vous pourrez modifier les participants puis relancer un nouveau tirage."
            confirmButton="Annuler le tirage"
            cancelButton="Garder le tirage"
            variant="outlined"
            color="success"
            startIcon={<ReplayIcon />}
            loading={loading}
            disabled={loading}
            onClick={onCancel}
          >
            Annuler le tirage
          </ConfirmButton>
        ) : (
          <ConfirmButton
            confirmTitle="Lancer le tirage ?"
            confirmText="Chaque participant recevra un email avec le nom de la personne à qui offrir."
            confirmButton="Lancer le tirage"
            variant="contained"
            color="success"
            startIcon={<PlayArrowRoundedIcon />}
            loading={loading}
            disabled={loading || eventInPast || Boolean(drawBlockedReason)}
            onClick={onStart}
          >
            Lancer le tirage
          </ConfirmButton>
        )}
      </Action>

      <Steps aria-label="Étapes du Secret Santa">
        {steps.map((step, index) => (
          <Step key={step.label} className={step.state} aria-current={step.state === 'current' ? 'step' : undefined}>
            <StepDot>{step.state === 'done' ? <CheckIcon /> : index + 1}</StepDot>
            <StepLabel>{step.label}</StepLabel>
            <StepHint>{step.hint}</StepHint>
          </Step>
        ))}
      </Steps>
    </Card>
  );
};
