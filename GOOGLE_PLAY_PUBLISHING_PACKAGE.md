# دليل رفع تطبيق TrailerGuard DMS على حساب Google Play Console
**المطور المعتمد**: `raaedalkhateeb6@gmail.com`  
**اسم الحزمة (Package Name)**: `com.trailerguard.dms`  
**نوع الحزمة المجهزة**: Progressive Web App (PWA) / Trusted Web Activity (TWA)

---

## 1. الملفات التي تم تجهيزها داخل المشروع:
- ✅ **Web App Manifest (`public/manifest.json`)**: مُعد بالكامل وفق معايير جوجل بلاي (الاسم، الوصف، شاشات البداية، الوضع المستقل Standalone).
- ✅ **حزمة الأيقونات المعتمدة**:
  - `public/icon-512.png` (قياس 512x512 بدقة عالية لشعار المتجر وأيقونة التطبيق).
  - `public/icon-maskable-512.png` (أيقونة متكيفة مع Safe-Zone لأجهزة أندرويد).
  - `public/icon-192.png` (أيقونة الشاشة الرئيسية لأندرويد).
  - `public/apple-touch-icon.png` (أيقونة أجهزة iOS).
  - `public/icon.svg` (أيقونة المتجهات الأصلية).
- ✅ **مشغل العمليات الخلفية وخدمة الأوفلاين (`public/sw.js`)**: Service Worker للتخزين المؤقت وتجاوز فحص جاهزية التثبيت.
- ✅ **ملف التحقق من النطاق (`public/.well-known/assetlinks.json`)**: لربط النطاق بحساب جوجل بلاي وإخفاء شريط المتصفح تلقائياً عند فتح التطبيق.
- ✅ **سياسة الخصوصية وأمان إذن الكاميرا (`PrivacyPolicyModal.tsx`)**: متوافقة مع شروط Google Play Data Safety لإذن الكاميرا.

---

## 2. خطوات استخراج حزمة الأندرويد (.aab) في 3 دقائق:

### الطريقة المباشرة عبر PWABuilder (المعتمدة والموصى بها من Google):
1. افتح متصفحك وتوجه إلى: [https://www.pwabuilder.com](https://www.pwabuilder.com)
2. ضع رابط تطبيقك المنشور ثم اضغط **Start**.
3. ستظهر شاشة تقييم التطبيق بنتيجة كاملة معتمدة (PWA Ready).
4. اضغط على زر **Package for Google Play**.
5. تأكد من الإعدادات التالية:
   - **Package ID**: `com.trailerguard.dms`
   - **App Name**: `TrailerGuard DMS`
   - **Short Name**: `TrailerGuard`
   - **Version Name**: `1.0.0`
   - **Version Code**: `1`
   - **Display Mode**: `Standalone`
6. اضغط **Download Package**.
7. ستحصل على ملف مضغوط يحتوي على ملف الحزمة النهائي الموقّع:
   `trailerguard-release.aab` (أو ملف `.apk` للتجربة السريعة).

---

## 3. خطوات الرفع على لوحة Google Play Console:

1. سجل الدخول إلى [Google Play Console](https://play.google.com/console) بحسابك: `raaedalkhateeb6@gmail.com`.
2. اضغط على **Create App** (إنشاء تطبيق):
   - **App name**: `TrailerGuard DMS - مراقبة نوم السائقين`
   - **Default language**: العربية (ar) أو English (en)
   - **App or Game**: App (تطبيق)
   - **Free or Paid**: Free (مجاني)
   - وافق على الشروط ثم اضغط **Create App**.

3. **إعدادات أمان البيانات وسياسة الخصوصية (Data Safety & Privacy)**:
   - **Privacy Policy URL**: ضع رابط سياسة الخصوصية الخاصة بتطبيقك.
   - **Camera Permission (إذن الكاميرا)**:
     - عند سؤال المتجر: *هل يجمع التطبيق بيانات المستخدمين أو ينقلها؟*  
       اختر: **No (لا)**.
     - عند سؤال المتجر عن الغرض من الكاميرا:  
       اختر: **Ephemeral Processing (معالجة لحظية داخل الجهاز فقط لسلامة السائق)** دون تخزين أو حفظ أي صور للوجه.

4. **رفع حزمة التطبيق (App Bundle)**:
   - توجه إلى القائمة الجانبية: **Production** أو **Internal Testing**.
   - أنشئ إصداراً جديداً (Create new release).
   - اسحب ملف `trailerguard-release.aab` الناتج من PWABuilder.
   - اكتب ملاحظات الإصدار (Release notes):
     `الإصدار الأول لنظام TrailerGuard DMS لرصد إرهاق ونعاس وتشتت سائقي المقطورات وتنبيههم صوتياً.`
   - اضغط **Save** ثم **Review Release** ثم **Start rollout to Production**.

---

## 4. إخفاء شريط العنوان في أندرويد (Digital Asset Links):
لجعل التطبيق يفتح كشاشة كاملة دون أي شريط عنوان للمتصفح:
1. في لوحة Google Play Console، اذهب إلى:
   **Setup** > **App Integrity** > **App Signing**.
2. انسخ مفتاح بصمة الشهادة: **SHA-256 certificate fingerprint**.
3. استبدل القيمة داخل ملف `public/.well-known/assetlinks.json`.
4. عند تحديث التطبيق، سيتعرف نظام أندرويد على النطاق تلقائياً ويصبح التطبيق بمظهر Native 100%.

مبروك! تطبيقك الآن مجهز بالكامل للرفع على متجر جوجل بلاي.
