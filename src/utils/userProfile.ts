export const MAX_STORED_MATCHES = 20;

export interface MatchRecord {
  id: string;
  roundNumber: number;
  date: string;
  opponentName: string;
  winner: 'player' | 'opponent';
  playerPoints: number;
  opponentPoints: number;
  ratingAfter: number;
  cumulativeWins: number;
  cumulativeLosses: number;
  winRate: number; // Percentage, e.g. 65.4
}

export interface Achievement {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: 'tactical' | 'streak' | 'legendary';
  iconEmoji: string;
  rarity: 'gold' | 'royal' | 'mythic';
  unlocked: boolean;
  unlockedAt?: string;
  requirementText: string;
}

export interface UserProfile {
  id: string;
  name: string;
  avatarEmoji: string;
  countryCode: string;
  countryName: string;
  wins: number;
  losses: number;
  totalGames: number;
  currentStreak: number;
  bestStreak: number;
  rating: number; // ELO rating (e.g. 1200 - 2400)
  tierName: string;
  nationalRank: number;
  globalRank: number;
  matchHistory: MatchRecord[];
  // Achievements fields
  unlockedAchievements?: string[];
  khashabWins?: number;
  fullBlockades?: number;
  matchWins31?: number;
  multiPins?: number;
}

export const ACHIEVEMENTS_REGISTRY: Omit<Achievement, 'unlocked' | 'unlockedAt'>[] = [
  {
    id: 'khashab_master',
    title: 'فوز كاسح (خشب)',
    subtitle: 'حرمان الخصم من لم أي قشاط',
    description: 'الفوز بنتيجة خشب (مارس) بحبس قشاط بداية الخصم في نقطة الصفر أو لم جميع قواشيطك دون أن يلم الخصم قشاطاً واحداً.',
    category: 'tactical',
    iconEmoji: '🪵',
    rarity: 'gold',
    requirementText: 'تحقيق فوز خشب أو مارس',
  },
  {
    id: 'sadd_kamel',
    title: 'سد كامل مصفح',
    subtitle: 'بناء الحصن المنيع (٦ أبواب)',
    description: 'إغلاق ربع اللم كاملاً أو بناء سلسلة من ٦ أبواب مقفولة متتالية تمنع قواشيط الخصم تماماً من التحرك.',
    category: 'tactical',
    iconEmoji: '🛡️',
    rarity: 'gold',
    requirementText: 'قفل ربع اللم كاملاً أو سد طريق الخصم',
  },
  {
    id: 'streak_3',
    title: 'حريف الانتصارات (سلسلة ٣)',
    subtitle: '٣ انتصارات متتالية',
    description: 'إثبات المهارة والتركيز بالفوز في ٣ جولات متتالية بدون أي هزيمة.',
    category: 'streak',
    iconEmoji: '🔥',
    rarity: 'gold',
    requirementText: 'تحقيق سلسلة ٣ انتصارات',
  },
  {
    id: 'streak_5',
    title: 'سلطان الطاولة (سلسلة ٥)',
    subtitle: '٥ انتصارات متتالية',
    description: 'السيطرة الكاملة على الطاولة بسلسلة ذهبية من ٥ انتصارات متتالية بدون هزيمة واحدة.',
    category: 'streak',
    iconEmoji: '👑',
    rarity: 'royal',
    requirementText: 'تحقيق سلسلة ٥ انتصارات',
  },
  {
    id: 'pin_hunter',
    title: 'صياد المحبوسة',
    subtitle: 'حبس قشاطين في جولة واحدة',
    description: 'تنفيذ تكتيك المحبوسة المتقن باصطياد وحبس قشاطين أو أكثر للخصم وتكبيل حركته.',
    category: 'tactical',
    iconEmoji: '🔒',
    rarity: 'gold',
    requirementText: 'حبس قطعتين للخصم في المحبوسة',
  },
  {
    id: 'double_six_finish',
    title: 'دوش النصر الملكي',
    subtitle: 'إنهاء الجولة برمي الدوش (٦-٦)',
    description: 'حسم الجولة بلم آخر قشاط على رمية الدوش المباركة (٦-٦) بطريقة استعراضية.',
    category: 'tactical',
    iconEmoji: '🎲',
    rarity: 'gold',
    requirementText: 'إنهاء الجولة على رمية دوش ٦-٦',
  },
  {
    id: 'match_champion_31',
    title: 'أسطورة الـ ٣١ نقطة',
    subtitle: 'الفوز بمباراة كاملة ٣١ نقطة',
    description: 'الوصول إلى ٣١ نقطة والفوز ببطولة المباراة كاملة والتتويج بالعرش.',
    category: 'legendary',
    iconEmoji: '🏆',
    rarity: 'mythic',
    requirementText: 'الفوز بنقاط المباراة ٣١ كاملة',
  },
];

