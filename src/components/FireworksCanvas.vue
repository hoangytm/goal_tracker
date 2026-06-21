<template>
  <Teleport to="body">
    <canvas
      v-if="visible"
      ref="canvasRef"
      class="pointer-events-none fixed inset-0 z-[9999]"
      :width="vw"
      :height="vh"
    />
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onUnmounted, watch, nextTick } from 'vue'

const props = defineProps<{ active: boolean }>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const visible = ref(false)
const vw = ref(window.innerWidth)
const vh = ref(window.innerHeight)

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  alpha: number
  color: string
  radius: number
}

const COLORS = [
  '#f97316', '#3b82f6', '#10b981', '#f59e0b',
  '#ec4899', '#8b5cf6', '#06b6d4', '#facc15',
]

let particles: Particle[] = []
let animId = 0
let launchTimer = 0
let stopTimer = 0
let launchCount = 0

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min
}

function burst(cx: number, cy: number) {
  const count = Math.floor(rand(40, 70))
  for (let i = 0; i < count; i++) {
    const angle = rand(0, Math.PI * 2)
    const speed = rand(2, 9)
    particles.push({
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      alpha: 1,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      radius: rand(2.5, 5),
    })
  }
}

function scheduleLaunch() {
  if (launchCount >= 8) return
  const delay = launchCount === 0 ? 0 : rand(300, 700)
  launchTimer = window.setTimeout(() => {
    const cx = rand(vw.value * 0.15, vw.value * 0.85)
    const cy = rand(vh.value * 0.1, vh.value * 0.55)
    burst(cx, cy)
    launchCount++
    scheduleLaunch()
  }, delay)
}

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, vw.value, vh.value)

  for (const p of particles) {
    p.x += p.vx
    p.y += p.vy
    p.vy += 0.12
    p.vx *= 0.98
    p.alpha -= 0.014

    ctx.save()
    ctx.globalAlpha = Math.max(0, p.alpha)
    ctx.fillStyle = p.color
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  particles = particles.filter((p) => p.alpha > 0)

  if (particles.length > 0 || launchCount < 8) {
    animId = requestAnimationFrame(draw)
  } else {
    stop()
  }
}

async function start() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReduced) return

  particles = []
  launchCount = 0
  visible.value = true

  await nextTick()
  vw.value = window.innerWidth
  vh.value = window.innerHeight

  scheduleLaunch()
  draw()

  stopTimer = window.setTimeout(() => stop(), 5000)
}

function stop() {
  cancelAnimationFrame(animId)
  clearTimeout(launchTimer)
  clearTimeout(stopTimer)
  visible.value = false
  particles = []
}

watch(
  () => props.active,
  (val) => {
    if (val) start()
    else stop()
  },
)

onUnmounted(stop)
</script>
