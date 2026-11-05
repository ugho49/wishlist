import { Avatar, alpha, keyframes, Stack, styled } from '@mui/material';
import { type CSSProperties, type PointerEvent, useCallback, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const REVEAL_THRESHOLD = 0.75;
const BRUSH_RADIUS = 30;
const SAMPLE_STEP = 4;
const INTERACTIVE_DELAY_MS = 400;
const BAUBLE_SIZE = 'min(76vw, 46dvh, 360px)';
const CONFETTI_COLORS = ['#2e7d32', '#66bb6a', '#a5d6a7', '#255376', '#7fa7c9', '#ffffff', '#f4c95d'];

const sway = keyframes`
  0%, 100% { transform: rotate(-2deg); }
  50% { transform: rotate(2deg); }
`;

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

const popIn = keyframes`
  0% { transform: scale(0.94); }
  55% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const revealIn = keyframes`
  from { opacity: 0; transform: scale(0.85); }
  to { opacity: 1; transform: scale(1); }
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

const Header = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(1),
  maxWidth: 520,
  padding: theme.spacing(0, 2),
  textAlign: 'center',
}));

const Eyebrow = styled('div')(({ theme }) => ({
  maxWidth: '100%',
  padding: theme.spacing(0.5, 1.5),
  borderRadius: 999,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fontSize: '0.7rem',
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: '#c8e6c9',
  backgroundColor: alpha(theme.palette.common.white, 0.08),
  border: `1px solid ${alpha(theme.palette.common.white, 0.14)}`,
}));

const Title = styled('h2')(({ theme }) => ({
  margin: 0,
  fontSize: '1.5rem',
  fontWeight: 800,
  lineHeight: 1.2,
  letterSpacing: '-0.01em',
  [theme.breakpoints.up('md')]: {
    fontSize: '2rem',
  },
}));

const Subtitle = styled('p')({
  margin: 0,
  fontSize: '0.95rem',
  color: 'rgba(255, 255, 255, 0.7)',
});

const Stage = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

const HangingString = styled('div')({
  width: 2,
  height: 'clamp(20px, 5dvh, 40px)',
  background: 'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.55) 100%)',
});

const Ornament = styled('div')<{ $paused: boolean }>(({ $paused }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  transformOrigin: 'top center',
  animation: $paused ? 'none' : `${sway} 4s ease-in-out infinite`,
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none',
  },
}));

const Cap = styled('div')({
  position: 'relative',
  zIndex: 2,
  width: 'calc(0.22 * min(76vw, 46dvh, 360px))',
  height: 'clamp(16px, 3.4dvh, 24px)',
  marginBottom: -4,
  borderRadius: '6px 6px 3px 3px',
  background: 'linear-gradient(90deg, #b8c4cf 0%, #f5f8fa 45%, #9aa8b5 100%)',
  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.35)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -11,
    left: '50%',
    width: 14,
    height: 14,
    marginLeft: -7,
    borderRadius: '50%',
    border: '2px solid #dfe6ec',
  },
});

const SphereFrame = styled('div')({
  position: 'relative',
  width: BAUBLE_SIZE,
  height: BAUBLE_SIZE,
});

const ProgressRing = styled('svg')(({ theme }) => ({
  position: 'absolute',
  inset: -12,
  width: 'calc(100% + 24px)',
  height: 'calc(100% + 24px)',
  transform: 'rotate(-90deg)',
  pointerEvents: 'none',
  overflow: 'visible',
  '& circle': {
    fill: 'none',
    strokeWidth: 1.6,
  },
  '& .track': {
    stroke: alpha(theme.palette.common.white, 0.12),
  },
  '& .value': {
    stroke: '#81c784',
    strokeLinecap: 'round',
    filter: 'drop-shadow(0 0 4px rgba(129, 199, 132, 0.8))',
    transition: 'stroke-dashoffset 0.25s ease-out',
  },
}));

