import { initializeApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  getDocFromServer,
  query,
  orderBy,
  limit,
  getDocs,
  deleteDoc,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { BoardTheme } from '../types/tawla';

// 1. Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Test connection on boot per Firebase guidelines
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase connection check: client is offline or pending connection.');
    }
  }
}
testConnection();

// 2. Strict Error Handling Enum & Interface
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo:
        auth.currentUser?.providerData?.map((p) => ({
          providerId: p.providerId,
          email: p.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// 3. Daily Rewards Data Model with Coins (ذهب الطاولة 🪙)
export interface DailyReward {
  day: number;
  type: 'points' | 'theme' | 'coins';
  value: number | BoardTheme;
  coinsBonus: number;
  title: string;
  subtitle: string;
  iconEmoji: string;
}

export const SEVEN_DAY_REWARDS: DailyReward[] = [
  {
    day: 1,
    type: 'points',
    value: 150,
    coinsBonus: 250,
    title: '١٥٠ نقطة تقييم + ٢٥٠ كوينز 🪙',
    subtitle: 'مكافأة افتتاح الأسبوع الذهبي',
    iconEmoji: '🪙',
  },
  {
    day: 2,
    type: 'theme',
    value: 'cairoCafe1920',
    coinsBonus: 350,
    title: 'طراز المقهى القاهري ١٩٢٠ + ٣٥٠ كوينز 🪙',
    subtitle: 'تصميم طاولة المقاهي التراثية الأصيلة',
    iconEmoji: '☕',
  },
  {
    day: 3,
    type: 'points',
    value: 300,
    coinsBonus: 500,
    title: '٣٠٠ نقطة تقييم + ٥٠٠ كوينز 🪙',
    subtitle: 'مكافأة الحضور اليومي المستمر',
    iconEmoji: '💰',
  },
  {
    day: 4,
    type: 'theme',
    value: 'brassEbony',
    coinsBonus: 650,
    title: 'الأبنوس المعرق بالنحاس الأصفر + ٦٥٠ كوينز 🪙',
    subtitle: 'طراز ملكي مذهب وفواصل نحاس عيار ٢٤',
    iconEmoji: '✨',
  },
  {
    day: 5,
    type: 'points',
    value: 500,
    coinsBonus: 800,
    title: '٥٠٠ نقطة تقييم + ٨٠٠ كوينز 🪙',
    subtitle: 'قفزة تصنيف حريف الطاولة المحترف',
    iconEmoji: '💎',
  },
  {
    day: 6,
    type: 'theme',
    value: 'fatimidInlay',
    coinsBonus: 1000,
    title: 'الطاولة الصدفية الفاطمية التراثية + ١٠٠٠ كوينز 🪙',
    subtitle: 'صدف بحر أحمر مضلع وأبنوس نادر',
    iconEmoji: '🕌',
  },
  {
    day: 7,
    type: 'theme',
    value: 'abdeenVelvet',
    coinsBonus: 2000,
    title: 'طراز قصر عابدين المخملي + ٢٠٠٠ كوينز 🪙 + ١٠٠٠ نقطة',
    subtitle: 'الجائزة الكبرى: التيجان الخديوية المصرية',
    iconEmoji: '👑',
  },
];

export interface UserDailyProgress {
  uid: string;
  name: string;
  rating: number;
  coins: number;
  dailyStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  lastMatchPlayedDate: string; // YYYY-MM-DD
  lastClaimedDate: string; // YYYY-MM-DD
  claimedDay: number; // 0 to 7
  unlockedThemes: string[];
  unlockedDiceStyles: string[];
  selectedTheme?: string;
  selectedDiceStyle?: string;
  googleEmail?: string;
  googlePhotoUrl?: string;
  isGoogleConnected?: boolean;
}

export function getTodayDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getYesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// 4. Local Guest Progress Storage Helpers (Ensures 100% Zero-Crashes offline or unauthenticated)
const LOCAL_PROGRESS_KEY = 'tawla_local_user_progress_v2';
const LOCAL_MATCHES_KEY = 'tawla_local_saved_matches_v2';

export function getLocalProgress(): UserDailyProgress {
  const today = getTodayDateString();
  const fallback: UserDailyProgress = {
    uid: 'local_guest_player',
    name: 'لاعب طاولة',
    rating: 1290,
    coins: 1000, // Initial welcome bonus coins!
    dailyStreak: 1,
    lastActiveDate: today,
    lastMatchPlayedDate: '',
    lastClaimedDate: '',
    claimedDay: 0,
    unlockedThemes: ['arabesque'],
    unlockedDiceStyles: ['ivory'],
    selectedTheme: 'arabesque',
    selectedDiceStyle: 'ivory',
    isGoogleConnected: false,
  };

  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(LOCAL_PROGRESS_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return {
      ...fallback,
      ...parsed,
      coins: typeof parsed.coins === 'number' ? parsed.coins : 1000,
      lastActiveDate: today,
      unlockedThemes: Array.isArray(parsed.unlockedThemes) && parsed.unlockedThemes.length > 0
        ? parsed.unlockedThemes
        : ['arabesque'],
      unlockedDiceStyles: Array.isArray(parsed.unlockedDiceStyles) && parsed.unlockedDiceStyles.length > 0
        ? parsed.unlockedDiceStyles
        : ['ivory'],
    };
  } catch {
    return fallback;
  }
}

export function saveLocalProgress(prog: UserDailyProgress) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_PROGRESS_KEY, JSON.stringify(prog));
  } catch (err) {
    console.warn(err);
  }
}

