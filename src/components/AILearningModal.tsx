import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, CheckCircle2, RotateCcw, Sparkles, TrendingUp, X } from 'lucide-react';
import { getAILearningStats, resetAILearningModel, AILearningStats } from '../utils/ai';

interface AILearningModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AILearningModal: React.FC<AILearningModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [stats, setStats] = useState<AILearningStats>(getAILearningStats());

  if (!isOpen) return null;

  const handleReset = () => {
    resetAILearningModel();
    setStats(getAILearningStats());
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm font-['Cairo']">
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 15 }}
          className="relative w-full max-w-lg bg-gradient-to-b from-[#24130a] to-[#120803] border-2 border-amber-600/50 rounded-3xl p-5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.95)] text-[#f5ecd9]"
          dir="rtl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#4d2d18] pb-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-600/30 border border-amber-400/60 flex items-center justify-center shadow">
                <Brain className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-amber-100 flex items-center gap-2">
                  <span>الذكاء الاصطناعي المتعلم</span>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </h2>
                <p className="text-xs text-amber-200/70">
                  يتعلم الكمبيوتر تلقائياً من أسلوب لعبك وخططك ويكتسب خبرة مستمرة
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#3a1d0d] hover:bg-[#522913] text-amber-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-3 gap-2.5 mb-4">
            <div className="p-2.5 rounded-2xl bg-[#1b0d06] border border-[#4d2812] flex flex-col items-center justify-center text-center">
              <span className="text-[11px] text-amber-200/60">نقلات تم تحليلها</span>
              <span className="text-xl sm:text-2xl font-black text-amber-300 font-mono mt-1">
                {stats.movesAnalyzed}
              </span>
            </div>
            <div className="p-2.5 rounded-2xl bg-[#1b0d06] border border-[#4d2812] flex flex-col items-center justify-center text-center">
              <span className="text-[11px] text-amber-200/60">جولات تم التعلم منها</span>
              <span className="text-xl sm:text-2xl font-black text-amber-300 font-mono mt-1">
                {stats.gamesAnalyzed}
              </span>
            </div>
            <div className="p-2.5 rounded-2xl bg-[#1b0d06] border border-[#4d2812] flex flex-col items-center justify-center text-center">
              <span className="text-[11px] text-amber-200/60">تكتيكات فوز محفوظة</span>
              <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono mt-1">
                {stats.tacticsLearned || 0}
              </span>
            </div>
          </div>

          {/* Learned Heuristics Weights */}
          <div className="space-y-2.5 bg-[#170a04] p-3.5 rounded-2xl border border-[#3b1d0c] mb-4">
            <h3 className="text-xs font-bold text-amber-200 flex items-center gap-1.5 mb-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>مؤشرات المهارات المكتسبة من لعبك:</span>
            </h3>

            <div>
              <div className="flex justify-between text-xs text-amber-200/80 mb-1">
                <span>إتقان بناء السدود (البريم المتصل):</span>
                <span className="font-mono text-amber-300 font-bold">
                  {((stats.primePreference - 1) * 100).toFixed(0)}% خبرة إضافية
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-black/50 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-600 to-emerald-500 rounded-full"
                  style={{ width: `${Math.min(100, (stats.primePreference / 2.5) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-amber-200/80 mb-1">
                <span>تكتيك حبس ربع بيت الخصم:</span>
                <span className="font-mono text-amber-300 font-bold">
                  {((stats.lockdownPreference - 1) * 100).toFixed(0)}% خبرة إضافية
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-black/50 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-600 to-emerald-500 rounded-full"
                  style={{ width: `${Math.min(100, (stats.lockdownPreference / 2.5) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-amber-200/80 mb-1">
                <span>سرعة تحريك القشاط الأول:</span>
                <span className="font-mono text-amber-300 font-bold">
                  {((stats.rushLeadPreference - 1) * 100).toFixed(0)}% خبرة إضافية
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-black/50 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-600 to-emerald-500 rounded-full"
                  style={{ width: `${Math.min(100, (stats.rushLeadPreference / 2.5) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Action note */}
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-950/40 border border-amber-600/30 text-xs text-amber-200/80 mb-4">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              كل نقلة تلعبها أو تفوز بها تُسجل في ذاكرة المتصفح وتجعل الكمبيوتر أكثر دهاءً وذكاءً.
            </span>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-[#4d2d18]/60">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/70 hover:bg-red-900 border border-red-700/60 text-xs text-red-200 cursor-pointer transition-colors"
              title="تصفير خبرة الكمبيوتر والبدء من جديد"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة ضبط الذاكرة</span>
            </button>

            <button
              onClick={onClose}
              className="px-5 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-600 text-white font-bold text-xs cursor-pointer transition-all"
            >
              إغلاق
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
