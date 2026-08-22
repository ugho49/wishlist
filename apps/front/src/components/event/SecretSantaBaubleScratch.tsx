import { Avatar, Button, keyframes, Stack, styled } from '@mui/material'
import { type PointerEvent, useCallback, useEffect, useRef, useState } from 'react'

const REVEAL_THRESHOLD = 0.52
const BRUSH_RADIUS = 40
const REVEAL_HANDOFF_MS = 1100
const SAMPLE_STEP = 4

const sway = keyframes`
  0%, 100% { transform: rotate(-1.8deg); }
  50% { transform: rotate(1.8deg); }
`

const shine = keyframes`
  0%, 100% { opacity: 0.55; }
  50% { opacity: 0.85; }
`

const popIn = keyframes`
  0% { transform: scale(0.92); filter: brightness(0.9); }
  60% { transform: scale(1.04); filter: brightness(1.08); }
  100% { transform: scale(1); filter: brightness(1); }
`

const Section = styled(Stack)(({ theme }) => ({
  alignItems: 'center',
  gap: theme.spacing(1.5),
  padding: theme.spacing(1, 0, 0.5),
  userSelect: 'none',
}))

const Hint = styled('p')(({ theme }) => ({
  margin: 0,
  textAlign: 'center',
  fontFamily: 'Palatino, "Palatino Linotype", "Book Antiqua", Georgia, serif',
  fontSize: '1.05rem',
  fontWeight: 600,
  letterSpacing: '0.01em',
  color: '#3d1f14',
  padding: theme.spacing(0, 2),
  [theme.breakpoints.down('sm')]: {
    fontSize: '0.95rem',
  },
}))

const Stage = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: 'min(72vw, 260px)',
})

const HangingString = styled('div')({
  width: 2,
  height: 22,
  background: 'linear-gradient(180deg, #e8c547 0%, #9a7018 100%)',
  borderRadius: 1,
  boxShadow: '0 0 4px rgba(212, 175, 55, 0.45)',
})

const Ornament = styled('div')<{ $paused: boolean }>(({ $paused }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  transformOrigin: 'top center',
  animation: $paused ? 'none' : `${sway} 3.6s ease-in-out infinite`,
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none',
  },
}))

const Cap = styled('div')({
  position: 'relative',
  zIndex: 2,
  width: '34%',
  height: 16,
  marginBottom: -4,
  background: 'linear-gradient(180deg, #f7e7a4 0%, #d4a017 42%, #8a6414 100%)',
  borderRadius: '5px 5px 3px 3px',
  boxShadow: '0 2px 4px rgba(80, 50, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.55)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -9,
    left: '50%',
    width: 12,
    height: 12,
    marginLeft: -6,
    borderRadius: '50%',
    border: '2px solid #d4a017',
    background: 'transparent',
    boxShadow: 'inset 0 0 0 1.5px rgba(247, 231, 164, 0.7)',
  },
})

const Sphere = styled('div')<{ $complete: boolean }>(({ $complete }) => ({
  position: 'relative',
  width: 'min(72vw, 260px)',
  aspectRatio: '1',
  borderRadius: '50%',
  overflow: 'hidden',
  background: `
    radial-gradient(circle at 32% 26%, rgba(255, 255, 255, 0.38) 0%, transparent 28%),
    radial-gradient(circle at 50% 58%, #1f5a3a 0%, #123526 58%, #0a2418 100%)
  `,
  boxShadow: `
    inset 0 -18px 28px rgba(0, 20, 10, 0.45),
    inset 0 10px 18px rgba(255, 255, 255, 0.12),
    0 14px 28px rgba(18, 53, 38, 0.35),
    0 0 0 3px #c9a227,
    0 0 0 6px rgba(90, 50, 10, 0.25)
  `,
  animation: $complete ? `${popIn} 0.55s ease-out` : 'none',
  cursor: $complete ? 'default' : 'grab',
  '&:active': {
    cursor: $complete ? 'default' : 'grabbing',
  },
}))

const InnerReveal = styled(Stack)({
  position: 'absolute',
  inset: '16%',
  borderRadius: '50%',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  background: `
    radial-gradient(circle at 40% 30%, #fff6de 0%, #f3e0b0 55%, #e6c878 100%)
  `,
  boxShadow: 'inset 0 0 0 2px rgba(184, 134, 11, 0.35), 0 0 16px rgba(255, 220, 140, 0.25)',
  padding: '12%',
  textAlign: 'center',
})

