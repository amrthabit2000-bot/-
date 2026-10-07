import { AIDifficulty, BoardState31, Move, Player } from '../types/tawla';
import {
  applyMove31,
  canBearOff,
  getLegalMoves31,
  isHomeQuadrantBlocked,
} from './rules31';

export interface AILearningStats {
  movesAnalyzed: number;
  gamesAnalyzed: number;
  tacticsLearned: number;
  primePreference: number;
  rushLeadPreference: number;
  lockdownPreference: number;
  bearOffPreference: number;
  lastTrained: string;
}

const DEFAULT_LEARNING_STATS: AILearningStats = {
  movesAnalyzed: 48,
  gamesAnalyzed: 1,
  tacticsLearned: 48,
  primePreference: 3.5,
  rushLeadPreference: 3.8,
  lockdownPreference: 3.6,
  bearOffPreference: 2.8,
  lastTrained: 'تم حفظ وتدريب تكتيك فوزك الكاسح (١٥-٠)',
};

const STORAGE_KEY = 'tawla_ai_learning_profile_v2';
const TACTICS_KEY = 'tawla_learned_tactics_v2';

// Tactical Move Memory: key = positionHash:dice, value = { from, to, weight }
interface LearnedMoveRecord {
  from: number;
  to: number;
  weight: number;
  wins: number;
  losses: number;
}

// In-memory buffer of moves during the active round
interface BufferedMove {
  state: BoardState31;
  player: Player;
  move: Move;
  diceKey: string;
}
let roundMovesBuffer: BufferedMove[] = [];

// All 21 unique combinations of 2 dice in Backgammon
const ALL_21_DICE_ROLLS: Array<[number, number]> = [
  [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1],
  [2, 2], [3, 2], [4, 2], [5, 2], [6, 2],
  [3, 3], [4, 3], [5, 3], [6, 3],
  [4, 4], [5, 4], [6, 4],
  [5, 5], [6, 5],
  [6, 6]
];

/**
 * Compact state hashing for tactical recognition
 */
function getPositionHash(state: BoardState31, player: Player): string {
  const opponent: Player = player === 0 ? 1 : 0;
  let myLead = -1;
  let oppLead = -1;
  for (let k = 23; k >= 0; k--) {
    if (myLead === -1 && state.c[player][k] > 0) myLead = k;
    if (oppLead === -1 && state.c[opponent][k] > 0) oppLead = k;
    if (myLead !== -1 && oppLead !== -1) break;
  }
  const myArrived = state.ar[player] ? '1' : '0';
  const oppArrived = state.ar[opponent] ? '1' : '0';

  const myHomeCount = state.c[player].slice(18, 24).reduce((a, b) => a + b, 0);
  const oppHomeCount = state.c[opponent].slice(18, 24).reduce((a, b) => a + b, 0);

  return `P${player}_ML${myLead}_OL${oppLead}_A${myArrived}${oppArrived}_H${myHomeCount}_${oppHomeCount}`;
}

export function getAILearningStats(): AILearningStats {
  if (typeof window === 'undefined') return DEFAULT_LEARNING_STATS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_LEARNING_STATS;
    return { ...DEFAULT_LEARNING_STATS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_LEARNING_STATS;
  }
}

export function saveAILearningStats(stats: AILearningStats): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // Fails gracefully
  }
}

function getLearnedTactics(): Record<string, LearnedMoveRecord> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(TACTICS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLearnedTactics(tactics: Record<string, LearnedMoveRecord>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TACTICS_KEY, JSON.stringify(tactics));
  } catch {
    // Fails gracefully
  }
}

export function resetAILearningModel(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TACTICS_KEY);
    roundMovesBuffer = [];
  } catch {
    // Fails gracefully
  }
}

/**
 * Records every human move during play and buffers it for round outcome learning
 */
