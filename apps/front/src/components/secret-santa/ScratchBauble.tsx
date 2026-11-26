import { Avatar, alpha, keyframes, styled } from '@mui/material';
import {
  type CSSProperties,
  type PointerEvent,
  type Ref,
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

const DEFAULT_REVEAL_THRESHOLD = 0.75;
const BRUSH_RADIUS = 30;
const SAMPLE_STEP = 4;
const INTERACTIVE_DELAY_MS = 400;
/** Weights of the canvas lettering ("Gratte-moi", then the line under it). */
const CANVAS_TITLE_WEIGHT = 800;
const CANVAS_CAPTION_WEIGHT = 600;

const sway = keyframes`
  0%, 100% { transform: rotate(-2deg); }
  50% { transform: rotate(2deg); }
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

/** The scene sets `--bauble-size`, so the sphere and its cap follow the `size` prop. */
const SceneRoot = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(3),
  fontFamily: theme.typography.fontFamily,
  color: theme.palette.common.white,
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
  display: 'grid',
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
  display: 'grid',
  margin: 0,
  fontSize: '0.95rem',
  color: 'rgba(255, 255, 255, 0.7)',
});

/** The before and after texts of a header line share one grid cell, so the line keeps the taller
    one's height and the bauble does not jump when the text switches on reveal. */
const HeaderText = styled('span')<{ $shown: boolean }>(({ $shown }) => ({
  gridArea: '1 / 1',
  visibility: $shown ? 'visible' : 'hidden',
}));

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
  width: 'calc(0.22 * var(--bauble-size))',
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
  width: 'var(--bauble-size)',
  height: 'var(--bauble-size)',
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
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none',
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
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none',
  },
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

/** The only element with `touch-action: none`, so the page keeps scrolling around the bauble. */
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
  '@media (prefers-reduced-motion: reduce)': {
    transition: 'none',
  },
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

export type ScratchBaubleHandle = {
  /** Clears the whole coating at once, for a "reveal" button next to the bauble. */
  reveal: () => void;
};

export type ScratchBaubleProps = {
  /** Name hidden under the coating. */
  displayName: string;
  pictureUrl?: string;
  /** Avatar letters when there is no picture; defaults to the initials of `displayName`. */
  initials?: string;
  eventTitle: string;
  /** Diameter of the bauble, in pixels or as a CSS length (e.g. `min(76vw, 360px)`). */
  size: number | string;
  /** Share of the bauble to scratch before it reveals itself, 0 to 1. */
  threshold?: number;
  /** Called once, when the name shows: scratched enough, or `reveal()`. */
  onRevealed: () => void;
  /** Called on the first stroke. */
  onScratchStart?: () => void;
  /** Id of the scene title, for a dialog's `aria-labelledby`. */
  titleId?: string;
  /** Element of the scene title: a heading in the app's dialog, a plain paragraph in a page that has its own headings. */
  titleAs?: 'h2' | 'p';
  ref?: Ref<ScratchBaubleHandle>;
};

/**
 * Christmas bauble to scratch to discover one's Secret Santa draw: the scene only (texts,
 * bauble, scratch canvas). The app shows it full screen in `SecretSantaBaubleScratch`; the
 * landing page embeds it as a live demo.
 */
export function ScratchBauble({
  displayName,
  pictureUrl,
  initials,
  eventTitle,
  size,
  threshold = DEFAULT_REVEAL_THRESHOLD,
  onRevealed,
  onScratchStart,
  titleId,
  titleAs = 'h2',
  ref,
}: ScratchBaubleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sphereRef = useRef<HTMLDivElement>(null);
  const lastPointRef = useRef<Point | null>(null);
  const lastSizeRef = useRef(0);
  const completeRef = useRef<boolean>(false);
  const paintedRef = useRef<boolean>(false);
  const hasScratchedRef = useRef<boolean>(false);
  const scratchingRef = useRef<boolean>(false);
  const lastMeasureAtRef = useRef(0);
  const mountedAtRef = useRef(Date.now());
  const onRevealedRef = useRef(onRevealed);
  const [scratching, setScratching] = useState(false);
  const [complete, setComplete] = useState(false);
  const [progress, setProgress] = useState(0);

  useLayoutEffect(() => {
    onRevealedRef.current = onRevealed;
  });

  const finishReveal = useCallback(() => {
    if (completeRef.current) return;
    completeRef.current = true;
    scratchingRef.current = false;
    setComplete(true);
    setScratching(false);
    setProgress(1);
    onRevealedRef.current();
  }, []);

  useImperativeHandle(ref, () => ({ reveal: finishReveal }), [finishReveal]);

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const sphere = sphereRef.current;
    if (!canvas || !sphere || completeRef.current) return false;
    if (hasScratchedRef.current && paintedRef.current) return true;

    const sphereSize = Math.round(sphere.clientWidth);
    if (sphereSize < 32) return false;
    if (paintedRef.current && Math.abs(sphereSize - lastSizeRef.current) < 8) return true;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(sphereSize * dpr);
    canvas.height = Math.round(sphereSize * dpr);

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return false;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    paintBauble(ctx, sphereSize, getComputedStyle(sphere).fontFamily);
    lastSizeRef.current = sphereSize;
    paintedRef.current = true;
    return true;
  }, []);

  useLayoutEffect(() => {
    mountedAtRef.current = Date.now();

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

    // The coating may have been painted with a fallback font: paint it again once the real one is in.
    if (sphere) {
      loadCanvasFonts(getComputedStyle(sphere).fontFamily)
        ?.then(() => {
          if (cancelled || hasScratchedRef.current || completeRef.current) return;
          paintedRef.current = false;
          setupCanvas();
        })
        .catch(() => undefined);
    }

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
    };
  }, [setupCanvas]);

  const bindSphere = useCallback(
    (node: HTMLDivElement | null) => {
      sphereRef.current = node;
      if (node) setupCanvas();
    },
    [setupCanvas],
  );

  const maybeFinishFromScratch = useCallback(
    (ctx: CanvasRenderingContext2D, force: boolean) => {
      if (!paintedRef.current || !hasScratchedRef.current) return;
      const now = performance.now();
      if (!force && now - lastMeasureAtRef.current < 80) return;
      lastMeasureAtRef.current = now;
      const ratio = measureClearedRatio(ctx);
      setProgress(Math.min(1, ratio / threshold));
      if (ratio >= threshold) {
        finishReveal();
      }
    },
    [threshold, finishReveal],
  );

  const handlePointerDown = useCallback(
    (event: PointerEvent<HTMLCanvasElement>) => {
      if (completeRef.current) return;
      if (!paintedRef.current) setupCanvas();
      if (!paintedRef.current) return;
      if (Date.now() - mountedAtRef.current < INTERACTIVE_DELAY_MS) return;
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      if (!hasScratchedRef.current) onScratchStart?.();
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
    },
    [setupCanvas, onScratchStart],
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLCanvasElement>) => {
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
    },
    [maybeFinishFromScratch],
  );

  const handlePointerUp = useCallback(
    (event: PointerEvent<HTMLCanvasElement>) => {
      const wasScratching = scratchingRef.current;
      scratchingRef.current = false;
      setScratching(false);
      lastPointRef.current = null;
      if (!wasScratching || !paintedRef.current || completeRef.current) return;
      const ctx = event.currentTarget.getContext('2d');
      if (ctx) maybeFinishFromScratch(ctx, true);
    },
    [maybeFinishFromScratch],
  );

  const avatarInitials = initials ?? getInitials(displayName);
  const baubleSize = typeof size === 'number' ? `${size}px` : size;

  return (
    <SceneRoot style={{ '--bauble-size': baubleSize } as CSSProperties}>
      <Header>
        <Eyebrow>Secret Santa · {eventTitle}</Eyebrow>
        <Title as={titleAs} id={titleId}>
          <HeaderText $shown={!complete}>À qui vas-tu offrir ?</HeaderText>
          <HeaderText $shown={complete}>Et voilà !</HeaderText>
        </Title>
        <Subtitle>
          <HeaderText $shown={!complete}>Gratte la boule du bout du doigt pour le découvrir</HeaderText>
          <HeaderText $shown={complete}>Chut, ça reste entre nous !</HeaderText>
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
                  {avatarInitials}
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
    </SceneRoot>
  );
}

type Point = { x: number; y: number };

/** Pointer position relative to the canvas the handler is bound to. */
function getLocalPoint(event: PointerEvent<HTMLCanvasElement>): Point {
  const rect = event.currentTarget.getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
}

function scratchAt(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(x, y, BRUSH_RADIUS, 0, Math.PI * 2);
  ctx.fill();
}

function scratchLine(ctx: CanvasRenderingContext2D, from: Point, to: Point) {
  const dist = Math.hypot(to.x - from.x, to.y - from.y);
  const steps = Math.max(1, Math.ceil(dist / (BRUSH_RADIUS / 3)));
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    scratchAt(ctx, from.x + (to.x - from.x) * t, from.y + (to.y - from.y) * t);
  }
}

/** Share of the disc whose coating is scratched off, sampled every few pixels. */
function measureClearedRatio(ctx: CanvasRenderingContext2D) {
  const { width, height } = ctx.canvas;
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
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('');
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
  ctx.font = `${CANVAS_TITLE_WEIGHT} ${Math.round(size * 0.085)}px ${fontFamily}`;
  ctx.fillText('Gratte-moi', cx, cy - size * 0.02);
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.font = `${CANVAS_CAPTION_WEIGHT} ${Math.round(size * 0.042)}px ${fontFamily}`;
  ctx.fillText('ton tirage est caché ici', cx, cy + size * 0.07);
  ctx.restore();
}

/**
 * Loads the faces the canvas lettering uses. Resolves once they are in, or returns `undefined`
 * when they already are (or the browser has no font loading API).
 */
function loadCanvasFonts(fontFamily: string): Promise<unknown> | undefined {
  if (!('fonts' in document)) return undefined;
  const fonts = [CANVAS_TITLE_WEIGHT, CANVAS_CAPTION_WEIGHT].map(weight => `${weight} 16px ${fontFamily}`);
  if (fonts.every(font => document.fonts.check(font))) return undefined;
  return Promise.all(fonts.map(font => document.fonts.load(font)));
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
