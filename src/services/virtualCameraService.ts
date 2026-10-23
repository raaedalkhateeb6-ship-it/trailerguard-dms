/**
 * Virtual Camera Generator
 * Creates an animated canvas video stream simulating a commercial truck driver
 * Allows complete real-time vision testing even when a physical webcam is blocked,
 * busy in another program, or unsupported.
 */

export class VirtualCameraService {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animFrameId: number | null = null;
  private stream: MediaStream | null = null;
  private isActive: boolean = false;

  // Driver animated state
  private eyeOpen: number = 0.8;
  private mouthOpen: number = 0.1;
  private headPitchDeg: number = 0;
  private headYawDeg: number = 0;
  private blinkTimer: number = 0;
  private mode: 'normal' | 'drowsy' | 'yawn' | 'nod' = 'normal';

  public createStream(width: number = 640, height: number = 480): MediaStream {
    this.stop();

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas 2d context');

    this.canvas = canvas;
    this.ctx = ctx;
    this.isActive = true;

    // Capture 30fps MediaStream from canvas
    const stream = canvas.captureStream(30);
    this.stream = stream;

    this.startAnimationLoop();
    return stream;
  }

  public setMode(mode: 'normal' | 'drowsy' | 'yawn' | 'nod') {
    this.mode = mode;
  }

  public getDriverEyeOpen(): number {
    return this.eyeOpen;
  }

  public getDriverMouthOpen(): number {
    return this.mouthOpen;
  }

  public getDriverPitch(): number {
    return this.headPitchDeg;
  }

  public isRunning(): boolean {
    return this.isActive;
  }