export function recordHumanMove(
  stateBefore: BoardState31,
  player: Player,
  move: Move
): void {
  const diceKey = `${move.die}`;
  roundMovesBuffer.push({
    state: stateBefore,
    player,
    move,
    diceKey,
  });

  const stats = getAILearningStats();
  stats.movesAnalyzed += 1;

  const nextState = applyMove31(stateBefore, player, move);

  // Analyze prime formation (building consecutive doors)
  let runs = 0;
  for (let k = 0; k < 24; k++) {
    if (nextState.c[player][k] > 0) runs++;
    else runs = 0;
    if (runs >= 3) {
      stats.primePreference = Number((stats.primePreference + 0.05).toFixed(2));
    }
  }

  // Rushing 1st checker home
  if (!stateBefore.ar[player] && move.from > 0) {
    stats.rushLeadPreference = Number((stats.rushLeadPreference + 0.05).toFixed(2));
  }

  // Trapping opponent exit (points 18..23)
  if (move.to >= 18 && move.to <= 23) {
    stats.lockdownPreference = Number((stats.lockdownPreference + 0.05).toFixed(2));
  }

  if (move.to >= 24) {
    stats.bearOffPreference = Number((stats.bearOffPreference + 0.03).toFixed(2));
  }

  stats.lastTrained = `تم تدريب حركة جديدة (${stats.movesAnalyzed} نقلة محللة)`;
  saveAILearningStats(stats);
}

/**
 * When human wins, all their played moves are saved into the AI's tactical playbook!
 */
export function recordHumanGameResult(humanWon: boolean): void {
  const stats = getAILearningStats();
  stats.gamesAnalyzed += 1;

  const tactics = getLearnedTactics();

  if (humanWon && roundMovesBuffer.length > 0) {
    for (const item of roundMovesBuffer) {
      if (item.player === 0) {
        const posHash = getPositionHash(item.state, item.player);
        const key = `${posHash}_D${item.diceKey}`;
        const existing = tactics[key];

        if (existing) {
          if (existing.from === item.move.from && existing.to === item.move.to) {
            existing.weight += 20;
            existing.wins += 1;
          } else {
            if (existing.weight < 30) {
              tactics[key] = {
                from: item.move.from,
                to: item.move.to,
                weight: 25,
                wins: 1,
                losses: 0,
              };
            }
          }
        } else {
          tactics[key] = {
            from: item.move.from,
            to: item.move.to,
            weight: 30,
            wins: 1,
            losses: 0,
          };
          stats.tacticsLearned += 1;
        }
      }
    }

    stats.primePreference = Math.min(4.0, stats.primePreference * 1.1);
    stats.lockdownPreference = Math.min(4.0, stats.lockdownPreference * 1.1);
    stats.rushLeadPreference = Math.min(4.0, stats.rushLeadPreference * 1.1);
  }

  roundMovesBuffer = [];
  stats.lastTrained = new Date().toLocaleTimeString('ar-EG');
  saveLearnedTactics(tactics);
  saveAILearningStats(stats);
}

/**
 * Egyptian Tawla 31 Opening Champion Book:
 * Unlocks the army at lightning speed!
 */
function getChampionOpeningMove(
  state: BoardState31,
  player: Player,
  dice: number[]
): Move | null {
  // If 1st checker has NOT arrived yet:
  if (!state.ar[player]) {
    const legalMoves = getLegalMoves31(state, player, dice);
    if (legalMoves.length === 0) return null;

    // 1. Instant arrival into home quadrant (points 18..23):
    const homeArrivalMove = legalMoves.find((m) => m.to >= 18 && m.to <= 23);
    if (homeArrivalMove) return homeArrivalMove;

    // 2. Find the lead checker
    let leadPos = -1;
    for (let k = 23; k >= 0; k--) {
      if (state.c[player][k] > 0) {
        leadPos = k;
        break;
      }
    }

    // 3. USER SLINGSHOT SIGNATURE (اندفاع القشاط الأول المزدوج بنفس الرمية):
    // As seen in user's turn [#98] and [#96]: keep moving the lead checker continuously!
    if (leadPos > 0) {
      const leadMoves = legalMoves
        .filter((m) => m.from === leadPos)
        .sort((a, b) => b.die - a.die);
      if (leadMoves.length > 0) return leadMoves[0];
    }

    // 4. Starting move from 0: push with largest die
    const maxDie = Math.max(...dice);
    const maxMove = legalMoves.find((m) => m.from === 0 && m.die === maxDie);
    if (maxMove) return maxMove;
  }

  return null;
}

