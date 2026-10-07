import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dices, Sparkles } from 'lucide-react';
import { ArabesqueDie } from './ArabesqueDie';
import { GamePhase, Player } from '../types/tawla';
import { getDiceCallName, PLAYER_NAMES } from '../utils/diceNames';
import { toArabicDigits } from '../utils/rules31';

interface InBoardDiceAlleyProps {
  trayPlayer: Player; // 0 for Right Tray (White), 1 for Left Tray (Black)
  currentTurn: Player;
  phase: GamePhase;
  roll: [number, number] | null;
  initialRoll: [number, number] | null;
  remainingDice: number[];
  isRolling: boolean;
  onRoll: () => void;
  isAiTurn: boolean;
  isCompletelyBlocked?: boolean;
  isSpectator?: boolean;
  selectedDie?: number | null;
  onSelectDie?: (die: number | null) => void;
  trayTitle: string;
}

export const InBoardDiceAlley: React.FC<InBoardDiceAlleyProps> = ({
  trayPlayer,
  currentTurn,
  phase,
  roll,
  initialRoll,
  remainingDice,
  isRolling,
  onRoll,
  isAiTurn,
  isCompletelyBlocked = false,
  isSpectator = false,
  selectedDie = null,
  onSelectDie,
  trayTitle,
}) => {
  // Rapid Face Cycling while throwing the dice
  const [flickerDice, setFlickerDice] = useState<[number, number]>([6, 5]);

  useEffect(() => {
    if (isRolling) {
      const interval = setInterval(() => {
        setFlickerDice([
          Math.floor(Math.random() * 6) + 1,
          Math.floor(Math.random() * 6) + 1,
        ]);
      }, 65);
      return () => clearInterval(interval);
    }
  }, [isRolling]);

  const isActiveTray = currentTurn === trayPlayer;
  const isInitial = phase === 'initialRoll';
  const isDoubles = !isInitial && roll && roll[0] === roll[1];

  // In initial roll, each player rolls on their tray:
  // Tray 0 (Right) = White, Tray 1 (Left) = Black
  if (isInitial) {
    const val = initialRoll ? initialRoll[trayPlayer] : null;
    const displayVal = isRolling ? flickerDice[trayPlayer] : val;

    return (
      <div className="relative h-18 sm:h-24 w-full flex flex-col items-center justify-center select-none py-1">
        {displayVal !== null ? (
          <div className="flex flex-col items-center gap-1 z-20">
            <span className="text-[10px] sm:text-xs font-bold text-amber-200/90 font-['Cairo']">
              {trayPlayer === 0 ? 'الأبيض' : 'الأسود'}:{' '}
              <span className="text-amber-400 font-mono text-xs sm:text-sm font-black">
                {toArabicDigits(displayVal)}
              </span>
            </span>
            <ArabesqueDie
              value={displayVal}
              isRolling={isRolling}
              size="md"
              rotationSign={trayPlayer === 0 ? 1 : -1}
              restAngle={trayPlayer === 0 ? 8 : -9}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center opacity-40">
            <span className="text-[10px] font-bold text-amber-200/70 uppercase font-['Cairo'] tracking-widest">
              {trayTitle}
            </span>
          </div>
        )}
      </div>
    );
  }

  // If this tray does NOT belong to the active player, show subtle background text
  if (!isActiveTray) {
    return (
      <div className="relative h-18 sm:h-24 w-full flex flex-col items-center justify-center select-none opacity-30 pointer-events-none">
        <span className="text-[10px] sm:text-xs font-bold text-amber-200/60 uppercase font-['Cairo'] tracking-widest">
          {trayTitle}
        </span>
      </div>
    );
  }

  // --- Active Player's Tray ---

  // 1. Ready to Roll Phase (Button inside the board)
  if (phase === 'turnRoll') {
    return (
      <div className="relative h-18 sm:h-24 w-full flex flex-col items-center justify-center select-none z-20 px-2">
        {!isSpectator && !isAiTurn ? (
          <motion.button
            onClick={onRoll}
            disabled={isRolling || isCompletelyBlocked}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center gap-2 px-4 sm:px-6 py-2 rounded-xl text-amber-50 font-black text-xs sm:text-sm font-['Cairo'] border-2 shadow-[0_8px_20px_rgba(0,0,0,0.85)] cursor-pointer transition-all ${
              isCompletelyBlocked
                ? 'bg-stone-800/80 border-stone-600 text-stone-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-500 border-amber-400/80 shadow-[0_0_20px_rgba(217,119,6,0.6)] animate-pulse'
            }`}
          >
            <Dices className={`w-4 h-4 sm:w-5 sm:h-5 text-amber-200 ${isRolling ? 'animate-spin' : ''}`} />
            <span>
              {isRolling
                ? 'جاري الرمي...'
                : isCompletelyBlocked
                ? 'مقفول تماماً — ملوش رمي'
                : `ارمِ الزهر (${PLAYER_NAMES[currentTurn]})`}
            </span>
          </motion.button>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#241208]/90 border border-[#5d3118] text-amber-200/80 text-xs font-bold font-['Cairo']">
            <Dices className={`w-4 h-4 ${isRolling ? 'animate-spin text-amber-400' : ''}`} />
            <span>{isRolling ? 'جاري رمي الزهر...' : isAiTurn ? 'الكمبيوتر يرمي الزهر...' : `بانتظار ${PLAYER_NAMES[currentTurn]}`}</span>
          </div>
        )}
      </div>
    );
  }

  // 2. Dice Resting on the Board (Playing Phase)
  if (roll) {
    const totalMovesCount = isDoubles ? 4 : 2;
    const usedMovesCount = totalMovesCount - remainingDice.length;
    const rollSum = isDoubles ? roll[0] * 4 : roll[0] + roll[1];

    const diceCallText = isDoubles
      ? `${getDiceCallName(roll[0], roll[1])} — ${toArabicDigits(roll[0])}×٤ = ${toArabicDigits(rollSum)}`
      : `${getDiceCallName(roll[0], roll[1])} (${toArabicDigits(roll[0])}-${toArabicDigits(roll[1])}) — مجموع ${toArabicDigits(rollSum)}`;

    return (
      <div className="relative h-18 sm:h-24 w-full flex flex-col items-center justify-center select-none z-20 py-1">
        {/* Floating Arabesque Plaque with Numbers and Traditional Callout */}
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#180a04]/95 border border-amber-500/70 text-amber-100 text-[10px] sm:text-xs font-extrabold shadow-lg backdrop-blur-md mb-1"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span className="font-['Cairo']">{diceCallText}</span>
          </motion.div>
        </AnimatePresence>

        {/* The Dice Sitting on the Board */}
        {isDoubles ? (
          // 4 Dice for Doubles (بَفّة)
          <div className="flex items-center gap-2 sm:gap-2.5">
            {[0, 1, 2, 3].map((idx) => {
              const isUsed = idx < usedMovesCount;
              const isDieSelected = !isUsed && selectedDie === roll[0];
              const displayVal = isRolling ? flickerDice[idx % 2] : roll[0];
              const angles = [-7, 9, -5, 11];

              return (
                <ArabesqueDie
                  key={idx}
                  value={displayVal}
                  isRolling={isRolling}
                  isUsed={isUsed}
                  isSelected={isDieSelected}
                  onClick={() => {
                    if (!isUsed && !isSpectator && !isAiTurn && onSelectDie) {
                      onSelectDie(isDieSelected ? null : roll[0]);
                    }
                  }}
                  title={!isUsed ? `اضغط لتحديد الزهرة ${toArabicDigits(roll[0])}` : undefined}
                  size="sm"
                  rotationSign={idx % 2 === 0 ? 1 : -1}
                  restAngle={angles[idx]}
                />
              );
            })}
          </div>
        ) : (
          // 2 Regular Dice
          <div className="flex items-center gap-3 sm:gap-4">
            {[0, 1].map((idx) => {
              const val = roll[idx];
              const displayVal = isRolling ? flickerDice[idx] : val;
              const countInRemaining = remainingDice.filter((d) => d === val).length;
              const countInRoll = roll.filter((d) => d === val).length;
              const isUsed = idx === 0 ? countInRemaining < countInRoll : countInRemaining === 0;
              const isDieSelected = !isUsed && selectedDie === val;
              const restAngle = idx === 0 ? -9 : 12;

              return (
                <ArabesqueDie
                  key={idx}
                  value={displayVal}
                  isRolling={isRolling}
                  isUsed={isUsed}
                  isSelected={isDieSelected}
                  onClick={() => {
                    if (!isUsed && !isSpectator && !isAiTurn && onSelectDie) {
                      onSelectDie(isDieSelected ? null : val);
                    }
                  }}
                  title={!isUsed ? `اضغط لتحديد الزهرة ${toArabicDigits(val)}` : undefined}
                  size="md"
                  rotationSign={idx === 0 ? 1 : -1}
                  restAngle={restAngle}
                />
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Fallback empty alley
  return (
    <div className="relative h-18 sm:h-24 w-full flex flex-col items-center justify-center select-none opacity-40">
      <span className="text-[10px] font-bold text-amber-200/70 uppercase font-['Cairo'] tracking-widest">
        {trayTitle}
      </span>
    </div>
  );
};