export function getLocalSavedMatches(): FirebaseSavedMatch[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_MATCHES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveLocalSavedMatch(match: FirebaseSavedMatch) {
  if (typeof window === 'undefined') return;
  try {
    const list = getLocalSavedMatches();
    const updated = [match, ...list.filter((m) => m.matchId !== match.matchId)].slice(0, MAX_SAVED_MATCHES_FIREBASE);
    localStorage.setItem(LOCAL_MATCHES_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn(err);
  }
}

// 5. Safe Authenticated User Retrieval (Never crashes with null.uid or admin-restricted-operation)
export async function getEnsureAuthUser(): Promise<FirebaseUser | null> {
  if (auth.currentUser) return auth.currentUser;

  return new Promise((resolve) => {
    let resolved = false;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (resolved) return;
      resolved = true;
      unsubscribe();
      resolve(user || null);
    });

    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        unsubscribe();
        resolve(auth.currentUser || null);
      }
    }, 600);
  });
}

// 6. Fetch or Initialize User Daily Progress in Firebase Firestore
export async function fetchUserDailyProgress(): Promise<UserDailyProgress> {
  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();

  const user = await getEnsureAuthUser();
  if (!user) {
    // Guest mode with localStorage persistence
    const local = getLocalProgress();
    if (local.lastClaimedDate && local.lastClaimedDate !== today && local.lastClaimedDate !== yesterday) {
      local.dailyStreak = 1;
      local.claimedDay = 0;
    }
    local.lastActiveDate = today;
    saveLocalProgress(local);
    return local;
  }

  try {
    const userDocRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userDocRef);

    if (snap.exists()) {
      const data = snap.data();
      let streak = data.dailyStreak || 1;
      let claimedDay = data.claimedDay || 0;

      if (data.lastClaimedDate && data.lastClaimedDate !== today && data.lastClaimedDate !== yesterday) {
        streak = 1;
        claimedDay = 0;
      }

      const rawThemes = data.unlockedThemes;
      const parsedThemes = Array.isArray(rawThemes)
        ? rawThemes
        : typeof rawThemes === 'string'
        ? rawThemes.split(',').filter(Boolean)
        : ['arabesque'];

      const rawDice = data.unlockedDiceStyles;
      const parsedDice = Array.isArray(rawDice)
        ? rawDice
        : typeof rawDice === 'string'
        ? rawDice.split(',').filter(Boolean)
        : ['ivory'];

      const progress: UserDailyProgress = {
        uid: user.uid,
        name: data.name || user.displayName || 'لاعب طاولة',
        rating: typeof data.rating === 'number' ? data.rating : 1290,
        coins: typeof data.coins === 'number' ? data.coins : 1000,
        dailyStreak: streak,
        lastActiveDate: today,
        lastMatchPlayedDate: data.lastMatchPlayedDate || '',
        lastClaimedDate: data.lastClaimedDate || '',
        claimedDay,
        unlockedThemes: parsedThemes.length > 0 ? parsedThemes : ['arabesque'],
        unlockedDiceStyles: parsedDice.length > 0 ? parsedDice : ['ivory'],
        selectedTheme: data.selectedTheme || 'arabesque',
        selectedDiceStyle: data.selectedDiceStyle || 'ivory',
        googleEmail: user.email || data.googleEmail || '',
        googlePhotoUrl: user.photoURL || data.googlePhotoUrl || '',
        isGoogleConnected: true,
      };

      await updateDoc(userDocRef, {
        lastActiveDate: today,
        dailyStreak: streak,
        isGoogleConnected: true,
      }).catch(() => {});

      saveLocalProgress(progress);
      return progress;
    } else {
      // First time Google user — migrate any local progress into their Firestore account!
      const local = getLocalProgress();
      const initialProgress: UserDailyProgress = {
        uid: user.uid,
        name: user.displayName || local.name || 'لاعب طاولة',
        rating: local.rating || 1290,
        coins: local.coins || 1000,
        dailyStreak: local.dailyStreak || 1,
        lastActiveDate: today,
        lastMatchPlayedDate: local.lastMatchPlayedDate || '',
        lastClaimedDate: local.lastClaimedDate || '',
        claimedDay: local.claimedDay || 0,
        unlockedThemes: local.unlockedThemes || ['arabesque'],
        unlockedDiceStyles: local.unlockedDiceStyles || ['ivory'],
        selectedTheme: local.selectedTheme || 'arabesque',
        selectedDiceStyle: local.selectedDiceStyle || 'ivory',
        googleEmail: user.email || '',
        googlePhotoUrl: user.photoURL || '',
        isGoogleConnected: true,
      };

      await setDoc(userDocRef, {
        uid: user.uid,
        name: initialProgress.name,
        rating: initialProgress.rating,
        coins: initialProgress.coins,
        dailyStreak: initialProgress.dailyStreak,
        lastActiveDate: today,
        lastMatchPlayedDate: initialProgress.lastMatchPlayedDate,
        lastClaimedDate: initialProgress.lastClaimedDate,
        claimedDay: initialProgress.claimedDay,
        unlockedThemes: initialProgress.unlockedThemes.join(','),
        unlockedDiceStyles: initialProgress.unlockedDiceStyles.join(','),
        selectedTheme: initialProgress.selectedTheme,
        selectedDiceStyle: initialProgress.selectedDiceStyle,
        googleEmail: initialProgress.googleEmail,
        googlePhotoUrl: initialProgress.googlePhotoUrl,
        isGoogleConnected: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }).catch(() => {});

      saveLocalProgress(initialProgress);
      return initialProgress;
    }
  } catch (error) {
    console.warn('Firestore fetch user notice, falling back to local progress:', error);
    return getLocalProgress();
  }
}

