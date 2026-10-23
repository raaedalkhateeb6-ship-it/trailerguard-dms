import React from 'react';
import { Clock, ShieldAlert, Coffee, AlertCircle, CheckCircle2 } from 'lucide-react';
import { DutyStatus, TripState } from '../types/dms';
import { Translations } from '../i18n/translations';

interface HOSProps {
  tripState: TripState;
  setTripState: React.Dispatch<React.SetStateAction<TripState>>;
  onTakeBreak: () => void;
  t: Translations;
}

export const HoursOfServiceTracker: React.FC<HOSProps> = ({
  tripState,
  setTripState,
  onTakeBreak,
  t,
}) => {
  // FMCSA Standard limits
  const maxDriveSecToday = 11 * 3600; // 11 hours max driving
  const maxShiftWindowSec = 14 * 3600; // 14 hours shift window

  const drivingSecondsRemaining = Math.max(0, maxDriveSecToday - tripState.drivingSecondsToday);
  const continuousSecondsRemaining = Math.max(
    0,
    tripState.maxContinuousDrivingLimitSec - tripState.continuousDrivingSeconds
  );

  const formatHMS = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const setDuty = (status: DutyStatus) => {
    setTripState(s => ({
      ...s,
      dutyStatus: status,
      simulatedSpeedMph: status === 'driving' ? 64 : 0,
    }));
  };

  // Circadian fatigue vulnerability estimation
  const currentHour = new Date().getHours();
  const isCircadianHighRisk = (currentHour >= 1 && currentHour <= 5) || (currentHour >= 13 && currentHour <= 16);

  return (
    <div className="flex flex-col flex-1 p-4 md:p-6 gap-6 overflow-y-auto">
      {/* Title & Status Summary */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            {t.hosTitle}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {t.hosSubtitle}
          </p>
        </div>

        {/* Duty Status Segmented Selector */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl shrink-0">
          <button
            onClick={() => setDuty('driving')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              tripState.dutyStatus === 'driving'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.dutyDriving}
          </button>
          <button
            onClick={() => setDuty('on_duty_not_driving')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              tripState.dutyStatus === 'on_duty_not_driving'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.dutyInspection}
          </button>
          <button
            onClick={() => setDuty('sleeper_berth')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              tripState.dutyStatus === 'sleeper_berth'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.dutySleeper}
          </button>
          <button
            onClick={() => setDuty('off_duty')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              tripState.dutyStatus === 'off_duty'
                ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.dutyOffDuty}
          </button>
        </div>
      </div>

      {/* 3 Core HOS Clocks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Clock 1: 11-Hour Drive Limit */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold uppercase tracking-wider">{t.clock11Hr}</span>
              <span className="font-mono text-emerald-400">{t.availableLabel}</span>
            </div>
            <div className="text-3xl font-extrabold font-mono tabular-nums text-white">
              {formatHMS(drivingSecondsRemaining)}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              {t.drivenToday} <span className="text-slate-200 font-mono">{formatHMS(tripState.drivingSecondsToday)}</span> of 11h
            </p>
          </div>
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mt-4">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, (tripState.drivingSecondsToday / maxDriveSecToday) * 100)}%` }}
            />
          </div>
        </div>

        {/* Clock 2: Continuous Drive until Mandatory Rest */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold uppercase tracking-wider">{t.continuousLimit}</span>
              <span className="font-mono text-amber-400">{t.recommendedStop}</span>
            </div>
            <div className="text-3xl font-extrabold font-mono tabular-nums text-white">
              {formatHMS(continuousSecondsRemaining)}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              {t.currentLeg} <span className="text-slate-200 font-mono">{formatHMS(tripState.continuousDrivingSeconds)}</span>
            </p>
          </div>
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mt-4">
            <div
              className={`h-full rounded-full transition-all ${
                continuousSecondsRemaining < 1800 ? 'bg-red-500' : 'bg-amber-500'
              }`}
              style={{
                width: `${Math.min(100, (tripState.continuousDrivingSeconds / tripState.maxContinuousDrivingLimitSec) * 100)}%`,
              }}
            />
          </div>
        </div>

        {/* Clock 3: 14-Hour Shift Duty Clock */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold uppercase tracking-wider">{t.shift14Hr}</span>
              <span className="font-mono text-cyan-400">{t.dailyMax}</span>
            </div>
            <div className="text-3xl font-extrabold font-mono tabular-nums text-white">
              {formatHMS(Math.max(0, maxShiftWindowSec - (tripState.drivingSecondsToday + 3600)))}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              {t.shiftStartedAt}
            </p>
          </div>
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mt-4">
            <div
              className="bg-cyan-500 h-full rounded-full transition-all"
              style={{
                width: `${Math.min(100, ((tripState.drivingSecondsToday + 3600) / maxShiftWindowSec) * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Circadian Hazard Alert & Rest Recommendation Strip */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              isCircadianHighRisk
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
            }`}
          >
            {isCircadianHighRisk ? (
              <AlertCircle className="w-6 h-6" />
            ) : (
              <CheckCircle2 className="w-6 h-6" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <span>{t.circadianTitle}</span>
              <span>·</span>
              <span className="font-mono text-slate-300">{currentHour}:00</span>
            </div>
            <p className="text-sm font-medium text-slate-200 mt-0.5">
              {isCircadianHighRisk
                ? t.circadianHighRisk
                : t.circadianModerate}
            </p>
          </div>
        </div>

        <button
          onClick={onTakeBreak}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-2 shrink-0"
        >
          <Coffee className="w-4 h-4" />
          <span>{t.log30MinBreakBtn}</span>
        </button>
      </div>

      {/* Mandatory Safety Guidelines for Semi-Truck Operators */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40">
        <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          {t.microSleepSignsTitle}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-400">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
            <span className="font-bold text-slate-200 block mb-1">{t.sign1Title}</span>
            {t.sign1Desc}
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
            <span className="font-bold text-slate-200 block mb-1">{t.sign2Title}</span>
            {t.sign2Desc}
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80">
            <span className="font-bold text-slate-200 block mb-1">{t.sign3Title}</span>
            {t.sign3Desc}
          </div>
        </div>
      </div>
    </div>
  );
};
