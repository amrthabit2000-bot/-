import React from 'react';
import { GameLogEntry, Player } from '../types/tawla';
import { computeLuckAnalysis } from '../utils/luckAnalytics';
import { Award, BarChart2, Dices, Sparkles, TrendingUp, X, Zap } from 'lucide-react';

interface LuckAndStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: GameLogEntry[];
  winner?: Player;
}

export const LuckAndStatsModal: React.FC<LuckAndStatsModalProps> = ({
  isOpen,
  onClose,
  logs,
  winner,
}) => {
  if (!isOpen) return null;

  const analysis = computeLuckAnalysis(logs, winner);
  const { white, black, verdictText, verdictSubtitle, luckierPlayer } = analysis;

  const totalFacesWhite = Object.values(white.faceCounts).reduce((a, b) => a + b, 0);
  const totalFacesBlack = Object.values(black.faceCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md font-['Cairo']">
      <div className="relative w-full max-w-xl max-h-[90vh] bg-gradient-to-b from-[#2a140a] via-[#1d0d05] to-[#120602] border-2 border-amber-600/50 rounded-3xl p-4 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.9)] text-[#f5ecd9] flex flex-col overflow-hidden" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#4d2d18] pb-3 mb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 border border-amber-300 flex items-center justify-center shadow-lg text-xl">
              🎲
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-amber-100 flex items-center gap-2">
                <span>تحليل مقياس الحظ مقابل المهارة</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950 border border-amber-500/50 text-amber-300 font-mono">
                  GNUbg Analytics
                </span>
              </h2>
              <p className="text-xs text-amber-200/60">
                إحصائيات عدالة الزهر وتأثير التوفيق العشوائي على نتيجة الجولة
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#3a1d0d] hover:bg-[#522913] text-amber-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-3.5 text-xs sm:text-sm">
          {/* Statistical Verdict Banner */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/80 via-[#3d1e0f] to-amber-950/80 border border-amber-500/50 shadow-md">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-black text-amber-200">{verdictText}</h3>
            </div>
            <p className="text-xs text-amber-100/80 leading-relaxed">{verdictSubtitle}</p>
          </div>

          {/* Quick KPI Meters: White vs Black */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* White Stats Card */}
            <div className="p-3 rounded-2xl bg-[#170a04] border border-[#432311] flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-[#361a0b] pb-1.5 mb-2">
                <span className="font-bold text-amber-100 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#fdfaf2] border border-amber-300 shadow-sm" />
                  <span>الأبيض</span>
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono ${
                  white.luckFactorPercentage > 0
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/40'
                    : 'bg-stone-900 text-stone-300'
                }`}>
                  مؤشر الحظ: {white.luckFactorPercentage > 0 ? `+${white.luckFactorPercentage}%` : `${white.luckFactorPercentage}%`}
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-amber-200/70">
                  <span>عدد الرميات:</span>
                  <strong className="text-amber-100 font-mono">{white.totalRolls}</strong>
                </div>
                <div className="flex justify-between text-amber-200/70">
                  <span>مجموع النرد:</span>
                  <strong className="text-amber-100 font-mono">{white.totalPips} نقطة</strong>
                </div>
                <div className="flex justify-between text-amber-200/70">
                  <span>معدل الرمية:</span>
                  <strong className="text-amber-300 font-mono">{white.avgRollPips} / 12</strong>
                </div>
                <div className="flex justify-between text-amber-200/70">
                  <span>رميات الدبل (دوش/دوبارة):</span>
                  <strong className="text-amber-300 font-mono">{white.doublesCount}</strong>
                </div>
                <div className="flex justify-between text-amber-200/70">
                  <span>تقييم المهارة التكتيكية:</span>
                  <strong className="text-emerald-400 font-mono">{white.skillScore}%</strong>
                </div>
              </div>
            </div>

            {/* Black Stats Card */}
            <div className="p-3 rounded-2xl bg-[#170a04] border border-[#432311] flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-[#361a0b] pb-1.5 mb-2">
                <span className="font-bold text-stone-200 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1b0d06] border border-stone-600 shadow-sm" />
                  <span>الأسود</span>
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono ${
                  black.luckFactorPercentage > 0
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/40'
                    : 'bg-stone-900 text-stone-300'
                }`}>
                  مؤشر الحظ: {black.luckFactorPercentage > 0 ? `+${black.luckFactorPercentage}%` : `${black.luckFactorPercentage}%`}
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-amber-200/70">
                  <span>عدد الرميات:</span>
                  <strong className="text-amber-100 font-mono">{black.totalRolls}</strong>
                </div>
                <div className="flex justify-between text-amber-200/70">
                  <span>مجموع النرد:</span>
                  <strong className="text-amber-100 font-mono">{black.totalPips} نقطة</strong>
                </div>
                <div className="flex justify-between text-amber-200/70">
                  <span>معدل الرمية:</span>
                  <strong className="text-amber-300 font-mono">{black.avgRollPips} / 12</strong>
                </div>
                <div className="flex justify-between text-amber-200/70">
                  <span>رميات الدبل (دوش/دوبارة):</span>
                  <strong className="text-amber-300 font-mono">{black.doublesCount}</strong>
                </div>
                <div className="flex justify-between text-amber-200/70">
                  <span>تقييم المهارة التكتيكية:</span>
                  <strong className="text-emerald-400 font-mono">{black.skillScore}%</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Dice Face Frequency Distribution (1 to 6) */}
          <div className="p-3.5 rounded-2xl bg-[#170a04] border border-[#3b1d0c]">
            <h4 className="text-xs font-bold text-amber-100 mb-2.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-amber-400" />
                <span>توزيع تكرار أرقام النرد (من ١ إلى ٦)</span>
              </span>
              <span className="text-[10px] text-amber-200/60 font-normal">
                (المعدل الطبيعي المتوقع: ١٦.٦% لكل رقم)
              </span>
            </h4>

            <div className="space-y-2 text-xs">
              {[6, 5, 4, 3, 2, 1].map((face) => {
                const wCount = white.faceCounts[face] || 0;
                const bCount = black.faceCounts[face] || 0;
                const maxVal = Math.max(1, ...Object.values(white.faceCounts), ...Object.values(black.faceCounts));

                return (
                  <div key={face} className="flex items-center gap-2">
                    <span className="w-6 font-mono font-bold text-amber-300 text-center">
                      [{face}]
                    </span>

                    {/* Comparative Dual Bar */}
                    <div className="flex-1 flex items-center gap-1">
                      {/* White bar */}
                      <div className="flex-1 flex items-center justify-end">
                        <div
                          style={{ width: `${(wCount / maxVal) * 100}%` }}
                          className="h-2.5 bg-amber-200/90 rounded-l transition-all min-w-[3px]"
                        />
                        <span className="font-mono text-[10px] text-amber-200 mr-1 w-4 text-right">
                          {wCount}
                        </span>
                      </div>

                      <div className="w-[1px] h-3 bg-amber-700/60" />

                      {/* Black bar */}
                      <div className="flex-1 flex items-center justify-start">
                        <span className="font-mono text-[10px] text-stone-300 ml-1 w-4 text-left">
                          {bCount}
                        </span>
                        <div
                          style={{ width: `${(bCount / maxVal) * 100}%` }}
                          className="h-2.5 bg-stone-500 rounded-r transition-all min-w-[3px]"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-center gap-6 mt-3 text-[11px] text-amber-200/70 border-t border-[#361a0b] pt-2">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-2 bg-amber-200 rounded" />
                <span>أرقام الأبيض ({totalFacesWhite} نرد)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-2 bg-stone-500 rounded" />
                <span>أرقام الأسود ({totalFacesBlack} نرد)</span>
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#4d2d18]/60 mt-3 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-amber-700 hover:bg-amber-600 text-white font-bold text-xs cursor-pointer shadow transition-all"
          >
            إغلاق التحليل
          </button>
        </div>
      </div>
    </div>
  );
};
