export type Language = 'en' | 'ar';

export interface Translations {
  appName: string;
  appSubtitle: string;
  // Nav
  navHud: string;
  navHos: string;
  navIncidents: string;
  navRestStops: string;
  navSettings: string;
  startMonitoring: string;
  monitoringActive: string;
  silenceAlarm: string;
  fullscreen: string;
  languageToggle: string;

  // Status Banner
  statusAttentive: string;
  statusAdvisory: string;
  statusWarning: string;
  statusCritical: string;
  cabinMonitor: string;
  truckNum: string;
  operator: string;
  spacebarToSilence: string;
  calibrateDriver: string;
  iAmAwake: string;
  quickCall: string;
  emergencyCallTitle: string;
  emergencyCallDesc: string;
  emergencyContactLabel: string;
  callNow: string;
  cancel: string;
  callFleetDispatch: string;
  noEmergencyNumber: string;

  // Camera & Reticle
  trackingAcquired: string;
  searchingFace: string;
  cameraOff: string;
  hudGrid: string;
  enableCamera: string;
  disableCamera: string;
  cameraInactiveTitle: string;
  cameraInactiveDesc: string;
  enableWebcamBtn: string;
  runSimulationBtn: string;
  startVirtualCamBtn: string;
  physicalCamBtn: string;
  camPermissionHelp: string;
  camInUseOrDenied: string;
  cameraSourceLabel: string;
  realWebcam: string;
  simulatedWebcam: string;
  switchDevice: string;
  selectCamera: string;
  retryCamera: string;
  cameraTroubleshoot: string;
  step1Permission: string;
  step2Permission: string;
  step3Permission: string;
  virtualCamActiveNotice: string;
  switchToPhysicalCam: string;
  eyeZoneLocked: string;
  eyeZoneAlign: string;
  chinPose: string;
  eyesClosed: string;
  eyesOpen: string;
  yawning: string;
  normal: string;
  headNodding: string;
  headLevel: string;

  // Telemetry
  fatigueRiskTitle: string;
  riskLabel: string;
  eyeApertureTitle: string;
  closedThreshold: string;
  normalOpen: string;
  perclosTitle: string;
  safeLevel: string;
  drowsyLevel: string;
  yawnOpennessTitle: string;
  headPitchTitle: string;
  noddingDown: string;
  blinkRateTitle: string;
  blinksPerMin: string;
  slowFatigued: string;
  normalCadence: string;

  // Continuous Drive & Night HUD
  continuousDriveTitle: string;
  fmcsaLimit: string;
  remainingUntilRest: string;
  highwayTransit: string;
  nightVisionTitle: string;
  themeDark: string;
  themeAmber: string;
  themeCrimson: string;

  // Simulator
  simulatorTitle: string;
  simulatorSubtitle: string;
  simMicroSleep: string;
  simYawn: string;
  simHeadNod: string;
  testVoiceBtn: string;
  testSirenBtn: string;

  // Vocal Alert Sentences
  vocalCritical: string;
  vocalWarning: string;
  vocalYawn: string;
  vocalHeadNod: string;
  vocalDistracted: string;
  vocalTest: string;

  // HOS Tracker
  hosTitle: string;
  hosSubtitle: string;
  dutyDriving: string;
  dutyInspection: string;
  dutySleeper: string;
  dutyOffDuty: string;
  clock11Hr: string;
  availableLabel: string;
  drivenToday: string;
  continuousLimit: string;
  recommendedStop: string;
  currentLeg: string;
  shift14Hr: string;
  dailyMax: string;
  shiftStartedAt: string;
  circadianTitle: string;
  circadianHighRisk: string;
  circadianModerate: string;
  log30MinBreakBtn: string;
  breakInitiatedMsg: string;
  microSleepSignsTitle: string;
  sign1Title: string;
  sign1Desc: string;
  sign2Title: string;
  sign2Desc: string;
  sign3Title: string;
  sign3Desc: string;

  // Incidents
  incidentsTitle: string;
  incidentsSubtitle: string;
  exportCsvBtn: string;
  clearLogBtn: string;
  totalEvents: string;
  criticalEvents: string;
  avgReactionTime: string;
  protectionActive: string;
  noIncidentsTitle: string;
  noIncidentsDesc: string;
  colTime: string;
  colType: string;
  colSeverity: string;
  colDuration: string;
  colPerclos: string;
  colSpeed: string;
  colReaction: string;
  sevCritical: string;
  sevWarning: string;
  sevAdvisory: string;
  typeMicroSleep: string;
  typeEyeClosure: string;
  typeYawn: string;
  typeHeadDrop: string;
  typeDistraction: string;

