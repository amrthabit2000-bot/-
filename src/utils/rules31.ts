import { BoardState31, CombinedMove, Move, Player } from '../types/tawla';

export function createFreshState31(): BoardState31 {
  const c: [number[], number[]] = [
    new Array(24).fill(0),
    new Array(24).fill(0),
  ];
  // 15 checkers on starting point 0 for each player
  c[0][0] = 15;
  c[1][0] = 15;

  return {
    c,
    o: [0, 0],
    ar: [false, false],
  };
}

export function cloneState31(state: BoardState31): BoardState31 {
  return {
    c: [state.c[0].slice(), state.c[1].slice()],
    o: [state.o[0], state.o[1]],
    ar: [state.ar[0], state.ar[1]],
  };
}

/**
 * Maps player track point k (0..23) to physical board point (0..23)
 * White (0): 0 -> 0 (top right), 11 -> 11 (top left), 12 -> 12 (bottom left), 23 -> 23 (bottom right)
 * Black (1): 0 -> 23 (bottom right), 11 -> 12 (bottom left), 12 -> 11 (top left), 23 -> 0 (top right)
 */
export function trackToPhysical(player: Player, trackIndex: number): number {
  return player === 0 ? trackIndex : 23 - trackIndex;
}

/**
 * Maps physical board point (0..23) to player's track point (0..23)
 */
export function physicalToTrack(player: Player, physicalIndex: number): number {
  return player === 0 ? physicalIndex : 23 - physicalIndex;
}

/**
 * Checks if a point on player's track is blocked by opponent.
 * In Tawla 31, if opponent has >= 1 checker on the physical position, it is blocked!
 */
export function isPointBlocked(state: BoardState31, player: Player, trackIndex: number): boolean {
  if (trackIndex >= 24) return false;
  const opponent: Player = player === 0 ? 1 : 0;
  const oppTrack = 23 - trackIndex;
  if (oppTrack < 0 || oppTrack >= 24) return false;
  return state.c[opponent][oppTrack] > 0;
}

/**
 * Checks if player's home quadrant is completely blocked by opponent
 * preventing player from ever landing their first checker (immediate loss of 15 pts)
 */
export function isHomeQuadrantBlocked(state: BoardState31, player: Player): boolean {
  if (state.ar[player]) return false;
  for (let k = 18; k < 24; k++) {
    if (!isPointBlocked(state, player, k)) return false;
  }
  return true;
}

/**
 * Checks if all remaining checkers are in the home quadrant (18..23)
 * meaning the player is ready to bear off
 */
export function canBearOff(state: BoardState31, player: Player): boolean {
  const checkers = state.c[player];
  for (let k = 0; k < 18; k++) {
    if (checkers[k] > 0) return false;
  }
  return true;
}

/**
 * Generates all basic single moves with a single die value d
 * Following Rule 10 strictly:
 * 1. لو فيه قشاط على الخانة n (حيث n = 24 - d)، يتلم.
 * 2. لو الخانة n فاضية وفيه قواشيط على خانات أعلى منها (18 <= k < n)، يتحرك قشاط واحد منها n خانة.
 * 3. لو مفيش قواشيط أعلى، يتلم قشاط من أعلى خانة فيها قواشيط.
 */
export function getSingleMovesForDie(state: BoardState31, player: Player, d: number): Move[] {
  const checkers = state.c[player];
  const moves: Move[] = [];
  const inHome = canBearOff(state, player);

  if (!inHome) {
    // Normal track movement
    for (let k = 0; k + d < 24; k++) {
      if (checkers[k] <= 0) continue;

      // First checker rule:
      // If 1st checker has not arrived (ar[player] === false):
      // - If all 15 checkers are still at point 0, any die can start the 1st checker.
      // - If 1st checker has left point 0 (checkers[0] < 15), ONLY that advanced checker can move!
      if (!state.ar[player]) {
        if (k === 0 && checkers[0] < 15) {
          continue;
        }
      }

      // Target point must not be blocked by opponent
      if (!isPointBlocked(state, player, k + d)) {
        moves.push({ from: k, to: k + d, die: d });
      }
    }
  } else {
    // Bearing off phase: all checkers are in points 18..23 (or already borne off)
    const exactPoint = 24 - d;

    // 1. لو فيه قشاط على الخانة n، يتلم
    if (exactPoint >= 18 && exactPoint < 24 && checkers[exactPoint] > 0) {
      moves.push({ from: exactPoint, to: 24, die: d });
    }

    // 2. لو الخانة n فاضية، شوف لو فيه قواشيط على خانات أعلى منها (18 <= k < exactPoint)
    let hasHigherCheckers = false;
    for (let k = 18; k < exactPoint; k++) {
      if (checkers[k] > 0) {
        hasHigherCheckers = true;
        if (k + d < 24 && !isPointBlocked(state, player, k + d)) {
          moves.push({ from: k, to: k + d, die: d });
        }
      }
    }

    // 3. لو مفيش قواشيط أعلى، يتلم قشاط من أعلى خانة فيها قواشيط (أبعد خانة شاغرة عن الخروج)
    if (!hasHigherCheckers && (!exactPoint || checkers[exactPoint] === 0 || exactPoint < 18)) {
      for (let k = Math.max(18, exactPoint + 1); k < 24; k++) {
        if (checkers[k] > 0) {
          moves.push({ from: k, to: 24, die: d });
          break; // فقط من أعلى خانة شاغرة
        }
      }
    }

    // Also allow advancing unblocked checkers forward inside home if exact point was occupied
    if (exactPoint >= 18 && exactPoint < 24 && checkers[exactPoint] > 0) {
      for (let k = 18; k < exactPoint; k++) {
        if (checkers[k] > 0 && k + d < 24 && !isPointBlocked(state, player, k + d)) {
          if (!moves.some((m) => m.from === k && m.to === k + d)) {
            moves.push({ from: k, to: k + d, die: d });
          }
        }
      }
    }
  }

  return moves;
}

