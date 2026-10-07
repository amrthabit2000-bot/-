import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  Smartphone,
  CheckCircle2,
  X,
  ExternalLink,
  Terminal,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  Copy,
  Layers,
} from 'lucide-react';

interface GooglePlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GooglePlayModal: React.FC<GooglePlayModalProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert('لتثبيت التطبيق على أندرويد:\nاضغط على قائمة المتصفح (⋮) ثم اختر "إضافة إلى الشاشة الرئيسية" أو "تثبيت التطبيق".');
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md font-['Cairo']">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="relative w-full max-w-2xl bg-gradient-to-b from-[#25130b] via-[#1a0c06] to-[#0f0603] border-2 border-amber-600/70 rounded-3xl p-4 sm:p-6 shadow-[0_20px_70px_rgba(0,0,0,0.95)] text-[#f5ecd9] flex flex-col max-h-[92vh] overflow-hidden"
          dir="rtl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#3b1d0c] pb-3 mb-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-stone-950 flex items-center justify-center shadow-lg text-2xl font-black">
                🤖
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-black text-amber-100 flex items-center gap-2">
                  <span>تنزيل ونشر التطبيق على Google Play</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                    Android & TWA
                  </span>
                </h2>
                <p className="text-xs text-amber-200/70 mt-0.5">
                  تثبيت فوري على الهواتف + خطوات استخراج ملف الحزمة (AAB) لمتجر جوجل بلاي
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#2e1509] hover:bg-[#43200e] text-amber-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-4 custom-scrollbar">
            {/* Section 1: Instant Direct Installation on Android (PWA/WebAPK) */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-[#182915] to-emerald-950/80 border border-emerald-500/50 shadow-md">
              <div className="flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600/30 text-emerald-300 flex items-center justify-center text-2xl border border-emerald-400/40 shrink-0">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm sm:text-base text-emerald-200">
                      تثبيت اللعبة على هاتفك مباشرة (مثل تطبيق Google Play تماماً)
                    </h3>
                    <p className="text-xs text-emerald-300/80 mt-0.5">
                      يتم تثبيت أيقونة التطبيق على شاشة هاتفك مع شاشة البداية الكاملة بدون شريط المتصفح وتعمل بكفاءة وسرعة فائقة.
                    </p>
                  </div>
                </div>

                <div className="w-full sm:w-auto shrink-0 pt-2 sm:pt-0">
                  {isInstalled ? (
                    <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>مثبت لديك بالفعل ✅</span>
                    </div>
                  ) : (
                    <button
                      onClick={handleInstallPWA}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-xs sm:text-sm shadow-lg cursor-pointer transition-all active:scale-95"
                    >
                      <Download className="w-4 h-4" />
                      <span>تثبيت على الهاتف الآن</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: How to publish to Google Play Store (For Developers / Store Owners) */}
            <div className="p-4 rounded-2xl bg-[#2e1509]/70 border border-amber-700/60 shadow-inner space-y-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-sm sm:text-base text-amber-100">
                  خطوات رفع اللعبة على حساب مطور Google Play Console:
                </h3>
              </div>

              <p className="text-xs text-amber-200/80 leading-relaxed">
                تقنية <strong>TWA (Trusted Web Activity)</strong> هي المعيار الرسمي المعتمد من Google لتحويل تطبيقات الويب التقدمية إلى ملف <strong>Android App Bundle (.aab)</strong> جاهز للرفع على متجر جوجل بلاي خلال دقائق:
              </p>

              {/* Step 1: PWABuilder (Easiest 1-click method) */}
              <div className="p-3 rounded-xl bg-black/30 border border-amber-800/40 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs text-amber-300">
                    الطريقة ١: عبر موقع PWABuilder (الأسهل والأسرع - بنقرة واحدة)
                  </span>
                  <a
                    href="https://www.pwabuilder.com"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[11px] text-blue-400 hover:underline"
                  >
                    <span>فتح الموقع</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <ol className="text-xs text-amber-200/70 list-decimal list-inside space-y-1">
                  <li>افتح رابط <strong className="text-amber-100">pwabuilder.com</strong> وضع رابط اللعبة المنشورة.</li>
                  <li>اضغط على زر <strong className="text-amber-100">Android Package (.aab)</strong>.</li>
                  <li>سيقوم الموقع بإنشاء وتوقيع حزمة <strong className="text-amber-100">app-release-signed.aab</strong> مع مفتاح التوقيع (Keystore).</li>
                  <li>قم بتحميل الملف وارفع الحزمة مباشرة إلى <strong className="text-amber-100">Google Play Console</strong>.</li>
                </ol>
              </div>

              {/* Step 2: Bubblewrap CLI (Official Google Tool) */}
              <div className="p-3 rounded-xl bg-black/30 border border-amber-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs text-amber-300">
                    الطريقة ٢: باستخدام أداة Google الرسمية (Bubblewrap CLI)
                  </span>
                </div>
                <div className="relative p-2.5 rounded-lg bg-stone-950 font-mono text-[11px] text-emerald-400 border border-stone-800" dir="ltr">
                  <code>npm i -g @bubblewrap/cli && bubblewrap init --manifest=manifest.json</code>
                  <button
                    onClick={() => copyToClipboard('npm i -g @bubblewrap/cli && bubblewrap init --manifest=manifest.json', 'bubble')}
                    className="absolute top-2 right-2 p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 cursor-pointer"
                    title="نسخ الأمر"
                  >
                    {copiedCode === 'bubble' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Requirements Checklist */}
              <div className="pt-2 border-t border-[#462312] grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-amber-200/80">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>حساب مطور في Google Play Console (٢٥ دولار تدفع مرة واحدة)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>ملف الأيقونة 512x512 وملف الـ Manifest المدمج في اللعبة جاهزان</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
