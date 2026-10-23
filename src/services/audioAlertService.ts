import { AlarmToneType } from '../types/dms';

class AudioAlertService {
  private ctx: AudioContext | null = null;
  private activeAlarmNodes: {
    oscillators: OscillatorNode[];
    gain: GainNode;
    intervalId?: number;
  } | null = null;
  private isAlarmPlaying: boolean = false;
  private lastSpokenPhrase: string = '';
  private lastSpokenTime: number = 0;

  private initContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * Play single short acoustic chime or warning chirp
   */
  public playChirp(type: 'advisory' | 'warning' | 'ack' = 'advisory', volume: number = 0.8) {
    try {
      const ctx = this.initContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      const masterVol = Math.max(0.1, Math.min(1.0, volume));

      if (type === 'advisory') {
        // Double ding (800Hz -> 1000Hz)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.setValueAtTime(1050, now + 0.12);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(masterVol * 0.4, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.36);
      } else if (type === 'warning') {
        // Dual warning blip
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(650, now);
        osc.frequency.linearRampToValueAtTime(950, now + 0.15);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(masterVol * 0.7, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.26);
      } else {
        // Acknowledge chime (soft confirmation)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.setValueAtTime(780, now + 0.08);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(masterVol * 0.3, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.26);
      }
    } catch {
      // AudioContext could be blocked if no user gesture yet
    }
  }

  /**
   * Start looping emergency alarm siren
   */
  public startAlarm(toneType: AlarmToneType = 'piercing_siren', volume: number = 0.9) {
    if (this.isAlarmPlaying) return;
    try {
      const ctx = this.initContext();
      this.isAlarmPlaying = true;
      const masterVol = Math.max(0.1, Math.min(1.0, volume));

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(masterVol, ctx.currentTime);
      gain.connect(ctx.destination);

      const oscillators: OscillatorNode[] = [];
      let intervalId: number | undefined;

      if (toneType === 'truck_airhorn') {
        // Deep resonant airhorn chords (220, 277, 330, 440 Hz)
        const freqs = [220, 277.18, 329.63, 440];
        freqs.forEach(freq => {
          const osc = ctx.createOscillator();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          osc.connect(gain);
          osc.start();
          oscillators.push(osc);
        });
      } else if (toneType === 'euro_two_tone') {
        // Alternating 960Hz and 770Hz
        const osc = ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(960, ctx.currentTime);
        osc.connect(gain);
        osc.start();
        oscillators.push(osc);

        let toggle = false;
        intervalId = window.setInterval(() => {
          if (!this.ctx) return;
          toggle = !toggle;
          osc.frequency.setValueAtTime(toggle ? 770 : 960, this.ctx.currentTime);
        }, 220);
      } else if (toneType === 'pulsed_buzzer') {
        // Piercing square-wave pulsing 1000Hz buzzer
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1100, ctx.currentTime);
        osc.connect(gain);
        osc.start();
        oscillators.push(osc);

        let isOn = true;
        intervalId = window.setInterval(() => {
          if (!this.ctx) return;
          isOn = !isOn;
          gain.gain.setValueAtTime(isOn ? masterVol : 0.05, this.ctx.currentTime);
        }, 110);
      } else {
        // Default: Piercing sweeping siren (800Hz - 1600Hz continuous warble)
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        osc1.type = 'sawtooth';
        osc2.type = 'square';

        osc1.connect(gain);
        osc2.connect(gain);
        osc1.start();
        osc2.start();
        oscillators.push(osc1, osc2);

        let phase = 0;
        intervalId = window.setInterval(() => {
          if (!this.ctx) return;
          phase += 0.25;
          const sweepFreq = 900 + Math.sin(phase) * 600;
          osc1.frequency.setValueAtTime(sweepFreq, this.ctx.currentTime);
          osc2.frequency.setValueAtTime(sweepFreq * 0.5, this.ctx.currentTime);
        }, 60);
      }

      this.activeAlarmNodes = { oscillators, gain, intervalId };
    } catch {
      this.isAlarmPlaying = false;
    }
  }

  /**
   * Stop any active emergency alarm siren
   */
  public stopAlarm() {
    if (!this.isAlarmPlaying || !this.activeAlarmNodes) return;
    try {
      if (this.activeAlarmNodes.intervalId) {
        clearInterval(this.activeAlarmNodes.intervalId);
      }
      this.activeAlarmNodes.oscillators.forEach(osc => {
        try {
          osc.stop();
          osc.disconnect();
        } catch {
          // ignore already stopped
        }
      });
      this.activeAlarmNodes.gain.disconnect();
    } catch {
      // ignore
    } finally {
      this.activeAlarmNodes = null;
      this.isAlarmPlaying = false;
    }
  }

  public isPlaying(): boolean {
    return this.isAlarmPlaying;
  }

  /**
   * Speak voice alert to driver using Web Speech API
   * Implements throttle and priority so critical alerts immediately preempt lower alerts
   */
  public speak(
    message: string,
    options: {
      volume?: number;
      rate?: number;
      pitch?: number;
      preferredVoiceURI?: string;
      lang?: 'en' | 'ar';
      urgent?: boolean;
    } = {}
  ) {
    if (!('speechSynthesis' in window)) return;

    const now = Date.now();
    // Prevent repeating identical non-urgent phrases too rapidly (min 3.5s gap)
    if (!options.urgent && message === this.lastSpokenPhrase && now - this.lastSpokenTime < 3500) {
      return;
    }

    try {
      // If urgent, immediately stop any currently playing speech to deliver critical warning!
      if (options.urgent) {
        window.speechSynthesis.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(message);
      utterance.volume = Math.max(0.1, Math.min(1.0, options.volume ?? 1.0));
      utterance.rate = Math.max(0.7, Math.min(1.5, options.rate ?? 1.1));
      utterance.pitch = Math.max(0.8, Math.min(1.3, options.pitch ?? 1.0));

      const isArabic = options.lang === 'ar' || /[\u0600-\u06FF]/.test(message);
      if (isArabic) {
        utterance.lang = 'ar-SA';
      }

      // Voice selection
      const voices = window.speechSynthesis.getVoices();
      if (options.preferredVoiceURI) {
        const found = voices.find(v => v.voiceURI === options.preferredVoiceURI);
        if (found) utterance.voice = found;
      }
      if (!utterance.voice && voices.length > 0) {
        if (isArabic) {
          // Look for Arabic voice
          const arVoice = voices.find(v => v.lang.startsWith('ar'));
          if (arVoice) utterance.voice = arVoice;
        } else {
          // Prefer natural English voices (e.g. Google US English, Samantha, Daniel, Natural)
          const preferred = voices.find(
            v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel'))
          ) || voices.find(v => v.lang.startsWith('en')) || voices[0];
          if (preferred) utterance.voice = preferred;
        }
      }

      this.lastSpokenPhrase = message;
      this.lastSpokenTime = now;

      window.speechSynthesis.speak(utterance);
    } catch {
      // speech synthesis error
    }
  }

  /**
   * Trigger haptic vibration for mobile or dashboard mounted touch devices
   */
  public triggerVibration(pattern: number[] = [200, 100, 200, 100, 500]) {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // ignore
      }
    }
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!('speechSynthesis' in window)) return [];
    return window.speechSynthesis.getVoices();
  }
}

export const audioAlertService = new AudioAlertService();
