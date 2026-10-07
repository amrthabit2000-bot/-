export type Player = 0 | 1; // 0 = White (الأبيض), 1 = Black (الأسود)

export type GameVariant = 'tawla31' | 'mahbousa';

export type GameMode = 'ai' | 'passAndPlay' | 'online';

export type AIDifficulty = 'easy' | 'medium' | 'pro' | 'learned';

export type BoardTheme =
  | 'arabesque'      // خشب الجوز الدمشقي والأرابيسك الملكي
  | 'mahogany'       // خشب الماهوجني الكوبي الكلاسيكي
  | 'aswanEbony'     // أبنوس أسوان الملكي وعاج الفيل
  | 'alexShell'      // خشب الورد الفاخر ومطعّم الصدف الإسكندراني
  | 'beechWood'      // خشب الزان الرومي المعتّق
  | 'goldenOak'      // البلوط الذهبي الأندلسي
  | 'oliveWood'      // خشب الزيتون السيناوي المعرق
  | 'royalAcacia'    // خشب السنط والأكاسيا النيلي
  | 'smokedBurl'     // قشرة السيكامور والخشب المحروق
  | 'burmaTeak'      // خشب التيك البورمي الفاخر
  | 'cedarLebanon'   // خشب الأرز اللبناني التراثي
  | 'cairoCafe1920'  // طراز المقهى القاهري القديم ١٩٢٠
  | 'fatimidInlay'   // الطاولة الصدفية الفاطمية التراثية
  | 'brassEbony'     // خشب الأبنوس المعرق بالنحاس الأصفر
  | 'canadianMaple'  // خشب القيقب الكندي مع لباد أخضر ملكي
  | 'darkCherry'     // خشب الكرز الداكن مع جلد بني فاخر
  | 'sandalwood'     // خشب الصندل العطري مع تطعيم الفضة
  | 'volcanicAsh'    // خشب المران البركاني الأسود
  | 'abdeenVelvet'   // طراز قصر عابدين المخملي
  | 'khanElKhalili'; // طاولة خان الخليلي النحاسية الأصيلة

export interface Move {
  from: number; // 0..23 in player's track perspective
  to: number;   // 0..23 or 24 for borne off
  die: number;  // The die value used for this move
}

export interface CombinedMove {
  from: number;
  to: number;
  dice: number[];
  sum: number;
  label: string; // e.g. "٣+٣+٣+٣=١٢" or "٣+٥=٨"
  moves: Move[];
  firstMove: Move;
  secondMove: Move;
}

export interface BoardState31 {
  // c[player][trackIndex] = count of checkers on that track point (0..23)
  c: [number[], number[]];
  // o[player] = count of borne off checkers (0..15)
  o: [number, number];
  // ar[player] = boolean flag indicating whether the 1st checker has reached the home quadrant (18..23)
  ar: [boolean, boolean];
}

export interface GameLogEntry {
  id: string;
  roundNumber: number;
  player: Player;
  roll: [number, number];
  diceName: string;
  moves: Array<{
    die: number;
    fromName: string;
    toName: string;
    actionType: 'move' | 'bearOff' | 'pin';
  }>;
  skipped: boolean;
  scoreAfter: [number, number];
  timestamp: string;
}

export type GamePhase =
  | 'initialRoll'
  | 'turnRoll'
  | 'playerMove'
  | 'aiThinking'
  | 'roundFinished'
  | 'matchFinished';

export interface OnlineUser {
  id: string;
  name: string;
}

export interface OnlineRoomState {
  roomCode: string;
  white: OnlineUser | null;
  black: OnlineUser | null;
  spectators: OnlineUser[];
  boardState: BoardState31;
  turn: Player;
  phase: GamePhase;
  roundNumber: number;
  matchScore: [number, number];
  roll: [number, number] | null;
  initialRoll?: [number, number] | null;
  remainingDice: number[];
  sweetPhrase: string | null;
  statusMessage: string;
  gameLogs: GameLogEntry[];
  gameState?: any;
}
