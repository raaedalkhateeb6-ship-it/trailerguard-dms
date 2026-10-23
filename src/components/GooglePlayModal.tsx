import React, { useState } from 'react';
import {
  X,
  Play,
  Download,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Smartphone,
  FileCode,
  FileText,
  Lock,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface GooglePlayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPrivacyPolicy: () => void;
  language: 'ar' | 'en';
}

export const GooglePlayModal: React.FC<GooglePlayModalProps> = ({
  isOpen,
  onClose,
  onOpenPrivacyPolicy,
  language,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'quick' | 'assetlinks' | 'datasafety'>('quick');
  const { isInstallable, isInstalled, install } = usePWAInstall();

  if (!isOpen) return null;

  const isAr = language === 'ar';
  const packageName = 'com.trailerguard.dms';
  const currentUrl = window.location.origin;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const assetLinksJson = JSON.stringify(
    [
      {
        relation: ['delegate_permission/common.handle_all_urls'],
        target: {
          namespace: 'android_app',
          package_name: packageName,
          sha256_cert_fingerprints: [
            '14:6D:E9:7D:0C:52:AB:71:6C:54:E5:60:92:43:57:A8:14:48:67:8F:A3:A3:34:3E:45:AC:12:05:43:03:7E:62',
            'REPLACE_WITH_YOUR_RELEASE_KEYSTORE_OR_GOOGLE_PLAY_APP_SIGNING_SHA256',
          ],
        },
      },
    ],
    null,
    2
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="google-play-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Play className="w-5 h-5 fill-emerald-400" />
            </div>
            <div>
              <h2 id="google-play-modal-title" className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <span>{isAr ? 'تجهيز التطبيق لمتجر Google Play' : 'Google Play Store Publishing Package'}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  {isAr ? 'جاهز 100%' : '100% Ready'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {isAr
                  ? 'حزمة Trusted Web Activity (TWA) الكاملة مع الأيقونات وملف الـ Manifest'
                  : 'Complete TWA / PWA Package with Web App Manifest, Service Worker & Icons'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 gap-2 text-xs">
          <button
            onClick={() => setActiveSubTab('quick')}
            className={`py-3 px-3 font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeSubTab === 'quick'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            {isAr ? 'خطوات الرفع السريعة' : 'Quick Steps'}
          </button>
          <button
            onClick={() => setActiveSubTab('assetlinks')}
            className={`py-3 px-3 font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeSubTab === 'assetlinks'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            {isAr ? 'ملف التحقق (assetlinks.json)' : 'Asset Links'}
          </button>
          <button
            onClick={() => setActiveSubTab('datasafety')}
            className={`py-3 px-3 font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeSubTab === 'datasafety'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            {isAr ? 'أمان البيانات (Data Safety)' : 'Data Safety Form'}
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm text-slate-300">
          {/* Quick Install Bar */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-slate-100 text-xs">
                  {isInstalled
                    ? isAr
                      ? 'التطبيق مثبت حالياً في وضع Standalone'
                      : 'App is currently installed in Standalone mode'
                    : isAr
                    ? 'تجربة تثبيت التطبيق مباشرة (PWA)'
                    : 'Test In-App Installation directly'}
                </p>
                <p className="text-[11px] text-slate-400">
                  {isAr
                    ? 'يعمل التطبيق كبرنامج مستقل على شاشة جهازك وهاتفك الأندرويد'
                    : 'Runs as a full native app on your phone / desktop'}
                </p>
              </div>
            </div>

            {isInstallable && !isInstalled ? (
              <button
                onClick={install}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30"
              >
                <Download className="w-4 h-4" />
                {isAr ? 'تثبيت على الجهاز الآن' : 'Install on Device'}
              </button>
            ) : isInstalled ? (
              <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                {isAr ? 'مثبت على الجهاز' : 'Installed'}
              </span>
            ) : null}
          </div>

          {activeSubTab === 'quick' && (
            <div className="space-y-4">
              {/* Package Identification */}
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  {isAr ? '1. بيانات الحزمة المجهزة (Application Package ID)' : '1. Package Identifier'}
                </h3>
                <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <span className="font-mono text-xs text-amber-400">{packageName}</span>
                  <button
                    onClick={() => handleCopy(packageName, 'pkg')}
                    className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition flex items-center gap-1 text-xs"
                  >
                    {copiedKey === 'pkg' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'pkg' ? (isAr ? 'تم النسخ' : 'Copied') : isAr ? 'نسخ' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* 3 Steps to Google Play */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  {isAr ? '2. خطوات الرفع على Google Play Console في 5 دقائق:' : '2. Steps to Publish on Google Play:'}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Step A */}
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs mb-2">
                        1
                      </div>
                      <p className="font-semibold text-slate-200 text-xs mb-1">
                        {isAr ? 'فتح أداة PWABuilder' : 'Open PWABuilder'}
                      </p>
                      <p className="text-[11px] text-slate-400 leading-normal">
                        {isAr
                          ? 'توجه إلى موقع pwabuilder.com وضع رابط تطبيقك المباشر.'
                          : 'Go to pwabuilder.com and paste your published app URL.'}
                      </p>
                    </div>
                    <a
                      href={`https://www.pwabuilder.com?url=${encodeURIComponent(currentUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:underline font-semibold"
                    >
                      {isAr ? 'انتقل إلى PWABuilder' : 'Open PWABuilder'}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* Step B */}
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs mb-2">
                        2
                      </div>
                      <p className="font-semibold text-slate-200 text-xs mb-1">
                        {isAr ? 'تحميل حزمة Android (.aab)' : 'Generate .aab Bundle'}
                      </p>
                      <p className="text-[11px] text-slate-400 leading-normal">
                        {isAr
                          ? 'اختر Package for Google Play، وضع اسم الحزمة com.trailerguard.dms ثم حمّل ملف .aab.'
                          : 'Click Package for Google Play, keep package as com.trailerguard.dms, download the signed bundle.'}
                      </p>
                    </div>
                  </div>

                  {/* Step C */}
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs mb-2">
                        3
                      </div>
                      <p className="font-semibold text-slate-200 text-xs mb-1">
                        {isAr ? 'الرفع في Google Play Console' : 'Upload to Console'}
                      </p>
                      <p className="text-[11px] text-slate-400 leading-normal">
                        {isAr
                          ? 'في حسابك raaedalkhateeb6@gmail.com أنشئ تطبيقا جديدا وارفع الحزمة وضع رابط سياسة الخصوصية.'
                          : 'In your developer account, create new app, upload .aab, and link the Privacy Policy.'}
                      </p>
                    </div>
                    <button
                      onClick={onOpenPrivacyPolicy}
                      className="mt-3 text-left inline-flex items-center gap-1.5 text-xs text-amber-400 hover:underline font-semibold"
                    >
                      <FileText className="w-3 h-3" />
                      {isAr ? 'عرض سياسة الخصوصية' : 'View Privacy Policy'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'assetlinks' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-300">
                {isAr
                  ? 'تم تجهيز ملف Digital Asset Links على مسار /.well-known/assetlinks.json لكي يخفي متصفح أندرويد شريط العناوين تلقائياً:'
                  : 'The assetlinks.json file is ready under /.well-known/assetlinks.json to eliminate the browser address bar in TWA mode:'}
              </p>
              <div className="relative">
                <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-mono text-xs overflow-x-auto max-h-48">
                  {assetLinksJson}
                </pre>
                <button
                  onClick={() => handleCopy(assetLinksJson, 'asset')}
                  className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1 transition"
                >
                  {copiedKey === 'asset' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'asset' ? (isAr ? 'تم النسخ' : 'Copied') : isAr ? 'نسخ الملف' : 'Copy JSON'}</span>
                </button>
              </div>
            </div>
          )}

          {activeSubTab === 'datasafety' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-600/30 text-amber-200 text-xs flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-300">
                    {isAr ? 'إجابات استبيان أمان البيانات (Data Safety) في Google Play Console:' : 'Data Safety Questionnaire Answers:'}
                  </p>
                  <p className="text-[11px] text-amber-200/80 mt-0.5">
                    {isAr
                      ? 'عند تعبئة قسم Data Safety في لوحة مطوري جوجل، اختر الإجابات التالية بدقة لتفادي أي رفض:'
                      : 'When filling the Data Safety section in Google Play Console, enter these exact responses:'}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-300">
                    {isAr ? 'هل يجمع تطبيقك أو يشارك بيانات المستخدمين؟' : 'Does your app collect or share user data?'}
                  </span>
                  <span className="font-bold text-emerald-400">{isAr ? 'لا (No)' : 'No'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-300">
                    {isAr ? 'كيف يتم استخدام إذن الكاميرا؟' : 'How is Camera permission used?'}
                  </span>
                  <span className="font-bold text-emerald-400">{isAr ? 'معالجة محلية فقط (Ephemeral Processing)' : 'Ephemeral on-device only'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-300">
                    {isAr ? 'هل يتم حفظ صور أو فيديوهات للوجه؟' : 'Are facial photos or videos stored or transmitted?'}
                  </span>
                  <span className="font-bold text-emerald-400">{isAr ? 'لا، يتم مسحها فوراً من الذاكرة' : 'No, discarded in RAM instantly'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/trailerguard-dms-source.zip"
              download="trailerguard-dms-source.zip"
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isAr ? 'تنزيل الكود المصدري (ZIP)' : 'Download Source ZIP'}</span>
            </a>
            <button
              onClick={onOpenPrivacyPolicy}
              className="text-xs text-amber-400 hover:underline flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isAr ? 'سياسة الخصوصية المعتمدة' : 'Privacy Policy'}</span>
            </button>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
          >
            {isAr ? 'تم، إغلاق النافذة' : 'Done / Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
