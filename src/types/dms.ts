export type AlertSeverity = 'nominal' | 'advisory' | 'warning' | 'critical';

export interface DetectionMetrics {
  timestamp: number;
  isFaceDetected: boolean;
  leftEyeOpen: number;     // 0.0 (closed) to 1.0 (fully open)
  rightEyeOpen: number;    // 0.0 (closed) to 1.0 (fully open)
  avgEyeOpen: number;      // 0.0 to 1.0
  isEyesClosed: boolean;
  eyesClosedDuration: number; // in seconds
  mouthOpen: number;       // 0.0 (closed) to 1.0 (wide open yawn)
  isYawning: boolean;
  yawnDuration: number;    // in seconds
  headPitch: number;       // degrees: negative = nodding down, positive = looking up
  headRoll: number;        // degrees tilt left/right
  headYaw: number;         // degrees turned left/right
  isHeadNodding: boolean;  // nodding down (classic micro-sleep sign)
  isDistracted: boolean;   // looking away from road
  perclos: number;         // Percentage of Eye Closure (0-100%) in rolling window
  blinksPerMinute: number;
  fatigueScore: number;    // 0 (fully alert) to 100 (critical fatigue)
  alertSeverity: AlertSeverity;
  alertMessage: string;
}

export interface IncidentRecord {
  id: string;
  timestamp: number;
  type: 'micro_sleep' | 'eyes_closed' | 'yawn_excess' | 'head_drop' | 'distraction';
  title: string;
  severity: AlertSeverity;
  duration: number; // seconds
  peakPerclos: number;
  driverResponseTimeSec?: number; // how quickly driver opened eyes / tapped acknowledge
  snapshotDataUrl?: string;
  speedMph: number;
}

export type AlarmToneType = 'piercing_siren' | 'pulsed_buzzer' | 'euro_two_tone' | 'truck_airhorn' | 'radar_ping';

export interface DMSSettings {
  eyeClosureThreshold: number; // 0.0 - 1.0, below this is closed (default 0.28)
  eyesClosedWarningSec: number; // default 1.2s
  eyesClosedCriticalSec: number; // default 2.0s
  yawnThreshold: number; // default 0.50
  yawnDurationSec: number; // default 2.2s
  headNodThresholdDeg: number; // default -14 degrees down
  alarmTone: AlarmToneType;
  alarmVolume: number; // 0.0 - 1.0
  voiceAlertsEnabled: boolean;
  voiceVolume: number; // 0.0 - 1.0
  voiceRate: number; // 0.8 - 1.4
  voicePitch: number; // 0.8 - 1.3
  preferredVoiceURI: string;
  nightVisionMode: 'off' | 'amber' | 'crimson';
  vibrationAlerts: boolean;
  language: 'en' | 'ar';
  truckId: string;
  driverName: string;
  emergencyContact: string;
}

export type DutyStatus = 'driving' | 'on_duty_not_driving' | 'sleeper_berth' | 'off_duty';

export interface TripState {
  tripStartTime: number;
  dutyStatus: DutyStatus;
  drivingSecondsToday: number;
  continuousDrivingSeconds: number;
  maxContinuousDrivingLimitSec: number; // 4 hours = 14400s or 8 hours before 30min rest
  simulatedSpeedMph: number;
  isSimulatedTrip: boolean;
}

export interface RestStop {
  id: string;
  name: string;
  brand: 'Loves' | 'Pilot Flying J' | 'TA Petro' | 'State Rest Area' | 'Travel Plaza';
  distanceMiles: number;
  exitNumber: string;
  highway: string;
  truckParkingSpotsTotal: number;
  truckParkingSpotsAvailable: number;
  hasShowers: boolean;
  hasDieselHighSpeed: boolean;
  hasHotFood: boolean;
  hasCoffee247: boolean;
  hasQuietBerthArea: boolean;
}
