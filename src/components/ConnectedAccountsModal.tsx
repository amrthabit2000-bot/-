import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe2,
  CheckCircle2,
  X,
  LogOut,
  Sparkles,
  ShieldCheck,
  User,
  Database,
  Coins,
  Trophy,
  History,
} from 'lucide-react';
import {
  connectWithGoogle,
  disconnectGoogle,
  GoogleAccountProfile,
  UserDailyProgress,
} from '../utils/firebase';

interface ConnectedAccountsModalProps {
  isOpen: boolean;
  onClose: () => void;
  googleProfile: GoogleAccountProfile | null;
  onGoogleProfileChange: (profile: GoogleAccountProfile | null) => void;
  dailyProgress?: UserDailyProgress | null;
}

export const ConnectedAccountsModal: React.FC<ConnectedAccountsModalProps> = ({
  isOpen,
  onClose,
  googleProfile,
  onGoogleProfileChange,
  dailyProgress,
}) => {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConnectGoogle = async () => {
    setGoogleLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const { profile } = await connectWithGoogle();
      onGoogleProfileChange(profile);
      setSuccessMsg('تم ربط حساب Google بنجاح! يتم الآن حفظ جميع بياناتك ومبارياتك وكوينزك في السحاب.');
    } catch (err: any) {
      console.warn('Google connect error:', err);
      setErrorMsg(err.message || 'تعذر استكمال الاتصال بحساب Google.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleDisconnectGoogle = async () => {
    setGoogleLoading(true);
    try {
      await disconnectGoogle();
      onGoogleProfileChange(null);
      setSuccessMsg('تم تسجيل الخروج من حساب Google بنجاح.');
    } catch (err) {
      console.warn(err);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md font-['Cairo']">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="relative w-full max-w-lg bg-gradient-to-b from-[#24130b] via-[#1a0c06] to-[#0f0603] border-2 border-amber-600/60 rounded-3xl p-4 sm:p-6 shadow-[0_20px_70px_rgba(0,0,0,0.95)] text-[#f5ecd9] flex flex-col max-h-[92vh]"
          dir="rtl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#3b1d0c] pb-3 mb-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center shadow-lg text-2xl font-black">
                G
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-amber-100 flex items-center gap-2">
                  <span>ربط الحساب بحساب Google</span>
                </h2>
                <p className="text-xs text-amber-200/70 mt-0.5">
                  حفظ دائم لنقاط التصنيف، الكوينز، الطاولات المفتوحة، وسجل المباريات
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

          {/* Feedback Alerts */}
          {successMsg && (
            <div className="mb-3 p-3 rounded-2xl bg-emerald-950/60 border border-emerald-600/50 text-emerald-200 text-xs flex items-center gap-2 shadow">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="mb-3 p-3 rounded-2xl bg-rose-950/60 border border-rose-600/50 text-rose-200 text-xs flex items-center gap-2 shadow">
              <span className="shrink-0">⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Main Google Connection Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#2e1509]/70 border border-blue-500/40 shadow-inner flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                {googleProfile?.photoURL ? (
                  <img
                    src={googleProfile.photoURL}
                    alt={googleProfile.displayName || 'Google'}
                    className="w-12 h-12 rounded-2xl border-2 border-blue-400 shadow object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-blue-600/30 border border-blue-400/50 flex items-center justify-center text-blue-300">
                    <User className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-amber-100">
                      {googleProfile ? googleProfile.displayName || 'لاعب طاولة معتمد' : 'حساب Google السحابي'}
                    </span>
                    {googleProfile && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-bold">
                        متصل ومحفوظ ✅
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-amber-200/60 block mt-0.5" dir="ltr">
                    {googleProfile?.email || 'لم يتم تسجيل الدخول بعد'}
                  </span>
                </div>
              </div>
            </div>

            {/* Benefits of Google Sync */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-amber-200/80 pt-1 border-t border-[#462312]">
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-black/25">
                <Coins className="w-4 h-4 text-amber-400 shrink-0" />
                <span>حفظ رصيد الكوينز ({dailyProgress?.coins || 1000} 🪙)</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-black/25">
                <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                <span>حفظ تصنيف ELO ولقب المعلم</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-black/25">
                <Database className="w-4 h-4 text-blue-400 shrink-0" />
                <span>حفظ الطاولات وخامات الزهر</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-black/25">
                <History className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>أرشفة آخر ٢٠ مباراة لعبتها</span>
              </div>
            </div>

            {/* Connect / Disconnect Action Buttons */}
            <div className="pt-2">
              {googleProfile ? (
                <div className="flex items-center gap-2">
                  <div className="flex-1 p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-center gap-1.5 font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>حسابك مؤمن في سحابة Firebase</span>
                  </div>
                  <button
                    onClick={handleDisconnectGoogle}
                    disabled={googleLoading}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 border border-rose-600/50 text-rose-300 text-xs font-bold transition-all cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>خروج</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleConnectGoogle}
                  disabled={googleLoading}
                  className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-black text-xs sm:text-sm border border-blue-400 shadow-lg cursor-pointer transition-all active:scale-95"
                >
                  <Globe2 className="w-4 h-4" />
                  <span>
                    {googleLoading ? 'جاري الاتصال بـ Google...' : 'تسجيل الدخول بحساب Google وحفظ التقدم'}
                  </span>
                </button>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#3b1d0c] text-center text-[11px] text-amber-200/50">
            بياناتك مشفرة ومحفوظة تحت معرفك الفريد في قاعدة بيانات Firestore الخاصة بالتطبيق.
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
