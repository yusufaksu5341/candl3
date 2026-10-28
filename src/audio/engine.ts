export const EQ_BANDS = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000]

export const EQ_PRESETS: Record<string, number[]> = {
  flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  bass: [7, 6, 5, 3, 1, 0, 0, 0, 0, 0],
  treble: [0, 0, 0, 0, 0, 1, 3, 5, 6, 7],
  vocal: [-2, -2, -1, 1, 4, 5, 4, 2, 0, -1],
  rock: [5, 4, 2, 0, -1, -1, 1, 3, 4, 5],
  electronic: [6, 5, 1, 0, -2, 1, 0, 2, 5, 6],
  acoustic: [4, 3, 2, 1, 2, 2, 3, 3, 2, 1],
  lofi: [3, 3, 2, 1, 0, -1, -3, -5, -8, -10],
}

/**
 * Single audio pipeline shared by the whole app:
 * <audio> -> EQ filters -> analyser -> speakers.
 * Internet Archive serves CORS headers, so the analyser sees real data.
 */
class AudioEngine {
  readonly audio: HTMLAudioElement
  private ctx?: AudioContext
  private filters: BiquadFilterNode[] = []
  private analyser?: AnalyserNode
  private gains = EQ_BANDS.map(() => 0)
  private freqData = new Uint8Array(1024)
  private waveData = new Uint8Array(2048)

  constructor() {
    this.audio = new Audio()
    this.audio.crossOrigin = 'anonymous'
    this.audio.preload = 'auto'
  }

  /** Must run from a user gesture (browser autoplay policy). */
  ensureContext() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') void this.ctx.resume()
      return
    }
    const ctx = new AudioContext()
    const source = ctx.createMediaElementSource(this.audio)
    this.filters = EQ_BANDS.map((freq, i) => {
      const f = ctx.createBiquadFilter()
      f.type = i === 0 ? 'lowshelf' : i === EQ_BANDS.length - 1 ? 'highshelf' : 'peaking'
      f.frequency.value = freq
      f.Q.value = 1.1
      f.gain.value = this.gains[i]
      return f
    })
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 2048
    analyser.smoothingTimeConstant = 0.82

    let node: AudioNode = source
    for (const f of this.filters) { node.connect(f); node = f }
    node.connect(analyser)
    analyser.connect(ctx.destination)

    this.ctx = ctx
    this.analyser = analyser
    this.freqData = new Uint8Array(analyser.frequencyBinCount)
    this.waveData = new Uint8Array(analyser.fftSize)
  }

  setEqGain(index: number, gain: number) {
    this.gains[index] = gain
    if (this.filters[index]) this.filters[index].gain.value = gain
  }

  /** Byte frequency data (0-255). Returns zeros until playback has started. */
  frequency(): Uint8Array {
    this.analyser?.getByteFrequencyData(this.freqData)
    return this.freqData
  }

  waveform(): Uint8Array {
    if (this.analyser) this.analyser.getByteTimeDomainData(this.waveData)
    else this.waveData.fill(128)
    return this.waveData
  }

  /** 0..1 energy of the low end; handy for beat-reactive effects. */
  bass(): number {
    const d = this.frequency()
    let sum = 0
    const n = Math.min(12, d.length)
    for (let i = 0; i < n; i++) sum += d[i]
    return n ? sum / n / 255 : 0
  }
}

export const engine = new AudioEngine()
