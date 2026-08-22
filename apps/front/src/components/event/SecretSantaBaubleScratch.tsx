import { Avatar, Button, keyframes, Stack, styled } from '@mui/material';
import { type PointerEvent, useCallback, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const REVEAL_THRESHOLD = 0.8;
const BRUSH_RADIUS = 34;
const CELEBRATION_MS = 2800;
const SAMPLE_STEP = 4;
const INTERACTIVE_DELAY_MS = 400;
const BAUBLE_SIZE = 'min(82vw, 52dvh, 400px)';

const sway = keyframes`
  0%, 100% { transform: rotate(-1.8deg); }
  50% { transform: rotate(1.8deg); }
`;

const shine = keyframes`
  0%, 100% { opacity: 0.55; }
  50% { opacity: 0.85; }
`;

const popIn = keyframes`
  0% { transform: scale(0.92); filter: brightness(0.9); }
  60% { transform: scale(1.06); filter: brightness(1.12); }
  100% { transform: scale(1); filter: brightness(1); }
`;

const glowPulse = keyframes`
  0%, 100% { box-shadow: 0 0 24px rgba(232, 197, 71, 0.25), 0 0 0 3px #c9a227, 0 0 0 7px rgba(90, 50, 10, 0.28); }
  50% { box-shadow: 0 0 48px rgba(246, 231, 178, 0.55), 0 0 0 3px #f6e7b2, 0 0 0 8px rgba(232, 197, 71, 0.35); }
`;

const fall = keyframes`
  0% { transform: translate3d(0, -12vh, 0) rotate(0deg); opacity: 0; }
  10% { opacity: 1; }
  100% { transform: translate3d(var(--drift), 108vh, 0) rotate(240deg); opacity: 0.15; }
`;

const burst = keyframes`
  0% { transform: translate(0, 0) scale(0.2) rotate(0deg); opacity: 1; }
  100% { transform: translate(var(--tx), var(--ty)) scale(1) rotate(160deg); opacity: 0; }
`;

const twinkle = keyframes`
  0%, 100% { opacity: 0; transform: scale(0.4); }
  40% { opacity: 1; transform: scale(1); }
  70% { opacity: 0.35; transform: scale(0.8); }
`;

const Overlay = styled('div')({
  position: 'fixed',
  inset: 0,
  zIndex: 1400,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  backgroundColor: 'rgba(6, 14, 11, 0.92)',
  backdropFilter: 'blur(12px)',
});

const Content = styled(Stack)(({ theme }) => ({
  outline: 'none',
  alignItems: 'center',
  gap: theme.spacing(2.5),
  padding: theme.spacing(3, 2),
  width: '100%',
  maxHeight: '100dvh',
  userSelect: 'none',
  position: 'relative',
  zIndex: 1,
}));

const Hint = styled('p')(({ theme }) => ({
  margin: 0,
  textAlign: 'center',
  fontFamily: 'Palatino, "Palatino Linotype", "Book Antiqua", Georgia, serif',
  fontSize: '1.35rem',
  fontWeight: 600,
  letterSpacing: '0.02em',
  color: '#f3e0b0',
  textShadow: '0 2px 12px rgba(0, 0, 0, 0.45)',
  padding: theme.spacing(0, 2),
  maxWidth: 560,
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.05rem',
  },
}));

const Stage = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: BAUBLE_SIZE,
});

const HangingString = styled('div')({
  width: 3,
  height: 'clamp(28px, 7vw, 40px)',
  background: 'linear-gradient(180deg, #e8c547 0%, #9a7018 100%)',
  borderRadius: 1,
  boxShadow: '0 0 8px rgba(212, 175, 55, 0.55)',
});

const Ornament = styled('div')<{ $paused: boolean }>(({ $paused }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  transformOrigin: 'top center',
  animation: $paused ? 'none' : `${sway} 3.6s ease-in-out infinite`,
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none',
  },
}));

const Cap = styled('div')({
  position: 'relative',
  zIndex: 2,
  width: '32%',
  height: 'clamp(20px, 5.5vw, 28px)',
  marginBottom: -6,
  background: 'linear-gradient(180deg, #f7e7a4 0%, #d4a017 42%, #8a6414 100%)',
  borderRadius: '6px 6px 4px 4px',
  boxShadow: '0 3px 6px rgba(80, 50, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.55)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -12,
    left: '50%',
    width: 16,
    height: 16,
    marginLeft: -8,
    borderRadius: '50%',
    border: '2.5px solid #d4a017',
    background: 'transparent',
    boxShadow: 'inset 0 0 0 2px rgba(247, 231, 164, 0.7)',
  },
});

