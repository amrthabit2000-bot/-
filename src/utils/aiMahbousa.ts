import { AIDifficulty, Move, Player } from '../types/tawla';
import {
  applyMoveMahbousa,
  BoardStateMahbousa,
  canBearOffMahbousa,
  getLegalMovesMahbousa,
  hasAnyPinnedChecker,
  isKhashabWin,
} from './rulesMahbousa';

/**
 * Master-Grade State Evaluation specifically for Mahbouseh (المحبوسة):
 * Centers around pinning opponent single checkers (الحبس),
 * preventing Khashab (حبس حجر البداية), and fortifying single checkers!
 */
export function evaluateStateMahbousa(
  state: BoardStateMahbousa,
  player: Player,
  difficulty: AIDifficulty = 'pro'
): number {
  const opponent: Player = player === 0 ? 1 : 0;

  // 1. Instant Khashab Win (حبس حجر بداية الخصم)
  if (isKhashabWin(state, player)) {
    return 500000;
  }
  if (isKhashabWin(state, opponent)) {
    return -500000;
  }

  // 2. Borne-Off Victory
  if (state.o[player] === 15) {
    return 300000 + (15 - state.o[opponent]) * 5000;
  }
  if (state.o[opponent] === 15) {
    return -300000;
  }

  let score = 0;

  // 3. Pinning Opponent Checkers (حبس قواشيط الخصم)
  let opponentPinnedCount = 0;
  for (let k = 0; k < 24; k++) {
    if (state.pinned[opponent][k] > 0) {
      opponentPinnedCount++;
      // Pins in opponent's early quadrant are much more devastating!
      score += 4500 + (24 - k) * 120;
    }
  }

  // 4. Player's Pinned Checkers Penalty (قواشيطك المحبوسة)
  let myPinnedCount = 0;
  for (let k = 0; k < 24; k++) {
    if (state.pinned[player][k] > 0) {
      myPinnedCount++;
      score -= 4500 + (24 - k) * 120;
    }
  }

  // 5. Fortified Points vs Exposed Single Checkers (سد الخانات وتحصينها ومنع التفريط)
  let fortifiedRun = 0;
  let maxFortifiedRun = 0;
  for (let k = 0; k < 24; k++) {
    const myCount = state.c[player][k];
    if (myCount >= 2) {
      // Safe point (محصن)
      score += 750;
      fortifiedRun++;
      if (fortifiedRun > maxFortifiedRun) maxFortifiedRun = fortifiedRun;
    } else {
      fortifiedRun = 0;
      if (myCount === 1) {
        // Single exposed checker (مهدد بالحبس)
        const oppTrack = 23 - k;
        let threatened = false;
        for (let roll = 1; roll <= 6; roll++) {
          const oppSource = oppTrack - roll;
          if (oppSource >= 0 && state.c[opponent][oppSource] > 0) {
            threatened = true;
            break;
          }
        }
        if (threatened) {
          // Severe penalty for exposing checkers to being pinned!
          score -= k === 0 ? 45000 : 9000;
        } else {
          score -= 400;
        }
      }
    }
  }

  // Consecutive fortified doors (محاولة سد خانات متتالية / السد السداسي)
  const primeRunBonuses = [0, 100, 800, 3500, 12000, 35000, 70000];
  score += primeRunBonuses[Math.min(maxFortifiedRun, 6)] || 0;

  // 6. Bearing Off Progress
  score += state.o[player] * 1500;
  score -= state.o[opponent] * 1200;

  // 7. Bearing Off Readiness
  if (canBearOffMahbousa(state, player)) {
    score += 4000;
  }

  // 8. Overall advancement
  for (let k = 0; k < 24; k++) {
    score += state.c[player][k] * k * 5;
    score -= state.c[opponent][k] * k * 4;
  }

  return score;
}

interface PathResult {
  moves: Move[];
  score: number;
}

/**
 * Searches the best sequence of moves in Mahbouseh
 */
