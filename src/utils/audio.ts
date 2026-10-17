/**
 * Web Audio API synthesizer for synthesized soundtracks and sound effects
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private currentBgmLoop: number | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.5;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.currentBgmLoop) {
      this.stopBgm();
    }
  }

  public getMuted() {
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public playSoundEffect(type: 'swoosh' | 'laser' | 'explosion' | 'sparkle' | 'footstep' | 'chime' | 'hit' | 'glitch') {
    if (this.isMuted) return;
    try {
      const ctx = this.initCtx();
      const now = ctx.currentTime;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(this.volume * 0.7, now);
      masterGain.connect(ctx.destination);

      if (type === 'swoosh') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.18);
        gain.gain.setValueAtTime(0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'laser') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.16);
      } else if (type === 'hit') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.12);
        gain.gain.setValueAtTime(0.8, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.13);
      } else if (type === 'sparkle') {
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.2, now + i * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.05 + 0.2);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now + i * 0.05);
          osc.stop(now + i * 0.05 + 0.25);
        });
      } else if (type === 'chime') {
        const freqs = [440, 554.37, 659.25];
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.3, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.4);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.45);
        });
      } else if (type === 'explosion') {
        const bufferSize = ctx.sampleRate * 0.4;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.12));
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(300, now);
        filter.frequency.linearRampToValueAtTime(80, now + 0.3);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.8, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);
        noise.start(now);
      } else if (type === 'footstep') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.08);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.09);
      } else if (type === 'glitch') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(240, now);
        osc.frequency.setValueAtTime(800, now + 0.03);
        osc.frequency.setValueAtTime(150, now + 0.06);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.1);
      }
    } catch {
      // Audio context might be restricted before user gesture
    }
  }

  public startBgm(track: 'synthwave' | 'chiptune' | 'ambient' | 'cinematic' | 'mysterious' | 'none') {
    if (track === 'none' || this.isMuted) {
      this.stopBgm();
      return;
    }
    this.stopBgm();

    try {
      const ctx = this.initCtx();
      let step = 0;

      // Define musical notes in Hz
      const notes: Record<string, number> = {
        C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
        C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
        C5: 523.25, D5: 587.33, E5: 659.25,
      };

      const synthwavePattern = [
        notes.A3, notes.A3, notes.C4, notes.D4,
        notes.E4, notes.E4, notes.D4, notes.C4,
        notes.G3, notes.G3, notes.B3, notes.D4,
        notes.F3, notes.F3, notes.A3, notes.C4,
      ];

      const chiptunePattern = [
        notes.C4, notes.E4, notes.G4, notes.C5,
        notes.G4, notes.E4, notes.D4, notes.F4,
        notes.A4, notes.D5, notes.A4, notes.F4,
        notes.G4, notes.B4, notes.D5, notes.G5,
      ];

      const ambientPattern = [
        notes.D3, notes.A3, notes.D4, notes.F4,
        notes.C3, notes.G3, notes.C4, notes.E4,
        notes.A3, notes.E4, notes.A4, notes.C5,
        notes.G3, notes.D4, notes.G4, notes.B4,
      ];

      const intervalMs = track === 'chiptune' ? 160 : track === 'synthwave' ? 220 : 380;
      const pattern = track === 'chiptune' ? chiptunePattern : track === 'ambient' ? ambientPattern : synthwavePattern;

      this.currentBgmLoop = window.setInterval(() => {
        if (this.isMuted) return;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = track === 'chiptune' ? 'square' : track === 'ambient' ? 'sine' : 'sawtooth';
        osc.frequency.value = pattern[step % pattern.length] || 220;

        const duration = (intervalMs / 1000) * 0.85;
        const noteVol = (track === 'ambient' ? 0.15 : track === 'chiptune' ? 0.12 : 0.2) * this.volume;

        gain.gain.setValueAtTime(noteVol, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        // Lowpass filter for warm synth sound
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = track === 'chiptune' ? 2400 : track === 'ambient' ? 800 : 1200;

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + duration + 0.05);

        step++;
      }, intervalMs);
    } catch {
      // Ignore background audio playback initiation if user hasn't interacted
    }
  }

  public stopBgm() {
    if (this.currentBgmLoop) {
      clearInterval(this.currentBgmLoop);
      this.currentBgmLoop = null;
    }
  }
}

export const soundEngine = new SoundEngine();
