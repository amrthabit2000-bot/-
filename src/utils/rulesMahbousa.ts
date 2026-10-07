import { BoardState31, CombinedMove, Move, Player } from '../types/tawla';
import { physicalToTrack, trackToPhysical, toArabicDigits } from './rules31';

export interface BoardStateMahbousa extends BoardState31 {
  // pinned[player][trackIndex] = 1 if player's checker is pinned underneath opponent's checker at trackIndex
  pinned: [number[], number[]];
}

/**
 * Creates initial board state for Mahbouseh (المحبوسة):
 * - Player 0 (White) has all 15 checkers at their starting point (track 0 / physical 0).
 * - Player 1 (Black) has all 15 checkers at their starting point (track 0 / physical 23).
 * - All 15 checkers are free to move from turn 1 (NO 1st-checker restriction like 31).
 */
export function createFreshStateMahbousa(): BoardStateMahbousa {
  const c: [number[], number[]] = [
    new Array(24).fill(0),
    new Array(24).fill(0),
  ];
  const pinned: [number[], number[]] = [
    new Array(24).fill(0),
    new Array(24).fill(0),
  ];

  c[0][0] = 15;
  c[1][0] = 15;

  return {
    c,
    o: [0, 0],
    ar: [true, true], // In Mahbouseh, all checkers can move from start immediately
    pinned,
  };
}

export function cloneStateMahbousa(state: BoardStateMahbousa): BoardStateMahbousa {
  return {
    c: [state.c[0].slice(), state.c[1].slice()],
    o: [state.o[0], state.o[1]],
    ar: [true, true],
    pinned: [state.pinned[0].slice(), state.pinned[1].slice()],
  };
}

/**
 * Checks if player has any checker pinned anywhere on the board.
 * In Mahbouseh, you CANNOT bear off if any of your checkers is pinned!
 */
export function hasAnyPinnedChecker(state: BoardStateMahbousa, player: Player): boolean {
  for (let k = 0; k < 24; k++) {
    if (state.pinned[player][k] > 0) return true;
  }
  return false;
}

/**
 * Checks if player can bear off:
 * 1. All 15 checkers must be in the home quadrant (track 18..23 or already borne off).
 * 2. Crucial Mahbouseh rule: NONE of the player's checkers can be pinned anywhere!
 */
export function canBearOffMahbousa(state: BoardStateMahbousa, player: Player): boolean {
  if (hasAnyPinnedChecker(state, player)) return false;

  const checkers = state.c[player];
  for (let k = 0; k < 18; k++) {
    if (checkers[k] > 0) return false;
  }
  return true;
}

/**
 * Checks if the opponent has an unpinned single checker (حجر مفرد) that can be pinned
 */
export function canPinOpponentChecker(
  state: BoardStateMahbousa,
  player: Player,
  targetTrack: number
): boolean {
  if (targetTrack < 0 || targetTrack >= 24) return false;
  const opponent: Player = player === 0 ? 1 : 0;
  const oppTrack = 23 - targetTrack;

  // Opponent must have EXACTLY 1 checker on top of this point
  if (state.c[opponent][oppTrack] !== 1) return false;

  // And player must NOT have a checker pinned underneath already
  if (state.pinned[player][targetTrack] > 0) return false;

  return true;
}

/**
 * Checks if a destination point is completely blocked for player in Mahbouseh
 */
export function isPointBlockedMahbousa(
  state: BoardStateMahbousa,
  player: Player,
  targetTrack: number
): boolean {
  if (targetTrack >= 24) return false;
  const opponent: Player = player === 0 ? 1 : 0;
  const oppTrack = 23 - targetTrack;

  // If opponent has 2 or more checkers on this point, it is blocked
  if (state.c[opponent][oppTrack] >= 2) return true;

  // If opponent is pinning player's checker here, it is owned by opponent and blocked
  if (state.pinned[player][targetTrack] > 0) return true;

  return false;
}

/**
 * Checks for "Khashab" win (خسارة خشب في المحبوسة):
 * If a player traps the opponent's checker on the opponent's starting point (track 0 for opponent),
 * before that checker can leave, that is an instant Khashab victory!
 */
export function isKhashabWin(state: BoardStateMahbousa, player: Player): boolean {
  const opponent: Player = player === 0 ? 1 : 0;
  // Opponent's starting point is track 0 for opponent, which is track 23 for player
  return state.pinned[opponent][0] > 0;
}

/**
 * Generates all single moves for a die in Mahbouseh
 */