function searchBestMoveSequenceMahbousa(
  state: BoardStateMahbousa,
  player: Player,
  dice: number[],
  depth: number,
  difficulty: AIDifficulty
): PathResult {
  const legalFirstMoves = getLegalMovesMahbousa(state, player, dice);
  if (legalFirstMoves.length === 0) {
    return { moves: [], score: evaluateStateMahbousa(state, player, difficulty) };
  }

  let bestScore = -Infinity;
  let bestMoves: Move[] = [];

  for (const m of legalFirstMoves) {
    const nextState = applyMoveMahbousa(state, player, m);
    const remainingDice = dice.slice();
    remainingDice.splice(remainingDice.indexOf(m.die), 1);

    let currentScore = 0;
    let sequence: Move[] = [m];

    if (remainingDice.length > 0) {
      const sub = searchBestMoveSequenceMahbousa(
        nextState,
        player,
        remainingDice,
        depth + 1,
        difficulty
      );
      currentScore = sub.score;
      sequence = [m, ...sub.moves];
    } else {
      currentScore = evaluateStateMahbousa(nextState, player, difficulty);
    }

    // TACTICAL RULE: عدم التفريط في خانة لو سابوها ممكن الخصم يسد عليهم ٦ خانات أو يحبسهم
    if (m.from < 24) {
      const wasFortified = state.c[player][m.from] >= 2;
      const isNowEmpty = nextState.c[player][m.from] === 0;
      const isNowSingle = nextState.c[player][m.from] === 1;

      // Heavy penalty for breaking a safe point and leaving a single exposed checker
      if (wasFortified && isNowSingle) {
        const oppTrack = 23 - m.from;
        const opponent: Player = player === 0 ? 1 : 0;
        let threatened = false;
        for (let roll = 1; roll <= 6; roll++) {
          const oppSource = oppTrack - roll;
          if (oppSource >= 0 && state.c[opponent][oppSource] > 0) {
            threatened = true;
            break;
          }
        }
        if (threatened) {
          currentScore -= 28000;
        }
      }

      // Check if emptying the point allows opponent to form a 5 or 6-point prime
      if (isNowEmpty) {
        const oppPoint = 23 - m.from;
        const opponent: Player = player === 0 ? 1 : 0;
        for (let wStart = Math.max(0, oppPoint - 5); wStart <= Math.min(18, oppPoint); wStart++) {
          let oppControl = 0;
          for (let p = wStart; p < wStart + 6; p++) {
            if (p === oppPoint) continue;
            if (state.c[opponent][p] >= 2) oppControl++;
          }
          if (oppControl >= 4) {
            currentScore -= 45000;
            break;
          }
        }
      }
    }

    // Add noise based on difficulty
    if (difficulty === 'easy') {
      currentScore += (Math.random() - 0.5) * 500;
    } else if (difficulty === 'medium') {
      currentScore += (Math.random() - 0.5) * 120;
    }

    if (currentScore > bestScore) {
      bestScore = currentScore;
      bestMoves = sequence;
    }
  }

  return { moves: bestMoves, score: bestScore };
}

/**
 * AI Move Selector for Mahbouseh
 */
export function getBestMoveMahbousa(
  state: BoardStateMahbousa,
  player: Player,
  dice: number[],
  difficulty: AIDifficulty = 'pro'
): Move | null {
  const legal = getLegalMovesMahbousa(state, player, dice);
  if (legal.length === 0) return null;

  // 1. Instant Khashab Win (Check if any move can immediately pin opponent's last starting checker)
  for (const m of legal) {
    const next = applyMoveMahbousa(state, player, m);
    if (isKhashabWin(next, player)) {
      return m; // Instant victory!
    }
  }

  // 2. Direct pin opportunities
  const pinMoves = legal.filter((m) => {
    if (m.to >= 24) return false;
    const oppTrack = 23 - m.to;
    const opponent: Player = player === 0 ? 1 : 0;
    return state.c[opponent][oppTrack] === 1 && state.pinned[player][m.to] === 0;
  });

  if (pinMoves.length > 0 && Math.random() < 0.85) {
    // Highly prioritize pinning!
    return pinMoves[0];
  }

  // 3. Minimax Lookahead Search
  const result = searchBestMoveSequenceMahbousa(state, player, dice, 0, difficulty);
  if (result.moves.length > 0) {
    return result.moves[0];
  }

  return legal[0];
}
