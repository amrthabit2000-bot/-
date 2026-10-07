import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  DailyReward,
  SEVEN_DAY_REWARDS,
  UserDailyProgress,
  claimDailyRewardInFirebase,
  getTodayDateString,
} from '../utils/firebase';
import { sound } from '../utils/audio';
import { BoardTheme } from '../types/tawla';
import {
  Award,
  Calendar,
  CheckCircle2,
  Crown,
  Flame,
  Gift,
  Lock,
  Palette,
  Sparkles,
  Trophy,
  X,
  Zap,
} from 'lucide-react';

interface DailyRewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: UserDailyProgress | null;
  onRewardClaimed: (updatedProgress: UserDailyProgress, reward: DailyReward) => void;
  onApplyTheme?: (theme: BoardTheme) => void;
}

export const DailyRewardsModal: React.FC<DailyRewardsModalProps> = ({
  isOpen,
  onClose,
  progress,
  onRewardClaimed,
  onApplyTheme,
}) => {
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimSuccessMessage, setClaimSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const today = getTodayDateString();
  const hasPlayedMatchToday = progress?.lastMatchPlayedDate === today;
  const hasClaimedToday = progress?.lastClaimedDate === today;

  // Next day in the 7-day cycle to claim
  const currentClaimedDay = progress?.claimedDay || 0;
  const targetDay = (currentClaimedDay % 7) + 1;

  const canClaimNow = hasPlayedMatchToday && !hasClaimedToday;

  const handleClaim = async () => {
    if (!canClaimNow || isClaiming) return;
    setIsClaiming(true);

    try {
      const result = await claimDailyRewardInFirebase();
      sound.playCelebration();

      // Launch golden reward confetti
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#ffd700', '#f59e0b', '#10b981', '#ffffff'],
        zIndex: 99999,
      });

      setClaimSuccessMessage(`مبروك! تم استلام ${result.reward.title} بنجاح! 🎉`);
      onRewardClaimed(result.updatedProgress, result.reward);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md font-['Cairo']">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="relative w-full max-w-2xl bg-gradient-to-b from-[#2d160c] via-[#1f0e06] to-[#120703] border-2 border-amber-600/60 rounded-3xl p-4 sm:p-6 shadow-[0_20px_70px_rgba(0,0,0,0.95)] text-[#f5ecd9] flex flex-col max-h-[92vh]"
          dir="rtl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#4d2d18] pb-3 mb-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 border border-amber-300 flex items-center justify-center shadow-lg text-2xl">
                🎁
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-black text-amber-100 flex items-center gap-2">
                  <span>المكافآت اليومية لحريف الطاولة</span>
                  <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full bg-amber-950/90 border border-amber-500/50 text-amber-300 font-normal">
                    سحابة Firebase ☁️
                  </span>
                </h2>
                <div className="flex items-center gap-2 text-xs text-amber-200/70 mt-0.5">
                  <span className="flex items-center gap-1 font-bold text-amber-400">
                    <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>سلسلة اللعب اليومي: {progress?.dailyStreak || 1} أيام متتالية</span>
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#3a1d0d] hover:bg-[#522913] text-amber-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Condition Requirement Banner */}
          <div className="p-3.5 rounded-2xl bg-[#160a04] border border-[#432311] mb-3 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-base ${
                hasPlayedMatchToday ? 'bg-emerald-950 border border-emerald-600/50 text-emerald-400' : 'bg-amber-950 border border-amber-600/40 text-amber-400'
              }`}>
                {hasPlayedMatchToday ? <CheckCircle2 className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
              </div>
              <div>
                <div className="text-xs font-bold text-amber-200">
                  شرط المكافأة: فتح التطبيق ولعب مباراة واحدة يومياً
                </div>
                <div className="text-[11px] text-amber-200/60 mt-0.5">
                  {hasPlayedMatchToday
                    ? 'أحسنت! أكملت شرط لعب مباراة اليوم بنجاح ✅'
                    : 'العب جولة أو مباراة واحدة على الأقل اليوم لتفعيل زر الاستلام 🎲'}
                </div>
              </div>
            </div>

            <div className="shrink-0 text-left">
              {hasClaimedToday ? (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-400">
                  تم الاستلام اليوم ✅
                </span>
              ) : hasPlayedMatchToday ? (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500 text-amber-950 animate-pulse shadow">
                  جاهز للاستلام 🎁
                </span>
              ) : (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-stone-900 border border-stone-700 text-stone-400">
                  العب للتفعيل 🔒
                </span>
              )}
            </div>
          </div>

          {/* Claim Success Banner */}
          {claimSuccessMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 mb-3 rounded-2xl bg-emerald-950/90 border border-emerald-500/60 text-emerald-200 text-xs font-bold flex items-center gap-2 shrink-0 shadow-lg"
            >
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span>{claimSuccessMessage}</span>
            </motion.div>
          )}

          {/* 7-Days Cycle Grid */}
          <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-4 gap-2.5 py-1">
            {SEVEN_DAY_REWARDS.map((rew) => {
              const isPastClaimed = rew.day <= currentClaimedDay;
              const isCurrentTarget = rew.day === targetDay;
              const isGrandPrize = rew.day === 7;

              return (
                <div
                  key={rew.day}
                  className={`relative p-3 rounded-2xl border transition-all flex flex-col justify-between overflow-hidden ${
                    isPastClaimed
                      ? 'bg-[#150a04]/90 border-emerald-600/40 opacity-80'
                      : isCurrentTarget
                      ? (canClaimNow
                          ? 'bg-gradient-to-b from-[#3d1e0d] to-[#241106] border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.35)] ring-2 ring-amber-400/50'
                          : 'bg-gradient-to-b from-[#2a1309] to-[#180a04] border-amber-600/60 shadow')
                      : isGrandPrize
                      ? 'bg-gradient-to-br from-[#3b1c0a] to-[#1a0c05] border-amber-500/60 col-span-2 sm:col-span-2'
                      : 'bg-[#140803]/80 border-[#3b1d0c] opacity-70'
                  }`}
                >
                  {/* Top Day Badge */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black font-mono text-amber-300 flex items-center gap-1">
                      {isGrandPrize && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                      <span>اليوم {rew.day}</span>
                    </span>

                    {isPastClaimed ? (
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>تم</span>
                      </span>
                    ) : isCurrentTarget ? (
                      <span className="text-[10px] text-amber-400 font-bold animate-pulse">
                        اليوم 🌟
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-200/40">
                        <Lock className="w-3 h-3 text-amber-200/30" />
                      </span>
                    )}
                  </div>

                  {/* Icon & Reward Details */}
                  <div className="flex flex-col items-center text-center my-1">
                    <div className="w-12 h-12 rounded-2xl bg-black/40 border border-amber-900/50 flex items-center justify-center text-2xl shadow-inner mb-2">
                      {rew.iconEmoji}
                    </div>

                    <span className="text-xs font-black text-amber-100 block">
                      {rew.title}
                    </span>
                    <span className="text-[10px] text-amber-200/60 block mt-0.5 leading-tight">
                      {rew.subtitle}
                    </span>
                  </div>

                  {/* Type Tag & Apply Button if theme */}
                  <div className="mt-2 pt-2 border-t border-[#3b1d0c] flex items-center justify-between text-[10px]">
                    <span className="text-amber-300/80 font-bold">
                      {rew.type === 'points' ? '🪙 نقاط إضافية' : '🎨 تصميم لوحة'}
                    </span>

                    {rew.type === 'theme' && isPastClaimed && onApplyTheme && (
                      <button
                        onClick={() => onApplyTheme(rew.value as BoardTheme)}
                        className="px-2 py-0.5 rounded-lg bg-amber-700/80 hover:bg-amber-600 text-white font-bold cursor-pointer"
                      >
                        تطبيق
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Footer Button */}
          <div className="pt-3 border-t border-[#4d2d18]/60 mt-3 flex items-center justify-between gap-3 shrink-0">
            <div className="text-xs text-amber-200/70 font-mono">
              التقييم الحالي: <strong className="text-amber-300">{progress?.rating || 1290}</strong> نقطة
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#281308] hover:bg-[#3d1c0c] text-amber-200 font-bold text-xs cursor-pointer transition-all"
              >
                إغلاق
              </button>

              <button
                onClick={handleClaim}
                disabled={!canClaimNow || isClaiming}
                className={`px-6 py-2.5 rounded-xl font-black text-xs sm:text-sm shadow-lg flex items-center gap-2 transition-all cursor-pointer ${
                  canClaimNow
                    ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-amber-950 animate-bounce active:scale-95'
                    : 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700'
                }`}
              >
                <Gift className="w-4 h-4" />
                <span>
                  {hasClaimedToday
                    ? 'تم استلام مكافأة اليوم ✅'
                    : hasPlayedMatchToday
                    ? (isClaiming ? 'جاري الاستلام...' : 'استلم مكافأة اليوم الآن 🎁')
                    : 'العب مباراة واحدة لتفعيل الاستلام 🔒'}
                </span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
