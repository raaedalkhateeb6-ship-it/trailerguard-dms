import React from 'react';
import { X, ShieldCheck, Eye, Lock, Camera, Server, Mail } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'ar' | 'en';
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  if (!isOpen) return null;

  const isAr = language === 'ar';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-policy-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 id="privacy-policy-title" className="text-lg font-bold text-slate-100">
                {isAr ? 'سياسة الخصوصية وأمان البيانات (Google Play)' : 'Privacy Policy & Data Safety'}
              </h2>
              <p className="text-xs text-slate-400">
                {isAr ? 'متوافقة مع متطلبات متجر جوجل بلاي وأمان إذن الكاميرا' : 'Google Play Store & Camera Permission Compliant'}
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

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm text-slate-300 leading-relaxed">
          {/* Key Highlight Banner */}
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 flex items-start gap-3">
            <Lock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-300 text-sm">
                {isAr ? 'معالجة محلية 100% داخل جهاز السائق' : '100% On-Device Edge AI Processing'}
              </p>
              <p className="text-xs text-emerald-300/80 mt-1">
                {isAr
                  ? 'لا يتم تسجيل أو تخزين أو إرسال أي مقاطع فيديو أو صور فوتوغرافية إلى أي خوادم سحابية. يتم استخراج إحداثيات العينين وحركة الرأس لحظياً في ذاكرة الجهاز العشوائية (RAM) وتُمسح فوراً.'
                  : 'Zero video or photo frames are recorded, stored, or transmitted to any remote servers. Facial landmarks are processed in real-time within device memory and discarded immediately.'}
              </p>
            </div>
          </div>

          {/* Section 1: Camera Permission */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-100 font-semibold text-base">
              <Camera className="w-4 h-4 text-amber-400" />
              <span>{isAr ? '1. إذن الوصول إلى الكاميرا (Camera Usage)' : '1. Camera Permission Usage'}</span>
            </div>
            <p className="text-xs text-slate-300">
              {isAr
                ? 'يطلب تطبيق TrailerGuard DMS إذن الكاميرا لغرض وحيد وهو: تشغيل الرصد اللحظي لملامح وجه السائق، وقياس نسبة إغلاق الجفون (PERCLOS)، ومعدل التثاؤب، وسقوط الرأس أثناء قيادة المقطورة لتفعيل التنبيهات الصوتية الوقائية.'
                : 'TrailerGuard DMS requests camera access solely to detect driver face landmarks, eye closure percentage (PERCLOS), yawning duration, and head nod angles to trigger real-time audible drowsiness warnings.'}
            </p>
          </div>

          {/* Section 2: Data Collection & Retention */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-100 font-semibold text-base">
              <Server className="w-4 h-4 text-amber-400" />
              <span>{isAr ? '2. جمع البيانات وحفظها (Data Retention)' : '2. Data Retention & Sharing'}</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
              <li>
                {isAr
                  ? 'لا يتم جمع أي بيانات تعريف شخصية (PII) أو صور حيوية بيومترية.'
                  : 'No Personally Identifiable Information (PII) or biometric facial templates are saved.'}
              </li>
              <li>
                {isAr
                  ? 'سجلات الأحداث (مثل عدد مرات التثاؤب أو تحذيرات النوم) يتم حفظها اختيارياً فقط في ذاكرة المتصفح المحلية (localStorage) لجهازك ولا يمكن لأي طرف ثالث الوصول إليها.'
                  : 'Safety incident logs (such as yawn counts or micro-sleep warnings) reside only within your local browser storage (localStorage) and never leave your device.'}
              </li>
              <li>
                {isAr
                  ? 'لا يتم بيع أو مشاركة أي بيانات مع شركات إعلانية أو جهات خارجية.'
                  : 'We do not sell, rent, or share user data with advertisers or third parties.'}
              </li>
            </ul>
          </div>

          {/* Section 3: Driver Safety Disclaimer */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-100 font-semibold text-base">
              <Eye className="w-4 h-4 text-amber-400" />
              <span>{isAr ? '3. إخلاء المسؤولية للسلامة على الطرق' : '3. Road Safety Disclaimer'}</span>
            </div>
            <p className="text-xs text-slate-300">
              {isAr
                ? 'تطبيق TrailerGuard DMS هو أداة مساعدة رقمية للسائق ولا يحل محل الحذر واليقظة الطبيعية والالتزام بساعات القيادة المسموحة قانونياً والاستراحة عند الشعور بالإرهاق.'
                : 'TrailerGuard DMS is a digital driving assist tool and does not replace driver attentiveness, legal hours of service compliance, or proper rest breaks.'}
            </p>
          </div>

          {/* Section 4: Contact / Developer Info */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Mail className="w-4 h-4 text-amber-400" />
              <span>{isAr ? 'البريد الإلكتروني المعتمد للمطور في Google Play:' : 'Google Play Developer Contact:'}</span>
            </div>
            <a
              href="mailto:raaedalkhateeb6@gmail.com"
              className="font-mono text-amber-400 hover:underline"
            >
              raaedalkhateeb6@gmail.com
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/70 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            {isAr ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