export function getUserAchievements(profile: UserProfile): Achievement[] {
  const unlockedSet = new Set(profile.unlockedAchievements || []);

  return ACHIEVEMENTS_REGISTRY.map((def) => {
    let isUnlocked = unlockedSet.has(def.id);

    if (!isUnlocked) {
      if (def.id === 'khashab_master' && (profile.khashabWins || 0) > 0) isUnlocked = true;
      if (def.id === 'sadd_kamel' && (profile.fullBlockades || 0) > 0) isUnlocked = true;
      if (def.id === 'streak_3' && profile.bestStreak >= 3) isUnlocked = true;
      if (def.id === 'streak_5' && profile.bestStreak >= 5) isUnlocked = true;
      if (def.id === 'pin_hunter' && (profile.multiPins || 0) > 0) isUnlocked = true;
      if (def.id === 'match_champion_31' && (profile.matchWins31 || 0) > 0) isUnlocked = true;
    }

    return {
      ...def,
      unlocked: isUnlocked,
      unlockedAt: isUnlocked ? 'مكتمل' : undefined,
    };
  });
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  avatarEmoji: string;
  country: string;
  countryCode: string;
  rating: number;
  wins: number;
  winRate: number;
  tier: string;
  isCurrentUser?: boolean;
}

const STORAGE_KEY = 'tawla_user_profile_v1';

export function calculateTier(rating: number): string {
  if (rating >= 2100) return 'أسطورة الطاولة 👑';
  if (rating >= 1800) return 'شيخ الحارة والزهر 🏆';
  if (rating >= 1550) return 'أستاذ طاولة كبير 🎖️';
  if (rating >= 1350) return 'حريف طاولة محترف 🎲';
  if (rating >= 1200) return 'لاعب متمرس 🪵';
  return 'لاعب صاعد 🌟';
}

export function calculateNationalRank(rating: number): number {
  // Rank in Egypt (scale 1 to 5,000)
  const rank = Math.round(5000 / (1 + Math.exp((rating - 1100) / 160)));
  return Math.max(1, rank);
}

export function calculateGlobalRank(rating: number): number {
  // Global Rank (scale 1 to 150,000)
  const rank = Math.round(150000 / (1 + Math.exp((rating - 1100) / 170)));
  return Math.max(1, rank);
}

// Initial realistic default mock match history so Recharts has beautiful immediate trends
const DEFAULT_MATCH_HISTORY: MatchRecord[] = [
  {
    id: 'm1',
    roundNumber: 1,
    date: 'أمس',
    opponentName: 'كمبيوتر (المستوى الذكي)',
    winner: 'player',
    playerPoints: 7,
    opponentPoints: 0,
    ratingAfter: 1225,
    cumulativeWins: 1,
    cumulativeLosses: 0,
    winRate: 100,
  },
  {
    id: 'm2',
    roundNumber: 2,
    date: 'أمس',
    opponentName: 'كمبيوتر (المستوى الذكي)',
    winner: 'player',
    playerPoints: 9,
    opponentPoints: 3,
    ratingAfter: 1252,
    cumulativeWins: 2,
    cumulativeLosses: 0,
    winRate: 100,
  },
  {
    id: 'm3',
    roundNumber: 3,
    date: 'أمس',
    opponentName: 'كمبيوتر (المستوى الذكي)',
    winner: 'opponent',
    playerPoints: 0,
    opponentPoints: 15,
    ratingAfter: 1234,
    cumulativeWins: 2,
    cumulativeLosses: 1,
    winRate: 66.7,
  },
  {
    id: 'm4',
    roundNumber: 4,
    date: 'اليوم',
    opponentName: 'كمبيوتر (المستوى الذكي)',
    winner: 'player',
    playerPoints: 15,
    opponentPoints: 4,
    ratingAfter: 1264,
    cumulativeWins: 3,
    cumulativeLosses: 1,
    winRate: 75.0,
  },
  {
    id: 'm5',
    roundNumber: 5,
    date: 'اليوم',
    opponentName: 'كمبيوتر (المستوى الذكي)',
    winner: 'player',
    playerPoints: 11,
    opponentPoints: 2,
    ratingAfter: 1290,
    cumulativeWins: 4,
    cumulativeLosses: 1,
    winRate: 80.0,
  },
];

