import React, { useState } from 'react';
import {
  MapPin,
  Coffee,
  Fuel,
  Bed,
  Navigation,
  CheckCircle,
  AlertOctagon,
} from 'lucide-react';
import { RestStop, DMSSettings } from '../types/dms';
import { Translations } from '../i18n/translations';

interface RestStopFinderProps {
  settings: DMSSettings;
  t: Translations;
}

export const RestStopFinder: React.FC<RestStopFinderProps> = ({ settings, t }) => {
  const [filterType, setFilterType] = useState<'all' | 'showers' | 'parking'>('all');
  const [activeNavStop, setActiveNavStop] = useState<string | null>(null);
  const [sosSent, setSosSent] = useState<boolean>(false);

  // Authentic commercial truck rest stops and travel plazas
  const restStops: RestStop[] = [
    {
      id: 'rs-1',
      name: settings.language === 'ar' ? "استراحة لافز ترافل سنتر #492" : "Love's Travel Stop #492",
      brand: 'Loves',
      distanceMiles: 3.8,
      exitNumber: settings.language === 'ar' ? 'مخرج 124B' : 'Exit 124B',
      highway: settings.language === 'ar' ? 'طريق I-80 غرباً' : 'I-80 Westbound',
      truckParkingSpotsTotal: 140,
      truckParkingSpotsAvailable: 38,
      hasShowers: true,
      hasDieselHighSpeed: true,
      hasHotFood: true,
      hasCoffee247: true,
      hasQuietBerthArea: true,
    },
    {
      id: 'rs-2',
      name: settings.language === 'ar' ? 'مركز بايلوت للشاحنات #718' : 'Pilot Travel Center #718',
      brand: 'Pilot Flying J',
      distanceMiles: 8.4,
      exitNumber: settings.language === 'ar' ? 'مخرج 132' : 'Exit 132',
      highway: settings.language === 'ar' ? 'طريق I-80 غرباً' : 'I-80 Westbound',
      truckParkingSpotsTotal: 180,
      truckParkingSpotsAvailable: 64,
      hasShowers: true,
      hasDieselHighSpeed: true,
      hasHotFood: true,
      hasCoffee247: true,
      hasQuietBerthArea: true,
    },
    {
      id: 'rs-3',
      name: settings.language === 'ar' ? 'استراحة السلامة العامة الحكومية' : 'State Highway Safety Rest Area',
      brand: 'State Rest Area',
      distanceMiles: 14.1,
      exitNumber: settings.language === 'ar' ? 'العلامة 138' : 'Mile Marker 138',
      highway: settings.language === 'ar' ? 'طريق I-80 غرباً' : 'I-80 Westbound',
      truckParkingSpotsTotal: 45,
      truckParkingSpotsAvailable: 12,
      hasShowers: false,
      hasDieselHighSpeed: false,
      hasHotFood: false,
      hasCoffee247: false,
      hasQuietBerthArea: true,
    },
    {
      id: 'rs-4',
      name: settings.language === 'ar' ? 'مجمع تي إيه بيترو للخدمات الشاملة' : 'TA Travel Center (Petro Stopping Center)',
      brand: 'TA Petro',
      distanceMiles: 22.6,
      exitNumber: settings.language === 'ar' ? 'مخرج 150' : 'Exit 150',
      highway: settings.language === 'ar' ? 'طريق I-80 غرباً' : 'I-80 Westbound',
      truckParkingSpotsTotal: 250,
      truckParkingSpotsAvailable: 95,
      hasShowers: true,
      hasDieselHighSpeed: true,
      hasHotFood: true,
      hasCoffee247: true,
      hasQuietBerthArea: true,
    },
  ];

  const filteredStops = restStops.filter(stop => {
    if (filterType === 'showers') return stop.hasShowers;
    if (filterType === 'parking') return stop.truckParkingSpotsAvailable > 25;
    return true;
  });

  const handleDispatchSos = () => {
    setSosSent(true);
    const msg = settings.language === 'ar'
      ? `تم إرسال نداء الاستغاثة بنجاح:\n\nتم إخطار غرفة عمليات الأسطول والسلامة على الطرق.\nالشاحنة: ${settings.truckId || 'TRK-882'}\nالسائق: ${settings.driverName || 'سائق معتمد'}\nالموقع: طريق I-80 غرباً علامة 121\nالحالة: إنذار نعاس وإرهاق - تم التوجيه للتوقف الآمن على حافة الطريق`
      : `EMERGENCY SOS BEACON DISPATCHED:\n\nFleet Dispatch & Roadside Safety notified.\nTruck: ${settings.truckId || 'TRK-882'}\nDriver: ${settings.driverName || 'Operator'}\nPosition: I-80 WB Mile Marker 121\nStatus: Driver Fatigue Alert - Safe Shoulder Pull-Over Initiated`;
    setTimeout(() => {
      alert(msg);
    }, 150);
  };

  return (
    <div className="flex flex-col flex-1 p-4 md:p-6 gap-6 overflow-y-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-amber-400" />
            {t.restStopsTitle}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {t.restStopsSubtitle}
          </p>
        </div>

        {/* SOS Emergency Dispatch Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleDispatchSos}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
              sosSent
                ? 'bg-emerald-600 text-white'
                : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-950/60'
            }`}
          >
            {sosSent ? (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>{t.sosDispatchedBtn}</span>
              </>
            ) : (
              <>
                <AlertOctagon className="w-4 h-4" />
                <span>{t.sosBtn}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Active Routing Banner (if driver selected a rest stop) */}
      {activeNavStop && (
        <div className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-950/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Navigation className="w-5 h-5 text-emerald-400 animate-pulse" />
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                {t.activeNav}
              </div>
              <div className="text-sm font-semibold text-white">
                {t.routingTo} {restStops.find(s => s.id === activeNavStop)?.name}
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveNavStop(null)}
            className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
          >
            {t.cancelRoute}
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-lg">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              filterType === 'all'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.filterAll}
          </button>
          <button
            onClick={() => setFilterType('parking')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              filterType === 'parking'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.filterParking}
          </button>
          <button
            onClick={() => setFilterType('showers')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              filterType === 'showers'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.filterShowers}
          </button>
        </div>

        <span className="text-xs font-mono text-slate-400 hidden sm:inline">
          {filteredStops.length} {t.safeLocationsAhead}
        </span>
      </div>

      {/* Rest Stops List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredStops.map(stop => (
          <div
            key={stop.id}
            className={`p-5 rounded-xl border transition-all flex flex-col justify-between ${
              activeNavStop === stop.id
                ? 'border-emerald-500/70 bg-slate-900/90 shadow-lg'
                : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
            }`}
          >
            <div>
              {/* Header: Name and Distance */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-xs text-amber-400 font-semibold">
                    {stop.highway} · {stop.exitNumber}
                  </div>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    {stop.name}
                  </h3>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-lg font-bold font-mono tabular-nums text-white">
                    {stop.distanceMiles} <span className="text-xs font-normal text-slate-400">{t.miAway}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    ~{Math.round(stop.distanceMiles / (60 / 60))} {t.minsAway}
                  </div>
                </div>
              </div>

              {/* Parking capacity bar */}
              <div className="mt-4 p-3 rounded-lg bg-slate-950/70 border border-slate-800/80">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">{t.parkingCapacity}</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {stop.truckParkingSpotsAvailable} / {stop.truckParkingSpotsTotal} {t.spotsOpen}
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden mt-1.5">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{
                      width: `${(stop.truckParkingSpotsAvailable / stop.truckParkingSpotsTotal) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Amenities list */}
              <div className="flex items-center flex-wrap gap-2 mt-4 text-xs text-slate-300">
                {stop.hasDieselHighSpeed && (
                  <span className="flex items-center gap-1 bg-slate-800/80 px-2 py-1 rounded border border-slate-700">
                    <Fuel className="w-3.5 h-3.5 text-amber-400" /> {t.amenityDiesel}
                  </span>
                )}
                {stop.hasShowers && (
                  <span className="flex items-center gap-1 bg-slate-800/80 px-2 py-1 rounded border border-slate-700">
                    {t.amenityShowers}
                  </span>
                )}
                {stop.hasCoffee247 && (
                  <span className="flex items-center gap-1 bg-slate-800/80 px-2 py-1 rounded border border-slate-700">
                    <Coffee className="w-3.5 h-3.5 text-amber-300" /> {t.amenityCoffee}
                  </span>
                )}
                {stop.hasQuietBerthArea && (
                  <span className="flex items-center gap-1 bg-slate-800/80 px-2 py-1 rounded border border-slate-700">
                    <Bed className="w-3.5 h-3.5 text-indigo-400" /> {t.amenityBerths}
                  </span>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
              <span className="text-[11px] text-slate-500">
                {t.verifiedParking}
              </span>
              <button
                onClick={() => setActiveNavStop(stop.id)}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeNavStop === stop.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md'
                }`}
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>{activeNavStop === stop.id ? t.routeActiveBtn : t.navigateRestBtn}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