export function getSingleMovesMahbousaForDie(
  state: BoardStateMahbousa,
  player: Player,
  d: number
): Move[] {
  const checkers = state.c[player];
  const moves: Move[] = [];
  const inHome = canBearOffMahbousa(state, player);

  if (!inHome) {
    // Normal track movement
    for (let k = 0; k + d < 24; k++) {
      if (checkers[k] <= 0) continue;
      const target = k + d;

      if (!isPointBlockedMahbousa(state, player, target)) {
        moves.push({ from: k, to: target, die: d });
      }
    }
  } else {
    // Bearing off phase in home quadrant (18..23)
    const exactIndex = 24 - d;

    // 1. Move within the home quadrant if target < 24 and not blocked
    for (let k = 18; k < 24; k++) {
      if (checkers[k] <= 0) continue;
      const target = k + d;
      if (target < 24 && !isPointBlockedMahbousa(state, player, target)) {
        moves.push({ from: k, to: target, die: d });
      }
    }

    // 2. Direct exact bear-off
    if (exactIndex >= 18 && exactIndex < 24 && checkers[exactIndex] > 0) {
      moves.push({ from: exactIndex, to: 24, die: d });
    } else {
      // 3. If exact point has no checkers, can we bear off from the highest populated point?
      let hasHigherCheckers = false;
      for (let k = 18; k < exactIndex; k++) {
        if (checkers[k] > 0) {
          hasHigherCheckers = true;
          break;
        }
      }

      if (!hasHigherCheckers) {
        let highestIndex = -1;
        for (let k = 23; k >= 18; k--) {
          if (checkers[k] > 0) {
            highestIndex = k;
            break;
          }
        }
        if (highestIndex >= 18 && 24 - highestIndex <= d) {
          moves.push({ from: highestIndex, to: 24, die: d });
        }
      }
    }
  }

  return moves;
}

/**
 * Generates all legal moves for dice in hand in Mahbouseh,
 * STRICTLY ENFORCING the Jawaker rule:
 * "في حال عدم إمكانية استخدام كلا النردين، يُجبر اللاعب على استخدام النرد الأكبر أو مجموع النردين إن أمكن"
 */
export function getLegalMovesMahbousa(
  state: BoardStateMahbousa,
  player: Player,
  dice: number[]
): Move[] {
  if (dice.length === 0) return [];

  // Doubles (all dice have the same value)
  const isDoubles = dice.length > 1 && dice.every((d) => d === dice[0]);
  if (isDoubles) {
    return getSingleMovesMahbousaForDie(state, player, dice[0]);
  }

  // Non-doubles with 2 dice
  if (dice.length === 2) {
    const [d1, d2] = dice;
    const maxDie = Math.max(d1, d2);
    const minDie = Math.min(d1, d2);

    const movesForD1 = getSingleMovesMahbousaForDie(state, player, d1);
    const movesForD2 = getSingleMovesMahbousaForDie(state, player, d2);

    // Check which moves allow playing the second die afterwards
    const fullPathsForD1 = movesForD1.filter((m) => {
      const next = applyMoveMahbousa(state, player, m);
      return getSingleMovesMahbousaForDie(next, player, d2).length > 0;
    });

    const fullPathsForD2 = movesForD2.filter((m) => {
      const next = applyMoveMahbousa(state, player, m);
      return getSingleMovesMahbousaForDie(next, player, d1).length > 0;
    });

    // If both dice can be played (either D1 then D2, or D2 then D1)
    if (fullPathsForD1.length > 0 || fullPathsForD2.length > 0) {
      return [...fullPathsForD1, ...fullPathsForD2];
    }

    // MANDATORY JAWAKER RULE:
    // If only ONE die can be played, player MUST use the larger die if available!
    const movesForMax = maxDie === d1 ? movesForD1 : movesForD2;
    if (movesForMax.length > 0) {
      return movesForMax;
    }

    const movesForMin = minDie === d1 ? movesForD1 : movesForD2;
    return movesForMin;
  }

  // Single die remaining
  return getSingleMovesMahbousaForDie(state, player, dice[0]);
}

/**
 * Applies a move in Mahbouseh, executing pins, releases, or bear-offs
 */
