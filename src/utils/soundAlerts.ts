class SoundAlertManager {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      this.audioContext = new AudioContext();
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  isEnabled() {
    return this.enabled;
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine') {
    if (!this.enabled || !this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  }

  playUpdate() {
    this.playTone(800, 0.1);
    setTimeout(() => this.playTone(1000, 0.15), 100);
  }

  playAlert() {
    this.playTone(400, 0.2);
    setTimeout(() => this.playTone(300, 0.3), 200);
  }

  playSuccess() {
    this.playTone(523, 0.1);
    setTimeout(() => this.playTone(659, 0.1), 100);
    setTimeout(() => this.playTone(784, 0.2), 200);
  }

  playWarning() {
    this.playTone(600, 0.15);
    setTimeout(() => this.playTone(600, 0.15), 200);
    setTimeout(() => this.playTone(600, 0.15), 400);
  }
}

export const soundAlert = new SoundAlertManager();
