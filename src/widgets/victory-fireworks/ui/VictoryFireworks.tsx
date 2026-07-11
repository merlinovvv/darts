import { useEffect, useRef } from 'react'

import { cn } from '@/shared/lib'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
  size: number
}

interface VictoryFireworksProps {
  active?: boolean
  className?: string
}

const COLORS = ['#f5f5f5', '#ef4444', '#22c55e', '#fbbf24', '#171717']

function createBurst(width: number, height: number): Particle[] {
  const originX = width * (0.2 + Math.random() * 0.6)
  const originY = height * (0.2 + Math.random() * 0.45)
  const particles: Particle[] = []

  for (let index = 0; index < 48; index += 1) {
    const angle = (Math.PI * 2 * index) / 48 + Math.random() * 0.2
    const speed = 2 + Math.random() * 4

    particles.push({
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0,
      maxLife: 50 + Math.random() * 30,
      color: COLORS[Math.floor(Math.random() * COLORS.length)] ?? '#fff',
      size: 2 + Math.random() * 2,
    })
  }

  return particles
}

export function VictoryFireworks({
  active = true,
  className,
}: VictoryFireworksProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!active) {
      return
    }

    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const context = canvas.getContext('2d')
    if (!context) {
      return
    }

    let animationId = 0
    let particles: Particle[] = []
    let burstTimer = 0

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resize()
    window.addEventListener('resize', resize)

    const tick = () => {
      context.clearRect(0, 0, canvas.width, canvas.height)

      burstTimer += 1
      if (burstTimer % 35 === 0) {
        particles.push(...createBurst(canvas.width, canvas.height))
      }

      particles = particles.filter((particle) => {
        particle.life += 1
        particle.x += particle.vx
        particle.y += particle.vy
        particle.vy += 0.06
        particle.vx *= 0.99

        const alpha = 1 - particle.life / particle.maxLife
        if (alpha <= 0) {
          return false
        }

        context.beginPath()
        context.fillStyle = particle.color
        context.globalAlpha = alpha
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        context.fill()

        return true
      })

      context.globalAlpha = 1
      animationId = window.requestAnimationFrame(tick)
    }

    particles.push(...createBurst(canvas.width, canvas.height))
    particles.push(...createBurst(canvas.width, canvas.height))
    animationId = window.requestAnimationFrame(tick)

    return () => {
      window.cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [active])

  if (!active) {
    return null
  }

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        'pointer-events-none fixed inset-0 z-40',
        className,
      )}
      aria-hidden
    />
  )
}