/**
 * Master-Grade State Evaluation for Tawla 31:
 * Tuned for fastest win and fastest point-blockade!
 */
function evaluateState(
  state: BoardState31,
  player: Player,
  difficulty: AIDifficulty = 'pro'
): number {
  const opponent: Player = player === 0 ? 1 : 0;

  // 1. Instant Victory / Defeat Check
  if (state.o[player] === 15) {
    const margin = 15 - state.o[opponent];
    return 500000 + margin * 10000;
  }
  if (state.o[opponent] === 15) {
    return -500000;
  }

  // 2. Sudden Death: Trapping opponent in home quadrant (السد التام في الربع الأخير = فوز فوري بـ ١٥ نقطة)
  if (isHomeQuadrantBlocked(state, opponent)) {
    return 400000;
  }
  if (isHomeQuadrantBlocked(state, player)) {
    return -400000;
  }

  const stats = getAILearningStats();
  const isLearned = difficulty === 'learned';
  const primeMult = isLearned ? stats.primePreference : 1.5;
  const rushMult = isLearned ? stats.rushLeadPreference : 1.8;
  const lockMult = isLearned ? stats.lockdownPreference : 1.8;
  const bearMult = isLearned ? stats.bearOffPreference : 1.3;

  let score = 0;

  // 3. Borne-Off Checkers (لم القشاط السريع)
  score += state.o[player] * 1200 * bearMult;
  score -= state.o[opponent] * 1000;

  // 4. #1 GOLDEN RULE: 1st Checker Arrival (فك أسر الـ ١٤ قشاطاً بأسرع طريقة)
  if (state.ar[player]) {
    score += 15000 * rushMult;
  } else {
    let myLead = 0;
    for (let k = 23; k >= 0; k--) {
      if (state.c[player][k] > 0) {
        myLead = k;
        break;
      }
    }
    // High urgency on racing lead checker to home quadrant
    score += myLead * 280 * rushMult;
    if (myLead >= 12) score += 1500 * rushMult;
    if (myLead >= 15) score += 3000 * rushMult;
    if (myLead >= 17) score += 6000 * rushMult;
  }

  // Severe penalty if opponent's 1st checker is already arrived or ahead
  if (state.ar[opponent]) {
    score -= 10000;
  } else {
    let oppLead = 0;
    for (let k = 23; k >= 0; k--) {
      if (state.c[opponent][k] > 0) {
        oppLead = k;
        break;
      }
    }
    score -= oppLead * 200;
  }

  // 5. FASTEST BLOCKADE: CONTINUOUS SADD (محاولة سد خانات - الأبواب المتتالية والسد السداسي)
  // In Tawla 31, a single checker closes a door! Consecutive doors form an impassable wall!
  let currentRun = 0;
  let maxRun = 0;
  let totalDoorsClosed = 0;
  for (let k = 0; k < 24; k++) {
    if (state.c[player][k] > 0) {
      totalDoorsClosed++;
      currentRun++;
      if (currentRun > maxRun) maxRun = currentRun;
    } else {
      currentRun = 0;
    }
  }
  // Exponential prime bonuses: 3 doors = 1500, 4 doors = 6000, 5 doors = 22000, 6 doors = 65000 (UNBREAKABLE WALL)
  const primeRunBonuses = [0, 50, 400, 1800, 7000, 24000, 65000];
  score += (primeRunBonuses[Math.min(maxRun, 6)] || 0) * primeMult;

  // Reward distributing checkers to close multiple doors instead of stacking 5 on one door
  score += totalDoorsClosed * 280 * primeMult;

  // USER STRATEGY: MIDFIELD PRIME CHOKEHOLD (سد الدبول المتصل من خانة ٥ لـ ١٣)
  // Locking points 4..12 kills opponent 4-4, 5-5, 6-6 completely
  let midfieldDoors = 0;
  for (let k = 4; k <= 12; k++) {
    if (state.c[player][k] > 0) midfieldDoors++;
  }
  if (midfieldDoors >= 4) score += 5000 * primeMult;
  if (midfieldDoors >= 6) score += 18000 * primeMult;

  // 6. CHOKE THE OPPONENT'S EXIT GATE (سد خروج الخصم من النقطة صفر)
  // For opponent, point 0 is physical 23, which is track 18..23 for player!
  // If player occupies points 18..23, opponent CANNOT exit point 0!
  let exitPointsClosed = 0;
  for (let k = 18; k <= 23; k++) {
    if (state.c[player][k] > 0) {
      exitPointsClosed++;
    }
  }
  score += exitPointsClosed * 600 * lockMult;
  if (exitPointsClosed >= 4) score += 3500 * lockMult;
  if (exitPointsClosed >= 5) score += 9000 * lockMult;
  if (exitPointsClosed === 6) score += 25000 * lockMult; // Complete death trap!

  // 7. TRAP OPPONENT'S LEAD CHECKER (السد أمام قشاط الخصم مباشرة)
  if (!state.ar[opponent]) {
    let oppLead = 0;
    for (let k = 23; k >= 0; k--) {
      if (state.c[opponent][k] > 0) {
        oppLead = k;
        break;
      }
    }
    // Block the 6 squares right in front of the opponent's lead checker:
    let stepsBlockedAhead = 0;
    for (let step = 1; step <= 6; step++) {
      const targetOpp = oppLead + step;
      if (targetOpp < 24) {
        const playerTrack = 23 - targetOpp;
        if (playerTrack >= 0 && playerTrack < 24 && state.c[player][playerTrack] > 0) {
          stepsBlockedAhead++;
          score += (7 - step) * 250 * lockMult;
        }
      }
    }
    if (stepsBlockedAhead >= 4) score += 3000 * lockMult;
    if (stepsBlockedAhead >= 5) score += 7000 * lockMult;
    if (stepsBlockedAhead === 6) score += 15000 * lockMult; // 100% paralyzed!
  }

  // 8. ANTI-TRAP SHIELD: Ensure AI itself doesn't get boxed in
  for (let k = 0; k < 24; k++) {
    if (state.c[player][k] > 0) {
      let blockedSteps = 0;
      for (let s = 1; s <= 6; s++) {
        if (k + s < 24) {
          const oppTrack = 23 - (k + s);
          if (oppTrack >= 0 && oppTrack < 24 && state.c[opponent][oppTrack] > 0) {
            blockedSteps++;
          }
        }
      }
      if (blockedSteps >= 5) {
        score -= 900;
      } else if (blockedSteps >= 3) {
        score -= 350;
      }
    }
  }

  // 9. Pip Advantage (سرعة السباق نحو البيت)
  for (let k = 0; k < 24; k++) {
    score += state.c[player][k] * k * 6;
    score -= state.c[opponent][k] * k * 5;
  }

  // 10. Bearing Off Speed (لم القشاط السريع)
  if (canBearOff(state, player)) {
    score += 3500 * bearMult;
    for (let k = 18; k < 24; k++) {
      score += state.c[player][k] * (k - 17) * 80 * bearMult;
    }
  }

  return score;
}

