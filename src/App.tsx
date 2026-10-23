import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { CabinHUD } from './components/CabinHUD';
import { HoursOfServiceTracker } from './components/HoursOfServiceTracker';
import { IncidentLog } from './components/IncidentLog';
import { RestStopFinder } from './components/RestStopFinder';
import { SettingsModal } from './components/SettingsModal';
import { DriverCalibrationModal } from './components/DriverCalibrationModal';
import { GooglePlayModal } from './components/GooglePlayModal';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import {
  DetectionMetrics,
  DMSSettings,
  TripState,
  IncidentRecord,
  AlertSeverity,
} from './types/dms';
import { drowsinessDetector } from './services/drowsinessDetector';
import { audioAlertService } from './services/audioAlertService';
import { virtualCameraService } from './services/virtualCameraService';
import { translations, Language } from './i18n/translations';

export default function App() {
  const [activeTab, setActiveTab] = useState<'hud' | 'hos' | 'incidents' | 'reststops' | 'settings'>('hud');
  const [isMonitoring, setIsMonitoring] = useState<boolean>(true);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isCalibrationOpen, setIsCalibrationOpen] = useState<boolean>(false);
  const [isGooglePlayOpen, setIsGooglePlayOpen] = useState<boolean>(false);
  const [isPrivacyPolicyOpen, setIsPrivacyPolicyOpen] = useState<boolean>(false);
  const [isAlarmActive, setIsAlarmActive] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Settings State - Default to Arabic per user request with instant toggle
  const [settings, setSettings] = useState<DMSSettings>({
    eyeClosureThreshold: 0.32,
    eyesClosedWarningSec: 1.0,
    eyesClosedCriticalSec: 1.8,
    yawnThreshold: 0.50,
    yawnDurationSec: 2.2,
    headNodThresholdDeg: -9,
    alarmTone: 'piercing_siren',
    alarmVolume: 0.9,
    voiceAlertsEnabled: true,
    voiceVolume: 1.0,
    voiceRate: 1.05,
    voicePitch: 1.0,
    preferredVoiceURI: '',
    nightVisionMode: 'off',
    vibrationAlerts: true,
    language: 'ar',
    truckId: 'TRK-402',
    driverName: 'الكابتن أحمد',
    emergencyContact: '+966 50 123 4567',
  });

  const t = translations[settings.language];
  const isRtl = settings.language === 'ar';

  // Trip and HOS State
  const [tripState, setTripState] = useState<TripState>({
    tripStartTime: Date.now() - 2 * 3600 * 1000 - 45 * 60 * 1000, // 2h 45m in
    dutyStatus: 'driving',
    drivingSecondsToday: 2 * 3600 + 45 * 60,
    continuousDrivingSeconds: 2 * 3600 + 45 * 60,
    maxContinuousDrivingLimitSec: 4 * 3600, // 4 hours before mandatory break
    simulatedSpeedMph: 64,
    isSimulatedTrip: true,
  });

  // Incident Records
  const [incidents, setIncidents] = useState<IncidentRecord[]>([
    {
      id: 'inc-demo-1',
      timestamp: Date.now() - 48 * 60 * 1000,
      type: 'yawn_excess',
      title: settings.language === 'ar' ? 'حالة تثاؤب مفرط وإرهاق' : 'Prolonged Yawning Episode',
      severity: 'advisory',
      duration: 3.1,
      peakPerclos: 22.4,
      driverResponseTimeSec: 0.8,
      speedMph: 63,
    },
    {
      id: 'inc-demo-2',
      timestamp: Date.now() - 19 * 60 * 1000,
      type: 'eyes_closed',
      title: settings.language === 'ar' ? 'تحذير إغلاق العينين والنعاس' : 'Drowsiness Eye Closure Warning',
      severity: 'warning',
      duration: 1.4,
      peakPerclos: 31.8,
      driverResponseTimeSec: 0.72,
      speedMph: 64,
    },
  ]);

  // Real-time metrics state
  const [metrics, setMetrics] = useState<DetectionMetrics>({
    timestamp: Date.now(),
    isFaceDetected: false,
    leftEyeOpen: 0.42,
    rightEyeOpen: 0.41,
    avgEyeOpen: 0.415,
    isEyesClosed: false,
    eyesClosedDuration: 0,
    mouthOpen: 0.08,
    isYawning: false,
    yawnDuration: 0,
    headPitch: -2,
    headRoll: 1,
    headYaw: 0,
    isHeadNodding: false,
    isDistracted: false,
    perclos: 6.2,
    blinksPerMinute: 16,
    fatigueScore: 12,
    alertSeverity: 'nominal',
    alertMessage: settings.language === 'ar' ? t.statusAttentive : 'Driver status: Attentive & Nominal',
  });

  // Track active incident in progress
  const activeIncidentRef = useRef<{
    startTime: number;
    type: IncidentRecord['type'];
    severity: AlertSeverity;
    peakPerclos: number;
  } | null>(null);

  // Initialize MediaPipe detector in background
  useEffect(() => {
    drowsinessDetector.initialize();
  }, []);

  // Continuous Driving timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTripState(s => {
        if (s.dutyStatus !== 'driving') return s;
        return {
          ...s,
          drivingSecondsToday: s.drivingSecondsToday + 1,
          continuousDrivingSeconds: s.continuousDrivingSeconds + 1,
        };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const [cameraSource, setCameraSource] = useState<'physical' | 'virtual' | 'none'>('none');

  // Enumerate video devices
  const updateCameraList = useCallback(async () => {
    if (!navigator?.mediaDevices?.enumerateDevices) return;
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(d => d.kind === 'videoinput');
      setAvailableCameras(videoDevices);
    } catch (e) {
      console.warn('Enumerate devices error:', e);
    }
  }, []);

  // Stop any active camera streams (physical or virtual)
  const stopCamera = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      mediaStreamRef.current = null;
    }
    virtualCameraService.stop();
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraSource('none');
    setIsCameraActive(false);
  }, []);

  // Launch Simulated Driver Camera (Canvas capture stream)
  const startVirtualCamera = useCallback(() => {
    stopCamera();
    try {
      const stream = virtualCameraService.createStream(640, 480);
      mediaStreamRef.current = stream;
      setCameraSource('virtual');
      setIsCameraActive(true);
      setCameraError(null);

      if (videoRef.current) {
        const v = videoRef.current;
        v.srcObject = stream;
        v.muted = true;
        v.playsInline = true;
        v.setAttribute('playsinline', 'true');
        v.setAttribute('webkit-playsinline', 'true');
        v.play().catch(e => console.warn('Virtual video play error:', e));
      }
    } catch (err) {
      console.warn('Failed to start virtual camera:', err);
    }
  }, [stopCamera]);

  // Launch Physical Webcam with multi-stage fallback
  const startCamera = useCallback(async (targetDeviceId?: string) => {
    setCameraError(null);
    const deviceToUse = targetDeviceId !== undefined ? targetDeviceId : selectedCameraId;

    if (!navigator?.mediaDevices?.getUserMedia) {
      const msg = settings.language === 'ar'
        ? 'المتصفح أو البيئة الحالية لا تدعم الوصول المباشر لكاميرا الويب. تم تشغيل كاميرا المحاكاة الحية تلقائياً.'
        : 'Webcam not supported in current environment. Started Simulated Driver Camera.';
      setCameraError(msg);
      startVirtualCamera();
      return;
    }

    try {
      stopCamera();
      let stream: MediaStream | null = null;

      // 1. If user selected a specific camera device
      if (deviceToUse) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              deviceId: { exact: deviceToUse },
              width: { ideal: 640 },
              height: { ideal: 480 },
            },
            audio: false,
          });
        } catch (devErr) {
          console.warn('Specific deviceId camera failed, falling back:', devErr);
        }
      }

      // 2. Try constrained user-facing camera first
      if (!stream) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 640 },
              height: { ideal: 480 },
              facingMode: 'user',
            },
            audio: false,
          });
        } catch (firstErr) {
          console.warn('FacingMode camera constraint failed, attempting generic video:', firstErr);
          // 3. Fallback to basic generic video
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        }
      }

      mediaStreamRef.current = stream;
      setCameraSource('physical');
      setIsCameraActive(true);
      setCameraError(null);

      // Refresh camera devices list now that permission was granted
      updateCameraList();

      if (videoRef.current) {
        const v = videoRef.current;
        v.srcObject = stream;
        v.muted = true;
        v.playsInline = true;
        v.setAttribute('playsinline', 'true');
        v.setAttribute('webkit-playsinline', 'true');
        v.onloadedmetadata = () => {
          v.play().catch(e => console.warn('Video play on metadata error:', e));
        };
        v.play().catch(e => console.warn('Immediate video play error:', e));
      }
    } catch (err: unknown) {
      console.warn('Physical webcam error:', err);
      let errorMsg = t.camInUseOrDenied;
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          errorMsg = settings.language === 'ar'
            ? 'تم حظر إذن الكاميرا من المتصفح. اضغط على أيقونة الكاميرا أو القفل 🔒 في شريط عنوان المتصفح واختر "سماح" (Allow)، أو استمتع بكاميرا المحاكاة الحية.'
            : 'Camera permission denied. Allow camera in browser settings or launch simulated feed.';
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          errorMsg = settings.language === 'ar'
            ? 'لم يتم العثور على كاميرا ويب متصلة بالجهاز. تم تشغيل كاميرا المحاكاة الحية لتجربة كافة وظائف النظام.'
            : 'No physical webcam detected on this device. Simulated feed ready.';
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          errorMsg = settings.language === 'ar'
            ? 'الكاميرا قيد الاستخدام في برنامج آخر (مثل Zoom أو Teams). يمكنك إغلاق التطبيق الآخر أو استخدام كاميرا المحاكاة الحية.'
            : 'Camera is currently in use by another application. Please close other camera apps or use simulated feed.';
        }
      }

      setCameraError(errorMsg);
      // Auto-fallback to virtual camera so user sees an active, working driver monitor immediately
      startVirtualCamera();
    }
  }, [selectedCameraId, settings.language, startVirtualCamera, stopCamera, t.camInUseOrDenied, updateCameraList]);

  const toggleCamera = () => {
    if (isCameraActive) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  // Ensure stream is always connected to videoRef when mounting or switching tabs
  useEffect(() => {
    if (videoRef.current && mediaStreamRef.current && isCameraActive) {
      const v = videoRef.current;
      if (v.srcObject !== mediaStreamRef.current) {
        v.srcObject = mediaStreamRef.current;
        v.muted = true;
        v.playsInline = true;
        v.setAttribute('playsinline', 'true');
        v.setAttribute('webkit-playsinline', 'true');
        v.play().catch(e => console.warn('Re-attach play error:', e));
      }
    }
  }, [activeTab, isCameraActive]);

  // Auto-attempt camera start on mount
  useEffect(() => {
    updateCameraList();
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera, updateCameraList]);

  // Draw HUD face mesh overlay on canvas
  const drawHudLandmarks = useCallback((landmarks?: Array<{ x: number; y: number; z: number }>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!landmarks || landmarks.length === 0) return;

    const w = canvas.width;
    const h = canvas.height;

    // Tactical HUD colors
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.fillStyle = 'rgba(56, 189, 248, 0.6)';
    ctx.lineWidth = 1;

    // Draw key eye contour points (Left eye ~33, right eye ~263)
    const leftEyeIdxs = [33, 160, 158, 133, 153, 144];
    const rightEyeIdxs = [362, 385, 387, 263, 373, 380];

    const drawContour = (indices: number[], color: string) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      indices.forEach((idx, i) => {
        const pt = landmarks[idx];
        if (!pt) return;
        const x = pt.x * w;
        const y = pt.y * h;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.stroke();
    };

    const eyeColor = metrics.isEyesClosed ? 'rgba(239, 68, 68, 0.9)' : 'rgba(16, 185, 129, 0.8)';
    drawContour(leftEyeIdxs, eyeColor);
    drawContour(rightEyeIdxs, eyeColor);

    // Draw mouth outline
    const mouthIdxs = [61, 81, 13, 311, 291, 402, 14, 178];
    const mouthColor = metrics.isYawning ? 'rgba(245, 158, 11, 0.9)' : 'rgba(148, 163, 184, 0.5)';
    drawContour(mouthIdxs, mouthColor);

    // Draw nose tip coordinate marker
    const nose = landmarks[1];
    if (nose) {
      const nx = nose.x * w;
      const ny = nose.y * h;
      ctx.beginPath();
      ctx.arc(nx, ny, 3, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(245, 158, 11, 0.8)';
      ctx.fill();
    }
  }, [metrics.isEyesClosed, metrics.isYawning]);

  // Main real-time detection & alert loop
  useEffect(() => {
    let lastSpokenWarning = 0;

    const processFrame = () => {
      if (isMonitoring) {
        const video = videoRef.current;
        const { metrics: newMetrics, landmarks } = drowsinessDetector.detect(video, settings);

        setMetrics(newMetrics);
        drawHudLandmarks(landmarks);

        const now = Date.now();

        // 1. Critical Alarm Logic (Micro-sleep or prolonged eye closure)
        if (newMetrics.alertSeverity === 'critical') {
          if (!audioAlertService.isPlaying()) {
            audioAlertService.startAlarm(settings.alarmTone, settings.alarmVolume);
            setIsAlarmActive(true);
          }
          if (settings.vibrationAlerts) {
            audioAlertService.triggerVibration([300, 100, 300, 100, 500]);
          }
          if (settings.voiceAlertsEnabled && now - lastSpokenWarning > 2800) {
            lastSpokenWarning = now;
            const criticalMsg = newMetrics.isHeadNodding
              ? (settings.language === 'ar'
                  ? 'طوارئ! سقوط الرأس للأمام! استيقظ فوراً وانتبه للطريق!'
                  : 'EMERGENCY: Head drop forward! Wake up!')
              : t.vocalCritical;
            audioAlertService.speak(criticalMsg, {
              volume: settings.voiceVolume,
              rate: settings.voiceRate,
              pitch: settings.voicePitch,
              preferredVoiceURI: settings.preferredVoiceURI,
              lang: settings.language,
              urgent: true,
            });
          }

          // Start recording incident if not already tracked
          if (!activeIncidentRef.current) {
            activeIncidentRef.current = {
              startTime: now,
              type: newMetrics.isHeadNodding ? 'head_drop' : 'micro_sleep',
              severity: 'critical',
              peakPerclos: newMetrics.perclos,
            };
          } else {
            activeIncidentRef.current.peakPerclos = Math.max(
              activeIncidentRef.current.peakPerclos,
              newMetrics.perclos
            );
          }
        }
        // 2. Warning Alert Logic
        else if (newMetrics.alertSeverity === 'warning') {
          if (settings.voiceAlertsEnabled && now - lastSpokenWarning > 4000) {
            lastSpokenWarning = now;
            audioAlertService.playChirp('warning', settings.alarmVolume);
            const warningMsg = newMetrics.isHeadNodding ? t.vocalHeadNod : t.vocalWarning;
            audioAlertService.speak(warningMsg, {
              volume: settings.voiceVolume,
              rate: settings.voiceRate,
              pitch: settings.voicePitch,
              preferredVoiceURI: settings.preferredVoiceURI,
              lang: settings.language,
              urgent: false,
            });
          }

          if (!activeIncidentRef.current) {
            activeIncidentRef.current = {
              startTime: now,
              type: newMetrics.isHeadNodding ? 'head_drop' : 'eyes_closed',
              severity: 'warning',
              peakPerclos: newMetrics.perclos,
            };
          }
        }
        // 3. Advisory Alert Logic (Yawn or high PERCLOS)
        else if (newMetrics.alertSeverity === 'advisory') {
          if (settings.voiceAlertsEnabled && now - lastSpokenWarning > 9000) {
            lastSpokenWarning = now;
            audioAlertService.playChirp('advisory', settings.alarmVolume);
            const advisoryMsg = newMetrics.isYawning
              ? t.vocalYawn
              : newMetrics.isDistracted
              ? t.vocalDistracted
              : t.statusAdvisory;
            audioAlertService.speak(advisoryMsg, {
              volume: settings.voiceVolume * 0.85,
              rate: settings.voiceRate,
              pitch: settings.voicePitch,
              preferredVoiceURI: settings.preferredVoiceURI,
              lang: settings.language,
              urgent: false,
            });
          }
        }
        // 4. Return to Nominal
        else {
          if (audioAlertService.isPlaying()) {
            audioAlertService.stopAlarm();
            setIsAlarmActive(false);
          }

          // If an active incident was occurring, finalize and save it!
          if (activeIncidentRef.current) {
            const duration = (now - activeIncidentRef.current.startTime) / 1000;
            if (duration >= 0.8) {
              const newRecord: IncidentRecord = {
                id: `inc-${Date.now()}`,
                timestamp: activeIncidentRef.current.startTime,
                type: activeIncidentRef.current.type,
                title:
                  activeIncidentRef.current.type === 'micro_sleep'
                    ? t.typeMicroSleep
                    : activeIncidentRef.current.type === 'head_drop'
                    ? t.typeHeadDrop
                    : t.typeEyeClosure,
                severity: activeIncidentRef.current.severity,
                duration,
                peakPerclos: activeIncidentRef.current.peakPerclos,
                driverResponseTimeSec: Math.max(0.4, duration - 1.0),
                speedMph: tripState.simulatedSpeedMph,
              };
              setIncidents(prev => [newRecord, ...prev]);
            }
            activeIncidentRef.current = null;
          }
        }
      }

      animationFrameId.current = requestAnimationFrame(processFrame);
    };

    animationFrameId.current = requestAnimationFrame(processFrame);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isMonitoring, settings, drawHudLandmarks, tripState.simulatedSpeedMph, t]);

  // Silence / Disarm active alarm
  const handleSilenceAlarm = () => {
    audioAlertService.stopAlarm();
    drowsinessDetector.clearSimulation();
    setIsAlarmActive(false);
    audioAlertService.playChirp('ack', settings.alarmVolume);

    if (activeIncidentRef.current) {
      const now = Date.now();
      const duration = (now - activeIncidentRef.current.startTime) / 1000;
      const newRecord: IncidentRecord = {
        id: `inc-${Date.now()}`,
        timestamp: activeIncidentRef.current.startTime,
        type: activeIncidentRef.current.type,
        title: settings.language === 'ar' ? 'إنذار تم إيقافه يدوياً' : 'Manually Silenced Alert',
        severity: activeIncidentRef.current.severity,
        duration: Math.max(0.5, duration),
        peakPerclos: activeIncidentRef.current.peakPerclos,
        driverResponseTimeSec: 0.5,
        speedMph: tripState.simulatedSpeedMph,
      };
      setIncidents(prev => [newRecord, ...prev]);
      activeIncidentRef.current = null;
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Rest break logger
  const handleTakeBreak = () => {
    setTripState(s => ({
      ...s,
      continuousDrivingSeconds: 0,
      dutyStatus: 'off_duty',
      simulatedSpeedMph: 0,
    }));
    audioAlertService.playChirp('ack');
    alert(t.breakInitiatedMsg);
  };

  const handleRecordIncident = (
    type: IncidentRecord['type'],
    duration: number,
    peakPerclos: number,
    snapshotUrl?: string
  ) => {
    const record: IncidentRecord = {
      id: `inc-${Date.now()}`,
      timestamp: Date.now(),
      type,
      title: settings.language === 'ar' ? 'حادثة مسجلة تجريبياً' : 'Manual / Drill Recorded Incident',
      severity: duration > 2.0 ? 'critical' : 'warning',
      duration,
      peakPerclos,
      driverResponseTimeSec: 0.85,
      snapshotDataUrl: snapshotUrl,
      speedMph: tripState.simulatedSpeedMph,
    };
    setIncidents(prev => [record, ...prev]);
  };

  const handleToggleLanguage = () => {
    const nextLang = settings.language === 'ar' ? 'en' : 'ar';
    setSettings(s => ({
      ...s,
      language: nextLang,
      driverName: nextLang === 'ar' ? 'الكابتن أحمد' : 'Captain Marcus Vance',
    }));
  };

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans select-none"
    >
      {/* Top Bar Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isMonitoring={isMonitoring}
        onToggleMonitoring={() => setIsMonitoring(!isMonitoring)}
        isAlarmActive={isAlarmActive}
        onSilenceAlarm={handleSilenceAlarm}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        language={settings.language}
        onToggleLanguage={handleToggleLanguage}
        onOpenGooglePlay={() => setIsGooglePlayOpen(true)}
        t={t}
      />

      {/* Main View Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {activeTab === 'hud' && (
          <CabinHUD
            metrics={metrics}
            settings={settings}
            tripState={tripState}
            isMonitoring={isMonitoring}
            onToggleMonitoring={() => setIsMonitoring(!isMonitoring)}
            onSilenceAlarm={handleSilenceAlarm}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenCalibration={() => setIsCalibrationOpen(true)}
            onRecordIncident={handleRecordIncident}
            setSettings={setSettings}
            videoRef={videoRef}
            canvasRef={canvasRef}
            isCameraActive={isCameraActive}
            onToggleCamera={toggleCamera}
            cameraError={cameraError}
            cameraSource={cameraSource}
            onStartVirtualCamera={startVirtualCamera}
            onStartPhysicalCamera={() => startCamera()}
            availableCameras={availableCameras}
            selectedCameraId={selectedCameraId}
            onSelectCamera={deviceId => {
              setSelectedCameraId(deviceId);
              startCamera(deviceId);
            }}
            t={t}
          />
        )}

        {activeTab === 'hos' && (
          <HoursOfServiceTracker
            tripState={tripState}
            setTripState={setTripState}
            onTakeBreak={handleTakeBreak}
            t={t}
          />
        )}

        {activeTab === 'incidents' && (
          <IncidentLog
            incidents={incidents}
            onClearIncidents={() => setIncidents([])}
            t={t}
          />
        )}

        {activeTab === 'reststops' && (
          <RestStopFinder settings={settings} t={t} />
        )}

        {activeTab === 'settings' && (
          <div className="flex-1 p-6 overflow-y-auto">
            <SettingsModal
              isOpen={true}
              onClose={() => setActiveTab('hud')}
              settings={settings}
              setSettings={setSettings}
              t={t}
            />
          </div>
        )}
      </main>

      {/* Floating Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        setSettings={setSettings}
        t={t}
      />

      <DriverCalibrationModal
        isOpen={isCalibrationOpen}
        onClose={() => setIsCalibrationOpen(false)}
        metrics={metrics}
        settings={settings}
        setSettings={setSettings}
        t={t}
      />

      <GooglePlayModal
        isOpen={isGooglePlayOpen}
        onClose={() => setIsGooglePlayOpen(false)}
        onOpenPrivacyPolicy={() => setIsPrivacyPolicyOpen(true)}
        language={settings.language}
      />

      <PrivacyPolicyModal
        isOpen={isPrivacyPolicyOpen}
        onClose={() => setIsPrivacyPolicyOpen(false)}
        language={settings.language}
      />
    </div>
  );
}