const Sphere = styled('div')<{ $complete: boolean }>(({ $complete }) => ({
  position: 'relative',
  width: BAUBLE_SIZE,
  height: BAUBLE_SIZE,
  flexShrink: 0,
  borderRadius: '50%',
  overflow: 'hidden',
  background: `
    radial-gradient(circle at 32% 26%, rgba(255, 255, 255, 0.38) 0%, transparent 28%),
    radial-gradient(circle at 50% 58%, #1f5a3a 0%, #123526 58%, #0a2418 100%)
  `,
  boxShadow: `
    inset 0 -22px 34px rgba(0, 20, 10, 0.45),
    inset 0 12px 22px rgba(255, 255, 255, 0.12),
    0 18px 36px rgba(18, 53, 38, 0.45),
    0 0 0 4px #c9a227,
    0 0 0 8px rgba(90, 50, 10, 0.28)
  `,
  animation: $complete ? `${popIn} 0.55s ease-out, ${glowPulse} 1.4s ease-in-out 0.4s 2` : 'none',
  cursor: $complete ? 'default' : 'grab',
  '&:active': {
    cursor: $complete ? 'default' : 'grabbing',
  },
}));

const InnerReveal = styled(Stack)({
  position: 'absolute',
  inset: '15%',
  borderRadius: '50%',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 12,
  background: `
    radial-gradient(circle at 40% 30%, #fff6de 0%, #f3e0b0 55%, #e6c878 100%)
  `,
  boxShadow: 'inset 0 0 0 2px rgba(184, 134, 11, 0.35), 0 0 22px rgba(255, 220, 140, 0.3)',
  padding: '12%',
  textAlign: 'center',
  zIndex: 0,
});

const DrawName = styled('div')({
  fontFamily: 'Palatino, "Palatino Linotype", "Book Antiqua", Georgia, serif',
  fontWeight: 700,
  fontSize: 'clamp(1.05rem, 5vw, 1.55rem)',
  lineHeight: 1.2,
  color: '#3d1f14',
  wordBreak: 'break-word',
  maxWidth: '100%',
});

const StyledAvatar = styled(Avatar)({
  width: 'clamp(64px, 22vw, 96px)',
  height: 'clamp(64px, 22vw, 96px)',
  backgroundColor: '#1f5a3a',
  border: '3px solid #c9a227',
  boxShadow: '0 3px 10px rgba(61, 31, 20, 0.25)',
  fontFamily: 'Palatino, "Palatino Linotype", Georgia, serif',
  fontWeight: 700,
  fontSize: '1.6rem',
});

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
  transition: 'opacity 0.7s ease',
  pointerEvents: $fading ? 'none' : 'auto',
  zIndex: 2,
}));

const GlassShine = styled('div')({
  position: 'absolute',
  inset: 0,
  borderRadius: '50%',
  pointerEvents: 'none',
  background: `
    radial-gradient(circle at 30% 22%, rgba(255, 255, 255, 0.42) 0%, rgba(255, 255, 255, 0.08) 22%, transparent 42%),
    linear-gradient(160deg, transparent 55%, rgba(255, 255, 255, 0.08) 100%)
  `,
  zIndex: 3,
  animation: `${shine} 4.5s ease-in-out infinite`,
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none',
  },
});

const RevealLink = styled(Button)({
  textTransform: 'none',
  color: '#e0b85a',
  fontSize: '0.95rem',
  minHeight: 40,
  padding: '6px 16px',
  '&:hover': {
    backgroundColor: 'rgba(224, 184, 90, 0.12)',
  },
});

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
  pointerEvents: 'none',
  overflow: 'hidden',
  zIndex: 2,
});

const particleBase = {
  position: 'absolute' as const,
  lineHeight: 1,
  fontFamily: 'Georgia, serif',
  pointerEvents: 'none' as const,
  filter: 'drop-shadow(0 0 6px rgba(246, 231, 178, 0.65))',
};

const SnowParticle = styled('span')<{
  $left: string;
  $drift: string;
  $duration: string;
  $delay: string;
  $size: number;
  $color: string;
}>(({ $left, $drift, $duration, $delay, $size, $color }) => ({
  ...particleBase,
  top: 0,
  left: $left,
  color: $color,
  fontSize: $size,
  animation: `${fall} ${$duration} ${$delay} linear forwards`,
  '--drift': $drift,
}));