  // Rest Stops & SOS
  restStopsTitle: string;
  restStopsSubtitle: string;
  sosBtn: string;
  sosDispatchedBtn: string;
  activeNav: string;
  routingTo: string;
  cancelRoute: string;
  filterAll: string;
  filterParking: string;
  filterShowers: string;
  safeLocationsAhead: string;
  miAway: string;
  minsAway: string;
  parkingCapacity: string;
  spotsOpen: string;
  amenityDiesel: string;
  amenityShowers: string;
  amenityCoffee: string;
  amenityBerths: string;
  verifiedParking: string;
  navigateRestBtn: string;
  routeActiveBtn: string;

  // Settings Modal
  settingsTitle: string;
  settingsSubtitle: string;
  section1Title: string;
  eyeClosureThresholdLabel: string;
  eyeClosureThresholdHint: string;
  alarmDelayLabel: string;
  alarmDelayHint: string;
  headNodThresholdLabel: string;
  headNodThresholdHint: string;
  section2Title: string;
  sirenProfileLabel: string;
  sirenProfileHint: string;
  masterVolumeLabel: string;
  stopSirenBtn: string;
  testSiren3sBtn: string;
  section3Title: string;
  enableVoiceAlerts: string;
  synthVoiceLabel: string;
  defaultHighClarityVoice: string;
  speechCadenceLabel: string;
  voiceLoudnessLabel: string;
  section4Title: string;
  truckUnitIdLabel: string;
  driverNameLabel: string;
  settingsSavedNotice: string;
  settingsRealtimeNotice: string;
  doneApplyBtn: string;

  // Calibration Modal
  calibTitle: string;
  calibReadyTitle: string;
  calibReadyDesc: string;
  calibFaceStatus: string;
  calibFaceAligned: string;
  calibAlignFace: string;
  calibBeginBtn: string;
  calibSamplingDesc: string;
  calibSamplesCount: string;
  calibCompleteTitle: string;
  calibCompleteDesc: string;
  calibTriggerLabel: string;
  calibNodTriggerLabel: string;
  calibSaveBtn: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    appName: 'TrailerGuard DMS',
    appSubtitle: 'Commercial Driver Drowsiness Defense',
    navHud: 'Cabin HUD',
    navHos: 'HOS Driving Log',
    navIncidents: 'Fatigue Incidents',
    navRestStops: 'Rest Stops & SOS',
    navSettings: 'System Audio',
    startMonitoring: 'Start DMS Monitor',
    monitoringActive: 'Monitoring Active',
    silenceAlarm: 'Silence Emergency Alarm',
    fullscreen: 'Cab Fullscreen Mode',
    languageToggle: 'العربية',

    statusAttentive: 'DRIVER ATTENTIVE · ALL SYSTEMS NOMINAL',
    statusAdvisory: 'ADVISORY: SIGNS OF FATIGUE DETECTED',
    statusWarning: 'WARNING: DROWSINESS DETECTED! FOCUS ON ROAD',
    statusCritical: 'CRITICAL: MICRO-SLEEP DETECTED! WAKE UP!',
    cabinMonitor: 'Cabin Driver Monitor',
    truckNum: 'Truck #',
    operator: 'Operator',
    spacebarToSilence: 'Spacebar to Silence',
    calibrateDriver: 'Calibrate Driver',
    iAmAwake: 'I AM AWAKE · SILENCE ALARM',
    quickCall: 'Quick Call',
    emergencyCallTitle: 'Emergency Quick Call',
    emergencyCallDesc: 'Instant phone connection to fleet safety dispatch or your designated emergency contact.',
    emergencyContactLabel: 'Emergency Contact',
    callNow: 'Call Now',
    cancel: 'Cancel',
    callFleetDispatch: 'Call Fleet Safety Dispatch',
    noEmergencyNumber: 'No emergency contact set in settings.',

    trackingAcquired: 'TRACKING ACQUIRED',
    searchingFace: 'SEARCHING FACE',
    cameraOff: 'CAMERA OFF',
    hudGrid: 'HUD Grid',
    enableCamera: 'Turn Camera On',
    disableCamera: 'Turn Camera Off',
    cameraInactiveTitle: 'Camera Inactive',
    cameraInactiveDesc:
      'Enable the cabin camera to activate real-time eye tracking, yawning analysis, and head pose detection. Or test anytime with the simulator below!',
    enableWebcamBtn: 'Enable Physical Webcam',
    runSimulationBtn: 'Run Test Simulation',
    startVirtualCamBtn: 'Start Simulated Driver Camera',
    physicalCamBtn: 'Switch to Physical Camera',
    camPermissionHelp: 'Camera blocked? Click the lock or camera icon in your browser address bar to allow camera access.',
    camInUseOrDenied: 'Physical camera access not available or blocked by browser.',
    cameraSourceLabel: 'Camera Feed',
    realWebcam: 'Physical Webcam',
    simulatedWebcam: 'Driver Simulator Feed',
    switchDevice: 'Camera Device',
    selectCamera: 'Select Camera...',
    retryCamera: 'Retry Connecting Camera',
    cameraTroubleshoot: 'How to allow camera access:',
    step1Permission: 'Click the lock or camera icon in the browser address bar',
    step2Permission: 'Change Camera permission to "Allow"',
    step3Permission: 'Click "Retry Connecting Camera" or refresh',
    virtualCamActiveNotice: 'Currently running on Simulated Driver Stream (active testing mode).',
    switchToPhysicalCam: 'Switch to Physical Camera',
    eyeZoneLocked: 'LOCKED',
    eyeZoneAlign: 'ALIGN FACE',
    chinPose: 'CHIN / POSE',
    eyesClosed: 'CLOSED',
    eyesOpen: 'OPEN',
    yawning: 'YAWNING',
    normal: 'NORMAL',
    headNodding: 'NODDING FORWARD',
    headLevel: 'LEVEL',