  private startAnimationLoop() {
    let tick = 0;

    const render = () => {
      if (!this.isActive || !this.ctx || !this.canvas) return;
      tick++;

      const w = this.canvas.width;
      const h = this.canvas.height;
      const ctx = this.ctx;

      // Update simulated driver dynamics
      if (this.mode === 'drowsy') {
        // Prolonged closed eyes
        this.eyeOpen = 0.05;
        this.mouthOpen = 0.1;
        this.headPitchDeg = -8;
      } else if (this.mode === 'yawn') {
        this.eyeOpen = 0.25;
        this.mouthOpen = 0.75 + Math.sin(tick * 0.08) * 0.15;
        this.headPitchDeg = -4;
      } else if (this.mode === 'nod') {
        this.eyeOpen = 0.1;
        this.headPitchDeg = -18 + Math.sin(tick * 0.1) * 3;
        this.mouthOpen = 0.15;
      } else {
        // Normal alert driving with natural blinks every ~3.5 seconds
        this.blinkTimer++;
        if (this.blinkTimer > 100 && this.blinkTimer < 108) {
          this.eyeOpen = 0.05; // blink
        } else {
          this.eyeOpen = 0.85;
          if (this.blinkTimer >= 115) this.blinkTimer = 0;
        }
        this.mouthOpen = 0.08;
        this.headPitchDeg = Math.sin(tick * 0.03) * 2;
        this.headYawDeg = Math.cos(tick * 0.02) * 3;
      }

      // 1. Draw Truck Cabin Interior Background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, '#020617'); // Dark roof
      bgGrad.addColorStop(0.4, '#0f172a'); // Windshield view twilight
      bgGrad.addColorStop(1, '#020617'); // Dashboard
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Distant highway vanishing lines
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.25)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(w * 0.5, h * 0.35);
      ctx.lineTo(w * 0.1, h * 0.7);
      ctx.moveTo(w * 0.5, h * 0.35);
      ctx.lineTo(w * 0.9, h * 0.7);
      ctx.stroke();

      // Steering wheel bottom curve
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 18;
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 1.05, w * 0.42, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();

      // 2. Draw Simulated Driver Face
      const faceCenterX = w * 0.5 + this.headYawDeg * 2;
      const faceCenterY = h * 0.44 - this.headPitchDeg * 2;
      const faceRadius = 95;

      // Neck & Shoulders (commercial driver uniform)
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(faceCenterX - 110, h);
      ctx.lineTo(faceCenterX - 45, faceCenterY + faceRadius * 0.9);
      ctx.lineTo(faceCenterX + 45, faceCenterY + faceRadius * 0.9);
      ctx.lineTo(faceCenterX + 110, h);
      ctx.closePath();
      ctx.fill();

      // Head / Face Oval
      ctx.fillStyle = '#e2b392';
      ctx.beginPath();
      ctx.ellipse(faceCenterX, faceCenterY, faceRadius * 0.72, faceRadius, 0, 0, Math.PI * 2);
      ctx.fill();

      // Driver Cap / Trucker Hat
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(faceCenterX, faceCenterY - faceRadius * 0.45, faceRadius * 0.76, Math.PI, Math.PI * 2);
      ctx.fill();
      // Cap Brim
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.ellipse(faceCenterX, faceCenterY - faceRadius * 0.35, faceRadius * 0.85, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      // 3. Eyes
      const eyeSpacing = 32;
      const eyeY = faceCenterY - 8;
      const eyeWidth = 22;
      const eyeHeight = Math.max(3, eyeWidth * 0.6 * this.eyeOpen);

      const drawEye = (x: number) => {
        // Eye whites
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(x, eyeY, eyeWidth * 0.5, eyeHeight * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();

        if (this.eyeOpen > 0.2) {
          // Iris
          ctx.fillStyle = '#3b82f6';
          ctx.beginPath();
          ctx.arc(x, eyeY, eyeHeight * 0.35, 0, Math.PI * 2);
          ctx.fill();

          // Pupil
          ctx.fillStyle = '#000000';
          ctx.beginPath();
          ctx.arc(x, eyeY, eyeHeight * 0.2, 0, Math.PI * 2);
          ctx.fill();
        }

        // Eyelid line
        ctx.strokeStyle = '#854d0e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(x, eyeY, eyeWidth * 0.52, eyeHeight * 0.52, 0, 0, Math.PI);
        ctx.stroke();
      };

      drawEye(faceCenterX - eyeSpacing);
      drawEye(faceCenterX + eyeSpacing);

      // Eyebrows
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(faceCenterX - eyeSpacing - 14, eyeY - 14);
      ctx.lineTo(faceCenterX - eyeSpacing + 14, eyeY - 16);
      ctx.moveTo(faceCenterX + eyeSpacing - 14, eyeY - 16);
      ctx.lineTo(faceCenterX + eyeSpacing + 14, eyeY - 14);
      ctx.stroke();

      // Nose
      ctx.strokeStyle = '#c28863';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(faceCenterX, eyeY + 6);
      ctx.lineTo(faceCenterX - 3, eyeY + 28);
      ctx.lineTo(faceCenterX + 4, eyeY + 28);
      ctx.stroke();

      // 4. Mouth
      const mouthY = faceCenterY + 45;
      const mouthWidth = 28;
      const mouthHeight = Math.max(3, 26 * this.mouthOpen);

      ctx.fillStyle = this.mouthOpen > 0.4 ? '#450a0a' : '#b91c1c';
      ctx.beginPath();
      ctx.ellipse(faceCenterX, mouthY, mouthWidth * 0.5, mouthHeight * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Watermark indicator on virtual video feed
      ctx.fillStyle = 'rgba(245, 158, 11, 0.9)';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('● SIMULATED DRIVER FEED (60 FPS)', 14, 24);

      this.animFrameId = requestAnimationFrame(render);
    };

    this.animFrameId = requestAnimationFrame(render);
  }

  public stop() {
    this.isActive = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
    this.canvas = null;
    this.ctx = null;
  }

  public getStream(): MediaStream | null {
    return this.stream;
  }
}

export const virtualCameraService = new VirtualCameraService();
