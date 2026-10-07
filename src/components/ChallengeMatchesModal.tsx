import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Swords,
  Coins,
  Trophy,
  X,
  Sparkles,
  Zap,
  TrendingUp,
  ShieldAlert,
} from 'lucide-react';
import { AIDifficulty, GameVariant } from '../types/tawla';
import { sound } from '../utils/audio';

export interface ChallengeTable {
  id: string;
  title: string;
  subtitle: string;
  opponentName: string;
  opponentAvatar: string;
  opponentRating: number;
  difficulty: AIDifficulty;
  entryStake: number;
  rewardCoins: number;
  bonusElo: number;
  bgGradient: string;
  borderColor: string;
}

export const CHALLENGE_TABLES: ChallengeTable[] = [
  {
    id: 'cafe_haretna',
    title: 'مقهى الحارة الشعبية',
    subtitle: 'طاولة الهواة والمتحمسين للمنافسة السريعة',
    opponentName: 'حنفي القهوجي',
    opponentAvatar: '☕',
    opponentRating: 1380,
    difficulty: 'medium',
    entryStake: 50,
    rewardCoins: 120,
    bonusElo: 15,
    bgGradient: 'from-[#2e180d] to-[#1e0e06]',
    borderColor: 'border-amber-700/60',
  },
  {
    id: 'alex_harifa',
    title: 'مجلس حريفة الإسكندرية',
    subtitle: 'طاولة المحترفين وتكتيكات الأبواب المقفولة',
    opponentName: 'كابتن عادل زهر',
    opponentAvatar: '🌊',
    opponentRating: 1650,
    difficulty: 'pro',
    entryStake: 150,
    rewardCoins: 380,
    bonusElo: 30,
    bgGradient: 'from-[#1c2438] to-[#0e1424]',
    borderColor: 'border-blue-600/60',
  },
  {
    id: 'grand_masters',
    title: 'ديوان كبار المعلمين',
    subtitle: 'طاولة حاسمة تتطلب تركيزاً عميقاً بدون أي ثغرة',
    opponentName: 'المعلم رشدي الكردي',
    opponentAvatar: '🧔🏻‍♂️',
    opponentRating: 1920,
    difficulty: 'learned',
    entryStake: 500,
    rewardCoins: 1300,
    bonusElo: 60,
    bgGradient: 'from-[#381a10] to-[#200d07]',
    borderColor: 'border-amber-500/80',
  },
  {
    id: 'pasha_royale',
    title: 'قصر الباشوات وبطولة النخبة',
    subtitle: 'أعلى طاولة رهان وتصنيف في اللعبة لأساطير الزهر',
    opponentName: 'أسطورة الطاولة د. رفعت',
    opponentAvatar: '👑',
    opponentRating: 2200,
    difficulty: 'learned',
    entryStake: 1000,
    rewardCoins: 2800,
    bonusElo: 100,
    bgGradient: 'from-[#38260a] via-[#241705] to-[#120a01]',
    borderColor: 'border-amber-400',
  },
];

interface ChallengeMatchesModalProps {
  isOpen: boolean;
  onClose: () => void;
  userCoins: number;
  userRating: number;
  onStartChallengeMatch: (table: ChallengeTable, variant: GameVariant) => void;
  selectedVariant: GameVariant;
}

