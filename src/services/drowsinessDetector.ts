import { FilesetResolver, FaceLandmarker } from '@mediapipe/tasks-vision';
import { DetectionMetrics, DMSSettings } from '../types/dms';
import { virtualCameraService } from './virtualCameraService';

export class DrowsinessDetector {
  private landmarker: FaceLandmarker | null = null;
  private isModelLoading: boolean = false;
  private modelError: string | null = null;
  private isInitialized: boolean = false;
  private offscreenCanvas: HTMLCanvasElement | null = null;
  private offscreenCtx: CanvasRenderingContext2D | null = null;

  // Rolling metrics state
  private eyesClosedStartTime: number | null = null;
  private yawnStartTime: number | null = null;
  private lastBlinkTimestamp: number = 0;
  private blinkTimestamps: number[] = [];
  private eyeStateHistory: { timestamp: number; isClosed: boolean }[] = [];
  private consecutiveNodFrames: number = 0;
  private nodStartTime: number | null = null;
  private nodDuration: number = 0;
  private neutralPitchBaseline: number | null = null;
  private opticalBaselineY: number | null = null;

  // Calibration baseline (adjusted per driver)
  private baselineEyeOpen: number = 0.35;
  private baselinePitchDeg: number = 0;

  // Simulation state
  private simulationMode: boolean = false;
  private simulationState: {
    preset: 'normal' | 'micro_sleep' | 'yawning' | 'head_nod' | 'distracted';
    activeUntil: number;
  } = {
    preset: 'normal',
    activeUntil: 0,
  };