const BurstParticle = styled('span')<{
  $tx: string;
  $ty: string;
  $duration: string;
  $delay: string;
  $size: number;
  $color: string;
}>(({ $tx, $ty, $duration, $delay, $size, $color }) => ({
  ...particleBase,
  top: '48%',
  left: '50%',
  color: $color,
  fontSize: $size,
  animation: `${burst} ${$duration} ${$delay} ease-out forwards`,
  '--tx': $tx,
  '--ty': $ty,
}));

const SparkleParticle = styled('span')<{
  $top: string;
  $left: string;
  $duration: string;
  $delay: string;
  $size: number;
}>(({ $top, $left, $duration, $delay, $size }) => ({
  ...particleBase,
  top: $top,
  left: $left,
  color: '#fff8e7',
  fontSize: $size,
  animation: `${twinkle} ${$duration} ${$delay} ease-in-out forwards`,
}));

type SnowSpec = {
  id: number;
  glyph: string;
  left: string;
  drift: string;
  duration: string;
  delay: string;
  size: number;
  color: string;
};
type BurstSpec = {
  id: number;
  glyph: string;
  tx: string;
  ty: string;
  duration: string;
  delay: string;
  size: number;
  color: string;
};
type SparkleSpec = {
  id: number;
  glyph: string;
  top: string;
  left: string;
  duration: string;
  delay: string;
  size: number;
};

