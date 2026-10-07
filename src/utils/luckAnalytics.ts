import { GameLogEntry, Player } from '../types/tawla';

export interface PlayerDiceStats {
  totalRolls: number;
  totalPips: number;
  avgRollPips: number;
  doublesCount: number;
  faceCounts: Record<number, number>; // 1 to 6
  highRollsCount: number; // 6-6, 6-5, 5-5
  luckFactorPercentage: number; // -50% to +50% relative to expected average (7.0)
  skillScore: number; // 0 to 100
}

export interface MatchLuckAnalysis {
  white: PlayerDiceStats;
  black: PlayerDiceStats;
  verdictText: string;
  verdictSubtitle: string;
  luckierPlayer: Player | 'even';
  luckDifference: number;
}

export function computeLuckAnalysis(logs: GameLogEntry[], matchWinner?: Player): MatchLuckAnalysis {
  const initStats = (): PlayerDiceStats => ({
    totalRolls: 0,
    totalPips: 0,
    avgRollPips: 0,
    doublesCount: 0,
    faceCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
    highRollsCount: 0,
    luckFactorPercentage: 0,
    skillScore: 70,
  });

  const white = initStats();
  const black = initStats();

  logs.forEach((entry) => {
    if (!entry.roll) return;
    const target = entry.player === 0 ? white : black;
    const d1 = entry.roll[0];
    const d2 = entry.roll[1];
    const sum = d1 + d2;

    target.totalRolls++;
    target.totalPips += sum;
    target.faceCounts[d1] = (target.faceCounts[d1] || 0) + 1;
    target.faceCounts[d2] = (target.faceCounts[d2] || 0) + 1;

    if (d1 === d2) {
      target.doublesCount++;
    }

    if ((d1 === 6 && d2 === 6) || (d1 === 6 && d2 === 5) || (d1 === 5 && d2 === 6) || (d1 === 5 && d2 === 5)) {
      target.highRollsCount++;
    }
  });

  // Calculate averages and luck factor (baseline average is 7.0 per roll, double rate is 16.7%)
  [white, black].forEach((s) => {
    if (s.totalRolls > 0) {
      s.avgRollPips = Number((s.totalPips / s.totalRolls).toFixed(1));
      const baselinePips = s.totalRolls * 7.0;
      const pipDiffPercent = ((s.totalPips - baselinePips) / Math.max(1, baselinePips)) * 100;
      const doubleRate = s.doublesCount / s.totalRolls;
      const doubleBonus = (doubleRate - 0.167) * 40;

      s.luckFactorPercentage = Number(Math.min(50, Math.max(-50, pipDiffPercent + doubleBonus)).toFixed(0));
    }
  });

  // Calculate skill score based on efficiency and game outcome
  if (matchWinner !== undefined) {
    const winnerStats = matchWinner === 0 ? white : black;
    const loserStats = matchWinner === 0 ? black : white;

    // If winner won with lower or equal luck, skill score is high!
    if (winnerStats.luckFactorPercentage <= loserStats.luckFactorPercentage) {
      winnerStats.skillScore = 90;
      loserStats.skillScore = 65;
    } else {
      winnerStats.skillScore = 78;
      loserStats.skillScore = 70;
    }
  }

  const luckDiff = Math.abs(white.luckFactorPercentage - black.luckFactorPercentage);
  let luckierPlayer: Player | 'even' = 'even';
  if (white.luckFactorPercentage > black.luckFactorPercentage + 5) luckierPlayer = 0;
  else if (black.luckFactorPercentage > white.luckFactorPercentage + 5) luckierPlayer = 1;

  let verdictText = 'توازن إحصائي متقارب بين الطرفين في الزهر';
  let verdictSubtitle = 'النتيجة تعكس المهارة التكتيكية والتخطيط في نقل القواشيط.';

  if (luckierPlayer === 0) {
    if (matchWinner === 0) {
      verdictText = 'فوز مدعوم ببركة النرد للأبيض 🎲';
      verdictSubtitle = `الأبيض حصل على معدل زهر أعلى بـ (${white.avgRollPips} نقطة/رمية) مع ${white.doublesCount} دبل.`;
    } else {
      verdictText = 'انتصار تكتيكي مبهر للأسود رغم حظ الأبيض! 🏆';
      verdictSubtitle = 'الأسود انتصر بفضل الدهاء وحسن اختيار النقلات وتفوق على حظ النرد.';
    }
  } else if (luckierPlayer === 1) {
    if (matchWinner === 1) {
      verdictText = 'الزهر كان حليفاً قوياً للأسود 🎲';
      verdictSubtitle = `الأسود حقق ${black.doublesCount} دبل ومعدل (${black.avgRollPips} نقطة/رمية).`;
    } else {
      verdictText = 'انتصار تكتيكي كاسح للأبيض أمام حظ الخصم! 🏆';
      verdictSubtitle = 'الأبيض حسم الجولة بالمهارة الخالصة وتوزيع القواشيط المتزن.';
    }
  }

  return {
    white,
    black,
    verdictText,
    verdictSubtitle,
    luckierPlayer,
    luckDifference: luckDiff,
  };
}