const DEFAULT_PROFILE: UserProfile = {
  id: 'usr_me',
  name: 'حريف الطاولة',
  avatarEmoji: '🤴',
  countryCode: 'EG',
  countryName: 'مصر 🇪🇬',
  wins: 4,
  losses: 1,
  totalGames: 5,
  currentStreak: 2,
  bestStreak: 2,
  rating: 1290,
  tierName: 'حريف طاولة محترف 🎲',
  nationalRank: 42,
  globalRank: 1284,
  matchHistory: DEFAULT_MATCH_HISTORY,
  unlockedAchievements: ['khashab_master'],
  khashabWins: 1,
  fullBlockades: 0,
  matchWins31: 0,
  multiPins: 0,
};

export function getUserProfile(): UserProfile {
  if (typeof window === 'undefined') return DEFAULT_PROFILE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveUserProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // Fails gracefully
  }
}

export function recordMatchOutcome(
  playerWon: boolean,
  playerPoints: number,
  opponentPoints: number,
  opponentName: string = 'الكمبيوتر الذكي',
  specialWinType?: 'khashab' | 'sadd_kamel' | 'normal',
  isMatchWin?: boolean
): { profile: UserProfile; newlyUnlocked: Achievement[] } {
  const profile = getUserProfile();

  const newWins = playerWon ? profile.wins + 1 : profile.wins;
  const newLosses = playerWon ? profile.losses : profile.losses + 1;
  const newTotal = newWins + newLosses;
  const newStreak = playerWon ? profile.currentStreak + 1 : 0;
  const newBestStreak = Math.max(profile.bestStreak, newStreak);

  // ELO Rating calculation
  const pointDelta = Math.abs(playerPoints - opponentPoints);
  const ratingDelta = playerWon
    ? Math.min(35, 18 + Math.floor(pointDelta * 0.8))
    : -Math.min(25, 12 + Math.floor(pointDelta * 0.5));
  const newRating = Math.max(800, profile.rating + ratingDelta);

  const winRate = Number(((newWins / Math.max(1, newTotal)) * 100).toFixed(1));

  const newRecord: MatchRecord = {
    id: 'm_' + Date.now(),
    roundNumber: newTotal,
    date: new Date().toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' }),
    opponentName,
    winner: playerWon ? 'player' : 'opponent',
    playerPoints,
    opponentPoints,
    ratingAfter: newRating,
    cumulativeWins: newWins,
    cumulativeLosses: newLosses,
    winRate,
  };

  const newKhashabWins = playerWon && specialWinType === 'khashab'
    ? (profile.khashabWins || 0) + 1
    : (profile.khashabWins || 0);

  const newFullBlockades = playerWon && specialWinType === 'sadd_kamel'
    ? (profile.fullBlockades || 0) + 1
    : (profile.fullBlockades || 0);

  const newMatchWins31 = playerWon && isMatchWin
    ? (profile.matchWins31 || 0) + 1
    : (profile.matchWins31 || 0);

  // Check achievements
  const currentUnlocked = new Set(profile.unlockedAchievements || []);
  const newlyUnlocked: Achievement[] = [];

  const checkAndAdd = (id: string) => {
    if (!currentUnlocked.has(id)) {
      currentUnlocked.add(id);
      const ach = ACHIEVEMENTS_REGISTRY.find((a) => a.id === id);
      if (ach) {
        newlyUnlocked.push({ ...ach, unlocked: true, unlockedAt: 'الآن' });
      }
    }
  };

  if (playerWon) {
    if (newStreak >= 3) checkAndAdd('streak_3');
    if (newStreak >= 5) checkAndAdd('streak_5');
    if (specialWinType === 'khashab') checkAndAdd('khashab_master');
    if (specialWinType === 'sadd_kamel') checkAndAdd('sadd_kamel');
    if (isMatchWin) checkAndAdd('match_champion_31');
  }

  const updatedProfile: UserProfile = {
    ...profile,
    wins: newWins,
    losses: newLosses,
    totalGames: newTotal,
    currentStreak: newStreak,
    bestStreak: newBestStreak,
    rating: newRating,
    tierName: calculateTier(newRating),
    nationalRank: calculateNationalRank(newRating),
    globalRank: calculateGlobalRank(newRating),
    matchHistory: [...profile.matchHistory, newRecord].slice(-MAX_STORED_MATCHES),
    khashabWins: newKhashabWins,
    fullBlockades: newFullBlockades,
    matchWins31: newMatchWins31,
    unlockedAchievements: Array.from(currentUnlocked),
  };

  saveUserProfile(updatedProfile);
  return { profile: updatedProfile, newlyUnlocked };
}