const DrawName = styled('div')({
  fontFamily: 'Palatino, "Palatino Linotype", "Book Antiqua", Georgia, serif',
  fontWeight: 700,
  fontSize: 'clamp(0.85rem, 4.4vw, 1.15rem)',
  lineHeight: 1.2,
  color: '#3d1f14',
  wordBreak: 'break-word',
  maxWidth: '100%',
})

const StyledAvatar = styled(Avatar)({
  width: 'clamp(44px, 18vw, 64px)',
  height: 'clamp(44px, 18vw, 64px)',
  backgroundColor: '#1f5a3a',
  border: '2px solid #c9a227',
  boxShadow: '0 2px 8px rgba(61, 31, 20, 0.2)',
  fontFamily: 'Palatino, "Palatino Linotype", Georgia, serif',
  fontWeight: 700,
})

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
}))

const GlassShine = styled('div')({
  position: 'absolute',
  inset: 0,
  borderRadius: '50%',
  pointerEvents: 'none',
  background: `
    radial-gradient(circle at 30% 22%, rgba(255, 255, 255, 0.42) 0%, rgba(255, 255, 255, 0.08) 22%, transparent 42%),
    linear-gradient(160deg, transparent 55%, rgba(255, 255, 255, 0.08) 100%)
  `,
  animation: `${shine} 4.5s ease-in-out infinite`,
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none',
  },
})

const RevealLink = styled(Button)({
  textTransform: 'none',
  color: '#6b4a1b',
  fontSize: '0.85rem',
  minHeight: 36,
  padding: '4px 12px',
  '&:hover': {
    backgroundColor: 'rgba(201, 162, 39, 0.12)',
  },
})

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
})

type SecretSantaBaubleScratchProps = {
  displayName: string
  pictureUrl?: string
  onRevealed: () => void
}