const Sphere = styled('div')<{ $complete: boolean }>(({ theme, $complete }) => ({
  position: 'relative',
  width: '100%',
  height: '100%',
  borderRadius: '50%',
  overflow: 'hidden',
  background: 'radial-gradient(circle at 50% 38%, #ffffff 0%, #f3f7f4 60%, #dfe9e2 100%)',
  boxShadow: `0 24px 60px -12px rgba(0, 0, 0, 0.55), 0 0 80px -10px ${alpha(theme.palette.success.main, 0.55)}`,
  animation: $complete ? `${popIn} 0.5s ease-out` : 'none',
  cursor: $complete ? 'default' : 'grab',
  '&:active': {
    cursor: $complete ? 'default' : 'grabbing',
  },
}));

const InnerReveal = styled('div')<{ $complete: boolean }>(({ theme, $complete }) => ({
  position: 'absolute',
  inset: '14%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(1),
  textAlign: 'center',
  animation: $complete ? `${revealIn} 0.5s ease-out` : 'none',
}));

const RevealEyebrow = styled('div')(({ theme }) => ({
  fontSize: 'clamp(0.62rem, 2.4vw, 0.75rem)',
  fontWeight: 700,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: theme.palette.success.main,
}));

const DrawName = styled('div')(({ theme }) => ({
  maxWidth: '100%',
  fontSize: 'clamp(1.05rem, 5vw, 1.5rem)',
  fontWeight: 800,
  lineHeight: 1.2,
  color: theme.palette.text.primary,
  overflowWrap: 'anywhere',
}));

const DrawAvatar = styled(Avatar)(({ theme }) => ({
  width: 'clamp(60px, 20vw, 92px)',
  height: 'clamp(60px, 20vw, 92px)',
  fontSize: '1.5rem',
  fontWeight: 700,
  color: theme.palette.success.dark,
  backgroundColor: alpha(theme.palette.success.main, 0.14),
  boxShadow: `0 0 0 3px ${theme.palette.common.white}, 0 0 0 5px ${alpha(theme.palette.success.main, 0.5)}`,
}));

const ScratchCanvas = styled('canvas')<{ $fading: boolean }>(({ $fading }) => ({
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  borderRadius: '50%',
  touchAction: 'none',
  overscrollBehavior: 'none',
  WebkitUserSelect: 'none',
  WebkitTouchCallout: 'none',
  opacity: $fading ? 0 : 1,
  transition: 'opacity 0.6s ease',
  pointerEvents: $fading ? 'none' : 'auto',
  zIndex: 2,
}));

const GlassShine = styled('div')({
  position: 'absolute',
  inset: 0,
  zIndex: 3,
  borderRadius: '50%',
  pointerEvents: 'none',
  background: `
    radial-gradient(circle at 30% 22%, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.1) 18%, transparent 36%),
    radial-gradient(circle at 72% 84%, rgba(255, 255, 255, 0.14) 0%, transparent 30%)
  `,
});

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