export function applyMoveMahbousa(
  state: BoardStateMahbousa,
  player: Player,
  move: Move
): BoardStateMahbousa {
  const next = cloneStateMahbousa(state);
  const opponent: Player = player === 0 ? 1 : 0;

  // 1. Remove checker from source point
  next.c[player][move.from]--;

  // Check if moving off a point releases an opponent's pinned checker underneath
  const oppFromTrack = 23 - move.from;
  if (next.pinned[opponent][oppFromTrack] > 0 && next.c[player][move.from] === 0) {
    // RELEASE PINNED CHECKER!
    next.pinned[opponent][oppFromTrack] = 0;
    next.c[opponent][oppFromTrack] = 1;
  }

  // 2. Destination handling
  if (move.to >= 24) {
    // Bearing off
    next.o[player]++;
  } else {
    const oppToTrack = 23 - move.to;

    // Check if landing on an opponent's single checker -> EXECUTE PIN!
    if (next.c[opponent][oppToTrack] === 1 && next.pinned[player][move.to] === 0) {
      // PIN OPPONENT CHECKER!
      next.c[opponent][oppToTrack] = 0;
      next.pinned[opponent][oppToTrack] = 1;
      next.c[player][move.to] = 1;
    } else {
      // Normal landing
      next.c[player][move.to]++;
    }
  }

  return next;
}

/**
 * Generates combined moves (both dice combined into one click) for Mahbouseh
 */
export function getCombinedMovesMahbousaForSelection(
  state: BoardStateMahbousa,
  player: Player,
  selectedTrack: number,
  remainingDice: number[],
  legalMoves: Move[]
): CombinedMove[] {
  if (remainingDice.length < 2) return [];

  const combined: CombinedMove[] = [];
  const isDoubles = remainingDice.length > 1 && remainingDice.every((d) => d === remainingDice[0]);

  if (isDoubles) {
    const d = remainingDice[0];
    const m1_candidates = legalMoves.filter((m) => m.from === selectedTrack && m.die === d);

    for (const m1 of m1_candidates) {
      const state1 = applyMoveMahbousa(state, player, m1);
      const rem1 = remainingDice.slice(1);
      const legals1 = getLegalMovesMahbousa(state1, player, rem1);
      const m2 = legals1.find((m) => m.from === m1.to && m.die === d);
      if (!m2) continue;

      // 2-step combo
      const sum2 = d * 2;
      const label2 = `${toArabicDigits(d)}+${toArabicDigits(d)}=${toArabicDigits(sum2)}`;
      if (!combined.some((c) => c.to === m2.to)) {
        combined.push({
          from: selectedTrack,
          to: m2.to,
          dice: [d, d],
          sum: sum2,
          label: label2,
          moves: [m1, m2],
          firstMove: m1,
          secondMove: m2,
        });
      }

      // 3-step combo
      if (rem1.length >= 2) {
        const state2 = applyMoveMahbousa(state1, player, m2);
        const rem2 = rem1.slice(1);
        const legals2 = getLegalMovesMahbousa(state2, player, rem2);
        const m3 = legals2.find((m) => m.from === m2.to && m.die === d);
        if (m3) {
          const sum3 = d * 3;
          const label3 = `${toArabicDigits(d)}×٣=${toArabicDigits(sum3)}`;
          if (!combined.some((c) => c.to === m3.to)) {
            combined.push({
              from: selectedTrack,
              to: m3.to,
              dice: [d, d, d],
              sum: sum3,
              label: label3,
              moves: [m1, m2, m3],
              firstMove: m1,
              secondMove: m2,
            });
          }

          // 4-step combo (all 4 dice in one tap!)
          if (rem2.length >= 2) {
            const state3 = applyMoveMahbousa(state2, player, m3);
            const rem3 = rem2.slice(1);
            const legals3 = getLegalMovesMahbousa(state3, player, rem3);
            const m4 = legals3.find((m) => m.from === m3.to && m.die === d);
            if (m4) {
              const sum4 = d * 4;
              const label4 = `${toArabicDigits(d)}×٤=${toArabicDigits(sum4)}`;
              if (!combined.some((c) => c.to === m4.to)) {
                combined.push({
                  from: selectedTrack,
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

    return combined;
  }

  // Non-doubles with 2 dice
  const movesFromSelected = legalMoves.filter((m) => m.from === selectedTrack);
  for (const m1 of movesFromSelected) {
    const nextState = applyMoveMahbousa(state, player, m1);
    const leftDice = remainingDice.slice();
    leftDice.splice(leftDice.indexOf(m1.die), 1);

    const secondLegals = getLegalMovesMahbousa(nextState, player, leftDice);
    const secondMoves = secondLegals.filter((m2) => m2.from === m1.to);

    for (const m2 of secondMoves) {
      const sum = m1.die + m2.die;
      const label = `${toArabicDigits(m1.die)}+${toArabicDigits(m2.die)}=${toArabicDigits(sum)}`;
      const existing = combined.find((c) => c.to === m2.to);
      if (!existing) {
        combined.push({
          from: selectedTrack,
          to: m2.to,
          dice: [m1.die, m2.die],
          sum,
          label,
          moves: [m1, m2],
          firstMove: m1,
          secondMove: m2,
        });
      }
    }
  }

  return combined;
}