// 7. Record Match Played in Firestore (Unlocks Daily Reward Claim!)
export async function recordDailyMatchInFirebase(): Promise<UserDailyProgress | null> {
  const today = getTodayDateString();
  const local = getLocalProgress();
  local.lastMatchPlayedDate = today;
  saveLocalProgress(local);

  const user = await getEnsureAuthUser();
  if (!user) {
    return local;
  }

  try {
    const userDocRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userDocRef);

    if (snap.exists()) {
      await updateDoc(userDocRef, {
        lastMatchPlayedDate: today,
      }).catch(() => {});

      const updated: UserDailyProgress = {
        ...local,
        ...(snap.data() as any),
        lastMatchPlayedDate: today,
      };
      saveLocalProgress(updated);
      return updated;
    }
    return local;
  } catch (error) {
    console.warn('Firestore record match notice:', error);
    return local;
  }
}

// 8. Claim Daily Reward in Firebase Firestore (Awards ELO Points + Coins 🪙 + Themes)
export async function claimDailyRewardInFirebase(): Promise<{
  reward: DailyReward;
  updatedProgress: UserDailyProgress;
}> {
  const today = getTodayDateString();
  const user = await getEnsureAuthUser();

  let currentProg = getLocalProgress();
  if (user) {
    try {
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (snap.exists()) {
        const d = snap.data();
        currentProg = {
          ...currentProg,
          ...d,
          coins: typeof d.coins === 'number' ? d.coins : currentProg.coins,
          rating: typeof d.rating === 'number' ? d.rating : currentProg.rating,
          dailyStreak: typeof d.dailyStreak === 'number' ? d.dailyStreak : currentProg.dailyStreak,
          claimedDay: typeof d.claimedDay === 'number' ? d.claimedDay : currentProg.claimedDay,
        };
      }
    } catch {
      // Fallback to local
    }
  }

  if (currentProg.lastClaimedDate === today) {
    throw new Error('لقد استلمت مكافأة اليوم بالفعل!');
  }

  if (currentProg.lastMatchPlayedDate !== today) {
    throw new Error('يجب لعب مباراة واحدة على الأقل اليوم لتفعيل المكافأة!');
  }

  const nextDay = ((currentProg.claimedDay || 0) % 7) + 1;
  const reward = SEVEN_DAY_REWARDS[nextDay - 1];

  const currentThemes = Array.isArray(currentProg.unlockedThemes)
    ? [...currentProg.unlockedThemes]
    : ['arabesque'];

  let addedRating = 0;
  if (reward.type === 'points') {
    addedRating = Number(reward.value);
  } else if (reward.type === 'theme') {
    const themeKey = String(reward.value);
    if (!currentThemes.includes(themeKey)) {
      currentThemes.push(themeKey);
    }
    if (nextDay === 7) {
      addedRating = 1000; // Grand prize points bonus!
    }
  }

  const newRating = (currentProg.rating || 1290) + addedRating;
  const newCoins = (currentProg.coins || 1000) + reward.coinsBonus;
  const newStreak = (currentProg.dailyStreak || 0) + 1;

  const updatedProgress: UserDailyProgress = {
    ...currentProg,
    uid: user ? user.uid : 'local_guest_player',
    rating: newRating,
    coins: newCoins,
    dailyStreak: newStreak,
    lastActiveDate: today,
    lastMatchPlayedDate: today,
    lastClaimedDate: today,
    claimedDay: nextDay,
    unlockedThemes: currentThemes,
  };

  saveLocalProgress(updatedProgress);

  if (user) {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        lastClaimedDate: today,
        claimedDay: nextDay,
        dailyStreak: newStreak,
        rating: newRating,
        coins: newCoins,
        unlockedThemes: currentThemes.join(','),
        updatedAt: new Date().toISOString(),
      });

      const claimDocRef = collection(db, 'users', user.uid, 'claims');
      await addDoc(claimDocRef, {
        claimId: `claim_${Date.now()}`,
        userId: user.uid,
        date: today,
        dayNumber: nextDay,
        rewardType: reward.type,
        rewardValue: String(reward.value),
        coinsBonus: reward.coinsBonus,
        claimedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Firestore claim sync notice:', err);
    }
  }

  return { reward, updatedProgress };
}