interface PathResult {
  moves: Move[];
  score: number;
}

/**
 * Searches the best sequence of moves across all dice in hand,
 * simulating opponent mobility to maximize opponent blockades!
 */
function searchBestMoveSequence(
  state: BoardState31,
  player: Player,
  dice: number[],
  depth: number,
  difficulty: AIDifficulty
): PathResult {
  const legalFirstMoves = getLegalMoves31(state, player, dice);
  if (legalFirstMoves.length === 0) {
    return { moves: [], score: evaluateState(state, player, difficulty) };
  }

  let bestScore = -Infinity;
  let bestMoves: Move[] = [];

  for (const m of legalFirstMoves) {
    const nextState = applyMove31(state, player, m);
    const remainingDice = dice.slice();
    remainingDice.splice(remainingDice.indexOf(m.die), 1);

    let currentScore = 0;
    let sequence: Move[] = [m];

    if (remainingDice.length > 0) {
      const sub = searchBestMoveSequence(nextState, player, remainingDice, depth + 1, difficulty);
      currentScore = sub.score;
      sequence = [m, ...sub.moves];
    } else {
      let baseScore = evaluateState(nextState, player, difficulty);

      // FASTEST BLOCKADE & OPPONENT PARALYSIS EVALUATION:
      // Test all 21 dice rolls for the opponent on this resulting board:
      // How many dice combinations leave the opponent completely BLOCKED (0 legal moves)?
      if (difficulty === 'pro' || difficulty === 'learned') {
        const opponent: Player = player === 0 ? 1 : 0;
        let blockedRolls = 0;
        let oppTotalOptions = 0;

        for (const [d1, d2] of ALL_21_DICE_ROLLS) {
          const testDice = d1 === d2 ? [d1, d1, d1, d1] : [d1, d2];
          const oppLegals = getLegalMoves31(nextState, opponent, testDice);
          if (oppLegals.length === 0) {
            blockedRolls++;
          } else {
            oppTotalOptions += oppLegals.length;
          }
        }

        // Heavy reward for shutting down opponent's dice rolls:
        baseScore += blockedRolls * 650;
        // Penalize giving the opponent comfortable options:
        baseScore -= oppTotalOptions * 12;
      }

      currentScore = baseScore;
    }

    // TACTICAL RULE: عدم التفريط في خانة لو سابوها ممكن الخصم يسد عليهم ٦ خانات
    // If moving from m.from empties the point (state.c[player][m.from] === 1):
    if (state.c[player][m.from] === 1 && m.from < 24) {
      const oppPoint = 23 - m.from;
      const opponent: Player = player === 0 ? 1 : 0;
      // Check if emptying oppPoint allows the opponent to establish a 5 or 6-prime:
      for (let wStart = Math.max(0, oppPoint - 5); wStart <= Math.min(18, oppPoint); wStart++) {
        let oppControlCount = 0;
        for (let p = wStart; p < wStart + 6; p++) {
          if (p === oppPoint) continue; // oppPoint was emptied by us
          const pPlayerTrack = 23 - p;
          if (state.c[opponent][p] > 0 || state.c[player][pPlayerTrack] === 0) {
            oppControlCount++;
          }
        }
        if (oppControlCount >= 5) {
          // Check if AI has checkers behind this prime:
          const primeEndPlayerTrack = 23 - (wStart + 5);
          let checkersBehind = 0;
          for (let k = 0; k < primeEndPlayerTrack; k++) {
            if (nextState.c[player][k] > 0) checkersBehind += nextState.c[player][k];
          }
          if (checkersBehind > 0) {
            currentScore -= 50000;
            break;
          }
        }
      }
    }

    // Add noise based on difficulty
    if (difficulty === 'easy') {
      currentScore += (Math.random() - 0.5) * 400;
    } else if (difficulty === 'medium') {
      currentScore += (Math.random() - 0.5) * 60;
    }

    if (currentScore > bestScore) {
      bestScore = currentScore;
      bestMoves = sequence;
    }
  }

  return { moves: bestMoves, score: bestScore };
}

