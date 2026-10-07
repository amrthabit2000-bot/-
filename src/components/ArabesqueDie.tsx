import React from 'react';
import { motion } from 'framer-motion';

export interface ArabesqueDieProps {
  value: number;
  isRolling: boolean;
  isUsed?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg';
  rotationSign?: number; // 1 for clockwise, -1 for counter-clockwise
  restAngle?: number; // natural resting angle in degrees (e.g. -8 or +12)
}

/**
 * Handcrafted Arabesque Ivory & Brass Die
 * Authentic luxury backgammon die featuring:
 * - Antique ivory/mother-of-pearl surface with soft 3D bevels
 * - Gilded brass rim with inner hairline chamfer
 * - 4 antique corner brass filigree studs
 * - Inlaid obsidian/jet pips with ruby center pip for Ace (1)
 * - Highly realistic physical toss & tumble bounce trajectory
 */
export const ArabesqueDie: React.FC<ArabesqueDieProps> = ({
  value,
  isRolling,
  isUsed = false,
  isSelected = false,
  onClick,
  title,
  size = 'md',
  rotationSign = 1,
  restAngle = 0,
}) => {
  // Pips on 3x3 grid (0..8)
  const dotPositions: Record<number, number[]> = {
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8],
  };

  const activeDots = dotPositions[value] || [4];
  const isAce = value === 1;

  const sizeClasses =
    size === 'lg'
      ? 'w-12 h-12 sm:w-15 sm:h-15 rounded-xl sm:rounded-2xl'
      : size === 'sm'
      ? 'w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl'
      : 'w-10 h-10 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl';

  const pipContainerSize =
    size === 'lg'
      ? 'w-8 h-8 sm:w-10 sm:h-10'
      : size === 'sm'
      ? 'w-6 h-6 sm:w-8 sm:h-8'
      : 'w-7 h-7 sm:w-9 sm:h-9';

  return (
    <motion.div
      onClick={!isUsed ? onClick : undefined}
      title={title}
      initial={false}
      animate={
        isRolling
          ? {
              // Natural throwing trajectory: coming in with high spin, bouncing, skidding to rest
              y: [-70, 6, -22, 4, -8, 0],
              x: [-25 * rotationSign, 12 * rotationSign, -8 * rotationSign, 4 * rotationSign, -2 * rotationSign, 0],
              rotate: [
                -160 * rotationSign,
                110 * rotationSign,
                -60 * rotationSign,
                35 * rotationSign,
                -15 * rotationSign,
                restAngle,
              ],
              scale: [0.65, 1.25, 0.94, 1.1, 0.98, 1],
              opacity: [0.4, 1, 1, 1, 1, 1],
            }
          : {
              y: 0,
              x: 0,
              rotate: isSelected ? 0 : restAngle,
              scale: isSelected ? 1.1 : 1,
              opacity: 1,
            }
      }
      transition={{
        duration: isRolling ? 0.72 : 0.25,
        ease: isRolling ? [0.22, 1, 0.36, 1] : 'easeOut',
      }}
      className={`relative ${sizeClasses} select-none flex items-center justify-center transition-all ${
        isUsed
          ? 'opacity-30 grayscale scale-90 pointer-events-none cursor-not-allowed'
          : isSelected
          ? 'ring-4 ring-amber-400 shadow-[0_0_24px_rgba(251,191,36,0.95)] cursor-pointer z-30'
          : 'ring-1 ring-[#c89d58]/80 hover:ring-2 hover:ring-amber-300 shadow-[0_8px_20px_rgba(0,0,0,0.7)] cursor-pointer hover:scale-105 active:scale-95'
      } bg-gradient-to-br from-[#fffdf8] via-[#f7edd9] to-[#dfc297] border-2 border-[#b88c4a] shadow-[inset_0_2px_4px_rgba(255,255,255,0.95),inset_0_-2px_4px_rgba(138,90,32,0.4),0_8px_18px_rgba(0,0,0,0.65)]`}
    >
      {/* Decorative Inner Arabesque Chamfer Rim */}
      <div className="absolute inset-[2.5px] rounded-[8px] sm:rounded-[12px] border border-[#b88c4a]/30 pointer-events-none" />

      {/* Four Antique Corner Gold Studs */}
      <div className="absolute top-1 left-1 w-1 h-1 rounded-full bg-[#9e7436]/50 pointer-events-none" />
      <div className="absolute top-1 right-1 w-1 h-1 rounded-full bg-[#9e7436]/50 pointer-events-none" />
      <div className="absolute bottom-1 left-1 w-1 h-1 rounded-full bg-[#9e7436]/50 pointer-events-none" />
      <div className="absolute bottom-1 right-1 w-1 h-1 rounded-full bg-[#9e7436]/50 pointer-events-none" />

      {/* Grid of Pips */}
      <div className={`grid grid-cols-3 grid-rows-3 ${pipContainerSize} p-0.5 gap-0.5 sm:gap-1 pointer-events-none z-10`}>
        {Array.from({ length: 9 }).map((_, i) => {
          const isActive = activeDots.includes(i);
          const isCenterPoint = isAce && i === 4;

          return (
            <div key={i} className="flex items-center justify-center">
              {isActive && (
                <div
                  className={`rounded-full transition-all ${
                    isCenterPoint
                      ? 'w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 bg-gradient-to-br from-[#991b1b] via-[#b91c1c] to-[#7f1d1d] ring-1 ring-amber-400/90 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8),0_1px_2px_rgba(255,255,255,0.5)]'
                      : 'w-2 h-2 sm:w-2.5 sm:h-2.5 bg-gradient-to-br from-[#120a06] via-[#2a170d] to-[#0a0503] ring-[1px] ring-[#b88c4a]/75 shadow-[inset_0_1.5px_2px_rgba(0,0,0,0.9),0_1px_1px_rgba(255,255,255,0.4)]'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};
