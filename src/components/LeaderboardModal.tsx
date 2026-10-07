import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Crown,
  Medal,
  Flame,
  RotateCw,
  X,
  Sparkles,
  ShieldCheck,
  User,
  Zap,
} from 'lucide-react';
import {
  LeaderboardPlayer,
  fetchLeaderboardFromFirebase,
  UserDailyProgress,
} from '../utils/firebase';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserProgress?: UserDailyProgress | null;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  currentUserProgress,
}) => {
  const [players, setPlayers] = useState<LeaderboardPlayer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await fetchLeaderboardFromFirebase();
      setPlayers(data);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Split top 3 for podium
  const top1 = players[0];
  const top2 = players[1];
  const top3 = players[2];
  const restPlayers = players.slice(3);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md font-['Cairo']">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="relative w-full max-w-2xl bg-gradient-to-b from-[#2a1409] via-[#1b0c05] to-[#100602] border-2 border-amber-600/60 rounded-3xl p-4 sm:p-6 shadow-[0_20px_70px_rgba(0,0,0,0.95)] text-[#f5ecd9] flex flex-col max-h-[92vh]"
          dir="rtl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#4d2d18] pb-3 mb-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 border border-amber-300 flex items-center justify-center shadow-lg text-2xl">
                🏆
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-black text-amber-100 flex items-center gap-2">
                  <span>لوحة الشرف — أفضل ١٠ لاعبين</span>
                </h2>
                <div className="flex items-center gap-2 text-xs text-amber-300/80 mt-0.5">
                  <span className="flex items-center gap-1 font-semibold text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>مزامنة سحابية حية عبر Firebase Firestore ☁️</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => loadData(true)}
                disabled={refreshing}
                className="p-2 rounded-xl bg-[#3a1d0d] hover:bg-[#522913] text-amber-200 transition-all cursor-pointer"
                title="تحديث القائمة الآن"
              >
                <RotateCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-amber-400' : ''}`} />
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-[#3a1d0d] hover:bg-[#522913] text-amber-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-amber-300/70">
              <RotateCw className="w-8 h-8 animate-spin text-amber-400" />
              <span className="text-sm font-bold">جاري تحميل لوحة المتصدرين من Firebase...</span>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4 py-1">
              {/* Podium Top 3 */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 items-end pt-4 pb-2">
                {/* 2nd Place */}
                {top2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="relative p-2.5 sm:p-3 rounded-2xl bg-gradient-to-b from-[#24130b] to-[#180a04] border border-slate-400/50 flex flex-col items-center text-center shadow-lg"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-300 text-stone-900 font-black text-xs sm:text-sm flex items-center justify-center -mt-6 border-2 border-stone-800 shadow">
                      ٢
                    </div>
                    <div className="text-2xl sm:text-3xl my-1">{top2.avatar || '👨🏻'}</div>
                    <div className="text-xs sm:text-sm font-black text-slate-100 truncate w-full">
                      {top2.name}
                    </div>
                    <div className="text-[10px] text-amber-300 font-mono font-bold mt-0.5">
                      {top2.rating.toLocaleString('ar-EG')} نقطة
                    </div>
                    <div className="mt-1 text-[9px] px-2 py-0.5 rounded-full bg-slate-900/80 border border-slate-700 text-slate-300">
                      الميدالية الفضية 🥈
                    </div>
                  </motion.div>
                )}

                {/* 1st Place (Champion) */}
                {top1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative p-3 sm:p-4 rounded-2xl bg-gradient-to-b from-[#42220f] via-[#2e1509] to-[#1c0b04] border-2 border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.3)] flex flex-col items-center text-center ring-2 ring-amber-400/40 -translate-y-2"
                  >
                    <div className="absolute -top-4 w-9 h-9 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-amber-950 font-black text-base flex items-center justify-center border-2 border-amber-200 shadow-md">
                      <Crown className="w-5 h-5 fill-amber-950" />
                    </div>
                    <div className="text-3xl sm:text-4xl my-1.5">{top1.avatar || '👴🏼'}</div>
                    <div className="text-xs sm:text-sm font-black text-amber-100 truncate w-full flex items-center justify-center gap-1">
                      <span>{top1.name}</span>
                    </div>
                    <div className="text-xs sm:text-sm text-amber-400 font-mono font-black mt-0.5">
                      {top1.rating.toLocaleString('ar-EG')} نقطة
                    </div>
                    <div className="mt-1.5 text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/60 text-amber-300 font-black">
                      تاج الصدارة 👑
                    </div>
                  </motion.div>
                )}

                {/* 3rd Place */}
                {top3 && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="relative p-2.5 sm:p-3 rounded-2xl bg-gradient-to-b from-[#24130b] to-[#180a04] border border-amber-700/50 flex flex-col items-center text-center shadow-lg"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-800 text-amber-100 font-black text-xs sm:text-sm flex items-center justify-center -mt-6 border-2 border-stone-800 shadow">
                      ٣
                    </div>
                    <div className="text-2xl sm:text-3xl my-1">{top3.avatar || '👳🏽‍♂️'}</div>
                    <div className="text-xs sm:text-sm font-black text-amber-200 truncate w-full">
                      {top3.name}
                    </div>
                    <div className="text-[10px] text-amber-300 font-mono font-bold mt-0.5">
                      {top3.rating.toLocaleString('ar-EG')} نقطة
                    </div>
                    <div className="mt-1 text-[9px] px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-700 text-amber-300">
                      الميدالية البرونزية 🥉
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Ranks 4 to 10 Table */}
              <div className="flex flex-col gap-1.5 mt-1">
                {restPlayers.map((player, index) => {
                  const rank = index + 4;
                  return (
                    <motion.div
                      key={player.uid}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.04 }}
                      className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl border transition-all ${
                        player.isCurrentUser
                          ? 'bg-gradient-to-r from-[#4d2410] to-[#2e1509] border-amber-400 ring-1 ring-amber-400/50 shadow-md'
                          : 'bg-[#180a04]/90 border-[#381c0c] hover:border-amber-700/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 text-center font-mono font-black text-xs sm:text-sm text-amber-400/80">
                          #{rank}
                        </span>

                        <span className="text-xl sm:text-2xl p-1 rounded-xl bg-black/40 border border-amber-900/40">
                          {player.avatar || '🎲'}
                        </span>

                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs sm:text-sm font-black text-amber-100">
                              {player.name}
                            </span>
                            {player.isCurrentUser && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-amber-500 text-stone-950 font-black">
                                أنت 🌟
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-amber-200/60 flex items-center gap-2 mt-0.5">
                            <span>{player.title || 'حريف طاولة'}</span>
                            {player.dailyStreak > 1 && (
                              <span className="flex items-center gap-0.5 text-amber-400">
                                <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                                <span>سلسلة {player.dailyStreak} أيام</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-left font-mono">
                        <div className="text-xs sm:text-sm font-black text-amber-300">
                          {player.rating.toLocaleString('ar-EG')}
                        </div>
                        <div className="text-[9px] text-amber-200/50">إجمالي النقاط 🪙</div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer with Current Player Position */}
          <div className="pt-3 border-t border-[#4d2d18]/60 mt-3 flex items-center justify-between gap-3 shrink-0">
            <div className="text-xs text-amber-200/80 flex items-center gap-2">
              <User className="w-4 h-4 text-amber-400" />
              <span>
                رصيدك المسجل: <strong className="text-amber-300 font-mono font-bold">{currentUserProgress?.rating || 1290}</strong> نقطة
              </span>
            </div>

            <button
              onClick={onClose}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-amber-950 font-black text-xs cursor-pointer shadow-md transition-all"
            >
              إغلاق لوحة الشرف
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