export function SecretSantaBaubleScratch({
  displayName,
  eventTitle,
  pictureUrl,
  onRevealed,
}: SecretSantaBaubleScratchProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sphereRef = useRef<HTMLDivElement>(null);
  const doneButtonRef = useRef<HTMLButtonElement>(null);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const lastSizeRef = useRef(0);
  const completeRef = useRef(false);
  const paintedRef = useRef(false);
  const hasScratchedRef = useRef(false);
  const scratchingRef = useRef(false);
  const lastMeasureAtRef = useRef(0);
  const mountedAtRef = useRef(Date.now());
  const [scratching, setScratching] = useState(false);
  const [complete, setComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const [particles, setParticles] = useState<CelebrationParticles | undefined>();

  const finishReveal = useCallback(() => {
    if (completeRef.current) return;
    completeRef.current = true;
    scratchingRef.current = false;
    setComplete(true);
    setScratching(false);
    setProgress(1);
    setParticles(createCelebrationParticles());
    window.setTimeout(() => doneButtonRef.current?.focus(), 400);
  }, []);

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const sphere = sphereRef.current;
    if (!canvas || !sphere || completeRef.current) return false;
    if (hasScratchedRef.current && paintedRef.current) return true;

    const size = Math.round(sphere.clientWidth);
    if (size < 32) return false;
    if (paintedRef.current && Math.abs(size - lastSizeRef.current) < 8) return true;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return false;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    paintBauble(ctx, size, getComputedStyle(sphere).fontFamily);
    lastSizeRef.current = size;
    paintedRef.current = true;
    return true;
  }, []);

  useLayoutEffect(() => {
    mountedAtRef.current = Date.now();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    let cancelled = false;
    let attempts = 0;
    let raf = 0;

    const tryPaint = () => {
      if (cancelled || paintedRef.current) return;
      if (setupCanvas()) return;
      attempts += 1;
      if (attempts < 60) {
        raf = requestAnimationFrame(tryPaint);
      }
    };

    tryPaint();

    const sphere = sphereRef.current;
    const observer =
      sphere &&
      new ResizeObserver(() => {
        if (completeRef.current || hasScratchedRef.current) return;
        setupCanvas();
      });
    if (sphere && observer) observer.observe(sphere);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      observer?.disconnect();
      document.body.style.overflow = previousOverflow;
    };
  }, [setupCanvas]);

  const bindSphere = useCallback(
    (node: HTMLDivElement | null) => {
      sphereRef.current = node;
      if (node) setupCanvas();
    },
    [setupCanvas],
  );

  const getLocalPoint = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const scratchAt = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, BRUSH_RADIUS, 0, Math.PI * 2);
    ctx.fill();
  };

  const scratchLine = (ctx: CanvasRenderingContext2D, from: { x: number; y: number }, to: { x: number; y: number }) => {
    const dist = Math.hypot(to.x - from.x, to.y - from.y);
    const steps = Math.max(1, Math.ceil(dist / (BRUSH_RADIUS / 3)));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      scratchAt(ctx, from.x + (to.x - from.x) * t, from.y + (to.y - from.y) * t);
    }
  };

  const measureClearedRatio = (ctx: CanvasRenderingContext2D) => {
    const canvas = canvasRef.current;
    if (!canvas) return 0;
    const { width, height } = canvas;
    const data = ctx.getImageData(0, 0, width, height).data;
    const cx = width / 2;
    const cy = height / 2;
    const radiusSq = (Math.min(width, height) / 2) ** 2;
    let inside = 0;
    let cleared = 0;

    for (let y = 0; y < height; y += SAMPLE_STEP) {
      for (let x = 0; x < width; x += SAMPLE_STEP) {
        const dx = x - cx;
        const dy = y - cy;
        if (dx * dx + dy * dy > radiusSq) continue;
        inside++;
        const alphaValue = data[(y * width + x) * 4 + 3];
        if (alphaValue !== undefined && alphaValue < 128) cleared++;
      }
    }

    return inside === 0 ? 0 : cleared / inside;
  };

  const maybeFinishFromScratch = (ctx: CanvasRenderingContext2D, force: boolean) => {
    if (!paintedRef.current || !hasScratchedRef.current) return;
    const now = performance.now();
    if (!force && now - lastMeasureAtRef.current < 80) return;
    lastMeasureAtRef.current = now;
    const ratio = measureClearedRatio(ctx);
    setProgress(Math.min(1, ratio / REVEAL_THRESHOLD));
    if (ratio >= REVEAL_THRESHOLD) {
      finishReveal();
    }
  };

  const handlePointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    if (completeRef.current) return;
    if (!paintedRef.current) setupCanvas();
    if (!paintedRef.current) return;
    if (Date.now() - mountedAtRef.current < INTERACTIVE_DELAY_MS) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    hasScratchedRef.current = true;
    scratchingRef.current = true;
    setScratching(true);
    const point = getLocalPoint(event);
    lastPointRef.current = point;
    const ctx = event.currentTarget.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    scratchAt(ctx, point.x, point.y);
    ctx.restore();
  };

  const handlePointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!scratchingRef.current || completeRef.current) return;
    event.preventDefault();
    const point = getLocalPoint(event);
    const last = lastPointRef.current ?? point;
    const ctx = event.currentTarget.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    scratchLine(ctx, last, point);
    ctx.restore();
    lastPointRef.current = point;
    maybeFinishFromScratch(ctx, false);
  };

  const handlePointerUp = (event: PointerEvent<HTMLCanvasElement>) => {
    const wasScratching = scratchingRef.current;
    scratchingRef.current = false;
    setScratching(false);
    lastPointRef.current = null;
    if (!wasScratching || !paintedRef.current || completeRef.current) return;
    const ctx = event.currentTarget.getContext('2d');
    if (ctx) maybeFinishFromScratch(ctx, true);
  };

  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('');

  return createPortal(
    <Overlay role="dialog" aria-modal="true" aria-labelledby="secret-santa-reveal-title">
      <Content>
        <Header>
          <Eyebrow>Secret Santa · {eventTitle}</Eyebrow>
          <Title id="secret-santa-reveal-title">{complete ? 'Et voilà !' : 'À qui vas-tu offrir ?'}</Title>
          <Subtitle>
            {complete ? 'Chut, ça reste entre nous !' : 'Gratte la boule du bout du doigt pour le découvrir'}
          </Subtitle>
        </Header>

        <Stage>
          <HangingString />
          <Ornament $paused={scratching || complete}>
            <Cap />
            <SphereFrame>
              <ProgressRing viewBox="0 0 100 100" aria-hidden>
                <circle className="track" cx="50" cy="50" r="49" />
                <circle
                  className="value"
                  cx="50"
                  cy="50"
                  r="49"
                  pathLength={1}
                  strokeDasharray="1"
                  strokeDashoffset={1 - progress}
                />
              </ProgressRing>
              <Sphere ref={bindSphere} $complete={complete}>
                <InnerReveal $complete={complete} aria-hidden={!complete}>
                  <DrawAvatar src={pictureUrl} alt="">
                    {initials}
                  </DrawAvatar>
                  <RevealEyebrow>Tu offres à</RevealEyebrow>
                  <DrawName>{displayName}</DrawName>
                </InnerReveal>
                <ScratchCanvas
                  ref={canvasRef}
                  $fading={complete}
                  aria-label="Zone à gratter pour découvrir ton Secret Santa"
                  aria-hidden={complete}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  onLostPointerCapture={handlePointerUp}
                />
                <GlassShine />
              </Sphere>
            </SphereFrame>
          </Ornament>
        </Stage>

        <Footer>
          {complete ? (
            <DoneButton ref={doneButtonRef} type="button" onClick={onRevealed}>
              C'est noté !
            </DoneButton>
          ) : (
            <GhostButton type="button" onClick={finishReveal}>
              Révéler d'un coup
            </GhostButton>
          )}
        </Footer>
        <LiveRegion aria-live="polite">{complete ? `Tu offres à ${displayName}` : ''}</LiveRegion>
      </Content>

      {particles && (
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

function paintBauble(ctx: CanvasRenderingContext2D, size: number, fontFamily: string) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2;
  const rng = mulberry32(2026);

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.clip();

  const base = ctx.createRadialGradient(cx - radius * 0.3, cy - radius * 0.35, radius * 0.05, cx, cy, radius * 1.05);
  base.addColorStop(0, '#5fb865');
  base.addColorStop(0.4, '#2e7d32');
  base.addColorStop(0.8, '#1b5e20');
  base.addColorStop(1, '#0f3d14');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);

  const bands = [
    { y: cy - radius * 0.42, width: radius * 0.07, dash: [] as number[] },
    { y: cy - radius * 0.3, width: radius * 0.025, dash: [radius * 0.01, radius * 0.06] },
    { y: cy + radius * 0.32, width: radius * 0.025, dash: [radius * 0.01, radius * 0.06] },
    { y: cy + radius * 0.44, width: radius * 0.07, dash: [] as number[] },
  ];
  ctx.lineCap = 'round';
  for (const band of bands) {
    ctx.setLineDash(band.dash);
    ctx.lineWidth = band.width;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.beginPath();
    ctx.ellipse(cx, band.y, radius * 1.1, radius * 0.16, 0, 0, Math.PI);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  for (let i = 0; i < 70; i++) {
    const angle = rng() * Math.PI * 2;
    const dist = Math.sqrt(rng()) * radius;
    ctx.fillStyle = `rgba(255, 255, 255, ${0.15 + rng() * 0.45})`;
    ctx.beginPath();
    ctx.arc(cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist, 0.6 + rng() * 1.6, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 8;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `800 ${Math.round(size * 0.085)}px ${fontFamily}`;
  ctx.fillText('Gratte-moi', cx, cy - size * 0.02);
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.font = `600 ${Math.round(size * 0.042)}px ${fontFamily}`;
  ctx.fillText('ton tirage est caché ici', cx, cy + size * 0.07);
  ctx.restore();
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

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}