// 9. Update Player Coins and Inventory (For Store purchases, Challenge Match stakes, etc.)
export async function updateUserCoinsAndInventoryInFirebase(updates: {
  coins?: number;
  rating?: number;
  unlockedThemes?: string[];
  unlockedDiceStyles?: string[];
  selectedTheme?: string;
  selectedDiceStyle?: string;
}): Promise<UserDailyProgress> {
  const local = getLocalProgress();
  const updated: UserDailyProgress = {
    ...local,
    coins: typeof updates.coins === 'number' ? updates.coins : local.coins,
    rating: typeof updates.rating === 'number' ? updates.rating : local.rating,
    unlockedThemes: updates.unlockedThemes || local.unlockedThemes,
    unlockedDiceStyles: updates.unlockedDiceStyles || local.unlockedDiceStyles,
    selectedTheme: updates.selectedTheme || local.selectedTheme,
    selectedDiceStyle: updates.selectedDiceStyle || local.selectedDiceStyle,
  };

  saveLocalProgress(updated);

  const user = await getEnsureAuthUser();
  if (user) {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        coins: updated.coins,
        rating: updated.rating,
        unlockedThemes: updated.unlockedThemes.join(','),
        unlockedDiceStyles: updated.unlockedDiceStyles.join(','),
        selectedTheme: updated.selectedTheme,
        selectedDiceStyle: updated.selectedDiceStyle,
        updatedAt: new Date().toISOString(),
      }).catch(() => {});
    } catch (err) {
      console.warn('Firestore inventory update notice:', err);
    }
  }

  return updated;
}