type CelebrationParticles = {
  snow: SnowSpec[];
  burst: BurstSpec[];
  sparkle: SparkleSpec[];
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
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const lastSizeRef = useRef(0);
  const completeRef = useRef(false);
  const paintedRef = useRef(false);
  const hasScratchedRef = useRef(false);
  const scratchingRef = useRef(false);
  const lastMeasureAtRef = useRef(0);
  const mountedAtRef = useRef(Date.now());
  const handoffTimerRef = useRef<number | undefined>(undefined);
  const [scratching, setScratching] = useState(false);
  const [complete, setComplete] = useState(false);
  const [particles, setParticles] = useState<CelebrationParticles | undefined>();

  const finishReveal = useCallback(() => {
    if (completeRef.current) return;
    completeRef.current = true;
    scratchingRef.current = false;
    setComplete(true);
    setScratching(false);
    setParticles(createCelebrationParticles());
    handoffTimerRef.current = window.setTimeout(() => {
      onRevealed();
    }, CELEBRATION_MS);
  }, [onRevealed]);

  const paintFrost = useCallback((ctx: CanvasRenderingContext2D, size: number) => {
    const cx = size / 2;
    const cy = size / 2;
    const radius = size / 2;
    const rng = mulberry32(2026);

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.clip();

    const gradient = ctx.createRadialGradient(cx - radius * 0.22, cy - radius * 0.28, radius * 0.08, cx, cy, radius);
    gradient.addColorStop(0, '#f6e7b2');
    gradient.addColorStop(0.32, '#e0b85a');
    gradient.addColorStop(0.68, '#c4922a');
    gradient.addColorStop(1, '#8a6414');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    for (let i = 0; i < 220; i++) {
      const angle = rng() * Math.PI * 2;
      const dist = Math.sqrt(rng()) * radius;
      ctx.fillStyle = `rgba(255, 250, 230, ${0.12 + rng() * 0.38})`;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist, 0.7 + rng() * 2.4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.strokeStyle = 'rgba(255, 248, 220, 0.5)';
    ctx.lineWidth = 1.1;
    ctx.lineCap = 'round';
    for (let i = 0; i < 9; i++) {
      drawSnowflake(ctx, cx + (rng() - 0.5) * radius * 1.45, cy + (rng() - 0.5) * radius * 1.45, 5 + rng() * 9);
    }

    ctx.fillStyle = 'rgba(74, 44, 8, 0.78)';
    ctx.font = `700 ${Math.round(size * 0.078)}px Palatino, Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('GRATTE-MOI', cx, cy);
    ctx.restore();
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
    paintFrost(ctx, size);
    lastSizeRef.current = size;
    paintedRef.current = true;
    return true;
  }, [paintFrost]);

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
      if (handoffTimerRef.current) window.clearTimeout(handoffTimerRef.current);
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
        const alpha = data[(y * width + x) * 4 + 3];
        if (alpha !== undefined && alpha < 128) cleared++;
      }
    }

    return inside === 0 ? 0 : cleared / inside;
  };

  const maybeFinishFromScratch = (ctx: CanvasRenderingContext2D, force: boolean) => {
    if (!paintedRef.current || !hasScratchedRef.current) return;
    const now = performance.now();
    if (!force && now - lastMeasureAtRef.current < 80) return;
    lastMeasureAtRef.current = now;
    if (measureClearedRatio(ctx) >= REVEAL_THRESHOLD) {
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
        <Hint id="secret-santa-reveal-title">
          Gratte la boule pour découvrir ton Secret Santa pour l'événement : {eventTitle}
        </Hint>
        <Stage>
          <HangingString />
          <Ornament $paused={scratching || complete}>
            <Cap />
            <Sphere ref={bindSphere} $complete={complete}>
              <InnerReveal aria-hidden={!complete}>
                <StyledAvatar src={pictureUrl} alt="">
                  {initials}
                </StyledAvatar>
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
          </Ornament>
        </Stage>
        {!complete && (
          <RevealLink variant="text" onClick={finishReveal}>
            Révéler
          </RevealLink>
        )}
        <LiveRegion aria-live="polite">{complete ? `Votre Secret Santa est ${displayName}` : ''}</LiveRegion>
      </Content>
      {particles && (
        <CelebrationLayer aria-hidden>
          {particles.snow.map(particle => (
            <SnowParticle
              key={particle.id}
              $left={particle.left}
              $drift={particle.drift}
              $duration={particle.duration}
              $delay={particle.delay}
              $size={particle.size}
              $color={particle.color}
            >
              {particle.glyph}
            </SnowParticle>
          ))}
          {particles.burst.map(particle => (
            <BurstParticle
              key={particle.id}
              $tx={particle.tx}
              $ty={particle.ty}
              $duration={particle.duration}
              $delay={particle.delay}
              $size={particle.size}
              $color={particle.color}
            >
              {particle.glyph}
            </BurstParticle>
          ))}
          {particles.sparkle.map(particle => (
            <SparkleParticle
              key={particle.id}
              $top={particle.top}
              $left={particle.left}
              $duration={particle.duration}
              $delay={particle.delay}
              $size={particle.size}
            >
              {particle.glyph}
            </SparkleParticle>
          ))}
        </CelebrationLayer>
      )}
    </Overlay>,
    document.body,
  );
}

function createCelebrationParticles(): CelebrationParticles {
  const colors = ['#f6e7b2', '#e8c547', '#fff8e7', '#c4922a', '#ef9a9a', '#a5d6a7'];
  const snowGlyphs = ['❄', '✦', '·'];
  const burstGlyphs = ['✦', '★', '✧'];

  const snow: SnowSpec[] = Array.from({ length: 28 }, (_, i) => ({
    id: i,
    glyph: snowGlyphs[i % snowGlyphs.length] ?? '❄',
    left: `${Math.random() * 100}%`,
    drift: `${(Math.random() - 0.5) * 80}px`,
    duration: `${1.8 + Math.random() * 1.2}s`,
    delay: `${Math.random() * 0.45}s`,
    size: 12 + Math.random() * 16,
    color: colors[i % colors.length] ?? '#f6e7b2',
  }));

  const burstParticles: BurstSpec[] = Array.from({ length: 22 }, (_, i) => {
    const angle = (Math.PI * 2 * i) / 22 + Math.random() * 0.3;
    const dist = 90 + Math.random() * 160;
    return {
      id: 100 + i,
      glyph: burstGlyphs[i % burstGlyphs.length] ?? '✦',
      tx: `${Math.cos(angle) * dist}px`,
      ty: `${Math.sin(angle) * dist}px`,
      duration: `${0.9 + Math.random() * 0.7}s`,
      delay: `${Math.random() * 0.12}s`,
      size: 14 + Math.random() * 18,
      color: colors[(i + 2) % colors.length] ?? '#e8c547',
    };
  });

  const sparkle: SparkleSpec[] = Array.from({ length: 16 }, (_, i) => ({
    id: 200 + i,
    glyph: '✧',
    top: `${12 + Math.random() * 70}%`,
    left: `${8 + Math.random() * 84}%`,
    duration: `${0.8 + Math.random() * 0.6}s`,
    delay: `${0.15 + Math.random() * 0.5}s`,
    size: 10 + Math.random() * 12,
  }));

  return { snow, burst: burstParticles, sparkle };
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

function drawSnowflake(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * size, y + Math.sin(angle) * size);
  }
  ctx.stroke();
}