/**
 * Applies a move to the state and returns a new state
 */
export function applyMove31(state: BoardState31, player: Player, move: Move): BoardState31 {
  const next = cloneState31(state);
  next.c[player][move.from]--;

  if (move.to >= 24) {
    next.o[player]++;
  } else {
    next.c[player][move.to]++;
    // If first checker reaches home quadrant (18..23), unlock all other checkers!
    if (move.to >= 18) {
      next.ar[player] = true;
    }
  }

  return next;
}

function removeDie(dice: number[], dieValue: number): number[] {
  const idx = dice.indexOf(dieValue);
  if (idx === -1) return dice;
  const copy = dice.slice();
  copy.splice(idx, 1);
  return copy;
}

/**
 * Finds the maximum number of dice that can be played given remaining dice
 */
export function getMaxDicePlayable(state: BoardState31, player: Player, dice: number[]): number {
  if (dice.length === 0) return 0;

  let maxPlayed = 0;
  const uniqueDice = Array.from(new Set(dice));

  for (const d of uniqueDice) {
    const remaining = removeDie(dice, d);
    const moves = getSingleMovesForDie(state, player, d);
    for (const m of moves) {
      const nextState = applyMove31(state, player, m);
      const played = 1 + getMaxDicePlayable(nextState, player, remaining);
      if (played > maxPlayed) {
        maxPlayed = played;
      }
      if (maxPlayed === dice.length) {
        return maxPlayed; // Reached absolute maximum possible
      }
    }
  }

  return maxPlayed;
}

/**
 * Returns only legal first moves that maximize the total number of dice played
 */
export function getLegalMoves31(state: BoardState31, player: Player, dice: number[]): Move[] {
  const maxPossible = getMaxDicePlayable(state, player, dice);
  if (maxPossible === 0) return [];

  const legalMoves: Move[] = [];
  const uniqueDice = Array.from(new Set(dice));

  for (const d of uniqueDice) {
    const remaining = removeDie(dice, d);
    const moves = getSingleMovesForDie(state, player, d);

    for (const m of moves) {
      const nextState = applyMove31(state, player, m);
      const canPlay = 1 + getMaxDicePlayable(nextState, player, remaining);
      if (canPlay === maxPossible) {
        if (!legalMoves.some((x) => x.from === m.from && x.to === m.to && x.die === m.die)) {
          legalMoves.push(m);
        }
      }
    }
  }

  return legalMoves;
}

const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
export function toArabicDigits(n: number | string): string {
  return n.toString().split('').map((ch) => {
    const d = parseInt(ch, 10);
    return isNaN(d) ? ch : ARABIC_DIGITS[d];
  }).join('');
}

/**
 * Generates all combined moves (using 2 dice together on the same checker)
 * from selectedTrackIndex, ensuring the intermediate point is unblocked!
 */
