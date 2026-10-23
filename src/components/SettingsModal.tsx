import React, { useState, useEffect } from 'react';
import { X, Volume2, Shield, Radio, Mic, Truck, Check, Globe, Phone } from 'lucide-react';
import { DMSSettings, AlarmToneType } from '../types/dms';
import { audioAlertService } from '../services/audioAlertService';
import { Translations } from '../i18n/translations';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: DMSSettings;
  setSettings: React.Dispatch<React.SetStateAction<DMSSettings>>;
  t: Translations;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  setSettings,
  t,
}) => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [testPlaying, setTestPlaying] = useState<boolean>(false);
  const [savedNotice, setSavedNotice] = useState<boolean>(false);

  useEffect(() => {
    const updateVoices = () => {
      const v = audioAlertService.getAvailableVoices();
      setVoices(v);
    };
    updateVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  if (!isOpen) return null;

  const handleTestSiren = () => {
    if (testPlaying) {
      audioAlertService.stopAlarm();
      setTestPlaying(false);
    } else {
      audioAlertService.startAlarm(settings.alarmTone, settings.alarmVolume);
      setTestPlaying(true);
      setTimeout(() => {
        audioAlertService.stopAlarm();
        setTestPlaying(false);
      }, 3000);
    }
  };

  const handleTestVoice = () => {
    audioAlertService.speak(
      t.vocalTest,
      {
        volume: settings.voiceVolume,
        rate: settings.voiceRate,
        pitch: settings.voicePitch,
        preferredVoiceURI: settings.preferredVoiceURI,
        lang: settings.language,
        urgent: true,
      }
    );
  };

  const handleSave = () => {
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {t.settingsTitle}
              </h2>
              <p className="text-xs text-slate-400">
                {t.settingsSubtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex flex-col gap-6 text-sm">
          {/* Section 0: Language Selection */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-amber-400" />
              <div>
                <span className="text-xs font-bold text-white block">
                  {settings.language === 'ar' ? 'لغة واجهة التطبيق والصوت' : 'System Interface & Vocal Alert Language'}
                </span>
                <span className="text-[11px] text-slate-400">
                  {settings.language === 'ar' ? 'العربية (RTL) / English' : 'English / Arabic with localized synthesized voice'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setSettings(s => ({ ...s, language: 'ar' }))}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                  settings.language === 'ar'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                العربية
              </button>
              <button
                onClick={() => setSettings(s => ({ ...s, language: 'en' }))}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                  settings.language === 'en'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                English
              </button>
            </div>
          </div>

          {/* Section 1: Vision Sensitivity & Timing */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              {t.section1Title}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-medium">{t.eyeClosureThresholdLabel}</span>
                  <span className="font-mono text-amber-400">
                    {Math.round(settings.eyeClosureThreshold * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.15"
                  max="0.40"
                  step="0.01"
                  value={settings.eyeClosureThreshold}
                  onChange={e =>
                    setSettings(s => ({ ...s, eyeClosureThreshold: parseFloat(e.target.value) }))
                  }
                  className="accent-amber-500 w-full"
                />
                <span className="text-[11px] text-slate-500">
                  {t.eyeClosureThresholdHint}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-medium">{t.alarmDelayLabel}</span>
                  <span className="font-mono text-red-400">
                    {settings.eyesClosedCriticalSec.toFixed(1)} {settings.language === 'ar' ? 'ثانية' : 'seconds'}
                  </span>
                </div>
                <input
                  type="range"
                  min="1.2"
                  max="3.0"
                  step="0.1"
                  value={settings.eyesClosedCriticalSec}
                  onChange={e =>
                    setSettings(s => ({
                      ...s,
                      eyesClosedCriticalSec: parseFloat(e.target.value),
                    }))
                  }
                  className="accent-red-500 w-full"
                />
                <span className="text-[11px] text-slate-500">
                  {t.alarmDelayHint}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col gap-2 md:col-span-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-medium">{t.headNodThresholdLabel}</span>
                  <span className="font-mono text-amber-400 font-bold">
                    {settings.headNodThresholdDeg}° {settings.language === 'ar' ? '(ميلان للأمام)' : '(forward nod)'}
                  </span>
                </div>
                <input
                  type="range"
                  min="-18"
                  max="-5"
                  step="1"
                  value={settings.headNodThresholdDeg}
                  onChange={e =>
                    setSettings(s => ({
                      ...s,
                      headNodThresholdDeg: parseInt(e.target.value, 10),
                    }))
                  }
                  className="accent-amber-500 w-full"
                />
                <span className="text-[11px] text-slate-500">
                  {t.headNodThresholdHint}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Audio Siren Settings */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5" />
              {t.section2Title}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col gap-2">
                <label className="text-xs text-slate-300 font-medium">{t.sirenProfileLabel}</label>
                <select
                  value={settings.alarmTone}
                  onChange={e =>
                    setSettings(s => ({ ...s, alarmTone: e.target.value as AlarmToneType }))
                  }
                  className="bg-slate-900 border border-slate-700 text-slate-100 rounded-lg p-2 text-xs focus:outline-none focus:border-amber-500"
                >
                  <option value="piercing_siren">
                    {settings.language === 'ar' ? 'صفارة مسح ترددية خارقة (880-1760 هرتز)' : 'Piercing Frequency Sweep (880-1760Hz)'}
                  </option>
                  <option value="truck_airhorn">
                    {settings.language === 'ar' ? 'بوق هوائي لشاحنة ثقيلة (نغمات جهيرة)' : 'Commercial Semi Air-Horn Blast (Deep Harmonics)'}
                  </option>
                  <option value="pulsed_buzzer">
                    {settings.language === 'ar' ? 'إنذار طنان متقطع سريع' : 'High-Decibel Rapid Square Buzzer'}
                  </option>
                  <option value="euro_two_tone">
                    {settings.language === 'ar' ? 'بوق طوارئ ثنائي النغمة (960/770 هرتز)' : 'Dual-Tone Hi-Low Horn (960/770Hz)'}
                  </option>
                  <option value="radar_ping">
                    {settings.language === 'ar' ? 'نبض رادار تحذيري' : 'Radar Warning Pulse'}
                  </option>
                </select>
                <span className="text-[11px] text-slate-500">
                  {t.sirenProfileHint}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-medium">{t.masterVolumeLabel}</span>
                    <span className="font-mono text-slate-200">
                      {Math.round(settings.alarmVolume * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="1.0"
                    step="0.05"
                    value={settings.alarmVolume}
                    onChange={e =>
                      setSettings(s => ({ ...s, alarmVolume: parseFloat(e.target.value) }))
                    }
                    className="accent-amber-500 w-full mt-2"
                  />
                </div>

                <button
                  onClick={handleTestSiren}
                  className="mt-3 px-3 py-1.5 text-xs font-bold rounded-lg bg-red-600 hover:bg-red-500 text-white transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>{testPlaying ? t.stopSirenBtn : t.testSiren3sBtn}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Web Speech API Voice Alerts */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5" />
              {t.section3Title}
            </h3>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-xs text-slate-200 font-medium flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.voiceAlertsEnabled}
                    onChange={e =>
                      setSettings(s => ({ ...s, voiceAlertsEnabled: e.target.checked }))
                    }
                    className="accent-amber-500 rounded"
                  />
                  <span>{t.enableVoiceAlerts}</span>
                </label>

                <button
                  onClick={handleTestVoice}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{t.testVoiceBtn}</span>
                </button>
              </div>

              {voices.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs text-slate-400">{t.synthVoiceLabel}</span>
                  <select
                    value={settings.preferredVoiceURI}
                    onChange={e =>
                      setSettings(s => ({ ...s, preferredVoiceURI: e.target.value }))
                    }
                    className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-amber-500"
                  >
                    <option value="">{t.defaultHighClarityVoice}</option>
                    {voices.map(voice => (
                      <option key={voice.voiceURI} value={voice.voiceURI}>
                        {voice.name} ({voice.lang})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-1">
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>{t.speechCadenceLabel}</span>
                    <span className="font-mono">{settings.voiceRate.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.8"
                    max="1.4"
                    step="0.05"
                    value={settings.voiceRate}
                    onChange={e =>
                      setSettings(s => ({ ...s, voiceRate: parseFloat(e.target.value) }))
                    }
                    className="accent-amber-500 w-full"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>{t.voiceLoudnessLabel}</span>
                    <span className="font-mono">{Math.round(settings.voiceVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="1.0"
                    step="0.05"
                    value={settings.voiceVolume}
                    onChange={e =>
                      setSettings(s => ({ ...s, voiceVolume: parseFloat(e.target.value) }))
                    }
                    className="accent-amber-500 w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Vehicle & Operator Profile */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5" />
              {t.section4Title}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <span className="text-xs text-slate-400 block mb-1">{t.truckUnitIdLabel}</span>
                <input
                  type="text"
                  value={settings.truckId}
                  onChange={e => setSettings(s => ({ ...s, truckId: e.target.value }))}
                  placeholder="e.g. VOLVO-VNL-860"
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <span className="text-xs text-slate-400 block mb-1">{t.driverNameLabel}</span>
                <input
                  type="text"
                  value={settings.driverName}
                  onChange={e => setSettings(s => ({ ...s, driverName: e.target.value }))}
                  placeholder={settings.language === 'ar' ? 'الكابتن أحمد الخالدي' : 'Captain Marcus Vance'}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="md:col-span-2">
                <span className="text-xs text-rose-400 font-medium flex items-center gap-1.5 mb-1">
                  <Phone className="w-3.5 h-3.5" />
                  {t.emergencyContactLabel}
                </span>
                <input
                  type="tel"
                  value={settings.emergencyContact}
                  onChange={e => setSettings(s => ({ ...s, emergencyContact: e.target.value }))}
                  placeholder="+966 50 123 4567 / 911 / 998"
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-rose-500 font-mono"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  {settings.language === 'ar'
                    ? 'الرقم الذي يتم الاتصال به فوراً عند الضغط على زر اتصال الطوارئ السريع في الواجهة الرئيسية'
                    : 'Dialed immediately when tapping the Quick Call button on the main HUD'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            {savedNotice ? t.settingsSavedNotice : t.settingsRealtimeNotice}
          </span>
          <button
            onClick={handleSave}
            className="px-5 py-2 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>{t.doneApplyBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