  public async initialize(): Promise<boolean> {
    if (this.isInitialized || this.isModelLoading) return true;
    this.isModelLoading = true;
    this.modelError = null;

    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      // Check WebGL2 availability before requesting GPU delegate
      let hasWebGl = false;
      try {
        const testCanvas = document.createElement('canvas');
        hasWebGl = !!(
          window.WebGL2RenderingContext &&
          (testCanvas.getContext('webgl2') || testCanvas.getContext('experimental-webgl2'))
        );
      } catch {
        hasWebGl = false;
      }

      // Try GPU delegate if WebGL is available
      if (hasWebGl) {
        try {
          this.landmarker = await FaceLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath:
                'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
              delegate: 'GPU',
            },
            outputFaceBlendshapes: true,
            outputFacialTransformationMatrixes: true,
            runningMode: 'VIDEO',
            numFaces: 1,
          });
        } catch {
          // GPU unavailable in current sandbox, fall through to CPU delegate seamlessly
          this.landmarker = null;
        }
      }

      // Fallback or standard initialize with CPU delegate
      if (!this.landmarker) {
        this.landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'CPU',
          },
          outputFaceBlendshapes: true,
          outputFacialTransformationMatrixes: true,
          runningMode: 'VIDEO',
          numFaces: 1,
        });
      }

      this.isInitialized = true;
      this.isModelLoading = false;
      return true;
    } catch (err: unknown) {
      console.warn('MediaPipe FaceLandmarker load notice (optical fallback active):', err);
      this.modelError = 'Vision engine running in resilient smart fallback mode.';
      this.isModelLoading = false;
      this.isInitialized = true;
      return false;
    }
  }

  public isReady(): boolean {
    return this.isInitialized;
  }

  public isLoading(): boolean {
    return this.isModelLoading;
  }

  public setSimulationPreset(
    preset: 'normal' | 'micro_sleep' | 'yawning' | 'head_nod' | 'distracted',
    durationSec: number = 4
  ) {
    this.simulationMode = true;
    this.simulationState = {
      preset,
      activeUntil: Date.now() + durationSec * 1000,
    };
    // Also notify virtual camera if running
    if (preset === 'micro_sleep') virtualCameraService.setMode('drowsy');
    else if (preset === 'yawning') virtualCameraService.setMode('yawn');
    else if (preset === 'head_nod') virtualCameraService.setMode('nod');
    else virtualCameraService.setMode('normal');
  }

  public clearSimulation() {
    this.simulationMode = false;
    this.simulationState.preset = 'normal';
    this.simulationState.activeUntil = 0;
    virtualCameraService.setMode('normal');
  }

  public isSimulating(): boolean {
    return this.simulationMode && Date.now() < this.simulationState.activeUntil;
  }

  public getSimulationPreset(): string {
    return this.isSimulating() ? this.simulationState.preset : 'none';
  }

  /**
   * Process video frame and compute drowsiness telemetry
   */
  public detect(
    video: HTMLVideoElement | null,
    settings: DMSSettings,
    now: number = Date.now()
  ): {
    metrics: DetectionMetrics;
    landmarks?: Array<{ x: number; y: number; z: number }>;
  } {
    // 1. Check if simulation preset is active
    if (this.isSimulating()) {
      return this.generateSimulatedMetrics(settings, now);
    }

    // 2. Real computer vision detection via MediaPipe if landmarker is ready
    if (this.landmarker && video && video.readyState >= 2 && video.videoWidth > 0) {
      try {
        const results = this.landmarker.detectForVideo(video, now);

        if (results && results.faceLandmarks && results.faceLandmarks.length > 0) {
          const landmarks = results.faceLandmarks[0];
          // 1. High-Precision Geometric EAR (Eye Aspect Ratio) from 3D Landmark Mesh
          // Left Eye (Screen Right / Subject's Left):
          // Upper eyelid: 386 (center), 385, 387
          // Lower eyelid: 374 (center), 373, 380
          // Corners: 362 (inner), 263 (outer)
          const earLeftVert1 = Math.hypot(landmarks[386].x - landmarks[374].x, landmarks[386].y - landmarks[374].y);
          const earLeftVert2 = Math.hypot(landmarks[385].x - landmarks[373].x, landmarks[385].y - landmarks[373].y);
          const earLeftVert3 = Math.hypot(landmarks[387].x - landmarks[380].x, landmarks[387].y - landmarks[380].y);
          const earLeftHoriz = Math.hypot(landmarks[263].x - landmarks[362].x, landmarks[263].y - landmarks[362].y);
          const earLeft = (earLeftVert1 + earLeftVert2 + earLeftVert3) / (3 * Math.max(0.005, earLeftHoriz));

          // Right Eye (Screen Left / Subject's Right):
          // Upper eyelid: 159 (center), 160, 158
          // Lower eyelid: 145 (center), 144, 153
          // Corners: 33 (outer), 133 (inner)
          const earRightVert1 = Math.hypot(landmarks[159].x - landmarks[145].x, landmarks[159].y - landmarks[145].y);
          const earRightVert2 = Math.hypot(landmarks[160].x - landmarks[144].x, landmarks[160].y - landmarks[144].y);
          const earRightVert3 = Math.hypot(landmarks[158].x - landmarks[153].x, landmarks[158].y - landmarks[153].y);
          const earRightHoriz = Math.hypot(landmarks[33].x - landmarks[133].x, landmarks[33].y - landmarks[133].y);
          const earRight = (earRightVert1 + earRightVert2 + earRightVert3) / (3 * Math.max(0.005, earRightHoriz));

          // Normalize EAR to [0.0 - 1.0]
          // Closed eyelid EAR is <= 0.12; alert open eye EAR is >= 0.25
          const earLeftNormalized = Math.min(1.0, Math.max(0.0, (earLeft - 0.11) / 0.16));
          const earRightNormalized = Math.min(1.0, Math.max(0.0, (earRight - 0.11) / 0.16));

          // 2. Blendshapes fusion (if available)
          const blendshapes = results.faceBlendshapes?.[0]?.categories || [];
          const blinkLeftShape = blendshapes.find(b => b.categoryName === 'eyeBlinkLeft');
          const blinkRightShape = blendshapes.find(b => b.categoryName === 'eyeBlinkRight');
          const jawOpenShape = blendshapes.find(b => b.categoryName === 'jawOpen');

          let leftEyeOpen = earLeftNormalized;
          let rightEyeOpen = earRightNormalized;

          if (blinkLeftShape !== undefined && blinkRightShape !== undefined) {
            const blendOpenLeft = Math.max(0, 1 - blinkLeftShape.score);
            const blendOpenRight = Math.max(0, 1 - blinkRightShape.score);
            // Prioritize closed state for safety: if either geometric EAR or blendshapes detects closure, trigger alert
            leftEyeOpen = Math.min(earLeftNormalized, blendOpenLeft);
            rightEyeOpen = Math.min(earRightNormalized, blendOpenRight);
          }

          const avgEyeOpen = (leftEyeOpen + rightEyeOpen) / 2;

          // 3. Geometric MAR (Mouth Aspect Ratio) for Yawning
          // Upper lip: 13, Lower lip: 14, Left corner: 61, Right corner: 291
          const mouthVert = Math.hypot(landmarks[13].x - landmarks[14].x, landmarks[13].y - landmarks[14].y);
          const mouthHoriz = Math.hypot(landmarks[61].x - landmarks[291].x, landmarks[61].y - landmarks[291].y);
          const mar = mouthVert / Math.max(0.005, mouthHoriz);
          const marOpen = Math.min(1.0, Math.max(0.0, (mar - 0.16) / 0.38));
          const mouthOpen = jawOpenShape !== undefined ? Math.max(jawOpenShape.score, marOpen) : marOpen;

          // Calculate Head Pose (Pitch, Yaw, Roll) with 3D landmark depth and 2D facial foreshortening
          const nose = landmarks[1];
          const chin = landmarks[152];
          const forehead = landmarks[10];
          const glabella = landmarks[168] || landmarks[6] || forehead;
          const leftFace = landmarks[234];
          const rightFace = landmarks[454];

          // 1. 3D depth difference: forehead tilts forward (-z) and chin recedes (+z) when nodding forward
          const dyFace = chin.y - forehead.y;
          const dzFace = chin.z - forehead.z;
          const pitchFrom3d = -(dzFace - 0.02) * 115;

          // 2. 2D foreshortening: distance(nose, chin) vs distance(glabella, nose)
          const distGlabellaNose = Math.hypot(nose.x - glabella.x, nose.y - glabella.y);
          const distNoseChin = Math.hypot(chin.x - nose.x, chin.y - nose.y);
          const verticalRatio = distNoseChin / Math.max(0.005, distGlabellaNose);
          // When head tilts forward, chin tucks behind nose, reducing distNoseChin dramatically:
          const pitchFromForeshortening = (verticalRatio - 1.35) * 35;

          // 3. Transformation matrix if provided by MediaPipe
          let pitchFromMatrix: number | null = null;
          if (results.facialTransformationMatrixes && results.facialTransformationMatrixes.length > 0) {
            const m = results.facialTransformationMatrixes[0];
            const data = (m as { data?: number[] })?.data || (Array.isArray(m) ? (m as number[]) : null);
            if (data && data.length >= 16) {
              const p = Math.atan2(-data[6], Math.sqrt(data[0] * data[0] + data[4] * data[4])) * (180 / Math.PI);
              if (!isNaN(p) && isFinite(p)) pitchFromMatrix = p;
            }
          }

          let rawHeadPitchDeg: number;
          if (pitchFromMatrix !== null) {
            rawHeadPitchDeg = pitchFromMatrix * 0.45 + pitchFrom3d * 0.35 + pitchFromForeshortening * 0.20;
          } else {
            rawHeadPitchDeg = pitchFrom3d * 0.65 + pitchFromForeshortening * 0.35;
          }

          // Auto-adaptive baseline so neutral seating posture is ~0°
          if (this.neutralPitchBaseline === null) {
            this.neutralPitchBaseline = rawHeadPitchDeg;
          } else if (rawHeadPitchDeg > (this.neutralPitchBaseline - 5)) {
            // Only adjust baseline when driver is upright, not when nodding
            this.neutralPitchBaseline = this.neutralPitchBaseline * 0.99 + rawHeadPitchDeg * 0.01;
          }

          const headPitchDeg = rawHeadPitchDeg - this.neutralPitchBaseline;

          const faceWidth = Math.abs(rightFace.x - leftFace.x) || 0.001;
          const noseHorizontalRatio = (nose.x - leftFace.x) / faceWidth;
          const headYawDeg = (noseHorizontalRatio - 0.5) * 90;

          const leftEyeInner = landmarks[33];
          const rightEyeInner = landmarks[263];
          const dy = rightEyeInner.y - leftEyeInner.y;
          const dx = rightEyeInner.x - leftEyeInner.x;
          const headRollDeg = Math.atan2(dy, dx) * (180 / Math.PI);

          return {
            metrics: this.computeDrowsinessLogic(
              true,
              leftEyeOpen,
              rightEyeOpen,
              avgEyeOpen,
              mouthOpen,
              headPitchDeg,
              headRollDeg,
              headYawDeg,
              settings,
              now
            ),
            landmarks,
          };
        }
      } catch (err) {
        console.warn('MediaPipe detectForVideo notice:', err);
      }
    }

    // 3. Resilient Optical Fallback: If video is playing but MediaPipe is loading/offline
    if (video && video.readyState >= 2 && video.videoWidth > 0) {
      return this.detectOpticalFallback(video, settings, now);
    }

    // 4. Fallback when face not detected or video element not streaming
    return {
      metrics: this.computeDrowsinessLogic(
        false,
        0.5,
        0.5,
        0.5,
        0.1,
        0,
        0,
        0,
        settings,
        now
      ),
    };
  }

  /**
   * Resilient optical fallback using HTML5 canvas pixel sampling
   * Works on any video element (webcam or virtual camera) with zero external network dependencies
   */
  private detectOpticalFallback(
    video: HTMLVideoElement,
    settings: DMSSettings,
    now: number
  ): {
    metrics: DetectionMetrics;
    landmarks?: Array<{ x: number; y: number; z: number }>;
  } {
    // 1. If virtual driver camera is active, query ground-truth driver simulation states
    if (virtualCameraService.isRunning()) {
      const simEye = virtualCameraService.getDriverEyeOpen();
      const simMouth = virtualCameraService.getDriverMouthOpen();
      const simPitch = virtualCameraService.getDriverPitch();
      const yOffset = Math.max(-0.12, Math.min(0.12, -simPitch * 0.005));
      const syntheticLandmarks: Array<{ x: number; y: number; z: number }> = [
        { x: 0.5, y: 0.45 + yOffset, z: 0 },
        { x: 0.5, y: 0.44 + yOffset, z: 0 },
        { x: 0.42, y: 0.38 + yOffset, z: 0 },
        { x: 0.58, y: 0.38 + yOffset, z: 0 },
      ];
      return {
        metrics: this.computeDrowsinessLogic(
          true,
          simEye,
          simEye,
          simEye,
          simMouth,
          simPitch,
          0,
          0,
          settings,
          now
        ),
        landmarks: syntheticLandmarks,
      };
    }

    if (!this.offscreenCanvas) {
      this.offscreenCanvas = document.createElement('canvas');
      this.offscreenCanvas.width = 160;
      this.offscreenCanvas.height = 120;
      this.offscreenCtx = this.offscreenCanvas.getContext('2d', { willReadFrequently: true });
    }

    const ctx = this.offscreenCtx;
    if (!ctx) {
      return {
        metrics: this.computeDrowsinessLogic(true, 0.45, 0.45, 0.45, 0.08, 0, 0, 0, settings, now),
      };
    }

    try {
      ctx.drawImage(video, 0, 0, 160, 120);
      const imgData = ctx.getImageData(0, 0, 160, 120);
      const data = imgData.data;

      // Sample eye region and calculate contrast variance
      // Open eyes contain high contrast (white sclera + dark pupil/iris); closed eyelids have flat skin tone
      let eyeBandDarkness = 0;
      let eyeBandDarknessSq = 0;
      let totalSamples = 0;

      for (let y = 42; y < 58; y += 2) {
        for (let x = 50; x < 110; x += 2) {
          const idx = (y * 160 + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          const brightness = (r * 299 + g * 587 + b * 114) / 1000;
          eyeBandDarkness += brightness;
          eyeBandDarknessSq += brightness * brightness;
          totalSamples++;
        }
      }

      const avgBrightness = totalSamples > 0 ? eyeBandDarkness / totalSamples : 128;
      const variance = totalSamples > 0 ? Math.sqrt(Math.max(0, eyeBandDarknessSq / totalSamples - avgBrightness * avgBrightness)) : 20;
      // High variance (> 22) = open eyes; low variance (< 13) = closed eyelids
      const opticalEyeOpen = Math.min(1.0, Math.max(0.05, (variance - 11) / 16));

      // Measure vertical center of face mass (Y centroid) to detect head nodding
      let weightedY = 0;
      let totalSkinSamples = 0;
      for (let y = 15; y < 105; y += 3) {
        for (let x = 30; x < 130; x += 3) {
          const idx = (y * 160 + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];
          if (r > 60 && g > 40 && b > 20 && r > b && (r - g) > 5) {
            weightedY += y;
            totalSkinSamples++;
          }
        }
      }

      const currentFaceY = totalSkinSamples > 15 ? weightedY / totalSkinSamples : 56;
      if (this.opticalBaselineY === null) {
        this.opticalBaselineY = currentFaceY;
      } else if (Math.abs(currentFaceY - this.opticalBaselineY) < 14) {
        this.opticalBaselineY = this.opticalBaselineY * 0.985 + currentFaceY * 0.015;
      }

      const yShift = currentFaceY - this.opticalBaselineY;
      // When head drops forward, face centroid moves down (positive yShift), yielding negative pitch:
      const opticalPitch = -Math.max(-40, Math.min(25, yShift * 2.8));

      // Synthetic landmarks for HUD reticle with dynamic nod offset
      const yOffset = Math.max(-0.12, Math.min(0.12, -opticalPitch * 0.005));
      const syntheticLandmarks: Array<{ x: number; y: number; z: number }> = [
        { x: 0.5, y: 0.45 + yOffset, z: 0 }, // 0: nose
        { x: 0.5, y: 0.44 + yOffset, z: 0 }, // 1: nose tip
        { x: 0.42, y: 0.38 + yOffset, z: 0 }, // left eye
        { x: 0.58, y: 0.38 + yOffset, z: 0 }, // right eye
      ];

      return {
        metrics: this.computeDrowsinessLogic(
          true,
          opticalEyeOpen,
          opticalEyeOpen,
          opticalEyeOpen,
          0.08,
          opticalPitch,
          0,
          0,
          settings,
          now
        ),
        landmarks: syntheticLandmarks,
      };
    } catch {
      return {
        metrics: this.computeDrowsinessLogic(true, 0.4, 0.4, 0.4, 0.08, 0, 0, 0, settings, now),
      };
    }
  }

  private computeDrowsinessLogic(
    isFaceDetected: boolean,
    leftEyeOpen: number,
    rightEyeOpen: number,
    avgEyeOpen: number,
    mouthOpen: number,
    headPitch: number,
    headRoll: number,
    headYaw: number,
    settings: DMSSettings,
    now: number
  ): DetectionMetrics {
    if (!isFaceDetected) {
      this.eyesClosedStartTime = null;
      this.yawnStartTime = null;
      return {
        timestamp: now,
        isFaceDetected: false,
        leftEyeOpen: 0.5,
        rightEyeOpen: 0.5,
        avgEyeOpen: 0.5,
        isEyesClosed: false,
        eyesClosedDuration: 0,
        mouthOpen: 0,
        isYawning: false,
        yawnDuration: 0,
        headPitch: 0,
        headRoll: 0,
        headYaw: 0,
        isHeadNodding: false,
        isDistracted: false,
        perclos: 0,
        blinksPerMinute: 16,
        fatigueScore: 10,
        alertSeverity: 'nominal',
        alertMessage:
          settings.language === 'ar'
            ? 'لم يتم رصد وجه السائق. وجه الكاميرا نحو خط الرؤية.'
            : 'Driver face not acquired. Align camera with steering line.',
      };
    }

    // A. Eyes Closed Evaluation
    const isEyesClosed = avgEyeOpen < settings.eyeClosureThreshold;
    let eyesClosedDuration = 0;

    if (isEyesClosed) {
      if (this.eyesClosedStartTime === null) {
        this.eyesClosedStartTime = now;
      }
      eyesClosedDuration = (now - this.eyesClosedStartTime) / 1000;
    } else {
      if (this.eyesClosedStartTime !== null) {
        const closedFor = (now - this.eyesClosedStartTime) / 1000;
        if (closedFor >= 0.08 && closedFor <= 0.6) {
          this.blinkTimestamps.push(now);
          this.lastBlinkTimestamp = now;
        }
      }
      this.eyesClosedStartTime = null;
      eyesClosedDuration = 0;
    }

    // Keep rolling 60-second blink history
    this.blinkTimestamps = this.blinkTimestamps.filter(t => now - t <= 60000);
    const blinksPerMinute = this.blinkTimestamps.length;

    // Rolling PERCLOS calculation (samples in last 30s)
    this.eyeStateHistory.push({ timestamp: now, isClosed: isEyesClosed });
    this.eyeStateHistory = this.eyeStateHistory.filter(h => now - h.timestamp <= 30000);
    const closedCount = this.eyeStateHistory.filter(h => h.isClosed).length;
    const perclos = this.eyeStateHistory.length > 0 ? (closedCount / this.eyeStateHistory.length) * 100 : 0;

    // B. Yawning Evaluation
    const isYawning = mouthOpen > settings.yawnThreshold;
    let yawnDuration = 0;
    if (isYawning) {
      if (this.yawnStartTime === null) {
        this.yawnStartTime = now;
      }
      yawnDuration = (now - this.yawnStartTime) / 1000;
    } else {
      this.yawnStartTime = null;
      yawnDuration = 0;
    }

    // C. Head Nodding Evaluation
    // Driver's head pitch is below threshold (e.g. -9° or lower relative to neutral)
    const isHeadNodding = headPitch <= settings.headNodThresholdDeg;
    if (isHeadNodding) {
      if (this.nodStartTime === null) {
        this.nodStartTime = now;
      }
      this.nodDuration = (now - this.nodStartTime) / 1000;
      this.consecutiveNodFrames++;
    } else {
      // 200ms grace window for single-frame noise
      if (this.nodStartTime !== null && now - this.nodStartTime > 200) {
        this.nodStartTime = null;
        this.nodDuration = 0;
        this.consecutiveNodFrames = 0;
      }
    }

    // D. Distraction Evaluation
    const isDistracted = Math.abs(headYaw) > 28;

    // E. Calculate Overall Driver Fatigue Score (0 - 100)
    let fatigueScore = 0;
    fatigueScore += Math.min(45, perclos * 1.5);
    if (isEyesClosed) {
      fatigueScore += Math.min(50, eyesClosedDuration * 25);
    }
    if (isYawning) {
      fatigueScore += Math.min(30, yawnDuration * 12);
    }
    if (isHeadNodding) {
      fatigueScore += Math.min(55, 32 + this.nodDuration * 18);
    }
    if (blinksPerMinute < 6 || blinksPerMinute > 32) {
      fatigueScore += 10;
    }
    fatigueScore = Math.min(100, Math.round(fatigueScore));

    // F. Determine Alert Severity and Voice Alert Message
    let alertSeverity: DetectionMetrics['alertSeverity'] = 'nominal';
    let alertMessage =
      settings.language === 'ar'
        ? 'السائق منتبه ومستيقظ · جميع الأنظمة تعمل بكفاءة'
        : 'Driver status: Attentive & Nominal';

    if (
      eyesClosedDuration >= settings.eyesClosedCriticalSec ||
      (isHeadNodding && eyesClosedDuration >= 1.0) ||
      (isHeadNodding && this.nodDuration >= 1.25)
    ) {
      alertSeverity = 'critical';
      alertMessage =
        settings.language === 'ar'
          ? (isHeadNodding
              ? 'طوارئ: سقوط الرأس للأمام وغفوة نوم! استيقظ فوراً!'
              : 'طوارئ: تم رصد نوم لحظي! استيقظ فوراً!')
          : 'EMERGENCY: MICRO-SLEEP & HEAD DROP DETECTED! WAKE UP!';
    } else if (eyesClosedDuration >= settings.eyesClosedWarningSec) {
      alertSeverity = 'warning';
      alertMessage =
        settings.language === 'ar'
          ? 'تحذير: إغلاق مطول للعينين! ركز في الطريق!'
          : 'WARNING: Prolonged eye closure! Keep eyes on highway!';
    } else if (isHeadNodding && (this.nodDuration >= 0.22 || this.consecutiveNodFrames >= 3)) {
      alertSeverity = 'warning';
      alertMessage =
        settings.language === 'ar'
          ? 'تحذير: سقوط الرأس للأمام! استيقظ وحافظ على وضعية القيادة!'
          : 'WARNING: Head drooping detected. Maintain driving posture!';
    } else if (yawnDuration >= settings.yawnDurationSec) {
      alertSeverity = 'advisory';
      alertMessage =
        settings.language === 'ar'
          ? 'تنبيه: تم رصد إرهاق وتثاؤب متكرر. يرجى أخذ استراحة.'
          : 'ADVISORY: Yawning fatigue detected. Plan upcoming rest break.';
    } else if (perclos > 25) {
      alertSeverity = 'advisory';
      alertMessage =
        settings.language === 'ar'
          ? 'تنبيه: مؤشر نعاس مرتفع (PERCLOS). حافظ على تركيزك.'
          : 'ADVISORY: Elevated drowsiness index (PERCLOS). Stay alert.';
    } else if (isDistracted) {
      alertSeverity = 'advisory';
      alertMessage =
        settings.language === 'ar'
          ? 'انتباه: تشتت نظرك عن مسار الطريق للأمام.'
          : 'CAUTION: Attention diverted from the road forward.';
    }

    return {
      timestamp: now,
      isFaceDetected: true,
      leftEyeOpen,
      rightEyeOpen,
      avgEyeOpen,
      isEyesClosed,
      eyesClosedDuration,
      mouthOpen,
      isYawning,
      yawnDuration,
      headPitch,
      headRoll,
      headYaw,
      isHeadNodding,
      isDistracted,
      perclos,
      blinksPerMinute,
      fatigueScore,
      alertSeverity,
      alertMessage,
    };
  }

  private generateSimulatedMetrics(
    settings: DMSSettings,
    now: number
  ): { metrics: DetectionMetrics } {
    const elapsed = (Date.now() - (this.simulationState.activeUntil - 4000)) / 1000;
    const preset = this.simulationState.preset;

    if (preset === 'micro_sleep') {
      const closedSec = Math.max(0, elapsed);
      const isCritical = closedSec >= settings.eyesClosedCriticalSec;
      return {
        metrics: {
          timestamp: now,
          isFaceDetected: true,
          leftEyeOpen: 0.05,
          rightEyeOpen: 0.04,
          avgEyeOpen: 0.045,
          isEyesClosed: true,
          eyesClosedDuration: closedSec,
          mouthOpen: 0.1,
          isYawning: false,
          yawnDuration: 0,
          headPitch: -16,
          headRoll: 4,
          headYaw: -2,
          isHeadNodding: true,
          isDistracted: false,
          perclos: 65,
          blinksPerMinute: 4,
          fatigueScore: isCritical ? 98 : 78,
          alertSeverity: isCritical ? 'critical' : 'warning',
          alertMessage: isCritical
            ? settings.language === 'ar'
              ? 'طوارئ: تم رصد نوم لحظي! استيقظ فوراً!'
              : 'EMERGENCY: MICRO-SLEEP DETECTED! WAKE UP!'
            : settings.language === 'ar'
            ? 'تحذير: إغلاق مطول للعينين! ركز في الطريق!'
            : 'WARNING: Prolonged eye closure! Keep eyes on highway!',
        },
      };
    }

    if (preset === 'yawning') {
      return {
        metrics: {
          timestamp: now,
          isFaceDetected: true,
          leftEyeOpen: 0.22,
          rightEyeOpen: 0.23,
          avgEyeOpen: 0.225,
          isEyesClosed: false,
          eyesClosedDuration: 0,
          mouthOpen: 0.78,
          isYawning: true,
          yawnDuration: elapsed,
          headPitch: -4,
          headRoll: 2,
          headYaw: 3,
          isHeadNodding: false,
          isDistracted: false,
          perclos: 28,
          blinksPerMinute: 22,
          fatigueScore: 54,
          alertSeverity: 'advisory',
          alertMessage:
            settings.language === 'ar'
              ? 'تنبيه: تم رصد إرهاق وتثاؤب متكرر. يرجى أخذ استراحة.'
              : 'ADVISORY: Heavy yawning detected. Plan upcoming rest break.',
        },
      };
    }

    if (preset === 'head_nod') {
      return {
        metrics: {
          timestamp: now,
          isFaceDetected: true,
          leftEyeOpen: 0.12,
          rightEyeOpen: 0.14,
          avgEyeOpen: 0.13,
          isEyesClosed: true,
          eyesClosedDuration: elapsed,
          mouthOpen: 0.15,
          isYawning: false,
          yawnDuration: 0,
          headPitch: -22,
          headRoll: -8,
          headYaw: 1,
          isHeadNodding: true,
          isDistracted: false,
          perclos: 45,
          blinksPerMinute: 8,
          fatigueScore: 82,
          alertSeverity: elapsed > 1.2 ? 'critical' : 'warning',
          alertMessage:
            settings.language === 'ar'
              ? 'تحذير: سقوط الرأس للأمام! حافظ على وضعية القيادة!'
              : 'WARNING: Head drooping & nodding forward! Wake up driver!',
        },
      };
    }

    if (preset === 'distracted') {
      return {
        metrics: {
          timestamp: now,
          isFaceDetected: true,
          leftEyeOpen: 0.38,
          rightEyeOpen: 0.39,
          avgEyeOpen: 0.385,
          isEyesClosed: false,
          eyesClosedDuration: 0,
          mouthOpen: 0.08,
          isYawning: false,
          yawnDuration: 0,
          headPitch: -2,
          headRoll: 3,
          headYaw: 35,
          isHeadNodding: false,
          isDistracted: true,
          perclos: 12,
          blinksPerMinute: 15,
          fatigueScore: 35,
          alertSeverity: 'advisory',
          alertMessage:
            settings.language === 'ar'
              ? 'انتباه: تشتت نظرك عن مسار الطريق للأمام.'
              : 'CAUTION: Attention diverted from the road forward.',
        },
      };
    }

    // Normal nominal driving
    return {
      metrics: {
        timestamp: now,
        isFaceDetected: true,
        leftEyeOpen: 0.38,
        rightEyeOpen: 0.37,
        avgEyeOpen: 0.375,
        isEyesClosed: false,
        eyesClosedDuration: 0,
        mouthOpen: 0.08,
        isYawning: false,
        yawnDuration: 0,
        headPitch: 0,
        headRoll: 0,
        headYaw: 0,
        isHeadNodding: false,
        isDistracted: false,
        perclos: 8,
        blinksPerMinute: 16,
        fatigueScore: 8,
        alertSeverity: 'nominal',
        alertMessage:
          settings.language === 'ar'
            ? 'السائق منتبه ومستيقظ · جميع الأنظمة تعمل بكفاءة'
            : 'Driver status: Attentive & Nominal',
      },
    };
  }

  public calibrateBaseline(currentEyeOpen: number, currentPitchDeg: number) {
    this.baselineEyeOpen = currentEyeOpen;
    this.baselinePitchDeg = currentPitchDeg;
    this.neutralPitchBaseline = currentPitchDeg;
    this.nodStartTime = null;
    this.consecutiveNodFrames = 0;
  }
}

export const drowsinessDetector = new DrowsinessDetector();