// 10. Fetch Top 10 Leaderboard Players from Firebase
export interface LeaderboardPlayer {
  uid: string;
  name: string;
  rating: number;
  dailyStreak: number;
  isCurrentUser?: boolean;
  avatar?: string;
  title?: string;
  gamesWon?: number;
}

const DEFAULT_CHAMPIONS: LeaderboardPlayer[] = [
  { uid: 'c_1', name: 'المعلم عاشور السويسي', rating: 2150, dailyStreak: 14, avatar: '👴🏼', title: 'أسطورة طاولة ٣١', gamesWon: 420 },
  { uid: 'c_2', name: 'هاني القهوجي (حريف الفيش)', rating: 1980, dailyStreak: 9, avatar: '👨🏻', title: 'معلم القهاوي الشعبية', gamesWon: 310 },
  { uid: 'c_3', name: 'محمود الصعيدي', rating: 1840, dailyStreak: 12, avatar: '👳🏽‍♂️', title: 'سفير البكجامون', gamesWon: 265 },
  { uid: 'c_4', name: 'طارق الألفي', rating: 1720, dailyStreak: 7, avatar: '👨🏻‍💻', title: 'عاشق الدوبارة', gamesWon: 190 },
  { uid: 'c_5', name: 'كابتن مدحت', rating: 1610, dailyStreak: 5, avatar: '🧔🏻', title: 'صقر المحبوسة', gamesWon: 140 },
  { uid: 'c_6', name: 'عم درويش الإسكندراني', rating: 1530, dailyStreak: 8, avatar: '👨🏽‍🦳', title: 'فنان رمي الزهر', gamesWon: 115 },
  { uid: 'c_7', name: 'زياد التكتيكي', rating: 1470, dailyStreak: 4, avatar: '🧑🏻', title: 'محلل الديش والجهار', gamesWon: 98 },
  { uid: 'c_8', name: 'حسام نرد', rating: 1410, dailyStreak: 6, avatar: '🧔🏽', title: 'فارس القواشيط', gamesWon: 85 },
  { uid: 'c_9', name: 'أبو ليلى البغدادي', rating: 1360, dailyStreak: 3, avatar: '🧓🏻', title: 'حكيم الداما والباكجامون', gamesWon: 72 },
];