export function awardSpecialAchievement(achievementId: string): { profile: UserProfile; achievement: Achievement | null } {
  const profile = getUserProfile();
  const currentUnlocked = new Set(profile.unlockedAchievements || []);
  if (currentUnlocked.has(achievementId)) {
    return { profile, achievement: null };
  }

  currentUnlocked.add(achievementId);
  const updated: UserProfile = {
    ...profile,
    unlockedAchievements: Array.from(currentUnlocked),
  };
  saveUserProfile(updated);
  const def = ACHIEVEMENTS_REGISTRY.find((a) => a.id === achievementId);
  return {
    profile: updated,
    achievement: def ? { ...def, unlocked: true, unlockedAt: 'الآن' } : null,
  };
}

/**
 * Top Regional & Global Champions for the Leaderboard
 */
export function getLeaderboardEntries(user: UserProfile): LeaderboardEntry[] {
  const masters: LeaderboardEntry[] = [
    {
      rank: 1,
      name: 'الحاج إبراهيم الشيشيني',
      avatarEmoji: '👑',
      country: 'مصر',
      countryCode: 'EG',
      rating: 2420,
      wins: 480,
      winRate: 88.5,
      tier: 'أسطورة الطاولة 👑',
    },
    {
      rank: 2,
      name: 'معلم رشدي الكردي',
      avatarEmoji: '🧔',
      country: 'مصر',
      countryCode: 'EG',
      rating: 2310,
      wins: 395,
      winRate: 84.1,
      tier: 'أسطورة الطاولة 👑',
    },
    {
      rank: 3,
      name: 'أبو فهد الحجازي',
      avatarEmoji: '🧕',
      country: 'السعودية',
      countryCode: 'SA',
      rating: 2260,
      wins: 340,
      winRate: 81.9,
      tier: 'شيخ الحارة والزهر 🏆',
    },
    {
      rank: 4,
      name: 'عماد الطرابلسي',
      avatarEmoji: '🎩',
      country: 'لبنان',
      countryCode: 'LB',
      rating: 2190,
      wins: 290,
      winRate: 79.2,
      tier: 'شيخ الحارة والزهر 🏆',
    },
    {
      rank: 5,
      name: 'د. طارق السكندري',
      avatarEmoji: '👓',
      country: 'مصر',
      countryCode: 'EG',
      rating: 2120,
      wins: 260,
      winRate: 77.0,
      tier: 'أستاذ طاولة كبير 🎖️',
    },
    {
      rank: 6,
      name: 'كابتن وسام الفارس',
      avatarEmoji: '🦁',
      country: 'الإمارات',
      countryCode: 'AE',
      rating: 2050,
      wins: 215,
      winRate: 74.8,
      tier: 'أستاذ طاولة كبير 🎖️',
    },
  ];

  // Insert current user in realistic rank position
  const userEntry: LeaderboardEntry = {
    rank: user.nationalRank,
    name: user.name + ' (أنت)',
    avatarEmoji: user.avatarEmoji,
    country: user.countryName.split(' ')[0],
    countryCode: user.countryCode,
    rating: user.rating,
    wins: user.wins,
    winRate: Number(((user.wins / Math.max(1, user.totalGames)) * 100).toFixed(1)),
    tier: user.tierName,
    isCurrentUser: true,
  };

  return [...masters, userEntry].sort((a, b) => b.rating - a.rating);
}