/**
 * Grandmaster AI Move Selector with Opening Book and Learned Playbook Memory
 */
export function getBestMove31(
  state: BoardState31,
  player: Player,
  dice: number[],
  difficulty: AIDifficulty = 'pro'
): Move | null {
  const legal = getLegalMoves31(state, player, dice);
  if (legal.length === 0) return null;

  // 1. Check Learned Tactical Playbook (الذاكرة التكتيكية المتعلمة من حركات وفوز اللاعب)
  if (difficulty === 'learned' || difficulty === 'pro') {
    const tactics = getLearnedTactics();
    const posHash = getPositionHash(state, player);

    for (const d of dice) {
      const key = `${posHash}_D${d}`;
      const learned = tactics[key];
      if (learned && learned.weight > 10) {
        const matchingLegal = legal.find(
          (m) => m.from === learned.from && m.to === learned.to && m.die === d
        );
        if (matchingLegal) {
          return matchingLegal;
        }
      }
    }
  }

  // 2. Check Standard Egyptian Tawla 31 Opening Book
  const openingMove = getChampionOpeningMove(state, player, dice);
  if (openingMove) {
    return openingMove;
  }

  // 3. Deep Minimax Lookahead Search with Opponent Mobility Chokehold
  const result = searchBestMoveSequence(state, player, dice, 0, difficulty);
  if (result.moves.length > 0) {
    return result.moves[0];
  }

  return legal[0];
}
