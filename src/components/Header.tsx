import React from 'react';
import { ShieldAlert, Volume2, Maximize2, Minimize2, Languages } from 'lucide-react';
import { Translations, Language } from '../i18n/translations';

interface HeaderProps {
  activeTab: 'hud' | 'hos' | 'incidents' | 'reststops' | 'settings';
  setActiveTab: (tab: 'hud' | 'hos' | 'incidents' | 'reststops' | 'settings') => void;
  isMonitoring: boolean;
  onToggleMonitoring: () => void;
  isAlarmActive: boolean;
  onSilenceAlarm: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  language: Language;
  onToggleLanguage: () => void;
  onOpenGooglePlay?: () => void;
  t: Translations;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isMonitoring,
  onToggleMonitoring,
  isAlarmActive,
  onSilenceAlarm,
  isFullscreen,
  onToggleFullscreen,
  language,
  onToggleLanguage,
  t,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shrink-0">
      {/* Zone 1: Brand single text element */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
          {t.appName}
        </span>
      </div>

      {/* Zone 2: 4-5 single-line clean nav links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('hud')}
          className={`whitespace-nowrap transition-colors pb-1 border-b-2 cursor-pointer ${
            activeTab === 'hud'
              ? 'border-amber-400 text-amber-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          {t.navHud}
        </button>
        <button
          onClick={() => setActiveTab('hos')}
          className={`whitespace-nowrap transition-colors pb-1 border-b-2 cursor-pointer ${
            activeTab === 'hos'
              ? 'border-amber-400 text-amber-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          {t.navHos}
        </button>
        <button
          onClick={() => setActiveTab('incidents')}
          className={`whitespace-nowrap transition-colors pb-1 border-b-2 cursor-pointer ${
            activeTab === 'incidents'
              ? 'border-amber-400 text-amber-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          {t.navIncidents}
        </button>
        <button
          onClick={() => setActiveTab('reststops')}
          className={`whitespace-nowrap transition-colors pb-1 border-b-2 cursor-pointer ${
            activeTab === 'reststops'
              ? 'border-amber-400 text-amber-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          {t.navRestStops}
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`whitespace-nowrap transition-colors pb-1 border-b-2 cursor-pointer ${
            activeTab === 'settings'
              ? 'border-amber-400 text-amber-400 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          {t.navSettings}
        </button>
      </nav>

      {/* Zone 3: 1 primary action button + language toggle + fullscreen helper */}
      <div className="flex items-center gap-2.5 shrink-0">

        <button
          onClick={onToggleLanguage}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-colors cursor-pointer"
          title={language === 'en' ? 'التحويل إلى اللغة العربية' : 'Switch to English'}
        >
          <Languages className="w-3.5 h-3.5 text-amber-400" />
          <span>{t.languageToggle}</span>
        </button>

        <button
          onClick={onToggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : t.fullscreen}
          className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          aria-label="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {isAlarmActive ? (
          <button
            onClick={onSilenceAlarm}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg shadow-lg shadow-red-950/50 transition-colors whitespace-nowrap cursor-pointer animate-pulse"
          >
            <Volume2 className="w-4 h-4" />
            <span>{t.silenceAlarm}</span>
          </button>
        ) : (
          <button
            onClick={onToggleMonitoring}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              isMonitoring
                ? 'bg-slate-800 text-emerald-400 hover:bg-slate-700 border border-emerald-500/30'
                : 'bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold shadow-md shadow-amber-950/40'
            }`}
          >
            {isMonitoring ? t.monitoringActive : t.startMonitoring}
          </button>
        )}
      </div>
    </header>
  );
};
