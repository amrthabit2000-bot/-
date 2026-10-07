import { BoardState31, GameVariant, Player } from '../types/tawla';
import { BoardStateMahbousa } from './rulesMahbousa';

export interface EquityEvaluation {
  whiteEquity: number; // 0 - 100
  blackEquity: number; // 0 - 100
  evalText: string;
  advantage: 'white' | 'black' | 'even';
  leadPoints: number;
  tacticalTip: string;
  isBlunderWarning?: boolean;
  blunderMessage?: string;
}

/**
 * Calculate Pip Count for a player in Tawla 31 / Mahbousa
 */
export function calculatePipCount(
  state: BoardState31 | BoardStateMahbousa,
  player: Player
): number {
  let pips = 0;
  // Board checkers (track 0 to 23; distance to bear off is 24 - trackIndex)
  for (let track = 0; track < 24; track++) {
    const count = state.c[player][track] || 0;
    if (count > 0) {
      pips += count * (24 - track);
    }
  }

  return pips;
}

/**
 * Calculate Real-time Win Equity & Tactical Evaluation
 * Inspired by GNUbg & Backgammon AI engine evaluations
 */
export function calculateWinEquity(
  state: BoardState31 | BoardStateMahbousa,
  turn: Player,
  variant: GameVariant,
  previousEquity?: number | null
): EquityEvaluation {
  // 1. Immediate Win Check
  if (state.o[0] === 15) {
    return {
      whiteEquity: 100,
      blackEquity: 0,
      evalText: 'الأبيض فاز بالجولة! 🏆',
      advantage: 'white',
      leadPoints: 100,
      tacticalTip: 'انتهاء الجولة بانتصار كامل للأبيض.',
    };
  }
  if (state.o[1] === 15) {
    return {
      whiteEquity: 0,
      blackEquity: 100,
      evalText: 'الأسود فاز بالجولة! 🏆',
      advantage: 'black',
      leadPoints: 100,
      tacticalTip: 'انتهاء الجولة بانتصار كامل للأسود.',
    };
  }

  const whitePips = calculatePipCount(state, 0);
  const blackPips = calculatePipCount(state, 1);
  const whiteBorneOff = state.o[0] || 0;
  const blackBorneOff = state.o[1] || 0;

  // Pip race differential (baseline average pip is ~150)
  const pipDiff = blackPips - whitePips; // positive = White is ahead (fewer pips to travel)
  let rawScore = 50 + (pipDiff / 140) * 35;

  // Borne off bonus (each checker borne off is a huge leap toward 15)
  const borneOffDiff = whiteBorneOff - blackBorneOff;
  rawScore += borneOffDiff * 3.5;

  // Variant Specific Evaluations:
  if (variant === 'mahbousa') {
    const mahbousaState = state as BoardStateMahbousa;
    // Check pinned checkers count
    let whitePinnedCount = 0;
    let blackPinnedCount = 0;

    for (let track = 0; track < 24; track++) {
      if (mahbousaState.pinned) {
        if (mahbousaState.pinned[0]?.[track]) whitePinnedCount++;
        if (mahbousaState.pinned[1]?.[track]) blackPinnedCount++;
      }
    }

    // Pinned pieces heavily alter equity in Mahbousa
    rawScore += (blackPinnedCount - whitePinnedCount) * 12;

    // Zero-point Khashab trap vulnerability
    if (mahbousaState.c[1][0] === 1 && (mahbousaState.pinned?.[1]?.[0] || false)) {
      rawScore += 30; // White threatening instant Khashab
    } else if (mahbousaState.c[0][0] === 1 && (mahbousaState.pinned?.[0]?.[0] || false)) {
      rawScore -= 30; // Black threatening instant Khashab
    }
  } else {
    // Tawla 31: Blockade and Prime building in Home Quadrant (tracks 18-23)
    let whiteHomeDoors = 0;
    let blackHomeDoors = 0;

    for (let track = 18; track < 24; track++) {
      if (state.c[0][track] >= 2) whiteHomeDoors++;
      if (state.c[1][track] >= 2) blackHomeDoors++;
    }

    rawScore += (whiteHomeDoors - blackHomeDoors) * 4;
  }

  // Turn momentum bonus (+2.5% to player whose turn it is)
  rawScore += turn === 0 ? 2.5 : -2.5;

  // Clamp equity to [4%, 96%] during live play
  const whiteEquity = Math.min(96, Math.max(4, Math.round(rawScore)));
  const blackEquity = 100 - whiteEquity;

  const leadPoints = Math.abs(whiteEquity - 50) * 2;
  const advantage: 'white' | 'black' | 'even' =
    whiteEquity > 54 ? 'white' : blackEquity > 54 ? 'black' : 'even';

  // Evaluate descriptive text and tactical tips
  let evalText = 'موقف متوازن وسباق تكتيكي متكافئ';
  let tacticalTip = 'التركيز على حماية القواشيط المنفردة وتجميع اللم.';

  if (advantage === 'white') {
    if (whiteEquity >= 80) {
      evalText = 'الأبيض يهيمن باكتساح (+ ' + Math.round(whiteEquity - 50) + '%)';
      tacticalTip = 'الأبيض قريب من حسم الجولة؛ تجنب المغامرات غير المحسوبة.';
    } else if (whiteEquity >= 65) {
      evalText = 'الأبيض متقدم ومسيطر على السباق (+ ' + Math.round(whiteEquity - 50) + '%)';
      tacticalTip = 'استمر في زحف القواشيط لبيت اللم وإغلاق الأبواب.';
    } else {
      evalText = 'أفضلية طفيفة للأبيض (+ ' + Math.round(whiteEquity - 50) + '%)';
      tacticalTip = 'أي رمية دبل قد تقلب موازين السباق لصالح أي طرف.';
    }
  } else if (advantage === 'black') {
    if (blackEquity >= 80) {
      evalText = 'الأسود يهيمن باكتساح (+ ' + Math.round(blackEquity - 50) + '%)';
      tacticalTip = 'الأسود يفرض سيطرته التامة؛ الأبيض بحاجة لرميات دوش سريعة.';
    } else if (blackEquity >= 65) {
      evalText = 'الأسود متقدم ومسيطر على السباق (+ ' + Math.round(blackEquity - 50) + '%)';
      tacticalTip = 'الأسود يتقدم في سباق اللم؛ حاول تعطيل قواشيطه.';
    } else {
      evalText = 'أفضلية طفيفة للأسود (+ ' + Math.round(blackEquity - 50) + '%)';
      tacticalTip = 'المعركة التكتيكية مشتعلة والزهر القادم حاسم.';
    }
  }

  // Blunder detection: Check if equity swung negatively by >= 15% against the player who just moved
  let isBlunderWarning = false;
  let blunderMessage = undefined;

  if (previousEquity !== null && previousEquity !== undefined) {
    const diff = (turn === 0 ? whiteEquity : blackEquity) - previousEquity;
    if (diff <= -15) {
      isBlunderWarning = true;
      blunderMessage = '⚠️ ثغرة تكتيكية: النقلة الأخيرة قللت أفضلية الفوز بمقدار ' + Math.abs(Math.round(diff)) + '%!';
    }
  }

  return {
    whiteEquity,
    blackEquity,
    evalText,
    advantage,
    leadPoints,
    tacticalTip,
    isBlunderWarning,
    blunderMessage,
  };
}