    fatigueRiskTitle: 'Driver Fatigue Index',
    riskLabel: 'RISK',
    eyeApertureTitle: 'Eye Aperture (Openness)',
    closedThreshold: 'Closed',
    normalOpen: 'Normal Open',
    perclosTitle: 'PERCLOS (Eye Closure Ratio, 60s)',
    safeLevel: 'Safe (<15%)',
    drowsyLevel: 'Drowsy (>25%)',
    yawnOpennessTitle: 'Yawn / Mouth Openness',
    headPitchTitle: 'Head Pitch (Nod)',
    noddingDown: 'Nodding Down',
    blinkRateTitle: 'Blink Frequency',
    blinksPerMin: '/min',
    slowFatigued: 'Slow (Fatigued)',
    normalCadence: 'Normal Cadence',

    continuousDriveTitle: 'Continuous Drive Timer',
    fmcsaLimit: 'FMCSA Safety Limit',
    remainingUntilRest: 'Remaining until recommended rest:',
    highwayTransit: 'Highway Transit',
    nightVisionTitle: 'Night Vision HUD Theme',
    themeDark: 'Dark',
    themeAmber: 'Amber',
    themeCrimson: 'Crimson',

    simulatorTitle: 'Safety Drill Simulator & Verification:',
    simulatorSubtitle: 'Test alarms and vocal alerts instantly',
    simMicroSleep: 'Simulate Micro-Sleep',
    simYawn: 'Simulate Yawning',
    simHeadNod: 'Simulate Head Nod',
    testVoiceBtn: 'Test Voice Alert',
    testSirenBtn: 'Test Siren Blast',

    vocalCritical: 'EMERGENCY! WAKE UP IMMEDIATELY! PULL OVER SAFELY!',
    vocalWarning: 'Warning! Driver drowsiness detected. Focus on the road!',
    vocalYawn: 'Advisory: Yawning fatigue detected. Plan upcoming rest break.',
    vocalHeadNod: 'Warning: Head drooping forward! Wake up driver!',
    vocalDistracted: 'Caution: Attention diverted from the road forward.',
    vocalTest: 'Alert: Driver drowsiness detected! Eyes closed for two seconds. Wake up and pull over safely!',

    hosTitle: 'Commercial Trailer Hours of Service (HOS) & Fatigue Defense',
    hosSubtitle: 'DOT / FMCSA 49 CFR Part 395 Compliance & Rest Break Scheduling',
    dutyDriving: 'Driving',
    dutyInspection: 'On Duty (Inspection)',
    dutySleeper: 'Sleeper Berth',
    dutyOffDuty: 'Off Duty',
    clock11Hr: '11-Hr Drive Window',
    availableLabel: 'Available',
    drivenToday: 'Driven today:',
    continuousLimit: 'Continuous Drive Limit',
    recommendedStop: 'Recommended Stop',
    currentLeg: 'Current leg:',
    shift14Hr: '14-Hr Shift Window',
    dailyMax: 'Daily Max',
    shiftStartedAt: 'Shift started: 06:00 AM CST',
    circadianTitle: 'Biological Circadian Hazard Index',
    circadianHighRisk:
      'HIGH DROWSINESS RISK WINDOW: Natural circadian dip. Heavy trailer drivers have 3x higher incidence of micro-sleeps during this interval.',
    circadianModerate:
      'MODERATE FATIGUE ZONE: Maintain steady cabin temperature (68°F / 20°C) and keep eye contact with rearview mirrors every 8 seconds.',
    log30MinBreakBtn: 'Log 30-Min Rest Break',
    breakInitiatedMsg: '30-Minute Rest Break initiated. Continuous driving clock reset.',
    microSleepSignsTitle: 'Highway Micro-Sleep Warning Signs for Commercial Drivers',
    sign1Title: '1. Prolonged Blinking > 1.2s',
    sign1Desc: 'When eyes remain shut for over 1.2 seconds at 65 MPH, an 80,000-lb tractor-trailer travels 114 feet completely blind and unguided.',
    sign2Title: '2. Head Bobbing / Cervical Drop',
    sign2Desc: 'The cervical neck muscles relax involuntarily during stage-1 micro-sleeps. TrailerGuard detects negative pitch angle drops >14°.',
    sign3Title: '3. Monotonous Interstate Hypnosis',
    sign3Desc: 'Rumble strips are the last line of defense. The vocal warning prompts you before highway lane departure occurs.',

