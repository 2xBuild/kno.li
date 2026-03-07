type SfxKind = "click" | "switch"

const STORAGE_KEY = "sfx"

let ctx: AudioContext | null = null
let clickNoiseBuffer: AudioBuffer | null = null
let swipeNoiseBuffer: AudioBuffer | null = null
let lastPlayAt = 0

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null
  if (ctx) return ctx
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctx) return null
  ctx = new Ctx()
  return ctx
}

function isSfxEnabled(): boolean {
  if (typeof window === "undefined") return false
  const v = localStorage.getItem(STORAGE_KEY)
  if (v === "0" || v === "false") return false
  return true
}

function getClickNoiseBuffer(ac: AudioContext) {
  if (clickNoiseBuffer && clickNoiseBuffer.sampleRate === ac.sampleRate) {
    return clickNoiseBuffer
  }

  const duration = 0.018
  const length = Math.max(1, Math.floor(ac.sampleRate * duration))
  const buffer = ac.createBuffer(1, length, ac.sampleRate)
  const channel = buffer.getChannelData(0)

  for (let i = 0; i < length; i += 1) {
    const decay = 1 - i / length
    channel[i] = (Math.random() * 2 - 1) * decay
  }

  clickNoiseBuffer = buffer
  return buffer
}

function getSwipeNoiseBuffer(ac: AudioContext) {
  if (swipeNoiseBuffer && swipeNoiseBuffer.sampleRate === ac.sampleRate) {
    return swipeNoiseBuffer
  }

  const duration = 0.05
  const length = Math.max(1, Math.floor(ac.sampleRate * duration))
  const buffer = ac.createBuffer(1, length, ac.sampleRate)
  const channel = buffer.getChannelData(0)

  for (let i = 0; i < length; i += 1) {
    const progress = i / length
    const shape = 0.45 + (1 - progress) * 0.55
    channel[i] = (Math.random() * 2 - 1) * shape
  }

  swipeNoiseBuffer = buffer
  return buffer
}

function play(kind: SfxKind) {
  if (typeof window === "undefined") return
  if (!isSfxEnabled()) return
  if (document.visibilityState === "hidden") return

  const now = performance.now()
  if (now - lastPlayAt < 60) return
  lastPlayAt = now

  const ac = getAudioContext()
  if (!ac) return

  if (ac.state === "suspended") {
    void ac.resume().catch(() => {})
  }

  const t0 = ac.currentTime
  const peak = 0.12

  if (kind === "click") {
    const noise = ac.createBufferSource()
    const noiseFilter = ac.createBiquadFilter()
    const noiseGain = ac.createGain()
    const snap = ac.createOscillator()
    const snapGain = ac.createGain()
    const body = ac.createOscillator()
    const bodyGain = ac.createGain()

    noise.buffer = getClickNoiseBuffer(ac)
    noiseFilter.type = "bandpass"
    noiseFilter.frequency.setValueAtTime(4200, t0)
    noiseFilter.Q.setValueAtTime(1.4, t0)

    noiseGain.gain.setValueAtTime(peak * 0.55, t0)
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.012)

    snap.type = "triangle"
    snap.frequency.setValueAtTime(2800, t0)
    snap.frequency.exponentialRampToValueAtTime(1700, t0 + 0.01)

    snapGain.gain.setValueAtTime(peak * 0.18, t0)
    snapGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.012)

    body.type = "triangle"
    body.frequency.setValueAtTime(190, t0)
    body.frequency.exponentialRampToValueAtTime(120, t0 + 0.022)

    bodyGain.gain.setValueAtTime(peak * 0.38, t0)
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.024)

    noise.connect(noiseFilter)
    noiseFilter.connect(noiseGain)
    noiseGain.connect(ac.destination)

    snap.connect(snapGain)
    snapGain.connect(ac.destination)

    body.connect(bodyGain)
    bodyGain.connect(ac.destination)

    noise.start(t0)
    noise.stop(t0 + 0.018)
    snap.start(t0)
    snap.stop(t0 + 0.014)
    body.start(t0)
    body.stop(t0 + 0.026)
  } else {
    const osc = ac.createOscillator()
    const gain = ac.createGain()
    const air = ac.createBufferSource()
    const airFilter = ac.createBiquadFilter()
    const airGain = ac.createGain()

    osc.type = "triangle"
    osc.frequency.setValueAtTime(520, t0)
    osc.frequency.exponentialRampToValueAtTime(1450, t0 + 0.055)

    gain.gain.setValueAtTime(0.001, t0)
    gain.gain.linearRampToValueAtTime(peak * 0.4, t0 + 0.012)
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.075)

    air.buffer = getSwipeNoiseBuffer(ac)
    airFilter.type = "bandpass"
    airFilter.frequency.setValueAtTime(1400, t0)
    airFilter.Q.setValueAtTime(0.8, t0)

    airGain.gain.setValueAtTime(0.0001, t0)
    airGain.gain.linearRampToValueAtTime(peak * 0.22, t0 + 0.014)
    airGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.07)

    osc.connect(gain)
    gain.connect(ac.destination)
    air.connect(airFilter)
    airFilter.connect(airGain)
    airGain.connect(ac.destination)

    osc.start(t0)
    osc.stop(t0 + 0.08)
    air.start(t0)
    air.stop(t0 + 0.05)
  }
}

export function playClickSfx() {
  play("click")
}

export function playSwitchSfx() {
  play("switch")
}
