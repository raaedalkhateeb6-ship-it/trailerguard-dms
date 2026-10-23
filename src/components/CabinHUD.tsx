import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Camera,
  CameraOff,
  Eye,
  AlertTriangle,
  Moon,
  Sun,
  ShieldCheck,
  Radio,
  Sliders,
  Volume2,
  Play,
  RotateCcw,
  Video,
  RefreshCw,
  Info,
  HelpCircle,
  PhoneCall,
  Phone,
  X,
} from 'lucide-react';
import { DetectionMetrics, DMSSettings, TripState } from '../types/dms';
import { drowsinessDetector } from '../services/drowsinessDetector';
import { audioAlertService } from '../services/audioAlertService';
import { Translations } from '../i18n/translations';

interface CabinHUDProps {
  metrics: DetectionMetrics;
  settings: DMSSettings;
  tripState: TripState;
  isMonitoring: boolean;
  onToggleMonitoring: () => void;
  onSilenceAlarm: () => void;
  onOpenSettings: () => void;
  onOpenCalibration: () => void;
  onRecordIncident: (
    type: 'micro_sleep' | 'eyes_closed' | 'yawn_excess' | 'head_drop' | 'distraction',
    duration: number,
    peakPerclos: number,
    snapshotUrl?: string
  ) => void;
  setSettings: React.Dispatch<React.SetStateAction<DMSSettings>>;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isCameraActive: boolean;
  onToggleCamera: () => void;
  cameraError: string | null;
  cameraSource: 'physical' | 'virtual' | 'none';
  onStartVirtualCamera: () => void;
  onStartPhysicalCamera: () => void;
  availableCameras: MediaDeviceInfo[];
  selectedCameraId: string;
  onSelectCamera: (deviceId: string) => void;
  t: Translations;
}