export async function fetchLeaderboardFromFirebase(): Promise<LeaderboardPlayer[]> {
  try {
    const user = await getEnsureAuthUser();
    const currentUid = user ? user.uid : 'local_guest_player';
    const local = getLocalProgress();

    let firebasePlayers: LeaderboardPlayer[] = [];
    if (user) {
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, orderBy('rating', 'desc'), limit(10));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const r = typeof data.rating === 'number' ? data.rating : 1290;
          firebasePlayers.push({
            uid: docSnap.id,
            name: data.name || 'لاعب طاولة',
            rating: r,
            dailyStreak: data.dailyStreak || 1,
            isCurrentUser: docSnap.id === currentUid,
            avatar: docSnap.id === currentUid ? '👑' : '🎲',
            title: r > 1800 ? 'أستاذ دولي' : r > 1500 ? 'حريف معتمد' : 'لاعب صاعد',
            gamesWon: Math.max(1, Math.floor((r - 1000) / 10)),
          });
        });
      } catch (err) {
        console.warn('Firestore leaderboard query notice:', err);
      }
    }

    const me: LeaderboardPlayer = {
      uid: currentUid,
      name: user?.displayName || local.name || 'أنت (حريف الطاولة)',
      rating: local.rating || 1290,
      dailyStreak: local.dailyStreak || 1,
      isCurrentUser: true,
      avatar: '👑',
      title: local.rating > 1800 ? 'أستاذ دولي' : local.rating > 1500 ? 'حريف معتمد' : 'لاعب صاعد',
      gamesWon: Math.max(1, Math.floor(((local.rating || 1290) - 1000) / 10)),
    };

    const combined = [...firebasePlayers];
    for (const champ of DEFAULT_CHAMPIONS) {
      if (!combined.some((p) => p.name === champ.name || p.uid === champ.uid)) {
        combined.push(champ);
      }
    }
    if (!combined.some((p) => p.uid === currentUid)) {
      combined.push(me);
    }

    combined.sort((a, b) => b.rating - a.rating);
    return combined.slice(0, 10).map((p) => ({
      ...p,
      isCurrentUser: p.uid === currentUid,
    }));
  } catch (error) {
    console.warn('Leaderboard fetch fallback notice:', error);
    return DEFAULT_CHAMPIONS.slice(0, 10);
  }
}

// 11. Save Match in Firebase Firestore (Retaining latest 20 matches per player)
export const MAX_SAVED_MATCHES_FIREBASE = 20;

export interface FirebaseSavedMatch {
  matchId: string;
  userId: string;
  opponentName: string;
  winner: 'player' | 'opponent';
  playerPoints: number;
  opponentPoints: number;
  ratingAfter: number;
  coinsWon?: number;
  date: string;
  playedAt: string;
}

export async function saveMatchToFirebase(match: {
  opponentName: string;
  winner: 'player' | 'opponent';
  playerPoints: number;
  opponentPoints: number;
  ratingAfter: number;
  coinsWon?: number;
  date?: string;
}): Promise<void> {
  const matchId = `m_${Date.now()}`;
  const playedAt = new Date().toISOString();
  const dateStr =
    match.date || new Date().toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });

  const record: FirebaseSavedMatch = {
    matchId,
    userId: auth.currentUser?.uid || 'local_guest_player',
    opponentName: match.opponentName,
    winner: match.winner,
    playerPoints: match.playerPoints,
    opponentPoints: match.opponentPoints,
    ratingAfter: match.ratingAfter,
    coinsWon: match.coinsWon || 0,
    date: dateStr,
    playedAt,
  };

  // Always save locally
  saveLocalSavedMatch(record);

  const user = await getEnsureAuthUser();
  if (!user) return;

  try {
    const matchesCol = collection(db, 'users', user.uid, 'matches');
    await addDoc(matchesCol, record);

    // Prune to 20 matches max
    const q = query(matchesCol, orderBy('playedAt', 'desc'));
    const snapshot = await getDocs(q);
    if (snapshot.size > MAX_SAVED_MATCHES_FIREBASE) {
      const extraDocs = snapshot.docs.slice(MAX_SAVED_MATCHES_FIREBASE);
      for (const d of extraDocs) {
        await deleteDoc(d.ref).catch(() => {});
      }
    }
  } catch (err) {
    console.warn('Firebase match save notice:', err);
  }
}

export async function fetchUserSavedMatchesFromFirebase(): Promise<FirebaseSavedMatch[]> {
  const user = await getEnsureAuthUser();
  if (!user) {
    return getLocalSavedMatches();
  }

  try {
    const matchesCol = collection(db, 'users', user.uid, 'matches');
    const q = query(matchesCol, orderBy('playedAt', 'desc'), limit(MAX_SAVED_MATCHES_FIREBASE));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return getLocalSavedMatches();
    }

    const matches: FirebaseSavedMatch[] = [];
    snapshot.forEach((docSnap) => {
      matches.push(docSnap.data() as FirebaseSavedMatch);
    });
    return matches;
  } catch (err) {
    console.warn('Firebase fetch saved matches notice:', err);
    return getLocalSavedMatches();
  }
}

// 12. Google Account Integration via Firebase Auth (Connecting Google, saving all data)
export interface GoogleAccountProfile {
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  uid: string;
}