    incidentsTitle: 'Driver Fatigue Incidents & Micro-Sleep Telemetry Log',
    incidentsSubtitle: 'Real-time audit record of eye closures, voice warnings, and driver reaction latency',
    exportCsvBtn: 'Export CSV Audit',
    clearLogBtn: 'Clear Log',
    totalEvents: 'Total Recorded Events',
    criticalEvents: 'Critical Micro-Sleeps',
    avgReactionTime: 'Avg. Driver Reaction Time',
    protectionActive: '100% Active',
    noIncidentsTitle: 'No Fatigue Incidents Logged',
    noIncidentsDesc: 'Your eyes and head pose have stayed attentive. When drowsiness, prolonged eye closures, or heavy yawning are detected, they will be logged here with precision reaction metrics.',
    colTime: 'Time',
    colType: 'Incident Type',
    colSeverity: 'Severity',
    colDuration: 'Closure Duration',
    colPerclos: 'Peak PERCLOS',
    colSpeed: 'Trailer Speed',
    colReaction: 'Driver Recovery Latency',
    sevCritical: 'Critical Alarm',
    sevWarning: 'Warning Alert',
    sevAdvisory: 'Advisory',
    typeMicroSleep: 'Micro-Sleep Episode',
    typeEyeClosure: 'Prolonged Eye Closure',
    typeYawn: 'Excessive Yawning',
    typeHeadDrop: 'Head Droop / Cervical Nod',
    typeDistraction: 'Distracted Glance Away',

    restStopsTitle: 'Commercial Trailer Rest Stops & Safe Pull-Over Finder',
    restStopsSubtitle: 'Dedicated parking spots, showers, and safe haven berths for 70ft tractor-trailers',
    sosBtn: 'Emergency Pull-Over SOS',
    sosDispatchedBtn: 'SOS Beacon Dispatched to Fleet',
    activeNav: 'Active Rest Navigation',
    routingTo: 'Routing to:',
    cancelRoute: 'Cancel Route',
    filterAll: 'All Rest Stops',
    filterParking: 'Ample Trailer Parking (>25)',
    filterShowers: 'Showers & Sleeper Amenities',
    safeLocationsAhead: 'safe locations ahead',
    miAway: 'mi',
    minsAway: 'mins away',
    parkingCapacity: 'Semi-Truck Parking Capacity',
    spotsOpen: 'spots open',
    amenityDiesel: 'High-Flow Diesel',
    amenityShowers: 'Showers',
    amenityCoffee: '24/7 Hot Coffee',
    amenityBerths: 'Quiet Sleeper Bays',
    verifiedParking: 'Verified commercial parking',
    navigateRestBtn: 'Navigate & Rest',
    routeActiveBtn: 'Route Active',

    settingsTitle: 'TrailerGuard DMS Safety & Voice Engine',
    settingsSubtitle: 'Calibrate sensitivity thresholds, sirens, and synthesized vocal warnings',
    section1Title: '1. Eye Closure & Micro-Sleep Timing',
    eyeClosureThresholdLabel: 'Eye Closure Threshold',
    eyeClosureThresholdHint: 'Higher = Triggers more easily (recommended for drivers wearing glasses)',
    alarmDelayLabel: 'Emergency Alarm Delay',
    alarmDelayHint: 'Siren sounds if eyes continuously closed beyond this limit (FMCSA rec: 2.0s)',
    headNodThresholdLabel: 'Head Nod Angle Sensitivity',
    headNodThresholdHint: 'Negative pitch angle (-6° to -16°) that triggers forward head droop warning',
    section2Title: '2. Emergency Cabin Siren Tone',
    sirenProfileLabel: 'Siren Sound Profile',
    sirenProfileHint: 'Synthesized via Web Audio API to bypass highway truck cabin acoustics',
    masterVolumeLabel: 'Master Alarm Volume',
    stopSirenBtn: 'Stop Siren',
    testSiren3sBtn: 'Test Siren Blast (3s)',
    section3Title: '3. Text-to-Speech Vocal Warning Engine',
    enableVoiceAlerts: 'Enable Real-Time Voice Warnings',
    synthVoiceLabel: 'Synthesizer Voice',
    defaultHighClarityVoice: 'Default High-Clarity Voice',
    speechCadenceLabel: 'Speech Cadence',
    voiceLoudnessLabel: 'Voice Loudness',
    section4Title: '4. Tractor-Trailer Fleet Tagging',
    truckUnitIdLabel: 'Truck Unit ID',
    driverNameLabel: 'Commercial Driver Name',
    settingsSavedNotice: 'Settings saved successfully',
    settingsRealtimeNotice: 'Settings apply in real time',
    doneApplyBtn: 'Done & Apply',

