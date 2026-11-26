import type { ScratchBaubleHandle } from '../secret-santa/ScratchBauble';

import { alpha, keyframes, Stack, styled } from '@mui/material';
import { type CSSProperties, useCallback, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { ScratchBauble } from '../secret-santa/ScratchBauble';

const REVEAL_THRESHOLD = 0.75;
const BAUBLE_SIZE = 'min(76vw, 46dvh, 360px)';
const TITLE_ID = 'secret-santa-reveal-title';
const CONFETTI_COLORS = ['#2e7d32', '#66bb6a', '#a5d6a7', '#255376', '#7fa7c9', '#ffffff', '#f4c95d'];

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

const fall = keyframes`
  0% { transform: translate3d(0, -10vh, 0) rotate(0deg); opacity: 0; }
  8% { opacity: 1; }
  100% { transform: translate3d(var(--drift), 110vh, 0) rotate(var(--spin)); opacity: 0.9; }
`;

const burstOut = keyframes`
  0% { transform: translate(-50%, -50%) scale(0.3); opacity: 1; }
  100% { transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(1); opacity: 0; }
`;

const Overlay = styled('div')(({ theme }) => ({
  position: 'fixed',
  inset: 0,
  zIndex: theme.zIndex.modal + 100,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  fontFamily: theme.typography.fontFamily,
  color: theme.palette.common.white,
  background: 'radial-gradient(120% 90% at 50% 0%, #2c6189 0%, #173a56 45%, #0b1d2c 100%)',
  animation: `${fadeUp} 0.35s ease-out`,
  '&::before, &::after': {
    content: '""',
    position: 'absolute',
    borderRadius: '50%',
    filter: 'blur(80px)',
    pointerEvents: 'none',
  },
  '&::before': {
    width: '60vmax',
    height: '60vmax',
    top: '-25vmax',
    left: '-20vmax',
    background: alpha(theme.palette.success.main, 0.35),
  },
  '&::after': {
    width: '50vmax',
    height: '50vmax',
    bottom: '-25vmax',
    right: '-20vmax',
    background: alpha('#7fa7c9', 0.3),
  },
}));

const Content = styled(Stack)(({ theme }) => ({
  position: 'relative',
  zIndex: 1,
  alignItems: 'center',
  gap: theme.spacing(3),
  width: '100%',
  maxHeight: '100dvh',
  padding: theme.spacing(3, 2),
  userSelect: 'none',
  [theme.breakpoints.up('md')]: {
    gap: theme.spacing(4),
  },
}));

const Footer = styled('div')({
  minHeight: 44,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const GhostButton = styled('button')(({ theme }) => ({
  height: 40,
  padding: theme.spacing(0, 2.5),
  borderRadius: 999,
  border: `1px solid ${alpha(theme.palette.common.white, 0.22)}`,
  backgroundColor: alpha(theme.palette.common.white, 0.06),
  color: alpha(theme.palette.common.white, 0.85),
  fontFamily: 'inherit',
  fontSize: '0.875rem',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'background-color 0.2s ease, border-color 0.2s ease',
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.12),
    borderColor: alpha(theme.palette.common.white, 0.4),
  },
  '&:focus-visible': {
    outline: `2px solid ${theme.palette.common.white}`,
    outlineOffset: 2,
  },
}));

const DoneButton = styled(GhostButton)(({ theme }) => ({
  height: 44,
  padding: theme.spacing(0, 3.5),
  border: 'none',
  color: theme.palette.success.dark,
  backgroundColor: theme.palette.common.white,
  fontSize: '0.95rem',
  fontWeight: 700,
  boxShadow: `0 10px 30px -8px ${alpha(theme.palette.success.main, 0.8)}`,
  animation: `${fadeUp} 0.4s ease-out 0.3s both`,
  '&:hover': {
    backgroundColor: '#f1f8f2',
  },
}));

const LiveRegion = styled('div')({
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
});

const CelebrationLayer = styled('div')({
  position: 'absolute',
  inset: 0,
  zIndex: 2,
  overflow: 'hidden',
  pointerEvents: 'none',
});

const ConfettiPiece = styled('span')({
  position: 'absolute',
  top: 0,
  borderRadius: 2,
  animationName: fall,
  animationTimingFunction: 'cubic-bezier(0.25, 0.6, 0.4, 1)',
  animationFillMode: 'forwards',
});

const BurstDot = styled('span')({
  position: 'absolute',
  top: '50%',
  left: '50%',
  borderRadius: '50%',
  animationName: burstOut,
  animationTimingFunction: 'ease-out',
  animationFillMode: 'forwards',
});

type ConfettiSpec = {
  id: number;
  left: string;
  width: number;
  height: number;
  color: string;
  drift: string;
  spin: string;
  duration: string;
  delay: string;
};

type BurstSpec = {
  id: number;
  size: number;
  color: string;
  tx: string;
  ty: string;
  duration: string;
};

type CelebrationParticles = {
  confetti: ConfettiSpec[];
  burst: BurstSpec[];
};

type SecretSantaBaubleScratchProps = {
  displayName: string;
  eventTitle: string;
  pictureUrl?: string;
  onRevealed: () => void;
};

/** Full-screen reveal of one's Secret Santa draw: the scratch bauble, then confetti and "C'est noté !". */
export function SecretSantaBaubleScratch({
  displayName,
  eventTitle,
  pictureUrl,
  onRevealed,
}: SecretSantaBaubleScratchProps) {
  const baubleRef = useRef<ScratchBaubleHandle>(null);
  const doneButtonRef = useRef<HTMLButtonElement>(null);
  const [complete, setComplete] = useState(false);
  const [particles, setParticles] = useState<CelebrationParticles | undefined>();

  useLayoutEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const handleRevealed = useCallback(() => {
    setComplete(true);
    setParticles(createCelebrationParticles());
    window.setTimeout(() => doneButtonRef.current?.focus(), 400);
  }, []);

  const handleRevealNow = useCallback(() => {
    const bauble: ScratchBaubleHandle | null = baubleRef.current;
    bauble?.reveal();
  }, []);

  return createPortal(
    <Overlay role="dialog" aria-modal="true" aria-labelledby={TITLE_ID}>
      <Content>
        <ScratchBauble
          ref={baubleRef}
          titleId={TITLE_ID}
          displayName={displayName}
          eventTitle={eventTitle}
          pictureUrl={pictureUrl}
          size={BAUBLE_SIZE}
          threshold={REVEAL_THRESHOLD}
          onRevealed={handleRevealed}
        />

        <Footer>
          {complete ? (
            <DoneButton ref={doneButtonRef} type="button" onClick={onRevealed}>
              C'est noté !
            </DoneButton>
          ) : (
            <GhostButton type="button" onClick={handleRevealNow}>
              Révéler d'un coup
            </GhostButton>
          )}
        </Footer>
        <LiveRegion aria-live="polite">{complete ? `Tu offres à ${displayName}` : ''}</LiveRegion>
      </Content>

      {particles !== undefined && (
        <CelebrationLayer aria-hidden>
          {particles.confetti.map(piece => (
            <ConfettiPiece
              key={piece.id}
              style={
                {
                  left: piece.left,
                  width: piece.width,
                  height: piece.height,
                  backgroundColor: piece.color,
                  animationDuration: piece.duration,
                  animationDelay: piece.delay,
                  '--drift': piece.drift,
                  '--spin': piece.spin,
                } as CSSProperties
              }
            />
          ))}
          {particles.burst.map(dot => (
            <BurstDot
              key={dot.id}
              style={
                {
                  width: dot.size,
                  height: dot.size,
                  backgroundColor: dot.color,
                  animationDuration: dot.duration,
                  '--tx': dot.tx,
                  '--ty': dot.ty,
                } as CSSProperties
              }
            />
          ))}
        </CelebrationLayer>
      )}
    </Overlay>,
    document.body,
  );
}

function createCelebrationParticles(): CelebrationParticles {
  const confetti: ConfettiSpec[] = Array.from({ length: 70 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    width: 6 + Math.random() * 5,
    height: 10 + Math.random() * 8,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length] ?? '#ffffff',
    drift: `${(Math.random() - 0.5) * 160}px`,
    spin: `${(Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 540)}deg`,
    duration: `${2.6 + Math.random() * 1.8}s`,
    delay: `${Math.random() * 0.6}s`,
  }));

  const burst: BurstSpec[] = Array.from({ length: 24 }, (_, i) => {
    const angle = (Math.PI * 2 * i) / 24 + Math.random() * 0.2;
    const dist = 140 + Math.random() * 140;
    return {
      id: 100 + i,
      size: 5 + Math.random() * 6,
      color: CONFETTI_COLORS[(i + 3) % CONFETTI_COLORS.length] ?? '#ffffff',
      tx: `${Math.cos(angle) * dist}px`,
      ty: `${Math.sin(angle) * dist}px`,
      duration: `${0.8 + Math.random() * 0.5}s`,
    };
  });

  return { confetti, burst };
}