export function getCombinedMovesForSelection(
  state: BoardState31,
  player: Player,
  fromTrackIndex: number,
  remainingDice: number[],
  legalMoves: Move[]
): CombinedMove[] {
  if (remainingDice.length < 2) {
    return [];
  }

  const combinedMoves: CombinedMove[] = [];
  const isDoubles = remainingDice.length > 1 && remainingDice.every((d) => d === remainingDice[0]);

  if (isDoubles) {
    const d = remainingDice[0];
    const m1_candidates = legalMoves.filter((m) => m.from === fromTrackIndex && m.die === d);

    for (const m1 of m1_candidates) {
      const state1 = applyMove31(state, player, m1);
      const rem1 = removeDie(remainingDice, d);
      const legals1 = getLegalMoves31(state1, player, rem1);
      const m2 = legals1.find((m) => m.from === m1.to && m.die === d);
      if (!m2) continue;

      // 2-step double combo (e.g. 3+3 = 6)
      const sum2 = d * 2;
      const label2 = `${toArabicDigits(d)}+${toArabicDigits(d)}=${toArabicDigits(sum2)}`;
      if (!combinedMoves.some((cm) => cm.to === m2.to)) {
        combinedMoves.push({
          from: fromTrackIndex,
          to: m2.to,
          dice: [d, d],
          sum: sum2,
          label: label2,
          moves: [m1, m2],
          firstMove: m1,
          secondMove: m2,
        });
      }

      // Check if 3-step double combo is possible (e.g. 3+3+3 = 9)
      if (rem1.length >= 2) {
        const state2 = applyMove31(state1, player, m2);
        const rem2 = removeDie(rem1, d);
        const legals2 = getLegalMoves31(state2, player, rem2);
        const m3 = legals2.find((m) => m.from === m2.to && m.die === d);
        if (m3) {
          const sum3 = d * 3;
          const label3 = `${toArabicDigits(d)}×٣=${toArabicDigits(sum3)}`;
          if (!combinedMoves.some((cm) => cm.to === m3.to)) {
            combinedMoves.push({
              from: fromTrackIndex,
              to: m3.to,
              dice: [d, d, d],
              sum: sum3,
              label: label3,
              moves: [m1, m2, m3],
              firstMove: m1,
              secondMove: m2,
            });
          }

          // Check if 4-step double combo is possible (e.g. 3+3+3+3 = 12!)
          if (rem2.length >= 2) {
            const state3 = applyMove31(state2, player, m3);
            const rem3 = removeDie(rem2, d);
            const legals3 = getLegalMoves31(state3, player, rem3);
            const m4 = legals3.find((m) => m.from === m3.to && m.die === d);
            if (m4) {
              const sum4 = d * 4;
              const label4 = `${toArabicDigits(d)}×٤=${toArabicDigits(sum4)}`;
              if (!combinedMoves.some((cm) => cm.to === m4.to)) {
                combinedMoves.push({
                  from: fromTrackIndex,
                  to: m4.to,
                  dice: [d, d, d, d],
                  sum: sum4,
                  label: label4,
                  moves: [m1, m2, m3, m4],
                  firstMove: m1,
                  secondMove: m2,
                });
              }
            }
          }
        }
      }
    }

    return combinedMoves;
  }

  // Non-doubles with 2 dice
  if (remainingDice.length === 2) {
    const d1 = remainingDice[0];
    const d2 = remainingDice[1];

    // Try order: d1 then d2
    const m1_candidates = legalMoves.filter((m) => m.from === fromTrackIndex && m.die === d1);
    for (const m1 of m1_candidates) {
      const stateAfter1 = applyMove31(state, player, m1);
      const remAfter1 = removeDie(remainingDice, d1);
      const legalsAfter1 = getLegalMoves31(stateAfter1, player, remAfter1);
      const m2 = legalsAfter1.find((m) => m.from === m1.to && m.die === d2);
      if (m2) {
        const sum = d1 + d2;
        const label = `${toArabicDigits(d1)}+${toArabicDigits(d2)}=${toArabicDigits(sum)}`;
        if (!combinedMoves.some((cm) => cm.to === m2.to)) {
          combinedMoves.push({
            from: fromTrackIndex,
            to: m2.to,
            dice: [d1, d2],
            sum,
            label,
            moves: [m1, m2],
            firstMove: m1,
            secondMove: m2,
          });
        }
      }
    }

    // Try reverse order: d2 then d1
    const m2_candidates = legalMoves.filter((m) => m.from === fromTrackIndex && m.die === d2);
    for (const m2 of m2_candidates) {
      const stateAfter2 = applyMove31(state, player, m2);
      const remAfter2 = removeDie(remainingDice, d2);
      const legalsAfter2 = getLegalMoves31(stateAfter2, player, remAfter2);
      const m1 = legalsAfter2.find((m) => m.from === m2.to && m.die === d1);
      if (m1) {
        const sum = d1 + d2;
        const label = `${toArabicDigits(d2)}+${toArabicDigits(d1)}=${toArabicDigits(sum)}`;
        if (!combinedMoves.some((cm) => cm.to === m1.to)) {
          combinedMoves.push({
            from: fromTrackIndex,
            to: m1.to,
            dice: [d2, d1],
            sum,
            label,
            moves: [m2, m1],
            firstMove: m2,
            secondMove: m1,
          });
        }
      }
    }
  }

  return combinedMoves;
}

/**
 * Helper to get user-friendly point names in Egyptian style
 */
export function getPointDisplayName(player: Player, trackIndex: number): string {
  if (trackIndex >= 24) return 'خارج اللوحة (ملموم)';
  if (trackIndex === 0) return 'خانة البداية (خ١)';
  if (trackIndex >= 18) return `ربع اللم (خ${trackIndex + 1})`;
  return `خانة ${trackIndex + 1}`;
}

/**
 * Checks if the player has ANY legal move with ANY possible die value in [1..6].
 * If this returns false, the player is completely locked/blocked (مقفول عليه تماماً)
 * and must NOT roll dice at all ("ميرميش ظهر أصلاً").
 */
export function canPlayerMoveWithAnyDie(state: BoardState31, player: Player): boolean {
  for (let d = 1; d <= 6; d++) {
    const singleMoves = getSingleMovesForDie(state, player, d);
    if (singleMoves.length > 0) return true;
  }
  return false;
}
