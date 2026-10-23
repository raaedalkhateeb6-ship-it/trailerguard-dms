import React from 'react';
import { Download, Trash2, Activity, ShieldCheck } from 'lucide-react';
import { IncidentRecord } from '../types/dms';
import { Translations } from '../i18n/translations';

interface IncidentLogProps {
  incidents: IncidentRecord[];
  onClearIncidents: () => void;
  t: Translations;
}

export const IncidentLog: React.FC<IncidentLogProps> = ({
  incidents,
  onClearIncidents,
  t,
}) => {
  const exportCSV = () => {
    if (incidents.length === 0) return;
    const headers = [
      t.colTime,
      t.colType,
      t.colSeverity,
      t.colDuration,
      t.colPerclos,
      t.colSpeed,
      t.colReaction,
    ];
    const rows = incidents.map(inc => [
      new Date(inc.timestamp).toLocaleTimeString(),
      getTypeLabel(inc.type),
      inc.severity,
      inc.duration.toFixed(2),
      inc.peakPerclos.toFixed(1),
      inc.speedMph,
      inc.driverResponseTimeSec ? inc.driverResponseTimeSec.toFixed(2) : 'N/A',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `trailerguard_fatigue_audit_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getSeverityBadge = (severity: IncidentRecord['severity']) => {
    switch (severity) {
      case 'critical':
        return <span className="text-xs font-bold text-red-400">{t.sevCritical}</span>;
      case 'warning':
        return <span className="text-xs font-semibold text-amber-400">{t.sevWarning}</span>;
      default:
        return <span className="text-xs font-medium text-slate-300">{t.sevAdvisory}</span>;
    }
  };

  const getTypeLabel = (type: IncidentRecord['type']) => {
    switch (type) {
      case 'micro_sleep':
        return t.typeMicroSleep;
      case 'eyes_closed':
        return t.typeEyeClosure;
      case 'yawn_excess':
        return t.typeYawn;
      case 'head_drop':
        return t.typeHeadDrop;
      case 'distraction':
        return t.typeDistraction;
      default:
        return t.typeEyeClosure;
    }
  };

  return (
    <div className="flex flex-col flex-1 p-4 md:p-6 gap-6 overflow-y-auto">
      {/* Title & Actions Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-400" />
            {t.incidentsTitle}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {t.incidentsSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportCSV}
            disabled={incidents.length === 0}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>{t.exportCsvBtn}</span>
          </button>
          <button
            onClick={onClearIncidents}
            disabled={incidents.length === 0}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-red-950/40 text-slate-400 hover:text-red-400 border border-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t.clearLogBtn}</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
          <div className="text-xs text-slate-400">{t.totalEvents}</div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {incidents.length}
          </div>
        </div>
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
          <div className="text-xs text-slate-400">{t.criticalEvents}</div>
          <div className="text-2xl font-bold font-mono text-red-400 mt-1">
            {incidents.filter(i => i.severity === 'critical').length}
          </div>
        </div>
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
          <div className="text-xs text-slate-400">{t.avgReactionTime}</div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
            {incidents.length > 0
              ? (
                  incidents.reduce((acc, i) => acc + (i.driverResponseTimeSec || 1.1), 0) /
                  incidents.length
                ).toFixed(2)
              : '0.00'}{' '}
            <span className="text-xs font-normal text-slate-400">sec</span>
          </div>
        </div>
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60">
          <div className="text-xs text-slate-400">{t.protectionActive}</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            100%
          </div>
        </div>
      </div>

      {/* Incidents Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        {incidents.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-200">{t.noIncidentsTitle}</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              {t.noIncidentsDesc}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-medium">
                  <th className="py-3 px-4">{t.colTime}</th>
                  <th className="py-3 px-4">{t.colType}</th>
                  <th className="py-3 px-4">{t.colSeverity}</th>
                  <th className="py-3 px-4 text-right">{t.colDuration}</th>
                  <th className="py-3 px-4 text-right">{t.colPerclos}</th>
                  <th className="py-3 px-4 text-right">{t.colSpeed}</th>
                  <th className="py-3 px-4 text-right">{t.colReaction}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {incidents.map((incident) => (
                  <tr key={incident.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {new Date(incident.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-100 flex items-center gap-2">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          incident.severity === 'critical'
                            ? 'bg-red-400'
                            : incident.severity === 'warning'
                            ? 'bg-amber-400'
                            : 'bg-slate-400'
                        }`}
                      />
                      <span>{getTypeLabel(incident.type)}</span>
                    </td>
                    <td className="py-3 px-4">{getSeverityBadge(incident.severity)}</td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-200">
                      {incident.duration.toFixed(2)}s
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-200">
                      {incident.peakPerclos.toFixed(1)}%
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-300">
                      {incident.speedMph} MPH
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-300">
                      {incident.driverResponseTimeSec
                        ? `${incident.driverResponseTimeSec.toFixed(2)}s`
                        : '<1.0s'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