    calibTitle: 'Driver Ergonomic Calibration',
    calibReadyTitle: 'Baseline Alignment',
    calibReadyDesc: 'Sit in your standard commercial driving position. Look forward at the windshield with eyes open and head upright.',
    calibFaceStatus: 'Face Status:',
    calibFaceAligned: 'Face Positioned in Reticle',
    calibAlignFace: 'Align Face in Camera',
    calibBeginBtn: 'Begin 3-Second Baseline Capture',
    calibSamplingDesc: 'Hold normal gaze at the road... sampling eye openness & head angle',
    calibSamplesCount: 'Samples recorded:',
    calibCompleteTitle: 'Calibration Complete',
    calibCompleteDesc: 'Your personalized baseline has been calculated. Drowsiness alerts are tuned to your eye aperture and cabin seat geometry.',
    calibTriggerLabel: 'Eye Closure Trigger:',
    calibNodTriggerLabel: 'Head Nod Trigger:',
    calibSaveBtn: 'Save & Return to Cabin HUD',
  },

  ar: {
    appName: 'حارس المقطورة (TrailerGuard)',
    appSubtitle: 'نظام حماية سائقي الشاحنات والمقطورات من النعاس والنوم اللحظي',
    navHud: 'شاشة الكابينة المباشرة',
    navHos: 'ساعات القيادة (HOS)',
    navIncidents: 'سجل حوادث الإرهاق',
    navRestStops: 'الاستراحات والطوارئ',
    navSettings: 'إعدادات الصوت',
    startMonitoring: 'بدء مراقبة السائق',
    monitoringActive: 'المراقبة نشطة',
    silenceAlarm: 'إيقاف إنذار الطوارئ',
    fullscreen: 'وضع الكابينة ملء الشاشة',
    languageToggle: 'English',

    statusAttentive: 'السائق منتبه ومستيقظ · جميع الأنظمة تعمل بكفاءة',
    statusAdvisory: 'تنبيه: تم رصد علامات إرهاق وتعب أولي',
    statusWarning: 'تحذير: تم رصد نعاس وإغلاق للعينين! ركز في الطريق!',
    statusCritical: 'طوارئ: تم رصد نوم لحظي! استيقظ فوراً!',
    cabinMonitor: 'نظام مراقبة مقصورة الشاحنة',
    truckNum: 'شاحنة رقم',
    operator: 'السائق',
    spacebarToSilence: 'مسافة (Space) لإيقاف الإنذار',
    calibrateDriver: 'معايرة وضعية السائق',
    iAmAwake: 'أنا مستيقظ · إيقاف الإنذار',
    quickCall: 'اتصال طوارئ سريع',
    emergencyCallTitle: 'اتصال الطوارئ السريع',
    emergencyCallDesc: 'اتصال هاتفي فوري ومباشر مع مركز سلامة الأسطول أو جهة الطوارئ المعتمدة.',
    emergencyContactLabel: 'رقم هاتف الطوارئ',
    callNow: 'اتصال الآن',
    cancel: 'إلغاء',
    callFleetDispatch: 'الاتصال بمركز سلامة الأسطول',
    noEmergencyNumber: 'لم يتم حفظ رقم طوارئ في الإعدادات.',

    trackingAcquired: 'تم التعرف على الوجه وتتبعه',
    searchingFace: 'جاري البحث عن وجه السائق...',
    cameraOff: 'الكاميرا متوقفة',
    hudGrid: 'شبكة التتبع',
    enableCamera: 'تشغيل الكاميرا',
    disableCamera: 'إيقاف الكاميرا',
    cameraInactiveTitle: 'الكاميرا غير مفعلة',
    cameraInactiveDesc:
      'قم بتفعيل كاميرا الكابينة لتشغيل التتبع اللحظي لحركة العينين، التثاؤب، وميلان الرأس. أو جرب النظام في أي وقت عبر وضع المحاكاة أدناه!',
    enableWebcamBtn: 'تفعيل كاميرا الويب الحقيقية',
    runSimulationBtn: 'تشغيل محاكاة تجريبية',
    startVirtualCamBtn: 'تشغيل كاميرا المحاكاة الحية (Virtual Camera)',
    physicalCamBtn: 'التحويل للكاميرا الفعلية',
    camPermissionHelp: 'الكاميرا محظورة؟ انقر على أيقونة القفل أو الكاميرا في شريط عنوان المتصفح للسماح بالوصول.',
    camInUseOrDenied: 'تعذر الوصول للكاميرا الفعلية (محظورة في المتصفح أو مستخدمة في تطبيق آخر). يمكنك تفعيل كاميرا المحاكاة الحية فوراً!',
    cameraSourceLabel: 'مصدر الكاميرا',
    realWebcam: 'الكاميرا الحقيقية للجهاز',
    simulatedWebcam: 'كاميرا المحاكاة التفاعلية',
    switchDevice: 'اختيار الكاميرا',
    selectCamera: 'اختر الكاميرا الموصلة...',
    retryCamera: 'إعادة محاولة الاتصال بالكاميرا',
    cameraTroubleshoot: 'خطوات حل مشكلة إذن الكاميرا في المتصفح:',
    step1Permission: 'انقر على أيقونة القفل 🔒 أو الكاميرا بجانب رابط الموقع في شريط العنوان',
    step2Permission: 'اضبط إذن الكاميرا على "سماح" (Allow)',
    step3Permission: 'اضغط على زر "إعادة محاولة الاتصال بالكاميرا" أو أعد تحميل الصفحة',
    virtualCamActiveNotice: 'تعمل حالياً بكاميرا المحاكاة التفاعلية (للاختبار الفوري دون الحاجة لكاميرا حقيقية).',
    switchToPhysicalCam: 'تشغيل الكاميرا الحقيقية',
    eyeZoneLocked: 'محدد بنجاح',
    eyeZoneAlign: 'وجه نظرك نحو الكاميرا',
    chinPose: 'وضعية الذقن / الرأس',
    eyesClosed: 'مغلقة',
    eyesOpen: 'مفتوحة',
    yawning: 'تثاؤب',
    normal: 'طبيعي',
    headNodding: 'سقوط الرأس للأمام (نعاس)',
    headLevel: 'مستقيم',

    fatigueRiskTitle: 'مؤشر إرهاق السائق',
    riskLabel: 'نسبة الخطر',
    eyeApertureTitle: 'اتساع وانفتاح العينين',
    closedThreshold: 'مغلقة تماماً',
    normalOpen: 'مفتوحة طبيعياً',
    perclosTitle: 'مؤشر بيركلوس (نسبة إغلاق الجفون خلال 60 ثانية)',
    safeLevel: 'آمن (<15%)',
    drowsyLevel: 'مرحلة نعاس (>25%)',
    yawnOpennessTitle: 'اتساع الفم / التثاؤب',
    headPitchTitle: 'ميلان الرأس وزاوية الرقبة',
    noddingDown: 'سقوط الرأس للأسفل',
    blinkRateTitle: 'معدل الرمش في الدقيقة',
    blinksPerMin: 'رمشة/دقيقة',
    slowFatigued: 'بطيء (مؤشر نعاس)',
    normalCadence: 'معدل يقظة طبيعي',

    continuousDriveTitle: 'عداد القيادة المتواصلة',
    fmcsaLimit: 'حد السلامة لنقل البضائع',
    remainingUntilRest: 'الوقت المتبقي حتى الاستراحة الإلزامية:',
    highwayTransit: 'مسار سريع بين المدن',
    nightVisionTitle: 'سمة الرؤية الليلية في الكابينة',
    themeDark: 'داكن كلاسيكي',
    themeAmber: 'كهرماني ليلي',
    themeCrimson: 'أحمر عالي التباين (OLED)',

    simulatorTitle: 'محاكي تدريب السائق واختبار الإنذارات:',
    simulatorSubtitle: 'اختبر استجابة الإنذارات الصوتية والصفارات فوراً',
    simMicroSleep: 'محاكاة النوم اللحظي (2.5ث)',
    simYawn: 'محاكاة التثاؤب والإرهاق',
    simHeadNod: 'محاكاة سقوط الرأس',
    testVoiceBtn: 'اختبار التنبيه الصوتي',
    testSirenBtn: 'اختبار صفارة الإنذار',

    vocalCritical: 'طوارئ! استيقظ فوراً! انتبه للطريق وتوقف بأمان!',
    vocalWarning: 'تحذير! تم رصد نعاس وإغلاق للعينين! ركز في الطريق!',
    vocalYawn: 'تنبيه: تم رصد إرهاق وتثاؤب متكرر. يرجى التخطيط لاستراحة قادمة.',
    vocalHeadNod: 'تحذير: سقوط الرأس للأمام! استيقظ وحافظ على وضعية القيادة!',
    vocalDistracted: 'انتباه: تشتت نظرك عن مسار الطريق للأمام.',
    vocalTest: 'تنبيه تجريبي: تم رصد إغلاق العينين. نظام حماية سائقي الشاحنات يعمل بكفاءة!',

    hosTitle: 'ساعات القيادة القانونية للشاحنات (HOS) ومكافحة الإرهاق',
    hosSubtitle: 'الامتثال للوائح النقل البري الفيدرالية ومواعيد الراحة الإلزامية',
    dutyDriving: 'قيادة نشطة',
    dutyInspection: 'في الخدمة (فحص الشاحنة)',
    dutySleeper: 'مقصورة النوم (السرير)',
    dutyOffDuty: 'خارج الخدمة',
    clock11Hr: 'نافذة القيادة المتاحة (11 ساعة)',
    availableLabel: 'متاح للقيادة',
    drivenToday: 'المقطوع اليوم:',
    continuousLimit: 'حد القيادة المتواصلة دون توقف',
    recommendedStop: 'موعد الراحة الموصى به',
    currentLeg: 'المرحلة الحالية:',
    shift14Hr: 'نافذة الوردية اليومية (14 ساعة)',
    dailyMax: 'الحد الأقصى اليومي',
    shiftStartedAt: 'بدء الوردية: 06:00 صباحاً',
    circadianTitle: 'مؤشر الخطر البيولوجي للساعة البيولوجية',
    circadianHighRisk:
      'نافذة خطر نعاس مرتفعة جداً: هبوط طبيعي في نشاط الجسم الحيوي (1-5 فجراً و 1-4 ظهراً). يتضاعف خطر النوم اللحظي لسائقي الشاحنات الثقيلة بثلاثة أضعاف.',
    circadianModerate:
      'منطقة إرهاق متوسطة: حافظ على درجة برودة معتدلة في الكابينة وتأكد من النظر في المرايا الجانبية كل 8 ثوانٍ.',
    log30MinBreakBtn: 'تسجيل استراحة 30 دقيقة',
    breakInitiatedMsg: 'تم تسجيل استراحة 30 دقيقة وإعادة ضبط عداد القيادة المتواصلة بنجاح.',
    microSleepSignsTitle: 'أهم مؤشرات النوم اللحظي على الطرق السريعة لسائقي المقطورات',
    sign1Title: '1. إغلاق العينين لأكثر من 1.2 ثانية',
    sign1Desc: 'عند إغلاق العينين لمدة 1.2 ثانية على سرعة 100 كم/ساعة، تقطع الشاحنة المحملة بـ 40 طناً مسافة 35 متراً دون أي توجيه أو رؤية.',
    sign2Title: '2. ارتخاء عضلات الرقبة وسقوط الرأس',
    sign2Desc: 'ترتخي عضلات الرقبة لا إرادياً في بداية مرحلة النوم الخاطف. يقوم النظام برصد زاوية الانحدار إذا تجاوزت 14 درجة سالبة.',
    sign3Title: '3. التنويم المغناطيسي للطرق السريعة الرتيبة',
    sign3Desc: 'الأشرطة الاهتزازية على حافة الطريق هي خط الدفاع الأخير. نظامنا يطلق التنبيه الصوتي قبل انحراف الشاحنة عن المسار.',

    incidentsTitle: 'سجل حوادث الإرهاق والنوم اللحظي وبيانات الاستجابة',
    incidentsSubtitle: 'سجل تدقيق فوري لمرات إغلاق العينين، التنبيهات الصوتية، وسرعة رد فعل السائق',
    exportCsvBtn: 'تصدير تقرير CSV للسلامة',
    clearLogBtn: 'مسح السجل',
    totalEvents: 'إجمالي الحالات المرصودة',
    criticalEvents: 'حالات النوم اللحظي الحرجة',
    avgReactionTime: 'متوسط سرعة استجابة السائق',
    protectionActive: 'نظام الحماية نشط 100%',
    noIncidentsTitle: 'لا توجد حوادث إرهاق مسجلة',
    noIncidentsDesc: 'عينيك ووضعية رأسك في حالة يقظة ممتازة. عند رصد أي نعاس أو إغلاق مطول أو تثاؤب، سيتم تسجيلها هنا فوراً مع قياس سرعة ردة الفعل بدقة.',
    colTime: 'الوقت',
    colType: 'نوع الحادثة',
    colSeverity: 'الخطورة',
    colDuration: 'مدة الإغلاق',
    colPerclos: 'ذروة بيركلوس',
    colSpeed: 'سرعة الشاحنة',
    colReaction: 'زمن استجابة السائق',
    sevCritical: 'إنذار طوارئ حرج',
    sevWarning: 'تحذير نعاس',
    sevAdvisory: 'تنبيه إرشادي',
    typeMicroSleep: 'حالة نوم لحظي خطيرة',
    typeEyeClosure: 'إغلاق مطول للعينين',
    typeYawn: 'تثاؤب مفرط وإرهاق',
    typeHeadDrop: 'سقوط الرأس للأمام',
    typeDistraction: 'تشتت النظر عن الطريق',

    restStopsTitle: 'استراحات الشاحنات الكبيرة ومواقف الطوارئ الآمنة',
    restStopsSubtitle: 'مواقف مخصصة للمقطورات الطويلة، خدمات ديزل سريعة، وأماكن نوم واستحمام',
    sosBtn: 'نداء استغاثة طارئ لغرفة العمليات (SOS)',
    sosDispatchedBtn: 'تم إرسال إشارة الاستغاثة لأسطول الشركة',
    activeNav: 'الملاحة النشطة نحو الاستراحة',
    routingTo: 'جاري التوجيه نحو:',
    cancelRoute: 'إلغاء المسار',
    filterAll: 'جميع الاستراحات',
    filterParking: 'مواقف شاحنات وافرة (>25)',
    filterShowers: 'خدمات الاستحمام والنوم',
    safeLocationsAhead: 'مواقع آمنة قادمة على الطريق',
    miAway: 'ميل',
    minsAway: 'دقيقة تقريباً',
    parkingCapacity: 'سعة مواقف الشاحنات الثقيلة',
    spotsOpen: 'موقف متوفر الآن',
    amenityDiesel: 'ديزل تدفق عالي للشاحنات',
    amenityShowers: 'دورات مياه واستحمام',
    amenityCoffee: 'قهوة ساخنة 24/7',
    amenityBerths: 'مواقف نوم هادئة وآمنة',
    verifiedParking: 'مواقف معتمدة للمقطورات الكبيرة',
    navigateRestBtn: 'التوجه للاستراحة',
    routeActiveBtn: 'المسار نشط',

    settingsTitle: 'إعدادات السلامة والمحرك الصوتي لنظام TrailerGuard',
    settingsSubtitle: 'ضبط حساسية استشعار العينين، صفارات الطوارئ، والتنبيهات الصوتية الناطقة',
    section1Title: '1. توقيت وحساسية إغلاق العينين والنوم اللحظي',
    eyeClosureThresholdLabel: 'عتبة حساسية إغلاق العينين',
    eyeClosureThresholdHint: 'قيمة أعلى = استجابة أسرع (يوصى بها للسائقين الذين يرتدون نظارات)',
    alarmDelayLabel: 'مهلة إطلاق صفارة الطوارئ',
    alarmDelayHint: 'تنطلق الصفارة فور إغلاق العينين المتواصل لهذه المدة (المعيار الدولي: 2.0 ثانية)',
    headNodThresholdLabel: 'حساسية زاوية سقوط الرأس (درجة الميلان)',
    headNodThresholdHint: 'الزاوية السالبة (-6° إلى -16°) التي ترصد انحدار الرأس للأمام وتطلق إنذار سقوط الرأس فوراً',
    section2Title: '2. نغمة صفارة الطوارئ داخل الكابينة',
    sirenProfileLabel: 'نوع صوت الإنذار',
    sirenProfileHint: 'يتم توليده عبر Web Audio API لاختراق الضجيج العالي لمحرك الشاحنة',
    masterVolumeLabel: 'مستوى الصوت الرئيسي',
    stopSirenBtn: 'إيقاف الصفارة',
    testSiren3sBtn: 'تجربة صوت الصفارة (3 ثوانٍ)',
    section3Title: '3. محرك التنبيه الصوتي الناطق (Text-to-Speech)',
    enableVoiceAlerts: 'تفعيل التنبيهات الصوتية الحية',
    synthVoiceLabel: 'صوت المتحدث الآلي',
    defaultHighClarityVoice: 'الصوت عالي الوضوح التلقائي',
    speechCadenceLabel: 'سرعة نطق التنبيه',
    voiceLoudnessLabel: 'علو الصوت الناطق',
    section4Title: '4. بيانات الشاحنة والسائق في الأسطول',
    truckUnitIdLabel: 'رقم / كود الشاحنة',
    driverNameLabel: 'اسم السائق المعتمد',
    settingsSavedNotice: 'تم حفظ الإعدادات بنجاح',
    settingsRealtimeNotice: 'تطبق الإعدادات فوراً وبشكل لحظي',
    doneApplyBtn: 'حفظ وتطبيق',

    calibTitle: 'المعايرة الهندسية لوضعية السائق',
    calibReadyTitle: 'ضبط الوضعية المرجعية',
    calibReadyDesc: 'اجلس في وضعية القيادة المعتادة في مقعد الشاحنة. انظر للأمام نحو الزجاج الأمامي مع إبقاء العينين مفتوحتين والرأس مستقيماً.',
    calibFaceStatus: 'حالة التعرف:',
    calibFaceAligned: 'الوجه مستقر داخل الإطار',
    calibAlignFace: 'وجه نظرك نحو الكاميرا',
    calibBeginBtn: 'بدء القياس المرجعي لمدة 3 ثوانٍ',
    calibSamplingDesc: 'حافظ على نظرك للأمام... جاري قياس اتساع العينين وزاوية الرأس',
    calibSamplesCount: 'البيانات المسجلة:',
    calibCompleteTitle: 'اكتملت المعايرة بنجاح',
    calibCompleteDesc: 'تم حساب خط الأساس المخصص لك بدقة، وضبط الإنذارات وفقاً لملامح وجهك وارتفاع مقعد الكابينة.',
    calibTriggerLabel: 'عتبة إغلاق العينين المعتمدة:',
    calibNodTriggerLabel: 'عتبة ميلان الرأس المعتمدة:',
    calibSaveBtn: 'حفظ والعودة لشاشة الكابينة',
  },
};