export function SecretSantaBaubleScratch({ displayName, pictureUrl, onRevealed }: SecretSantaBaubleScratchProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sphereRef = useRef<HTMLDivElement>(null)
  const lastPointRef = useRef<{ x: number; y: number } | null>(null)
  const completeRef = useRef(false)
  const hasScratchedRef = useRef(false)
  const scratchingRef = useRef(false)
  const lastMeasureAtRef = useRef(0)
  const handoffTimerRef = useRef<number | undefined>(undefined)
  const [scratching, setScratching] = useState(false)
  const [complete, setComplete] = useState(false)

  const finishReveal = useCallback(() => {
    if (completeRef.current) return
    completeRef.current = true
    scratchingRef.current = false
    setComplete(true)
    setScratching(false)
    handoffTimerRef.current = window.setTimeout(() => {
      onRevealed()
    }, REVEAL_HANDOFF_MS)
  }, [onRevealed])

  const paintFrost = useCallback((ctx: CanvasRenderingContext2D, size: number) => {
    const cx = size / 2
    const cy = size / 2
    const radius = size / 2
    const rng = mulberry32(2026)

    ctx.save()
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.clip()

    const gradient = ctx.createRadialGradient(cx - radius * 0.22, cy - radius * 0.28, radius * 0.08, cx, cy, radius)
    gradient.addColorStop(0, '#f6e7b2')
    gradient.addColorStop(0.32, '#e0b85a')
    gradient.addColorStop(0.68, '#c4922a')
    gradient.addColorStop(1, '#8a6414')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, size, size)

    for (let i = 0; i < 220; i++) {
      const angle = rng() * Math.PI * 2
      const dist = Math.sqrt(rng()) * radius
      ctx.fillStyle = `rgba(255, 250, 230, ${0.12 + rng() * 0.38})`
      ctx.beginPath()
      ctx.arc(cx + Math.cos(angle) * dist, cy + Math.sin(angle) * dist, 0.7 + rng() * 2.4, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.strokeStyle = 'rgba(255, 248, 220, 0.5)'
    ctx.lineWidth = 1.1
    ctx.lineCap = 'round'
    for (let i = 0; i < 9; i++) {
      drawSnowflake(ctx, cx + (rng() - 0.5) * radius * 1.45, cy + (rng() - 0.5) * radius * 1.45, 5 + rng() * 9)
    }

    ctx.fillStyle = 'rgba(74, 44, 8, 0.78)'
    ctx.font = `700 ${Math.round(size * 0.078)}px Palatino, Georgia, serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('GRATTE-MOI', cx, cy)
    ctx.restore()
  }, [])

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const sphere = sphereRef.current
    if (!canvas || !sphere || completeRef.current) return

    const size = sphere.getBoundingClientRect().width
    if (size <= 0) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = Math.round(size * dpr)
    canvas.height = Math.round(size * dpr)

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    paintFrost(ctx, size)
  }, [paintFrost])

  useEffect(() => {
    const sphere = sphereRef.current
    if (!sphere) return

    setupCanvas()
    const observer = new ResizeObserver(() => {
      if (!completeRef.current && !hasScratchedRef.current) setupCanvas()
    })
    observer.observe(sphere)

    return () => {
      observer.disconnect()
      if (handoffTimerRef.current) window.clearTimeout(handoffTimerRef.current)
    }
  }, [setupCanvas])

  const getLocalPoint = (event: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    return { x: event.clientX - rect.left, y: event.clientY - rect.top }
  }

  const scratchAt = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.arc(x, y, BRUSH_RADIUS, 0, Math.PI * 2)
    ctx.fill()
  }

  const scratchLine = (ctx: CanvasRenderingContext2D, from: { x: number; y: number }, to: { x: number; y: number }) => {
    const dist = Math.hypot(to.x - from.x, to.y - from.y)
    const steps = Math.max(1, Math.ceil(dist / (BRUSH_RADIUS / 3)))
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      scratchAt(ctx, from.x + (to.x - from.x) * t, from.y + (to.y - from.y) * t)
    }
  }

  const measureClearedRatio = (ctx: CanvasRenderingContext2D) => {
    const canvas = canvasRef.current
    if (!canvas) return 0
    const { width, height } = canvas
    const data = ctx.getImageData(0, 0, width, height).data
    const cx = width / 2
    const cy = height / 2
    const radiusSq = (Math.min(width, height) / 2) ** 2
    let inside = 0
    let cleared = 0

    for (let y = 0; y < height; y += SAMPLE_STEP) {
      for (let x = 0; x < width; x += SAMPLE_STEP) {
        const dx = x - cx
        const dy = y - cy
        if (dx * dx + dy * dy > radiusSq) continue
        inside++
        const alpha = data[(y * width + x) * 4 + 3]
        if (alpha !== undefined && alpha < 128) cleared++
      }
    }

    return inside === 0 ? 0 : cleared / inside
  }

  const maybeFinishFromScratch = (ctx: CanvasRenderingContext2D, force: boolean) => {
    const now = performance.now()
    if (!force && now - lastMeasureAtRef.current < 80) return
    lastMeasureAtRef.current = now
    if (measureClearedRatio(ctx) >= REVEAL_THRESHOLD) {
      finishReveal()
    }
  }

  const handlePointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    if (completeRef.current) return
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    hasScratchedRef.current = true
    scratchingRef.current = true
    setScratching(true)
    const point = getLocalPoint(event)
    lastPointRef.current = point
    const ctx = event.currentTarget.getContext('2d')
    if (!ctx) return
    const dpr = window.devicePixelRatio || 1
    ctx.save()
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    scratchAt(ctx, point.x, point.y)
    ctx.restore()
  }

  const handlePointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!scratchingRef.current || completeRef.current) return
    event.preventDefault()
    const point = getLocalPoint(event)
    const last = lastPointRef.current ?? point
    const ctx = event.currentTarget.getContext('2d')
    if (!ctx) return
    const dpr = window.devicePixelRatio || 1
    ctx.save()
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    scratchLine(ctx, last, point)
    ctx.restore()
    lastPointRef.current = point
    maybeFinishFromScratch(ctx, false)
  }

  const handlePointerUp = (event: PointerEvent<HTMLCanvasElement>) => {
    scratchingRef.current = false
    setScratching(false)
    lastPointRef.current = null
    if (completeRef.current) return
    const ctx = event.currentTarget.getContext('2d')
    if (ctx) maybeFinishFromScratch(ctx, true)
  }

  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('')

  return (
    <Section>
      <Hint>Gratte la boule pour découvrir ton Secret Santa</Hint>
      <Stage>
        <HangingString />
        <Ornament $paused={scratching || complete}>
          <Cap />
          <Sphere ref={sphereRef} $complete={complete}>
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
    </Section>
  )
}

function mulberry32(seed: number) {
  let t = seed >>> 0
  return () => {
    t += 0x6d2b79f5
    let x = t
    x = Math.imul(x ^ (x >>> 15), x | 1)
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61)
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296
  }
}

function drawSnowflake(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.beginPath()
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i
    ctx.moveTo(x, y)
    ctx.lineTo(x + Math.cos(angle) * size, y + Math.sin(angle) * size)
  }
  ctx.stroke()
}
