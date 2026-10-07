import React from 'react';
import { BoardState31, BoardTheme, CombinedMove, GamePhase, Move, Player } from '../types/tawla';
import { physicalToTrack } from '../utils/rules31';
import { DIE_NAMES } from '../utils/diceNames';
import { Point } from './Point';
import { InBoardDiceCanvas } from './InBoardDiceCanvas';
import {
  ArrowDownToLine,
  Dices,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { THEMES } from '../utils/themes';

const InlaidRosette: React.FC = () => (
  <div className="relative w-9 h-9 sm:w-12 sm:h-12 flex items-center justify-center opacity-35 select-none pointer-events-none">
    <svg viewBox="0 0 100 100" className="w-full h-full">
      {/* Outer 8-pointed star in carved wood */}
      <polygon
        points="50,4 62,38 96,50 62,62 50,96 38,62 4,50 38,38"
        fill="#cfa875"
        stroke="#422110"
        strokeWidth="1.5"
      />
      {/* Secondary Crossed Diamond Star in deep walnut */}
      <polygon
        points="50,15 74,26 85,50 74,74 50,85 26,74 15,50 26,26"
        fill="#1f0c05"
        stroke="#b88f58"
        strokeWidth="1"
      />
      {/* Center Marquetry Inlay */}
      <circle cx="50" cy="50" r="14" fill="#2d1408" stroke="#caa06d" strokeWidth="1.2" />
      <polygon
        points="50,40 53,47 60,50 53,53 50,60 47,53 40,50 47,47"
        fill="#d4af37"
      />
      <circle cx="50" cy="50" r="3" fill="#e8cfad" />
    </svg>
  </div>
);

interface BoardProps {
  state: BoardState31;
  turn: Player;
  selectedTrackIndex: number | null;
  selectedDie?: number | null;
  hintedTrackIndex: number | null;
  legalMoves: Move[];
  combinedMoves: CombinedMove[];
  theme: BoardTheme;
  pipCounts: [number, number];
  canUndo: boolean;
  onUndoMove: () => void;
  onRequestHint: () => void;
  onOpenThemeModal?: () => void;
  onSelectTrackPoint: (trackIndex: number) => void;
  onExecuteMove: (move: Move) => void;
  onExecuteCombinedMove: (combinedMove: CombinedMove) => void;
  isAiTurn: boolean;
  isSpectator?: boolean;
  // In-Board Dice Throw Props
  phase?: GamePhase;
  roll?: [number, number] | null;
  initialRoll?: [number, number] | null;
  initialRollStep?: 'white' | 'black' | 'done';
  initialWhiteDie?: number | null;
  initialBlackDie?: number | null;
  remainingDice?: number[];
  isRolling?: boolean;
  onRoll?: () => void;
  onRollComplete?: (result: [number, number]) => void;
  onSelectDie?: (die: number | null) => void;
  isCompletelyBlocked?: boolean;
  sweetPhrase?: string | null;
  diceStyle?: string;
}

export const Board: React.FC<BoardProps> = ({
  state,
  turn,
  selectedTrackIndex,
  selectedDie = null,
  hintedTrackIndex,
  legalMoves,
  combinedMoves,
  theme,
  pipCounts,
  canUndo,
  onUndoMove,
  onRequestHint,
  onOpenThemeModal,
  onSelectTrackPoint,
  onExecuteMove,
  onExecuteCombinedMove,
  isAiTurn,
  isSpectator = false,
  phase,
  roll = null,
  initialRoll = null,
  initialRollStep = 'white',
  initialWhiteDie = null,
  initialBlackDie = null,
  remainingDice = [],
  isRolling = false,
  onRoll,
  onRollComplete,
  onSelectDie,
  isCompletelyBlocked = false,
  sweetPhrase = null,
  diceStyle = 'ivory',
}) => {
  const currentTheme = THEMES[theme] || THEMES.arabesque;

  // Check if bear-off move is available for currently selected point
  const bearOffMoves =
    selectedTrackIndex !== null
      ? legalMoves.filter(
          (m) =>
            m.from === selectedTrackIndex &&
            m.to >= 24 &&
            (selectedDie === null || m.die === selectedDie)
        )
      : [];

  const handlePointClick = (physicalIndex: number) => {
    if (isAiTurn || isSpectator) return;

    const trackIndex = physicalToTrack(turn, physicalIndex);

    // If a checker is already selected, check if this clicked point is a valid legal target
    if (selectedTrackIndex !== null) {
      // 1. Check if it's a combined move destination (only when no specific single die is chosen)
      if (selectedDie === null) {
        const targetCombined = combinedMoves.find(
          (cm) => cm.from === selectedTrackIndex && cm.to === trackIndex
        );
        if (targetCombined) {
          onExecuteCombinedMove(targetCombined);
          return;
        }
      }

      // 2. Check if it's a single move destination matching selected die (if any)
      const targetMove = legalMoves.find(
        (m) =>
          m.from === selectedTrackIndex &&
          m.to === trackIndex &&
          (selectedDie === null || m.die === selectedDie)
      );
      if (targetMove) {
        onExecuteMove(targetMove);
        return;
      }
    }

    // Select this point if it has current player's checkers and has legal moves
    const hasCheckers = state.c[turn][trackIndex] > 0;
    const hasLegalMovesFromHere = legalMoves.some(
      (m) => m.from === trackIndex && (selectedDie === null || m.die === selectedDie)
    );

    if (hasCheckers && hasLegalMovesFromHere) {
      onSelectTrackPoint(trackIndex);
    } else if (selectedTrackIndex !== null) {
      onSelectTrackPoint(-1);
    }
  };

  // Double Click / Double Tap on a checker in home quadrant to bear it off directly! (التعديل رقم ١)
  const handlePointDoubleClick = (physicalIndex: number) => {
    if (isAiTurn || isSpectator) return;
    const trackIndex = physicalToTrack(turn, physicalIndex);
    const directBearOff = legalMoves.find(
      (m) => m.from === trackIndex && m.to >= 24
    );
    if (directBearOff) {
      onExecuteMove(directBearOff);
    }
  };

  const handleBearOffClick = () => {
    if (bearOffMoves.length > 0) {
      onExecuteMove(bearOffMoves[0]);
    }
  };

  // Top Row: Physical 11 down to 0
  const topLeftIndices = [11, 10, 9, 8, 7, 6];
  const topRightIndices = [5, 4, 3, 2, 1, 0];

  // Bottom Row: Physical 12 to 23
  const bottomLeftIndices = [12, 13, 14, 15, 16, 17];
  const bottomRightIndices = [18, 19, 20, 21, 22, 23];

  const renderPoint = (physicalIndex: number, isTop: boolean) => {
    const whiteTrack = physicalToTrack(0, physicalIndex);
    const blackTrack = physicalToTrack(1, physicalIndex);

    const whiteCount = state.c[0][whiteTrack];
    const blackCount = state.c[1][blackTrack];

    // Check if an opponent checker is pinned underneath in Mahbousa (المحبوسة)
    let pinnedPlayer: Player | null = null;
    const pinnedState = (state as any).pinned;
    if (pinnedState) {
      if (pinnedState[0] && pinnedState[0][whiteTrack] > 0) pinnedPlayer = 0;
      else if (pinnedState[1] && pinnedState[1][blackTrack] > 0) pinnedPlayer = 1;
    }

    const currentTrackIndex = physicalToTrack(turn, physicalIndex);
    const isSelected = selectedTrackIndex === currentTrackIndex;
    const isHinted = hintedTrackIndex === currentTrackIndex;

    // Filter legal moves based on selected die if one is specifically selected
    const activeLegalMoves =
      selectedDie !== null
        ? legalMoves.filter((m) => m.die === selectedDie)
        : legalMoves;

    // Single move targeting this point from the selected checker
    const singleMove =
      selectedTrackIndex !== null
        ? activeLegalMoves.find(
            (m) => m.from === selectedTrackIndex && m.to === currentTrackIndex
          ) || null
        : null;

    // Combined move targeting this point (only when no specific single die is chosen)
    const combinedMove =
      selectedTrackIndex !== null && selectedDie === null
        ? combinedMoves.find(
            (cm) => cm.from === selectedTrackIndex && cm.to === currentTrackIndex
          ) || null
        : null;

    const isCombinedTarget = Boolean(combinedMove);
    const isValidTarget = Boolean(singleMove);

    const singleDieLabel = singleMove ? DIE_NAMES[singleMove.die] || `${singleMove.die}` : null;
    const combinedDieLabel = combinedMove ? `${combinedMove.dice[0]}+${combinedMove.dice[1]}=${combinedMove.sum}` : null;

    const isClickable =
      !isSpectator &&
      state.c[turn][currentTrackIndex] > 0 &&
      legalMoves.some((m) => m.from === currentTrackIndex && (selectedDie === null || m.die === selectedDie));

    const isHomeWhite = physicalIndex >= 18;
    const isHomeBlack = physicalIndex <= 5;

    return (
      <Point
        key={physicalIndex}
        physicalIndex={physicalIndex}
        whiteCount={whiteCount}
        blackCount={blackCount}
        pinnedPlayer={pinnedPlayer}
        isTop={isTop}
        isHomeWhite={isHomeWhite}
        isHomeBlack={isHomeBlack}
        isSelected={isSelected}
        isValidTarget={isValidTarget}
        isCombinedTarget={isCombinedTarget}
        singleDieLabel={singleDieLabel}
        combinedDieLabel={combinedDieLabel}
        isHinted={isHinted}
        isClickable={isClickable}
        onClick={() => handlePointClick(physicalIndex)}
        onDoubleClick={() => handlePointDoubleClick(physicalIndex)}
        theme={theme}
      />
    );
  };

  return (
    <div className="w-full max-w-[1100px] mx-auto p-1 sm:p-2 flex flex-col items-center select-none">
      {/* Board Upper Toolbar: Pip Count, Borne-Off Summary & Actions */}
      <div className="w-full flex items-center justify-between px-3 sm:px-5 py-2 mb-2 bg-[#201007]/90 rounded-2xl border border-[#4d2a15] text-xs sm:text-sm font-semibold shadow-md">
        {/* Borne-off Checkers & Pip Counts */}
        <div className="flex items-center gap-4 sm:gap-7 text-amber-100">
          {/* White Status */}
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-b from-[#ffffff] via-[#f7f5f0] to-[#e4dfd3] border border-[#d0c9bc] shadow-sm" />
            <span className="font-['Cairo']">الأبيض:</span>
            <span className="font-mono text-amber-200" dir="ltr">
              {state.o[0]} / 15
            </span>
            <span className="text-[10px] text-amber-200/50" dir="ltr">({pipCounts[0]} مسافة)</span>
          </div>

          <div className="w-px h-4 bg-amber-700/40" />

          {/* Black Status */}
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-gradient-to-b from-[#32302e] via-[#1d1b1a] to-[#100f0e] border border-[#44403c] shadow-sm" />
            <span className="font-['Cairo']">الأسود:</span>
            <span className="font-mono text-amber-200" dir="ltr">
              {state.o[1]} / 15
            </span>
            <span className="text-[10px] text-amber-200/50" dir="ltr">({pipCounts[1]} مسافة)</span>
          </div>
        </div>

        {/* Turn Action Controls (Bear-off / Undo / Hint) */}
        <div className="flex items-center gap-2">
          {/* Active Bear Off Button if move is ready */}
          {bearOffMoves.length > 0 && !isAiTurn && !isSpectator && (
            <button
              onClick={handleBearOffClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-black shadow-lg cursor-pointer transition-all active:scale-95 animate-bounce"
              title="أو يمكنك الضغط مرتين مباشرة على القشاط للمه"
            >
              <ArrowDownToLine className="w-4 h-4" />
              <span>لُمّ القشاط</span>
            </button>
          )}

          {/* Undo Button */}
          {canUndo && !isAiTurn && !isSpectator && (
            <button
              onClick={onUndoMove}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-600 text-amber-50 text-xs sm:text-sm font-black border border-amber-400/60 shadow-lg cursor-pointer transition-all active:scale-95"
              title="تراجع عن النقلة في هذا الدور"
            >
              <RotateCcw className="w-4 h-4" />
              <span>تراجع</span>
            </button>
          )}

          {/* Hint Button */}
          {!isAiTurn && !isSpectator && legalMoves.length > 0 && (
            <button
              onClick={onRequestHint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#381f10] hover:bg-[#4d2c18] text-amber-200 text-xs sm:text-sm font-semibold border border-[#6b3e21] shadow-sm cursor-pointer transition-all active:scale-95"
              title="اقتراح أفضل نقلة"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">اقتراح</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Luxury Wooden Board Case */}
      <div
        className={`relative w-full bg-gradient-to-b ${currentTheme.boardOuterCase} p-3 sm:p-5 rounded-2xl sm:rounded-3xl border-4 sm:border-8 ${currentTheme.boardBorder} shadow-[0_25px_65px_rgba(0,0,0,0.95)]`}
        dir="ltr"
      >
        {/* Four Authentic Antique Brass Corner Brackets */}
        <div className="absolute top-1.5 left-1.5 w-4 h-4 sm:w-6 sm:h-6 border-t-2 border-l-2 border-[#d4af37]/60 rounded-tl pointer-events-none" />
        <div className="absolute top-1.5 right-1.5 w-4 h-4 sm:w-6 sm:h-6 border-t-2 border-r-2 border-[#d4af37]/60 rounded-tr pointer-events-none" />
        <div className="absolute bottom-1.5 left-1.5 w-4 h-4 sm:w-6 sm:h-6 border-b-2 border-l-2 border-[#d4af37]/60 rounded-bl pointer-events-none" />
        <div className="absolute bottom-1.5 right-1.5 w-4 h-4 sm:w-6 sm:h-6 border-b-2 border-r-2 border-[#d4af37]/60 rounded-br pointer-events-none" />

        {/* Dark wooden inner bevel frame */}
        <div className="relative flex flex-row rounded-xl overflow-hidden border-2 sm:border-4 border-[#240e06] shadow-[inset_0_4px_16px_rgba(0,0,0,0.8)]">
          {/* LEFT TRAY */}
          <div
            className={`flex-1 flex flex-col justify-between bg-gradient-to-b ${currentTheme.innerTrays} shadow-inner relative`}
          >
            {/* Top 6 Points (11..6) */}
            <div className="grid grid-cols-6 w-full">
              {topLeftIndices.map((i) => renderPoint(i, true))}
            </div>

            {/* Center Open Rolling Alley on Warm Walnut Wood with Inlaid Rosette */}
            <div className="h-16 sm:h-24 flex flex-col items-center justify-center pointer-events-none my-0.5">
              <InlaidRosette />
              <span className={`text-[10px] sm:text-xs font-bold tracking-widest ${currentTheme.alleyText} uppercase font-['Cairo'] mt-0.5`}>
                البيت الخارجي
              </span>
            </div>

            {/* Bottom 6 Points (12..17) */}
            <div className="grid grid-cols-6 w-full">
              {bottomLeftIndices.map((i) => renderPoint(i, false))}
            </div>
          </div>

          {/* CENTER WOODEN FOLDING SPINE WITH TWO AUTHENTIC BRASS HINGES */}
          <div className="relative w-7 sm:w-11 bg-gradient-to-r from-[#291208] via-[#431f0f] to-[#291208] border-x border-[#1c0b04] flex flex-col items-center justify-between py-6 sm:py-8 shadow-2xl z-20">
            {/* Top Brass Hinge */}
            <div className="w-5 sm:w-7 h-10 sm:h-14 rounded bg-gradient-to-r from-[#b38e3e] via-[#e2bd66] to-[#a88235] border border-[#6b501d] shadow-[0_3px_6px_rgba(0,0,0,0.6)] flex flex-col items-center justify-between py-1.5">
              <div className="flex items-center justify-between w-full px-1">
                <div className="w-1.5 h-1.5 rounded-full bg-[#4a3610] shadow-inner" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#4a3610] shadow-inner" />
              </div>
              <div className="w-1 h-3 sm:h-5 bg-[#ffe082] rounded-full shadow-sm" />
              <div className="flex items-center justify-between w-full px-1">
                <div className="w-1.5 h-1.5 rounded-full bg-[#4a3610] shadow-inner" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#4a3610] shadow-inner" />
              </div>
            </div>

            {/* Bottom Brass Hinge */}
            <div className="w-5 sm:w-7 h-10 sm:h-14 rounded bg-gradient-to-r from-[#b38e3e] via-[#e2bd66] to-[#a88235] border border-[#6b501d] shadow-[0_3px_6px_rgba(0,0,0,0.6)] flex flex-col items-center justify-between py-1.5">
              <div className="flex items-center justify-between w-full px-1">
                <div className="w-1.5 h-1.5 rounded-full bg-[#4a3610] shadow-inner" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#4a3610] shadow-inner" />
              </div>
              <div className="w-1 h-3 sm:h-5 bg-[#ffe082] rounded-full shadow-sm" />
              <div className="flex items-center justify-between w-full px-1">
                <div className="w-1.5 h-1.5 rounded-full bg-[#4a3610] shadow-inner" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#4a3610] shadow-inner" />
              </div>
            </div>
          </div>

          {/* RIGHT TRAY */}
          <div
            className={`flex-1 flex flex-col justify-between bg-gradient-to-b ${currentTheme.innerTrays} shadow-inner relative`}
          >
            {/* Top 6 Points (5..0) */}
            <div className="grid grid-cols-6 w-full">
              {topRightIndices.map((i) => renderPoint(i, true))}
            </div>

            {/* Center Open Rolling Alley on Warm Walnut Wood with Inlaid Rosette */}
            <div className="h-16 sm:h-24 flex flex-col items-center justify-center pointer-events-none my-0.5">
              <InlaidRosette />
              <span className={`text-[10px] sm:text-xs font-bold tracking-widest ${currentTheme.alleyText} uppercase font-['Cairo'] mt-0.5`}>
                البيت الداخلي
              </span>
            </div>

            {/* Bottom 6 Points (18..23) */}
            <div className="grid grid-cols-6 w-full">
              {bottomRightIndices.map((i) => renderPoint(i, false))}
            </div>
          </div>

          {/* Real-time In-Board Physics Dice Rolling Simulation */}
          {phase && (
            <InBoardDiceCanvas
              phase={phase}
              turn={turn}
              roll={roll}
              initialRoll={initialRoll}
              initialRollStep={initialRollStep}
              initialWhiteDie={initialWhiteDie}
              initialBlackDie={initialBlackDie}
              remainingDice={remainingDice}
              isRolling={Boolean(isRolling)}
              isAiTurn={isAiTurn}
              isSpectator={isSpectator}
              selectedDie={selectedDie}
              onSelectDie={onSelectDie}
              onRollComplete={onRollComplete || (() => {})}
              diceStyle={diceStyle}
            />
          )}
        </div>
      </div>
    </div>
  );
};