export async function connectWithGoogle(): Promise<{ user: FirebaseUser; profile: GoogleAccountProfile }> {
  try {
    const provider = new GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    provider.setCustomParameters({ prompt: 'select_account' });

    const result = await signInWithPopup(auth, provider);
    const googleUser = result.user;

    const local = getLocalProgress();
    const userDocRef = doc(db, 'users', googleUser.uid);
    const snap = await getDoc(userDocRef);

    const displayName = googleUser.displayName || local.name || 'لاعب طاولة';

    if (snap.exists()) {
      const existing = snap.data();
      // Merge local progress with existing cloud data
      const mergedThemes = Array.from(
        new Set([
          ...(Array.isArray(existing.unlockedThemes)
            ? existing.unlockedThemes
            : String(existing.unlockedThemes || 'arabesque').split(',')),
          ...local.unlockedThemes,
        ])
      ).filter(Boolean);

      const mergedDice = Array.from(
        new Set([
          ...(Array.isArray(existing.unlockedDiceStyles)
            ? existing.unlockedDiceStyles
            : String(existing.unlockedDiceStyles || 'ivory').split(',')),
          ...local.unlockedDiceStyles,
        ])
      ).filter(Boolean);

      const mergedCoins = Math.max(existing.coins || 0, local.coins || 1000);
      const mergedRating = Math.max(existing.rating || 0, local.rating || 1290);

      await updateDoc(userDocRef, {
        name: displayName,
        googleEmail: googleUser.email || '',
        googlePhotoUrl: googleUser.photoURL || '',
        isGoogleConnected: true,
        coins: mergedCoins,
        rating: mergedRating,
        unlockedThemes: mergedThemes.join(','),
        unlockedDiceStyles: mergedDice.join(','),
        updatedAt: new Date().toISOString(),
      });

      saveLocalProgress({
        ...local,
        uid: googleUser.uid,
        name: displayName,
        googleEmail: googleUser.email || '',
        googlePhotoUrl: googleUser.photoURL || '',
        isGoogleConnected: true,
        coins: mergedCoins,
        rating: mergedRating,
        unlockedThemes: mergedThemes,
        unlockedDiceStyles: mergedDice,
      });
    } else {
      // First time Google registration — migrate local progress completely
      await setDoc(userDocRef, {
        uid: googleUser.uid,
        name: displayName,
        rating: local.rating || 1290,
        coins: local.coins || 1000,
        dailyStreak: local.dailyStreak || 1,
        googleEmail: googleUser.email || '',
        googlePhotoUrl: googleUser.photoURL || '',
        isGoogleConnected: true,
        lastActiveDate: getTodayDateString(),
        lastMatchPlayedDate: local.lastMatchPlayedDate || '',
        lastClaimedDate: local.lastClaimedDate || '',
        claimedDay: local.claimedDay || 0,
        unlockedThemes: local.unlockedThemes.join(','),
        unlockedDiceStyles: local.unlockedDiceStyles.join(','),
        selectedTheme: local.selectedTheme || 'arabesque',
        selectedDiceStyle: local.selectedDiceStyle || 'ivory',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      saveLocalProgress({
        ...local,
        uid: googleUser.uid,
        name: displayName,
        googleEmail: googleUser.email || '',
        googlePhotoUrl: googleUser.photoURL || '',
        isGoogleConnected: true,
      });
    }

    const profile: GoogleAccountProfile = {
      displayName: googleUser.displayName,
      email: googleUser.email,
      photoURL: googleUser.photoURL,
      uid: googleUser.uid,
    };

    return { user: googleUser, profile };
  } catch (error: any) {
    console.error('Google Sign-In notice:', error);
    throw error;
  }
}

export async function disconnectGoogle(): Promise<void> {
  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        isGoogleConnected: false,
        updatedAt: new Date().toISOString(),
      }).catch(() => {});
    }
    await signOut(auth);
    const local = getLocalProgress();
    local.isGoogleConnected = false;
    saveLocalProgress(local);
  } catch (err) {
    console.warn('Google disconnect notice:', err);
  }
}
