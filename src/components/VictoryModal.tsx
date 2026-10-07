import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Player } from '../types/tawla';
import { PLAYER_NAMES } from '../utils/diceNames';
import { Award, Trophy, RotateCcw, ArrowRight, Dices, Film } from 'lucide-react';

interface VictoryModalProps {
  isOpen: boolean;
  winner: Player;
  roundPoints: number;
  isMatchWin: boolean;
  score: [number, number];
  onNextRound: () => void;
  onNewMatch: () => void;
  onOpenLuckStats?: () => void;
  onOpenReplay?: () => void;
  onCelebration?: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  winner,
  roundPoints,
  isMatchWin,
  score,
  onNextRound,
  onNewMatch,
  onOpenLuckStats,
  onOpenReplay,
  onCelebration,
}) => {
  // Launch celebratory Confetti whenever the victory modal opens!
  useEffect(() => {
    if (!isOpen) return;

    if (onCelebration) {
      onCelebration();
    }

    // Stage 1: Grand Central Festive Blast
    try {
      confetti({
        particleCount: isMatchWin ? 140 : 80,
        spread: 90,
        origin: { y: 0.55 },
        colors: ['#ffd700', '#f59e0b', '#d97706', '#10b981', '#3b82f6', '#ffffff'],
        zIndex: 99999,
        disableForReducedMotion: true,
      });

      // Stage 2 & 3: Side cannons if full match win
      if (isMatchWin) {
        const t1 = setTimeout(() => {
          confetti({
            particleCount: 60,
            angle: 60,
            spread: 55,
            origin: { x: 0.05, y: 0.65 },
            colors: ['#ffd700', '#f59e0b', '#fffbeb'],
            zIndex: 99999,
          });
          confetti({
            particleCount: 60,
            angle: 120,
            spread: 55,
            origin: { x: 0.95, y: 0.65 },
            colors: ['#ffd700', '#f59e0b', '#fffbeb'],
            zIndex: 99999,
          });
        }, 320);

        const t2 = setTimeout(() => {
          confetti({
            particleCount: 80,
            spread: 100,
            origin: { y: 0.4 },
            colors: ['#ffd700', '#eab308', '#ffffff'],
            zIndex: 99999,
          });
        }, 750);

        return () => {
          clearTimeout(t1);
          clearTimeout(t2);
        };
      }
    } catch {
      // Confetti fails gracefully if canvas not available
    }
  }, [isOpen, isMatchWin]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-['Cairo']">
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#2d180d] via-[#201007] to-[#160a04] border-2 border-amber-500/60 rounded-3xl p-6 sm:p-8 text-center text-amber-100 shadow-[0_0_60px_rgba(245,158,11,0.35)] flex flex-col items-center overflow-hidden">
        {/* Glow halo */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 border-4 border-amber-200 flex items-center justify-center shadow-xl mb-4 animate-bounce">
          {isMatchWin ? (
            <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-[#2d180d]" />
          ) : (
            <Award className="w-10 h-10 sm:w-12 sm:h-12 text-[#2d180d]" />
          )}
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-amber-200 tracking-wide mb-1">
          {isMatchWin
            ? `مبروك! ${PLAYER_NAMES[winner]} فاز بالـ ٣١ 🏆`
            : `${PLAYER_NAMES[winner]} كسب الجولة! 🎉`}
        </h2>

        <p className="text-sm text-amber-200/80 mb-4">
          {roundPoints === 15
            ? `كسب كامل ومارس (١٥ نقطة كاملة)!`
            : `حصل على +${roundPoints} نقطة في هذه الجولة`}
        </p>

        {/* Match Score Summary */}
        <div className="w-full bg-[#180c05] p-3.5 rounded-2xl border border-[#4d2d18] mb-4">
          <div className="text-xs text-amber-400 font-bold mb-1.5">
            مجموع نقاط المباراة (الهدف ٣١):
          </div>
          <div className="flex items-center justify-center gap-6 text-xl sm:text-2xl font-black font-mono">
            <div className="flex flex-col items-center">
              <span className="text-xs text-amber-200 font-sans font-bold">الأبيض</span>
              <span className="text-amber-100">{score[0]}</span>
            </div>
            <span className="text-amber-500/50">-</span>
            <div className="flex flex-col items-center">
              <span className="text-xs text-amber-200 font-sans font-bold">الأسود</span>
              <span className="text-amber-100">{score[1]}</span>
            </div>
          </div>
        </div>

        {/* Secondary Analytics & Replay Links */}
        <div className="flex items-center justify-center gap-2 w-full mb-4">
          {onOpenLuckStats && (
            <button
              onClick={onOpenLuckStats}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-[#281308] hover:bg-[#3d1c0c] border border-amber-700/50 text-amber-300 font-bold text-xs transition-colors cursor-pointer"
            >
              <Dices className="w-3.5 h-3.5 text-amber-400" />
              <span>تحليل الحظ والمهارة 🎲</span>
            </button>
          )}

          {onOpenReplay && (
            <button
              onClick={onOpenReplay}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-[#281308] hover:bg-[#3d1c0c] border border-amber-700/50 text-amber-300 font-bold text-xs transition-colors cursor-pointer"
            >
              <Film className="w-3.5 h-3.5 text-amber-400" />
              <span>إعادة مشاهدة الجولة 🎬</span>
            </button>
          )}
        </div>

        {/* Main Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 w-full justify-center">
          {isMatchWin ? (
            <button
              onClick={onNewMatch}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-[#1a0f08] font-black text-sm sm:text-base shadow-lg cursor-pointer transition-all active:scale-95"
            >
              <RotateCcw className="w-5 h-5" />
              <span>مباراة جديدة</span>
            </button>
          ) : (
            <button
              onClick={onNextRound}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-[#1a0f08] font-black text-sm sm:text-base shadow-lg cursor-pointer transition-all active:scale-95"
            >
              <ArrowRight className="w-5 h-5 rotate-180" />
              <span>الجولة التالية</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
