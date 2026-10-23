import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Crosshair } from 'lucide-react';
import { DetectionMetrics, DMSSettings } from '../types/dms';
import { drowsinessDetector } from '../services/drowsinessDetector';
import { audioAlertService } from '../services/audioAlertService';
import { Translations } from '../i18n/translations';

interface DriverCalibrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: DetectionMetrics;
  settings: DMSSettings;
  setSettings: React.Dispatch<React.SetStateAction<DMSSettings>>;
  t: Translations;
}

export const DriverCalibrationModal: React.FC<DriverCalibrationModalProps> = ({
  isOpen,
  onClose,
  metrics,
  settings,
  setSettings,
  t,
}) => {
  const [step, setStep] = useState<'ready' | 'measuring' | 'complete'>('ready');
  const [countdown, setCountdown] = useState<number>(3);
  const [samples, setSamples] = useState<{ eyeOpen: number; pitch: number }[]>([]);

  useEffect(() => {
    if (step !== 'measuring') return;
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(c => c - 1);
        if (metrics.isFaceDetected) {
          setSamples(s => [...s, { eyeOpen: metrics.avgEyeOpen, pitch: metrics.headPitch }]);
        }
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Completed measurement
      if (samples.length > 0) {
        const avgEye = samples.reduce((acc, curr) => acc + curr.eyeOpen, 0) / samples.length;
        const avgPitch = samples.reduce((acc, curr) => acc + curr.pitch, 0) / samples.length;

        // Suggested eye threshold is ~65% of normal open state
        const calibratedThreshold = Math.max(0.18, Math.min(0.38, avgEye * 0.65));
        const calibratedNodThreshold = -9;

        setSettings(s => ({
          ...s,
          eyeClosureThreshold: parseFloat(calibratedThreshold.toFixed(2)),
          headNodThresholdDeg: calibratedNodThreshold,
        }));

        drowsinessDetector.calibrateBaseline(avgEye, avgPitch);
        audioAlertService.playChirp('ack');
      }
      setStep('complete');
    }
  }, [step, countdown, metrics, samples, setSettings]);

  if (!isOpen) return null;

  const startCalibration = () => {
    setSamples([]);
    setCountdown(3);
    setStep('measuring');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Crosshair className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">{t.calibTitle}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center text-center">
          {step === 'ready' && (
            <>
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
                <Crosshair className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">{t.calibReadyTitle}</h3>
              <p className="text-xs text-slate-300 mt-2 max-w-sm leading-relaxed">
                {t.calibReadyDesc}
              </p>

              <div className="mt-4 p-3 bg-slate-950 rounded-xl border border-slate-800 w-full text-xs font-mono text-slate-400 flex justify-between">
                <span>{t.calibFaceStatus}</span>
                <span className={metrics.isFaceDetected ? 'text-emerald-400 font-bold' : 'text-red-400'}>
                  {metrics.isFaceDetected ? t.calibFaceAligned : t.calibAlignFace}
                </span>
              </div>

              <button
                onClick={startCalibration}
                className="mt-6 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-colors cursor-pointer w-full"
              >
                {t.calibBeginBtn}
              </button>
            </>
          )}

          {step === 'measuring' && (
            <div className="py-6 flex flex-col items-center">
              <div className="text-5xl font-black font-mono text-amber-400 animate-pulse">
                {countdown}
              </div>
              <p className="text-xs text-slate-300 mt-3 font-medium">
                {t.calibSamplingDesc}
              </p>
              <div className="mt-4 text-xs font-mono text-slate-500">
                {t.calibSamplesCount} {samples.length}
              </div>
            </div>
          )}

          {step === 'complete' && (
            <>
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">{t.calibCompleteTitle}</h3>
              <p className="text-xs text-slate-300 mt-1 max-w-sm">
                {t.calibCompleteDesc}
              </p>

              <div className="mt-4 p-3 bg-slate-950 rounded-xl border border-slate-800 w-full text-xs font-mono grid grid-cols-2 gap-2 text-left">
                <div>
                  <span className="text-slate-500 block">{t.calibTriggerLabel}</span>
                  <span className="text-emerald-400 font-bold text-sm">
                    {Math.round(settings.eyeClosureThreshold * 100)}%
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">{t.calibNodTriggerLabel}</span>
                  <span className="text-amber-400 font-bold text-sm">
                    {settings.headNodThresholdDeg}° {settings.language === 'ar' ? 'للأسفل' : 'Down'}
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="mt-6 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-colors cursor-pointer w-full"
              >
                {t.calibSaveBtn}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
