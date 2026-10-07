import React, { useRef } from 'react';
import { BoardTheme, Player } from '../types/tawla';
import { THEMES } from '../utils/themes';

interface PointProps {
  physicalIndex: number;
  whiteCount: number;
  blackCount: number;
  pinnedPlayer?: Player | null;
  isTop: boolean;
  isHomeWhite: boolean;
  isHomeBlack: boolean;
  isSelected: boolean;
  isValidTarget: boolean;
  isCombinedTarget: boolean;
  singleDieLabel?: string | null;
  combinedDieLabel?: string | null;
  isHinted: boolean;
  isClickable: boolean;
  onClick: () => void;
  onDoubleClick?: () => void;
  theme: BoardTheme;
}

export const Point: React.FC<PointProps> = ({
  physicalIndex,
  whiteCount,
  blackCount,
  pinnedPlayer,
  isTop,
  isSelected,
  isValidTarget,
  isCombinedTarget,
  singleDieLabel,
  combinedDieLabel,
  isHinted,
  onClick,
  onDoubleClick,
  theme,
}) => {
  const count = whiteCount || blackCount;
  const player: Player | null = whiteCount > 0 ? 0 : blackCount > 0 ? 1 : null;
  const isEven = physicalIndex % 2 === 0;

  const currentTheme = THEMES[theme] || THEMES.arabesque;

  // Max visible checkers stacked before showing a prominent count badge
  const MAX_VISIBLE = 5;
  const visibleCount = Math.min(count, MAX_VISIBLE);

  const isStartPoint = physicalIndex === 0 || physicalIndex === 23;

  // Double tap handler for touch devices and rapid clicks
  const lastTapRef = useRef<number>(0);
  const handleClick = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 350) {
      if (onDoubleClick) {
        onDoubleClick();
        lastTapRef.current = 0;
        return;
      }
    }
    lastTapRef.current = now;
    onClick();
  };

  return (
    <div
      onClick={handleClick}
      onDoubleClick={(e) => {
        if (onDoubleClick) {
          e.stopPropagation();
          onDoubleClick();
        }
      }}
      className={`relative w-full h-48 sm:h-56 md:h-64 lg:h-72 flex flex-col items-center select-none cursor-pointer transition-all duration-150 ${
        isTop ? 'justify-start' : 'justify-end'
      } ${
        isSelected
          ? 'border-2 border-white shadow-[0_0_14px_rgba(255,255,255,0.85)] z-20'
          : isCombinedTarget
          ? 'border-2 border-cyan-400 bg-cyan-400/10 shadow-[0_0_14px_rgba(34,211,238,0.75)] z-20'
          : isValidTarget
          ? 'border-2 border-yellow-400 bg-yellow-400/10 shadow-[0_0_14px_rgba(250,204,21,0.75)] z-20'
          : 'border-2 border-transparent'
      }`}
      style={{
        minWidth: 0,
        flexShrink: 0,
        flexGrow: 1,
      }}
    >
      {/* Authentic Backgammon Wood Triangle */}
      <div
        className={`absolute inset-x-0.5 pointer-events-none transition-all duration-150 ${
          isTop ? 'top-0 h-[84%]' : 'bottom-0 h-[84%]'
        } ${isEven ? currentTheme.pointEven : currentTheme.pointOdd} ${
          isSelected
            ? '!brightness-110'
            : isCombinedTarget
            ? '!brightness-120'
            : isValidTarget
            ? '!brightness-115'
            : ''
        }`}
        style={{
          clipPath: isTop
            ? 'polygon(0% 0%, 100% 0%, 50% 100%)' // Flat base at top rim, sharp tip aiming down
            : 'polygon(50% 0%, 0% 100%, 100% 100%)', // Flat base at bottom rim, sharp tip aiming up
        }}
      />

      {/* Start Point Badge only */}
      {isStartPoint && count > 0 && (
        <div
          className={`absolute z-10 flex items-center pointer-events-none px-1 ${
            isTop ? 'top-1' : 'bottom-1'
          }`}
        >
          <span className={`text-[8px] sm:text-[9px] px-1 rounded font-black shadow border ${currentTheme.accentBadge}`}>
            البداية
          </span>
        </div>
      )}

      {/* COMBINED SUM LABEL AT TRIANGLE TIP: exactly like screenshot (e.g. 4+6=10 in cyan box) */}
      {isCombinedTarget && combinedDieLabel && (
        <div
          className={`absolute z-30 pointer-events-none flex items-center justify-center ${
            isTop ? 'bottom-1 sm:bottom-2' : 'top-1 sm:top-2'
          }`}
        >
          <span className="font-bold text-[11px] sm:text-xs text-white bg-cyan-950/85 px-1.5 py-0.5 rounded border border-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.7)] tracking-wider">
            {combinedDieLabel}
          </span>
        </div>
      )}

      {/* SINGLE DIE NAME LABEL AT TRIANGLE TIP: exactly like screenshot (e.g. جوهار or شيش in yellow box) */}
      {!isCombinedTarget && isValidTarget && singleDieLabel && (
        <div
          className={`absolute z-30 pointer-events-none flex items-center justify-center ${
            isTop ? 'bottom-1 sm:bottom-2' : 'top-1 sm:top-2'
          }`}
        >
          <span className="font-bold text-[11px] sm:text-xs text-yellow-200 bg-amber-950/85 px-1.5 py-0.5 rounded border border-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.7)] tracking-wide font-['Cairo']">
            {singleDieLabel}
          </span>
        </div>
      )}

      {/* AI Move Hint Beacon */}
      {isHinted && (
        <div
          className={`absolute z-20 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-amber-400 ring-4 ring-amber-300/80 shadow-[0_0_16px_rgba(251,191,36,0.95)] animate-ping ${
            isTop ? 'top-12' : 'bottom-12'
          }`}
        />
      )}

      {/* Checkers Stack - Rock-solid natural alignment without jitter */}
      <div
        className={`z-10 flex items-center w-full px-0.5 pointer-events-none ${
          isTop
            ? 'flex-col justify-start pt-1 sm:pt-2 space-y-0.5 sm:space-y-1'
            : 'flex-col-reverse justify-start pb-1 sm:pb-2 space-y-reverse space-y-0.5 sm:space-y-1'
        }`}
      >
        {/* If an opponent checker is pinned underneath (المحبوس في لعبة المحبوسة) */}
        {pinnedPlayer !== null && pinnedPlayer !== undefined && (
          <div
            className={`relative rounded-full flex items-center justify-center select-none ring-2 ring-red-500/80 shadow-md ${
              'w-7 h-7 sm:w-8.5 sm:h-8.5 md:w-9.5 md:h-9.5 lg:w-10.5 lg:h-10.5'
            } ${
              pinnedPlayer === 0
                ? 'bg-gradient-to-b from-[#ffffff] via-[#f7f5f0] to-[#e4dfd3] border border-[#d0c9bc]'
                : 'bg-gradient-to-b from-[#32302e] via-[#1d1b1a] to-[#100f0e] border border-[#44403c]'
            }`}
            title="قشاط محبوس تحت قشاط الخصم!"
          >
            <div className="w-[62%] h-[62%] rounded-full border border-red-500/70 bg-red-950/70 flex items-center justify-center">
              <span className="text-[9px] sm:text-[11px] leading-none">🔒</span>
            </div>
          </div>
        )}

        {Array.from({ length: visibleCount }).map((_, idx) => {
          const isTopChecker = idx === visibleCount - 1;
          const isWhite = player === 0;

          return (
            <div
              key={idx}
              className={`relative rounded-full flex items-center justify-center select-none ${
                // Natural diameter matching the triangle width
                'w-7 h-7 sm:w-8.5 sm:h-8.5 md:w-9.5 md:h-9.5 lg:w-10.5 lg:h-10.5'
              } ${
                isWhite
                  ? // Realistic Bone White / Mother-of-Pearl Ivory Checker from photo
                    'bg-gradient-to-b from-[#ffffff] via-[#f7f5f0] to-[#e4dfd3] border border-[#d0c9bc] shadow-[0_3px_5px_rgba(0,0,0,0.45),inset_0_1px_1px_rgba(255,255,255,0.95)]'
                  : // Realistic Polished Jet Black Ebony Checker from photo
                    'bg-gradient-to-b from-[#32302e] via-[#1d1b1a] to-[#100f0e] border border-[#44403c] shadow-[0_3px_5px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.2)]'
              }`}
            >
              {/* Authentic concentric sunken central cup (الحفرة الدائرية المركزية لقشاط الطاولة) */}
              <div
                className={`w-[62%] h-[62%] rounded-full border flex items-center justify-center ${
                  isWhite
                    ? 'border-[#ccc5b8] bg-gradient-to-b from-[#ded9cd] via-[#eae6dd] to-[#f4f2ec] shadow-[inset_0_2px_4px_rgba(0,0,0,0.28),0_1px_0_rgba(255,255,255,0.9)]'
                    : 'border-[#262422] bg-gradient-to-b from-[#121110] via-[#1a1918] to-[#252322] shadow-[inset_0_2px_4px_rgba(0,0,0,0.85),0_1px_0_rgba(255,255,255,0.12)]'
                }`}
              >
                {/* Number badge on top checker showing total stack count if > 1 */}
                {isTopChecker && count > 1 && (
                  <span
                    className={`font-black text-[11px] sm:text-xs font-sans tracking-tight ${
                      isWhite ? 'text-[#3d2e1e]' : 'text-amber-100'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