export const ChallengeMatchesModal: React.FC<ChallengeMatchesModalProps> = ({
  isOpen,
  onClose,
  userCoins,
  userRating,
  onStartChallengeMatch,
  selectedVariant,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md font-['Cairo']">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="relative w-full max-w-2xl bg-gradient-to-b from-[#24130b] via-[#1a0c06] to-[#0f0603] border-2 border-amber-600/70 rounded-3xl p-4 sm:p-6 shadow-[0_20px_70px_rgba(0,0,0,0.95)] text-[#f5ecd9] flex flex-col max-h-[92vh] overflow-hidden"
          dir="rtl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#3b1d0c] pb-3 mb-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 via-amber-600 to-amber-700 text-white flex items-center justify-center shadow-lg text-2xl font-black">
                ⚔️
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-black text-amber-100 flex items-center gap-2">
                  <span>مباريات التحدي بالرهان (Challenge Matches)</span>
                </h2>
                <p className="text-xs text-amber-200/70 mt-0.5">
                  تحدَّ لاعبين ذوي تصنيف أعلى واربح كوينز مضاعفة ونقاط تصنيف ELO إضافية
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

          {/* Current Player Status Bar */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#2e1509]/80 border border-amber-700/50 mb-3 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs text-amber-200/80 font-bold">رصيد كوينزك:</span>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-black text-sm shadow">
                <Coins className="w-4 h-4 fill-stone-950" />
                <span>{userCoins.toLocaleString('ar-EG')} كوينز</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-amber-200/80 font-bold">تصنيفك الحالي:</span>
              <div className="flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-950 border border-amber-600/50 text-amber-300 font-black text-xs font-mono">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>{userRating} ELO</span>
              </div>
            </div>
          </div>

          {/* Challenge Tables List */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
            {CHALLENGE_TABLES.map((table) => {
              const canAfford = userCoins >= table.entryStake;
              const isHigherRating = table.opponentRating > userRating;
              const eloDifference = Math.max(0, table.opponentRating - userRating);
              const dynamicBonusElo = table.bonusElo + Math.round(eloDifference / 15);

              return (
                <div
                  key={table.id}
                  className={`p-4 rounded-2xl bg-gradient-to-r ${table.bgGradient} border ${table.borderColor} shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 transition-all hover:border-amber-400/80`}
                >
                  {/* Left: Opponent & Table Info */}
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="w-14 h-14 rounded-2xl bg-black/40 border-2 border-amber-500/40 flex items-center justify-center text-3xl shadow-inner shrink-0">
                      {table.opponentAvatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm sm:text-base text-amber-100">
                          {table.title}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                          {selectedVariant === 'mahbousa' ? 'المحبوسة' : 'طاولة ٣١'}
                        </span>
                      </div>
                      <div className="text-xs text-amber-200/80 font-semibold mt-0.5 flex items-center gap-2">
                        <span>الخصم: {table.opponentName}</span>
                        <span className="text-amber-500/60">•</span>
                        <span className="text-amber-300 font-mono font-bold">
                          {table.opponentRating} ELO
                        </span>
                        {isHigherRating && (
                          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-500/30">
                            أعلى منك (+{eloDifference})
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-amber-200/60 mt-1">{table.subtitle}</p>
                    </div>
                  </div>

                  {/* Right: Stakes, Rewards & Action */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[#3d1d0c]">
                    <div className="text-right">
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-amber-200/70">الرهان:</span>
                        <span className="font-black text-rose-300 font-mono">
                          {table.entryStake} 🪙
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs mt-0.5">
                        <span className="text-emerald-400 font-bold">جائزة الفوز:</span>
                        <span className="font-black text-emerald-300 font-mono text-sm">
                          +{table.rewardCoins} 🪙
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-amber-400 font-bold mt-0.5">
                        <TrendingUp className="w-3 h-3" />
                        <span>+{dynamicBonusElo} نقطة تصنيف ELO</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (canAfford) {
                          sound.playDiceRoll();
                          onStartChallengeMatch(table, selectedVariant);
                          onClose();
                        }
                      }}
                      disabled={!canAfford}
                      className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-1.5 shrink-0 ${
                        canAfford
                          ? 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-stone-950 shadow-lg cursor-pointer active:scale-95'
                          : 'bg-stone-900 text-stone-500 border border-stone-800 cursor-not-allowed'
                      }`}
                    >
                      <Swords className="w-4 h-4" />
                      <span>{canAfford ? 'دخول التحدي' : 'رصيد غير كافٍ'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-3 pt-2.5 border-t border-[#3b1d0c] text-center text-[11px] text-amber-200/60 flex items-center justify-center gap-2">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>
              نظام الـ ELO الذكي: كلما تغلبت على لاعب ذي تصنيف أعلى، زادت نقاطك ومكافآتك المسجلة في السحاب!
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