export const CabinHUD: React.FC<CabinHUDProps> = ({
  metrics,
  settings,
  tripState,
  isMonitoring,
  onToggleMonitoring,
  onSilenceAlarm,
  onOpenSettings,
  onOpenCalibration,
  setSettings,
  videoRef,
  canvasRef,
  isCameraActive,
  onToggleCamera,
  cameraError,
  cameraSource,
  onStartVirtualCamera,
  onStartPhysicalCamera,
  availableCameras,
  selectedCameraId,
  onSelectCamera,
  t,
}) => {
  const [showFaceMesh, setShowFaceMesh] = useState<boolean>(true);
  const [showPermissionGuide, setShowPermissionGuide] = useState<boolean>(false);
  const [lastAckTime, setLastAckTime] = useState<number | null>(null);
  const [showEmergencyCallModal, setShowEmergencyCallModal] = useState<boolean>(false);

  // Keyboard shortcut: Spacebar to acknowledge alarm
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && (metrics.alertSeverity === 'critical' || metrics.alertSeverity === 'warning')) {
        e.preventDefault();
        onSilenceAlarm();
        setLastAckTime(Date.now());
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [metrics.alertSeverity, onSilenceAlarm]);

  // Handle night vision theme color classes
  const getThemeWrapperClass = () => {
    if (settings.nightVisionMode === 'amber') {
      return 'text-amber-400 bg-black selection:bg-amber-400 selection:text-black';
    }
    if (settings.nightVisionMode === 'crimson') {
      return 'text-red-500 bg-black selection:bg-red-500 selection:text-black';
    }
    return 'text-slate-100 bg-slate-950';
  };

  const getStatusBannerColor = () => {
    if (metrics.alertSeverity === 'critical') {
      return 'bg-red-600/90 text-white border-red-500 animate-alarm-flash';
    }
    if (metrics.alertSeverity === 'warning') {
      return 'bg-amber-600/90 text-white border-amber-400 animate-pulse';
    }
    if (metrics.alertSeverity === 'advisory') {
      return 'bg-amber-950/80 text-amber-200 border-amber-600/50';
    }
    return 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30';
  };

  const formatDrivingTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Quick simulation trigger
  const triggerSimulation = (preset: 'micro_sleep' | 'yawning' | 'head_nod' | 'distracted') => {
    drowsinessDetector.setSimulationPreset(preset, 4.5);
  };

  return (
    <div className={`flex flex-col flex-1 p-4 md:p-6 gap-5 overflow-y-auto ${getThemeWrapperClass()}`}>
      {/* 1. Large Top Status & Urgent Action Bar */}
      <div
        className={`rounded-xl border p-4 md:p-5 flex flex-col md:flex-row items-center justify-between gap-4 transition-all duration-300 ${getStatusBannerColor()}`}
      >
        <div className="flex items-center gap-4 text-center md:text-left">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              metrics.alertSeverity === 'critical'
                ? 'bg-red-950 text-red-200 animate-bounce'
                : metrics.alertSeverity === 'warning'
                ? 'bg-amber-950 text-amber-300'
                : 'bg-emerald-900/40 text-emerald-300'
            }`}
          >
            {metrics.alertSeverity === 'critical' || metrics.alertSeverity === 'warning' ? (
              <AlertTriangle className="w-7 h-7" />
            ) : (
              <ShieldCheck className="w-7 h-7" />
            )}
          </div>
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-mono uppercase tracking-wider font-semibold opacity-90">
              <span>{t.cabinMonitor}</span>
              <span>·</span>
              <span>{t.truckNum} {settings.truckId || 'TRK-882'}</span>
              <span>·</span>
              <span>{settings.driverName || t.operator}</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight mt-0.5">
              {metrics.alertSeverity === 'critical'
                ? t.statusCritical
                : metrics.alertSeverity === 'warning'
                ? t.statusWarning
                : metrics.alertSeverity === 'advisory'
                ? (settings.language === 'ar' ? t.statusAdvisory : metrics.alertMessage)
                : t.statusAttentive}
            </h2>
          </div>
        </div>

        {/* Urgent Action Area: Big Tap Acknowledge + Quick Emergency Call */}
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-2.5 shrink-0 w-full md:w-auto">
          {/* Quick Call Emergency Button */}
          <button
            onClick={() => setShowEmergencyCallModal(true)}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs md:text-sm shadow-xl transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 border border-rose-400/50 ring-2 ring-rose-500/25"
            title={t.quickCall}
          >
            <PhoneCall className="w-4 h-4 animate-pulse text-white" />
            <span>{t.quickCall}</span>
          </button>

          {metrics.alertSeverity === 'critical' || metrics.alertSeverity === 'warning' ? (
            <button
              onClick={() => {
                onSilenceAlarm();
                setLastAckTime(Date.now());
              }}
              className="px-6 py-2.5 bg-white text-red-600 hover:bg-slate-100 font-extrabold text-sm md:text-base rounded-xl shadow-2xl transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2.5"
            >
              <Volume2 className="w-5 h-5 animate-pulse" />
              <span>{t.iAmAwake}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono opacity-75 hidden sm:inline">{t.spacebarToSilence}</span>
              <button
                onClick={onOpenCalibration}
                className="px-3.5 py-2 text-xs font-medium rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-slate-700/60 transition-colors cursor-pointer text-slate-200"
              >
                {t.calibrateDriver}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Main HUD Grid: Camera Feed & Real-Time Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left: Camera Feed & Visual Reticle (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden relative min-h-[380px] md:min-h-[460px]">
          {/* Top Camera Controls Overlay */}
          <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-auto">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono shadow-md">
                <span
                  className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                    isCameraActive
                      ? cameraSource === 'physical'
                        ? metrics.isFaceDetected ? 'bg-emerald-400' : 'bg-amber-400'
                        : 'bg-purple-400'
                      : 'bg-red-500'
                  }`}
                />
                <span className="font-semibold">
                  {isCameraActive
                    ? cameraSource === 'virtual'
                      ? t.simulatedWebcam
                      : metrics.isFaceDetected
                      ? t.trackingAcquired
                      : t.searchingFace
                    : t.cameraOff}
                </span>
              </div>

              {/* Source Switcher Pills */}
              <div className="hidden sm:flex items-center bg-slate-950/85 backdrop-blur-md p-1 rounded-lg border border-slate-800 text-xs font-mono">
                <button
                  onClick={onStartPhysicalCamera}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                    cameraSource === 'physical' && isCameraActive
                      ? 'bg-amber-500 text-slate-950 font-bold shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title={t.realWebcam}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{t.realWebcam}</span>
                </button>
                <button
                  onClick={onStartVirtualCamera}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                    cameraSource === 'virtual' && isCameraActive
                      ? 'bg-purple-600 text-white font-bold shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title={t.simulatedWebcam}
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>{t.simulatedWebcam}</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-950/85 backdrop-blur-md p-1 rounded-lg border border-slate-800">
              {/* Camera device picker if multiple video inputs are detected */}
              {availableCameras.length > 1 && (
                <div className="flex items-center gap-1 px-1">
                  <select
                    value={selectedCameraId}
                    onChange={e => onSelectCamera(e.target.value)}
                    className="bg-slate-900 text-slate-200 text-xs px-2 py-1 rounded border border-slate-700 focus:outline-none focus:border-amber-400"
                    title={t.switchDevice}
                  >
                    <option value="">{t.selectCamera}</option>
                    {availableCameras.map((cam, idx) => (
                      <option key={cam.deviceId || idx} value={cam.deviceId}>
                        {cam.label || `${t.realWebcam} #${idx + 1}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                onClick={() => setShowFaceMesh(!showFaceMesh)}
                className={`px-2.5 py-1 text-xs rounded font-medium transition-colors cursor-pointer ${
                  showFaceMesh ? 'bg-slate-800 text-amber-300' : 'text-slate-400 hover:text-slate-200'
                }`}
                title={t.hudGrid}
              >
                {t.hudGrid}
              </button>

              <button
                onClick={onToggleCamera}
                className="p-1.5 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title={isCameraActive ? t.disableCamera : t.enableCamera}
              >
                {isCameraActive ? <Camera className="w-4 h-4 text-emerald-400" /> : <CameraOff className="w-4 h-4 text-slate-400" />}
              </button>
            </div>
          </div>

          {/* Camera Viewport Canvas */}
          <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[360px]">
            {/* Real or Virtual Video element - ALWAYS rendered in DOM without display:none so videoWidth/readyState are valid */}
            <video
              ref={videoRef}
              className="w-full h-full object-cover transform -scale-x-100"
              playsInline
              muted
              autoPlay
            />
            <canvas
              ref={canvasRef}
              className={`absolute inset-0 w-full h-full object-cover pointer-events-none transform -scale-x-100 ${
                !showFaceMesh || !isCameraActive ? 'hidden' : 'block'
              }`}
            />

            {/* Virtual Stream Active Notice Bar */}
            {isCameraActive && cameraSource === 'virtual' && (
              <div className="absolute bottom-2 left-3 right-3 z-10 bg-purple-950/80 backdrop-blur-md border border-purple-500/30 text-purple-200 px-3 py-1.5 rounded-lg flex items-center justify-between text-xs font-mono">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                  <span>{t.virtualCamActiveNotice}</span>
                </span>
                <button
                  onClick={onStartPhysicalCamera}
                  className="px-2.5 py-0.5 bg-purple-600 hover:bg-purple-500 text-white rounded font-medium transition-colors cursor-pointer whitespace-nowrap ml-2"
                >
                  {t.switchToPhysicalCam}
                </button>
              </div>
            )}

            {/* Offline or Camera Disabled Fallback Hero */}
            {!isCameraActive && (
              <div className="absolute inset-0 z-10 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center overflow-y-auto">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3 shadow-inner">
                  <Camera className="w-8 h-8" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-white tracking-tight">
                  {cameraError ? (settings.language === 'ar' ? 'تنبيه الاتصال بالكاميرا' : 'Camera Notice') : t.cameraInactiveTitle}
                </h3>
                <p className="text-xs md:text-sm text-slate-300 mt-2 leading-relaxed max-w-lg">
                  {cameraError ? cameraError : t.cameraInactiveDesc}
                </p>

                {/* Primary Action Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
                  <button
                    onClick={onStartPhysicalCamera}
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs md:text-sm rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    <span>{t.enableWebcamBtn}</span>
                  </button>

                  <button
                    onClick={onStartVirtualCamera}
                    className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs md:text-sm rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    <span>{t.startVirtualCamBtn}</span>
                  </button>

                  <button
                    onClick={() => setShowPermissionGuide(!showPermissionGuide)}
                    className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/70 font-medium text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <HelpCircle className="w-4 h-4 text-amber-400" />
                    <span>{t.cameraTroubleshoot}</span>
                  </button>
                </div>

                {/* Step-by-Step Permission Helper Card */}
                {(showPermissionGuide || cameraError) && (
                  <div className="mt-4 max-w-md w-full bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl text-left text-xs text-slate-300 leading-normal shadow-xl">
                    <div className="flex items-center gap-2 font-semibold text-amber-400 mb-2">
                      <Info className="w-4 h-4" />
                      <span>{t.cameraTroubleshoot}</span>
                    </div>
                    <ol className="list-decimal list-inside space-y-1.5 text-slate-300 text-[11px] md:text-xs">
                      <li>{t.step1Permission}</li>
                      <li>{t.step2Permission}</li>
                      <li>{t.step3Permission}</li>
                    </ol>
                    <div className="mt-3 pt-2.5 border-t border-slate-800 flex justify-end">
                      <button
                        onClick={onStartPhysicalCamera}
                        className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>{t.retryCamera}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Optical Overlay Target Reticle */}
            {isCameraActive && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                {/* Visual alignment box */}
                <div
                  className={`w-56 h-64 md:w-64 md:h-72 border-2 rounded-3xl transition-colors duration-300 flex flex-col justify-between p-3 ${
                    metrics.alertSeverity === 'critical'
                      ? 'border-red-500/80 bg-red-500/10'
                      : metrics.alertSeverity === 'warning'
                      ? 'border-amber-500/70 bg-amber-500/10'
                      : metrics.isFaceDetected
                      ? 'border-emerald-500/40'
                      : 'border-dashed border-slate-500/40'
                  }`}
                >
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                    <span>{t.eyeApertureTitle.toUpperCase()}</span>
                    <span>{metrics.isFaceDetected ? t.eyeZoneLocked : t.eyeZoneAlign}</span>
                  </div>

                  {/* Immediate Visual Alert Floating Badges */}
                  {metrics.isEyesClosed ? (
                    <div className="self-center px-3.5 py-1.5 rounded-full bg-red-600 text-white font-bold text-xs animate-pulse border border-red-400 shadow-xl flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      <span>{t.eyesClosed}! ({metrics.eyesClosedDuration.toFixed(1)}s)</span>
                    </div>
                  ) : metrics.isHeadNodding ? (
                    <div className="self-center px-3.5 py-1.5 rounded-full bg-red-600 text-white font-bold text-xs animate-pulse border border-red-400 shadow-xl flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span>{t.headNodding}! ({Math.round(metrics.headPitch)}°)</span>
                    </div>
                  ) : metrics.isYawning ? (
                    <div className="self-center px-3.5 py-1.5 rounded-full bg-amber-600 text-white font-bold text-xs animate-pulse border border-amber-400 shadow-xl flex items-center gap-2">
                      <span>{t.yawning}! ({metrics.yawnDuration.toFixed(1)}s)</span>
                    </div>
                  ) : null}

                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                    <span>{t.chinPose}</span>
                    <span>{Math.round(metrics.headPitch)}°</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Video Status Strip */}
          <div className="p-3 bg-slate-950/90 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-3">
              <span className="text-slate-400">{t.eyeApertureTitle}:</span>
              <span
                className={`font-semibold ${
                  metrics.isEyesClosed ? 'text-red-400' : 'text-emerald-400'
                }`}
              >
                {metrics.isEyesClosed
                  ? `${t.eyesClosed} (${metrics.eyesClosedDuration.toFixed(1)}s)`
                  : t.eyesOpen}
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400">{t.yawnOpennessTitle}:</span>
              <span
                className={`font-semibold ${
                  metrics.isYawning ? 'text-amber-400' : 'text-slate-300'
                }`}
              >
                {metrics.isYawning ? `${t.yawning} (${metrics.yawnDuration.toFixed(1)}s)` : t.normal}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">{t.headPitchTitle}:</span>
              <span
                className={`font-semibold ${
                  metrics.isHeadNodding ? 'text-red-400' : 'text-slate-300'
                }`}
              >
                {metrics.isHeadNodding ? t.headNodding : t.headLevel}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Driver Safety Telemetry Gauges (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Telemetry Card: Primary Gauges */}
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {t.fatigueRiskTitle}
              </span>
              <span
                className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                  metrics.fatigueScore > 70
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                    : metrics.fatigueScore > 40
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                }`}
              >
                {metrics.fatigueScore}/100 {t.riskLabel}
              </span>
            </div>

            {/* 1. Eye Aperture Ratio Bar */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  {t.eyeApertureTitle}
                </span>
                <span className="font-mono tabular-nums text-slate-200">
                  {(metrics.avgEyeOpen * 100).toFixed(0)}%
                </span>
              </div>
              <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden relative">
                {/* Warning threshold line */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-red-400 z-10"
                  style={{ left: `${settings.eyeClosureThreshold * 100}%` }}
                  title={t.closedThreshold}
                />
                <div
                  className={`h-full transition-all duration-150 rounded-full ${
                    metrics.avgEyeOpen < settings.eyeClosureThreshold
                      ? 'bg-red-500'
                      : metrics.avgEyeOpen < 0.35
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(0, metrics.avgEyeOpen * 100))}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>{t.closedThreshold} (&lt;{Math.round(settings.eyeClosureThreshold * 100)}%)</span>
                <span>{t.normalOpen}</span>
              </div>
            </div>

            {/* 2. PERCLOS (Golden Standard NHTSA Metric) */}
            <div className="flex flex-col gap-1.5 pt-1">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-slate-300">
                  {t.perclosTitle}
                </span>
                <span className="font-mono tabular-nums text-slate-200">
                  {metrics.perclos.toFixed(1)}%
                </span>
              </div>
              <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    metrics.perclos > 40
                      ? 'bg-red-500'
                      : metrics.perclos > 20
                      ? 'bg-amber-500'
                      : 'bg-cyan-500'
                  }`}
                  style={{ width: `${Math.min(100, metrics.perclos)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>{t.safeLevel}</span>
                <span>{t.drowsyLevel}</span>
              </div>
            </div>

            {/* 3. Mouth Open / Yawning Bar */}
            <div className="flex flex-col gap-1.5 pt-1">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-slate-300">{t.yawnOpennessTitle}</span>
                <span className="font-mono tabular-nums text-slate-200">
                  {(metrics.mouthOpen * 100).toFixed(0)}%
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-150 rounded-full ${
                    metrics.isYawning ? 'bg-amber-500' : 'bg-slate-600'
                  }`}
                  style={{ width: `${Math.min(100, metrics.mouthOpen * 100)}%` }}
                />
              </div>
            </div>

            {/* 4. Head Pitch & Blink Rate Quick Badges */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div
                className={`p-2.5 rounded-lg border flex flex-col transition-all duration-200 ${
                  metrics.isHeadNodding
                    ? 'bg-red-950/80 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse'
                    : 'bg-slate-950/70 border-slate-800'
                }`}
              >
                <span className="text-[11px] text-slate-400">{t.headPitchTitle}</span>
                <span
                  className={`text-sm font-bold font-mono tabular-nums mt-0.5 ${
                    metrics.isHeadNodding ? 'text-red-400' : 'text-slate-100'
                  }`}
                >
                  {metrics.headPitch > 0 ? `+${metrics.headPitch.toFixed(0)}°` : `${metrics.headPitch.toFixed(0)}°`}
                </span>
                <span
                  className={`text-[10px] mt-0.5 font-bold ${
                    metrics.isHeadNodding ? 'text-red-300' : 'text-slate-500'
                  }`}
                >
                  {metrics.isHeadNodding ? t.headNodding : t.headLevel}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 flex flex-col">
                <span className="text-[11px] text-slate-400">{t.blinkRateTitle}</span>
                <span className="text-sm font-bold font-mono tabular-nums text-slate-100 mt-0.5">
                  {metrics.blinksPerMinute} <span className="text-xs font-normal text-slate-400">{t.blinksPerMin}</span>
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">
                  {metrics.blinksPerMinute < 8 ? t.slowFatigued : t.normalCadence}
                </span>
              </div>
            </div>
          </div>

          {/* Continuous Drive & Night Mode Options Card */}
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {t.continuousDriveTitle}
              </span>
              <span className="text-xs font-mono font-bold text-amber-400">
                {t.fmcsaLimit}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-extrabold font-mono tabular-nums text-white">
                  {formatDrivingTime(tripState.continuousDrivingSeconds)}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {t.remainingUntilRest} <span className="text-amber-300 font-mono">01h 15m</span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-lg font-bold font-mono tabular-nums text-slate-200">
                  {tripState.simulatedSpeedMph} <span className="text-xs font-normal text-slate-400">MPH</span>
                </div>
                <div className="text-[11px] text-emerald-400">{t.highwayTransit}</div>
              </div>
            </div>

            {/* Night Vision Display Mode Toggle */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <Moon className="w-3.5 h-3.5" />
                {t.nightVisionTitle}
              </span>

              <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                <button
                  onClick={() => setSettings(s => ({ ...s, nightVisionMode: 'off' }))}
                  className={`px-2 py-1 text-[11px] rounded transition-colors cursor-pointer ${
                    settings.nightVisionMode === 'off'
                      ? 'bg-slate-800 text-white font-medium'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t.themeDark}
                </button>
                <button
                  onClick={() => setSettings(s => ({ ...s, nightVisionMode: 'amber' }))}
                  className={`px-2 py-1 text-[11px] rounded transition-colors cursor-pointer ${
                    settings.nightVisionMode === 'amber'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 font-medium'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Amber low-glare display preserves driver night vision"
                >
                  {t.themeAmber}
                </button>
                <button
                  onClick={() => setSettings(s => ({ ...s, nightVisionMode: 'crimson' }))}
                  className={`px-2 py-1 text-[11px] rounded transition-colors cursor-pointer ${
                    settings.nightVisionMode === 'crimson'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/40 font-medium'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Red OLED display prevents road pupil constriction"
                >
                  {t.themeCrimson}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Drill & Testing Simulator Strip */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-semibold text-slate-300">
            {t.simulatorTitle}
          </span>
          <span className="text-xs text-slate-500 hidden md:inline">
            {t.simulatorSubtitle}
          </span>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={() => triggerSimulation('micro_sleep')}
            className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-red-950/60 hover:bg-red-900 text-red-200 border border-red-800/60 transition-colors cursor-pointer flex items-center gap-1.5"
            title="Simulate 2.5s prolonged eye closure"
          >
            <Play className="w-3 h-3 text-red-400" />
            <span>{t.simMicroSleep}</span>
          </button>
          <button
            onClick={() => triggerSimulation('yawning')}
            className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-amber-950/60 hover:bg-amber-900 text-amber-200 border border-amber-800/60 transition-colors cursor-pointer flex items-center gap-1.5"
            title="Simulate severe yawning"
          >
            <Play className="w-3 h-3 text-amber-400" />
            <span>{t.simYawn}</span>
          </button>
          <button
            onClick={() => triggerSimulation('head_nod')}
            className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
            title="Simulate head dropping downward"
          >
            <Play className="w-3 h-3 text-slate-400" />
            <span>{t.simHeadNod}</span>
          </button>
          <button
            onClick={() => {
              audioAlertService.speak(t.vocalCritical, {
                volume: settings.voiceVolume,
                rate: settings.voiceRate,
                pitch: settings.voicePitch,
                preferredVoiceURI: settings.preferredVoiceURI,
                lang: settings.language,
                urgent: true,
              });
            }}
            className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
            title="Test synthesized voice warning"
          >
            <Volume2 className="w-3 h-3 text-emerald-400" />
            <span>{t.testVoiceBtn}</span>
          </button>
          <button
            onClick={() => {
              audioAlertService.startAlarm(settings.alarmTone, settings.alarmVolume);
              setTimeout(() => audioAlertService.stopAlarm(), 2500);
            }}
            className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
            title="Test audio siren blast for 2.5s"
          >
            <Radio className="w-3 h-3 text-amber-400" />
            <span>{t.testSirenBtn}</span>
          </button>
        </div>
      </div>

      {/* 5. Emergency Quick Call System Dialog */}
      {showEmergencyCallModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
          onClick={() => setShowEmergencyCallModal(false)}
        >
          <div
            className="w-full max-w-md bg-slate-900 border-2 border-rose-500/80 rounded-2xl p-6 shadow-2xl flex flex-col gap-5 text-slate-100 relative"
            onClick={e => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setShowEmergencyCallModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              aria-label={t.cancel}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header with Emergency Badge */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-600/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shrink-0">
                <PhoneCall className="w-6 h-6 animate-pulse" />
              </div>
              <div className="flex-1 pr-6">
                <h3 className="text-xl font-black text-rose-400 tracking-tight">
                  {t.emergencyCallTitle}
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {t.emergencyCallDesc}
                </p>
              </div>
            </div>

            {/* Contact Card */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-rose-900/50 flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>{t.operator}: <strong className="text-slate-200">{settings.driverName || 'Captain'}</strong></span>
                <span>{t.truckNum}: <strong className="text-slate-200">{settings.truckId || 'TRK-402'}</strong></span>
              </div>
              <div className="text-xs font-semibold text-rose-400/90 uppercase tracking-wider">
                {t.emergencyContactLabel}
              </div>
              <div className="text-2xl font-mono font-black text-white tracking-widest text-center py-2.5 bg-slate-900/80 rounded-lg border border-slate-800">
                {settings.emergencyContact?.trim() || '+966 50 123 4567'}
              </div>
            </div>

            {/* Actions: Native Direct Call Anchor & Cancel */}
            <div className="flex flex-col gap-2.5">
              <a
                href={`tel:${(settings.emergencyContact?.trim() || '+966501234567').replace(/[^0-9+]/g, '')}`}
                onClick={() => {
                  setTimeout(() => setShowEmergencyCallModal(false), 600);
                }}
                className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-extrabold text-base rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-3 border border-rose-400/50 ring-2 ring-rose-500/30"
              >
                <PhoneCall className="w-5 h-5" />
                <span>{t.callNow}</span>
              </a>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowEmergencyCallModal(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors cursor-pointer text-center"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={() => {
                    setShowEmergencyCallModal(false);
                    onOpenSettings();
                  }}
                  className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 font-medium text-xs transition-colors cursor-pointer"
                >
                  {settings.language === 'ar' ? 'تعديل الرقم' : 'Edit Number'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
