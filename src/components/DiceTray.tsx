import React from 'react';
import { motion } from 'framer-motion';
import { Dices, Eye, Sparkles } from 'lucide-react';
import { getDiceCallName, PLAYER_NAMES } from '../utils/diceNames';
import { GamePhase, Player } from '../types/tawla';
import { toArabicDigits } from '../utils/rules31';

interface DiceTrayProps {
  phase: GamePhase;
  turn: Player;
  roll: [number, number] | null;
  initialRoll: [number, number] | null;
  sweetPhrase: string | null;
  remainingDice: number[];
  isRolling: boolean;
  onRoll: () => void;
  isAiTurn: boolean;
  isCompletelyBlocked?: boolean;
  isSpectator?: boolean;
  selectedDie?: number | null;
  onSelectDie?: (die: number | null) => void;
}

export const DiceTray: React.FC<DiceTrayProps> = ({
  phase,
  turn,
  roll,
  initialRoll,
  sweetPhrase,
  remainingDice,
  isRolling,
  onRoll,
  isAiTurn,
  isCompletelyBlocked = false,
  isSpectator = false,
}) => {
  const isInitial = phase === 'initialRoll';
  const isDoubles = !isInitial && roll && roll[0] === roll[1];
  const rollSum = roll ? (isDoubles ? roll[0] * 4 : roll[0] + roll[1]) : 0;
  const diceCallName = roll
    ? isDoubles
      ? `${getDiceCallName(roll[0], roll[1])} — المجموع: ${toArabicDigits(rollSum)} (٤ نقلات × ${toArabicDigits(roll[0])})`
      : `${getDiceCallName(roll[0], roll[1])} — المجموع: ${toArabicDigits(rollSum)}`
    : initialRoll
    ? `الأبيض ${toArabicDigits(initialRoll[0])} — الأسود ${toArabicDigits(initialRoll[1])}`
    : '';

  return (
    <div className="relative w-full max-w-[950px] mx-auto select-none font-['Cairo'] flex flex-col items-center gap-2">
      {/* Sleek Action / Quick Controls Bar (الزهر يتدحرج بالكامل جوا الطاولة) */}
      <div className="w-full flex items-center justify-between gap-3 px-4 py-2 rounded-2xl bg-[#201007]/90 border border-[#522d17] shadow-xl backdrop-blur-md text-amber-200">
        {/* Status / Dice Call Text */}
        <div className="flex items-center gap-2">
          {sweetPhrase ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 border border-amber-600/50 text-amber-200 font-black text-xs sm:text-sm shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{sweetPhrase}</span>
            </div>
          ) : diceCallName ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/60 text-amber-100 font-extrabold text-xs sm:text-sm shadow-md">
              <span>{diceCallName}</span>
            </div>
          ) : (
            <span className="text-xs sm:text-sm text-[#bca382] font-semibold">
              {phase === 'initialRoll'
                ? 'ارمِ الزهر لتحديد صاحب الرمية الأولى'
                : isSpectator
                ? `بانتظار ${PLAYER_NAMES[turn]} لرمي الزهر...`
                : `دور ${PLAYER_NAMES[turn]} — ارمِ الزهر جوا الطاولة`}
            </span>
          )}
        </div>

        {/* Quick Roll Button */}
        {!isSpectator && (phase === 'initialRoll' || phase === 'turnRoll') && (
          <motion.button
            onClick={onRoll}
            disabled={isRolling || isAiTurn || isCompletelyBlocked}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-5 sm:px-6 py-2 rounded-xl bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-500 text-amber-50 font-black text-xs sm:text-sm border border-amber-400/80 shadow-[0_4px_16px_rgba(180,83,9,0.5)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed font-['Cairo'] transition-all"
          >
            <Dices className={`w-4 h-4 text-amber-200 ${isRolling ? 'animate-spin' : ''}`} />
            <span>
              {isCompletelyBlocked
                ? 'مقفول تماماً'
                : isRolling
                ? 'جاري الرمي...'
                : phase === 'initialRoll'
                ? 'ارمِ الزهر'
                : `ارمِ الزهر (${PLAYER_NAMES[turn]})`}
            </span>
          </motion.button>
        )}

        {/* Spectator Indicator */}
        {isSpectator && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-950/80 border border-blue-500/60 text-blue-200 text-xs font-bold shadow">
            <Eye className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            <span>مشاهدة</span>
          </div>
        )}
      </div>
    </div>
  );
};
