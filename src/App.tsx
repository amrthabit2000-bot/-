/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AIDifficulty,
  BoardState31,
  BoardTheme,
  CombinedMove,
  GameLogEntry,
  GameMode,
  GamePhase,
  GameVariant,
  Move,
  OnlineRoomState,
  Player,
} from './types/tawla';
import {
  applyMove31,
  canPlayerMoveWithAnyDie,
  cloneState31,
  createFreshState31,
  getCombinedMovesForSelection,
  getLegalMoves31,
  getPointDisplayName,
  isHomeQuadrantBlocked,
  toArabicDigits,
} from './utils/rules31';
import {
  BoardStateMahbousa,
  createFreshStateMahbousa,
  cloneStateMahbousa,
  getLegalMovesMahbousa,
  applyMoveMahbousa,
  getCombinedMovesMahbousaForSelection,
  isKhashabWin,
  canBearOffMahbousa,
} from './utils/rulesMahbousa';
import { getBestMove31, recordHumanGameResult, recordHumanMove } from './utils/ai';
import { getBestMoveMahbousa } from './utils/aiMahbousa';
import { sound } from './utils/audio';
import { getDiceCallName, getSweetVoicePhrase, getDiceSingleName, PLAYER_NAMES } from './utils/diceNames';
import { ScoreBoard } from './components/ScoreBoard';
import { Board } from './components/Board';
import { GameLogModal } from './components/GameLogModal';
import { RulesModal } from './components/RulesModal';
import { VictoryModal } from './components/VictoryModal';
import confetti from 'canvas-confetti';
import { ThemeModal } from './components/ThemeModal';
import { SettingsModal } from './components/SettingsModal';
import { FriendsModal, Friend } from './components/FriendsModal';
import { TournamentsModal, Tournament } from './components/TournamentsModal';
import { InGameChatModal, ChatMessage } from './components/InGameChatModal';
import { DiceStyleModal, DiceStyle } from './components/DiceStyleModal';
import { LobbyScreen } from './components/LobbyScreen';
import { AILearningModal } from './components/AILearningModal';
import { OnlineRoomBar } from './components/OnlineRoomBar';
import { OnlineRoomModal } from './components/OnlineRoomModal';
import { ProfileAndStatsModal } from './components/ProfileAndStatsModal';
import { AIDicePhysicsLabModal } from './components/AIDicePhysicsLabModal';
import { WinEquityBar } from './components/WinEquityBar';
import { calculateWinEquity } from './utils/equityCalculator';
import { LuckAndStatsModal } from './components/LuckAndStatsModal';
import { DailyRewardsModal } from './components/DailyRewardsModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { ConnectedAccountsModal } from './components/ConnectedAccountsModal';
import { StoreModal } from './components/StoreModal';
import { ChallengeMatchesModal, ChallengeTable } from './components/ChallengeMatchesModal';
import { GooglePlayModal } from './components/GooglePlayModal';
import {
  fetchUserDailyProgress,
  recordDailyMatchInFirebase,
  saveMatchToFirebase,
  updateUserCoinsAndInventoryInFirebase,
  UserDailyProgress,
  getTodayDateString,
  GoogleAccountProfile,
  auth,
} from './utils/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { recordMatchOutcome } from './utils/userProfile';
import { THEMES } from './utils/themes';
import {
  Dices,
  Sparkles,
  Hourglass,
  ArrowRight,
  MessageSquare,
  Users,
  Trophy,
  ShoppingBag,
  Swords,
  Coins,
  Download,
  Settings,
  Volume2,
  VolumeX,
  Bot,
  CheckCircle2,
  Play,
  Zap,
  TrendingUp,
  Film,
  Gift,
  Headphones,
  Globe2,
} from 'lucide-react';

const BOT_CHAMPIONS: Friend[] = [
  {
    id: 'f_1',
    name: 'عماد الشيمي (المعلم)',
    avatar: '🧔🏻‍♂️',
    status: 'online',
    title: 'حريف طاولة ٣١',
    winRate: 68,
    totalMatches: 142,
  },
  {
    id: 'f_2',
    name: 'كريم الباشا',
    avatar: '👨🏽‍💼',
    status: 'online',
    title: 'أستاذ المحبوسة',
    winRate: 74,
    totalMatches: 210,
  },
  {
    id: 'f_3',
    name: 'ياسمين فؤاد',
    avatar: '👩🏻‍🦰',
    status: 'online',
    title: 'بطلة مقهى الفيشاوي',
    winRate: 61,
    totalMatches: 88,
  },
  {
    id: 'f_4',
    name: 'محمود الصعيدي',
    avatar: '👳🏽‍♂️',
    status: 'online',
    title: 'سفير البكجامون',
    winRate: 59,
    totalMatches: 165,
  },
  {
    id: 'f_5',
    name: 'طارق الألفي',
    avatar: '👨🏻‍💻',
    status: 'online',
    title: 'عاشق الدوبارة',
    winRate: 53,
    totalMatches: 79,
  },
];

/**
 * Triggers festive celebration confetti effects using canvas-confetti
 * - Single burst for winning a round
 * - Multi-stage fireworks and side cannons for winning an entire match (31 points)
 */
export const triggerVictoryConfetti = (isMatchWin: boolean) => {
  try {
    // Stage 1: Central Festive Explosion
    confetti({
      particleCount: isMatchWin ? 140 : 85,
      spread: 95,
      origin: { y: 0.55 },
      colors: ['#ffd700', '#f59e0b', '#d97706', '#10b981', '#3b82f6', '#ffffff'],
      zIndex: 99999,
      disableForReducedMotion: true,
    });

    // Stage 2: Side Cannons for a Full Match Win
    if (isMatchWin) {
      setTimeout(() => {
        confetti({
          particleCount: 65,
          angle: 60,
          spread: 55,
          origin: { x: 0.05, y: 0.65 },
          colors: ['#ffd700', '#f59e0b', '#fffbeb'],
          zIndex: 99999,
        });
        confetti({
          particleCount: 65,
          angle: 120,
          spread: 55,
          origin: { x: 0.95, y: 0.65 },
          colors: ['#ffd700', '#f59e0b', '#fffbeb'],
          zIndex: 99999,
        });
      }, 250);

      setTimeout(() => {
        confetti({
          particleCount: 90,
          spread: 110,
          origin: { y: 0.4 },
          colors: ['#ffd700', '#d97706', '#10b981'],
          zIndex: 99999,
        });
      }, 500);
    }
  } catch (err) {
    console.error('Confetti execution error:', err);
  }
};

export default function App() {
  // Game Setup & Modes
  const [gameMode, setGameMode] = useState<GameMode>('ai');
  const [gameVariant, setGameVariant] = useState<GameVariant>('tawla31');
  const [boardTheme, setBoardTheme] = useState<BoardTheme>('arabesque');
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>('learned');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Match & Round States
  const [matchScore, setMatchScore] = useState<[number, number]>([0, 0]);
  const [roundNumber, setRoundNumber] = useState<number>(1);
  const [lastRoundWinner, setLastRoundWinner] = useState<Player | null>(null);
  const [phase, setPhase] = useState<GamePhase>('initialRoll');
  const [turn, setTurn] = useState<Player>(0);

  // Factory for fresh board state depending on game variant
  const createInitialState = useCallback((variant: GameVariant) => {
    return variant === 'mahbousa' ? createFreshStateMahbousa() : createFreshState31();
  }, []);

  // Board State
  const [boardState, setBoardState] = useState<BoardState31 | BoardStateMahbousa>(() =>
    createFreshState31()
  );
  const [selectedTrackIndex, setSelectedTrackIndex] = useState<number | null>(null);
  const [selectedDie, setSelectedDie] = useState<number | null>(null);
  const [hintedTrackIndex, setHintedTrackIndex] = useState<number | null>(null);

  // Turn Undo Buffer
  const [turnInitialState, setTurnInitialState] = useState<{
    board: BoardState31 | BoardStateMahbousa;
    dice: number[];
  } | null>(null);

  // Dice States
  const [initialRoll, setInitialRoll] = useState<[number, number] | null>(null);
  const [roll, setRoll] = useState<[number, number] | null>(null);
  const [sweetPhrase, setSweetPhrase] = useState<string | null>(null);
  const [remainingDice, setRemainingDice] = useState<number[]>([]);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>(
    'مرحباً بك في طاولة ٣١ المصرية! الأبيض يرمي ظهر واحد لتحديد صاحب الرمية الأولى 🎲'
  );

  // Victory State
  const [victoryState, setVictoryState] = useState<{
    isOpen: boolean;
    winner: Player;
    roundPoints: number;
    isMatchWin: boolean;
  } | null>(null);

  // Screens & Navigation
  const [currentScreen, setCurrentScreen] = useState<'lobby' | 'game'>('lobby');

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isFriendsOpen, setIsFriendsOpen] = useState<boolean>(false);
  const [isTournamentsOpen, setIsTournamentsOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [isDiceStyleOpen, setIsDiceStyleOpen] = useState<boolean>(false);
  const [diceStyle, setDiceStyle] = useState<DiceStyle>('ivory');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [activeSpeechBubble, setActiveSpeechBubble] = useState<{ text: string; sender: string } | null>(null);
  const [isLogOpen, setIsLogOpen] = useState<boolean>(false);
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState<boolean>(false);
  const [isLearningModalOpen, setIsLearningModalOpen] = useState<boolean>(false);
  const [isOnlineModalOpen, setIsOnlineModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isAiLabOpen, setIsAiLabOpen] = useState<boolean>(false);
  const [gameLogs, setGameLogs] = useState<GameLogEntry[]>([]);
  const [showEquityBar, setShowEquityBar] = useState<boolean>(true);
  const [isLuckModalOpen, setIsLuckModalOpen] = useState<boolean>(false);
  const [previousEquity, setPreviousEquity] = useState<number | null>(null);
  const [isDailyRewardsOpen, setIsDailyRewardsOpen] = useState<boolean>(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [isConnectedAccountsOpen, setIsConnectedAccountsOpen] = useState<boolean>(false);
  const [isStoreOpen, setIsStoreOpen] = useState<boolean>(false);
  const [isChallengesOpen, setIsChallengesOpen] = useState<boolean>(false);
  const [isGooglePlayOpen, setIsGooglePlayOpen] = useState<boolean>(false);
  const [activeChallenge, setActiveChallenge] = useState<ChallengeTable | null>(null);
  const [googleProfile, setGoogleProfile] = useState<GoogleAccountProfile | null>(null);
  const [dailyProgress, setDailyProgress] = useState<UserDailyProgress | null>(null);

  // Sync Google Auth state from Firebase on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && !user.isAnonymous) {
        setGoogleProfile({
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          uid: user.uid,
        });
      } else {
        setGoogleProfile(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync Firebase Daily Rewards on Mount
  useEffect(() => {
    fetchUserDailyProgress()
      .then((prog) => {
        if (prog) setDailyProgress(prog);
      })
      .catch((err) => {
        console.warn('Firebase daily progress sync notice:', err);
      });
  }, []);

  // Real-time Win Equity & Tactical Blunder Evaluation (GNUbg Model)
  const equityEval = useMemo(
    () => calculateWinEquity(boardState, turn, gameVariant, previousEquity),
    [boardState, turn, gameVariant, previousEquity]
  );

  useEffect(() => {
    setPreviousEquity(turn === 0 ? equityEval.whiteEquity : equityEval.blackEquity);
  }, [turn]);

  // Online Multiplayer State
  const [clientId] = useState<string>(() => {
    let id = sessionStorage.getItem('tawla_client_id');
    if (!id) {
      id = 'client_' + Math.random().toString(36).substring(2, 9);
      sessionStorage.setItem('tawla_client_id', id);
    }
    return id;
  });
  const [playerName, setPlayerName] = useState<string>(() => {
    return localStorage.getItem('tawla_player_name') || 'لاعب طاولة';
  });
  const [onlineRoom, setOnlineRoom] = useState<OnlineRoomState | null>(null);
  const [onlineOpponentBot, setOnlineOpponentBot] = useState<Friend | null>(null);
  const [initialRollStep, setInitialRollStep] = useState<'white' | 'black' | 'done'>('white');
  const [initialWhiteDie, setInitialWhiteDie] = useState<number | null>(null);
  const [initialBlackDie, setInitialBlackDie] = useState<number | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const resetOpeningRoll = useCallback(() => {
    setInitialRoll(null);
    setInitialWhiteDie(null);
    setInitialBlackDie(null);
    setInitialRollStep('white');
  }, []);

  // Dynamic player names for white & black sides
  const activeWhiteName = useMemo(() => {
    if (gameMode === 'online' && onlineRoom?.white) return onlineRoom.white.name;
    if (gameMode === 'passAndPlay') return 'اللاعب الأبيض';
    return playerName || 'أنت (الأبيض)';
  }, [gameMode, onlineRoom, playerName]);

  const activeBlackName = useMemo(() => {
    if (onlineOpponentBot) return `${onlineOpponentBot.name} ${onlineOpponentBot.avatar}`;
    if (gameMode === 'online' && onlineRoom?.black) return onlineRoom.black.name;
    if (gameMode === 'passAndPlay') return 'اللاعب الأسود';
    return 'الكمبيوتر الذكي (AI)';
  }, [onlineOpponentBot, gameMode, onlineRoom]);

  // Check if current user is spectator in online mode
  const isSpectator = useMemo(() => {
    if (gameMode !== 'online' || !onlineRoom) return false;
    const isWhite = onlineRoom.white?.id === clientId;
    const isBlack = onlineRoom.black?.id === clientId;
    return !isWhite && !isBlack;
  }, [gameMode, onlineRoom, clientId]);

  // Check if current player is completely locked/blocked with NO moves on ANY die (1..6)
  const isCompletelyBlocked = useMemo(() => {
    if (phase !== 'turnRoll') return false;
    return !canPlayerMoveWithAnyDie(boardState, turn);
  }, [phase, boardState, turn]);

  // Check if it is currently THIS client's active turn to play
  const isMyActiveTurn = useMemo(() => {
    if (isSpectator) return false;
    if (gameMode === 'ai') {
      return turn === 0;
    }
    if (gameMode === 'online' && onlineRoom) {
      const mySeat = onlineRoom.white?.id === clientId ? 0 : onlineRoom.black?.id === clientId ? 1 : null;
      return mySeat !== null && turn === mySeat;
    }
    // 2-player pass mode: both turns are local human players
    return true;
  }, [isSpectator, gameMode, turn, onlineRoom, clientId]);

  // Determine if the player can currently roll the dice
  const canRollNow = useMemo(() => {
    if (isSpectator || isRolling || isCompletelyBlocked) return false;
    if (phase === 'initialRoll') {
      if (initialRollStep === 'white') {
        if (gameMode === 'online' && onlineRoom) {
          return onlineRoom.white?.id === clientId;
        }
        return true;
      }
      if (initialRollStep === 'black') {
        if (gameMode === 'ai') return false; // AI rolls automatically
        if (gameMode === 'online' && onlineRoom) {
          return onlineRoom.black?.id === clientId;
        }
        return true; // pass and play mode
      }
      return false;
    }
    return isMyActiveTurn && phase === 'turnRoll';
  }, [isSpectator, isRolling, isCompletelyBlocked, phase, initialRollStep, gameMode, onlineRoom, clientId, isMyActiveTurn]);

  // Turn Move Accumulator for Logging
  const currentTurnMovesRef = useRef<
    Array<{
      die: number;
      fromName: string;
      toName: string;
      actionType: 'move' | 'bearOff' | 'pin';
    }>
  >([]);

  // Calculate live Pip Counts
  const pipCounts = useMemo<[number, number]>(() => {
    let white = 0;
    let black = 0;
    for (let k = 0; k < 24; k++) {
      white += boardState.c[0][k] * (24 - k);
      black += boardState.c[1][k] * (24 - k);
    }
    return [white, black];
  }, [boardState]);

  // Toggle Sound FX
  const toggleSound = () => {
    const nextState = !soundEnabled;
    sound.soundEnabled = nextState;
    setSoundEnabled(nextState);
    if (nextState) {
      sound.playCheckerMove('move');
    }
  };

  // Broadcast game state in online mode
  const broadcastOnlineState = useCallback((updatedState: Partial<OnlineRoomState>) => {
    if (gameMode === 'online' && wsRef.current && wsRef.current.readyState === WebSocket.OPEN && onlineRoom) {
      const fullNewState = {
        boardState,
        turn,
        phase,
        roundNumber,
        matchScore,
        roll,
        remainingDice,
        sweetPhrase,
        statusMessage,
        gameLogs,
        ...updatedState,
      };

      wsRef.current.send(
        JSON.stringify({
          type: 'GAME_ACTION',
          roomCode: onlineRoom.roomCode,
          clientId,
          newGameState: fullNewState,
        })
      );
    }
  }, [gameMode, onlineRoom, clientId, boardState, turn, phase, roundNumber, matchScore, roll, remainingDice, sweetPhrase, statusMessage, gameLogs]);

  // Connect to Online Room via WebSocket
  const connectToRoom = useCallback((roomCode: string, name: string) => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: 'JOIN_ROOM',
          roomCode,
          clientId,
          playerName: name,
          initialGameState: {
            boardState: createFreshState31(),
            turn: 0,
            phase: 'initialRoll',
            roundNumber: 1,
            matchScore: [0, 0],
            roll: null,
            remainingDice: [],
            sweetPhrase: null,
            statusMessage: 'مرحباً بكم في الغرفة! اقعد أبيض أو أسود للبدء.',
            gameLogs: [],
          },
        })
      );
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'ROOM_UPDATE') {
          const rState: OnlineRoomState = msg.roomState;
          setOnlineRoom(rState);

          if (rState.gameState) {
            setBoardState(rState.gameState.boardState);
            setTurn(rState.gameState.turn);
            setPhase(rState.gameState.phase);
            setRoundNumber(rState.gameState.roundNumber);
            setMatchScore(rState.gameState.matchScore);
            setRoll(rState.gameState.roll);
            setRemainingDice(rState.gameState.remainingDice);
            setSweetPhrase(rState.gameState.sweetPhrase);
            setStatusMessage(rState.gameState.statusMessage);
            if (rState.gameState.gameLogs) setGameLogs(rState.gameState.gameLogs);
          }
        }

        if (msg.type === 'NEW_CHAT_MESSAGE') {
          setChatMessages((prev) => [...prev, msg.message]);
          setActiveSpeechBubble({ text: msg.message.text, sender: msg.message.senderName });
          sound.playCheckerMove('move');
          setTimeout(() => setActiveSpeechBubble(null), 4500);
        }
      } catch (err) {
        console.error('Error parsing room update:', err);
      }
    };

    setGameMode('online');
  }, [clientId]);

  // Auto-connect if URL has ?room=...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlRoom = params.get('room');
    if (urlRoom) {
      connectToRoom(urlRoom.toUpperCase(), playerName);
    }
  }, [connectToRoom, playerName]);

  // Take seat in online room
  const handleTakeSeat = (seat: 'white' | 'black') => {
    if (wsRef.current && onlineRoom) {
      wsRef.current.send(
        JSON.stringify({
          type: 'TAKE_SEAT',
          roomCode: onlineRoom.roomCode,
          clientId,
          playerName,
          seat,
        })
      );
    }
  };

  // Leave seat in online room
  const handleLeaveSeat = () => {
    if (wsRef.current && onlineRoom) {
      wsRef.current.send(
        JSON.stringify({
          type: 'LEAVE_SEAT',
          roomCode: onlineRoom.roomCode,
          clientId,
        })
      );
    }
  };

  // Start game from Lobby (Step 1 -> Step 2)
  const handleStartGameFromLobby = (
    variant: GameVariant,
    mode: GameMode,
    difficulty?: AIDifficulty
  ) => {
    setGameVariant(variant);
    if (difficulty) setAiDifficulty(difficulty);

    if (mode === 'online') {
      setIsOnlineModalOpen(true);
      setCurrentScreen('game');
    } else {
      setGameMode(mode);
      setBoardState(createInitialState(variant));
      setMatchScore([0, 0]);
      setRoundNumber(1);
      setLastRoundWinner(null);
      setSelectedTrackIndex(null);
      setSelectedDie(null);
      setTurnInitialState(null);
      resetOpeningRoll();
      setRoll(null);
      setRemainingDice([]);
      setPhase('initialRoll');
      setVictoryState(null);
      setCurrentScreen('game');
      setStatusMessage(
        variant === 'mahbousa'
          ? 'بدأت مباراة المحبوسة! الأبيض يرمي ظهر واحد لتحديد صاحب الرمية الأولى 🎲'
          : 'بدأت مباراة طاولة ٣١ المصرية! الأبيض يرمي ظهر واحد لتحديد صاحب الرمية الأولى 🎲'
      );
    }
  };

  // In-Game Chat Message Sender
  const handleSendMessage = (text: string, isQuickPhrase?: boolean) => {
    const newMsg: ChatMessage = {
      id: 'msg_' + Math.random().toString(36).substring(2, 9),
      senderId: clientId,
      senderName: playerName || 'أنا',
      text,
      isQuickPhrase,
      timestamp: Date.now(),
    };

    if (gameMode === 'online' && wsRef.current && onlineRoom) {
      wsRef.current.send(
        JSON.stringify({
          type: 'CHAT_MESSAGE',
          roomCode: onlineRoom.roomCode,
          clientId,
          senderName: playerName,
          text,
          isQuickPhrase,
        })
      );
    } else {
      setChatMessages((prev) => [...prev, newMsg]);
      setActiveSpeechBubble({ text, sender: playerName });
      setTimeout(() => setActiveSpeechBubble(null), 4500);

      // In AI mode, simulate humorous Egyptian café replies
      if (gameMode === 'ai' && Math.random() > 0.25) {
        setTimeout(() => {
          const aiReplies = [
            'الملعوب ملعوب يا معلم 😉',
            'شيش بيش جاي في السكة 🎲',
            'على مهلك يا حريف 😎',
            'حظك نار النهاردة ما شاء الله! 🔥',
            'ركز في الرقعة وسيبك من الكلام ☕',
            'والله رمية معلم! 👏',
            'عاش يا بطل، نشوف الرمية الجاية 🎩',
          ];
          const replyText = aiReplies[Math.floor(Math.random() * aiReplies.length)];
          const aiMsg: ChatMessage = {
            id: 'msg_ai_' + Math.random().toString(36).substring(2, 9),
            senderId: 'ai',
            senderName: 'الكمبيوتر (المعلم)',
            text: replyText,
            timestamp: Date.now(),
          };
          setChatMessages((prev) => [...prev, aiMsg]);
          setActiveSpeechBubble({ text: replyText, sender: 'الكمبيوتر (المعلم)' });
          setTimeout(() => setActiveSpeechBubble(null), 4500);
        }, 1100);
      }
    }
  };

  // Quick Match with Bot or Invited Friend (بوتات أونلاين متقدمة بمستوى محترف)
  const handleQuickMatchWithBot = (chosenBot?: Friend) => {
    const bot = chosenBot || BOT_CHAMPIONS[Math.floor(Math.random() * BOT_CHAMPIONS.length)];
    setOnlineOpponentBot(bot);
    setGameMode('ai');
    setAiDifficulty('pro');
    const roomCode = 'TAWLA-' + Math.floor(1000 + Math.random() * 9000);
    setOnlineRoom({
      roomCode,
      white: { id: clientId, name: playerName || 'أنت' },
      black: { id: bot.id, name: bot.name },
      spectators: [],
      boardState: createInitialState(gameVariant),
      turn: 0,
      phase: 'initialRoll',
      roundNumber: 1,
      matchScore: [0, 0],
      roll: null,
      remainingDice: [],
      sweetPhrase: null,
      statusMessage: `قبل ${bot.name} ${bot.avatar} دعوتك فوراً وجلس أمامك على الطاولة! ارمِ الزهر لتحديد البادئ.`,
      gameLogs: [],
    });
    setBoardState(createInitialState(gameVariant));
    setMatchScore([0, 0]);
    setRoundNumber(1);
    setPhase('initialRoll');
    resetOpeningRoll();
    setRoll(null);
    setRemainingDice([]);
    setCurrentScreen('game');
    setIsFriendsOpen(false);
    setIsOnlineModalOpen(false);

    // Realistic welcoming banter from the online bot
    setTimeout(() => {
      const greetings = [
        `يا هلا بيك يا حريف! جاهز للتحدي.. ارمِ الزهر ورينا لعبك 🎲☕`,
        `قبلت التحدي يا معلم! ركز معايا بقى لأن مش هسيبلك خانة واحدة 😉`,
        `مساء الجمال يا بطل! ماتش طاولة على أصوله.. ورينا حظك والرميات 🔥`,
      ];
      const text = greetings[Math.floor(Math.random() * greetings.length)];
      const botMsg: ChatMessage = {
        id: 'msg_bot_' + Math.random().toString(36).substring(2, 9),
        senderId: bot.id,
        senderName: bot.name,
        text,
        timestamp: Date.now(),
      };
      setChatMessages((prev) => [...prev, botMsg]);
      setActiveSpeechBubble({ text, sender: bot.name });
      setTimeout(() => setActiveSpeechBubble(null), 5000);
    }, 900);

    setStatusMessage(`قبل ${bot.name} ${bot.avatar} دعوتك فوراً وجلس أمامك! ارمِ الزهر لتحديد البادئ.`);
  };

  // Invite Friend handler (يدخل الصديق كبوت متقدم فوراً بدلاً من الانتظار)
  const handleInviteFriend = (friend: Friend) => {
    handleQuickMatchWithBot(friend);
  };

  // Start Tournament Match handler
  const handleStartTournamentMatch = (tourn: Tournament) => {
    setGameVariant(tourn.variant);
    setGameMode('ai');
    setAiDifficulty('pro');
    setBoardState(createInitialState(tourn.variant));
    setMatchScore([0, 0]);
    setRoundNumber(1);
    resetOpeningRoll();
    setRoll(null);
    setRemainingDice([]);
    setPhase('initialRoll');
    setVictoryState(null);
    setCurrentScreen('game');
    setStatusMessage(`بدأت مباراة ${tourn.name}! الأبيض يرمي ظهر واحد لتحديد البادئ 🎲`);
  };

  // Start Challenge Match handler (مباريات التحدي بالرهان)
  const handleStartChallengeMatch = async (table: ChallengeTable, variant: GameVariant) => {
    const currentCoins = dailyProgress?.coins || 1000;
    if (currentCoins < table.entryStake) {
      alert('رصيد الكوينز غير كافٍ لدخول هذا التحدي.');
      return;
    }

    const updated = await updateUserCoinsAndInventoryInFirebase({
      coins: currentCoins - table.entryStake,
    });
    setDailyProgress(updated);
    setActiveChallenge(table);

    setGameVariant(variant);
    setGameMode('ai');
    setAiDifficulty(table.difficulty);
    setOnlineOpponentBot({
      id: 'challenger_' + table.id,
      name: table.opponentName,
      avatar: table.opponentAvatar,
      status: 'online',
      title: `${table.opponentRating} ELO`,
      winRate: 75,
      totalMatches: 200,
    });

    setBoardState(createInitialState(variant));
    setMatchScore([0, 0]);
    setRoundNumber(1);
    resetOpeningRoll();
    setRoll(null);
    setRemainingDice([]);
    setPhase('initialRoll');
    setVictoryState(null);
    setCurrentScreen('game');

    setStatusMessage(`بدأت مباراة التحدي على ${table.title}! الخصم: ${table.opponentName} (${table.opponentRating} ELO) ⚔️`);
  };

  // Finish a Round
  const handleFinishRound = useCallback(
    (
      winner: Player,
      points: number,
      updatedScore: [number, number],
      specialWinType?: 'khashab' | 'sadd_kamel' | 'normal'
    ) => {
      sound.playWinFanfare();
      const isMatch = updatedScore[winner] >= 31;

      // Remember round winner for next round!
      setLastRoundWinner(winner);

      // Train AI on game outcome
      recordHumanGameResult(winner === 0);

      // Record match outcome into Player Profile & Recharts Match History & Golden Achievements
      const opponentDisplayName = activeChallenge
        ? activeChallenge.opponentName
        : gameMode === 'ai'
        ? 'الكمبيوتر الذكي'
        : 'المنافس';

      const result = recordMatchOutcome(
        winner === 0,
        updatedScore[0],
        updatedScore[1],
        opponentDisplayName,
        specialWinType,
        isMatch
      );

      // Calculate Challenge Coins Reward & Higher Rating ELO Bonus
      let coinsGained = 0;
      let finalRating = result.profile.rating;

      if (winner === 0 && activeChallenge) {
        coinsGained = activeChallenge.rewardCoins;
        const eloDiff = Math.max(0, activeChallenge.opponentRating - (dailyProgress?.rating || 1290));
        const bonusElo = activeChallenge.bonusElo + Math.round(eloDiff / 15);
        finalRating += bonusElo;

        updateUserCoinsAndInventoryInFirebase({
          coins: (dailyProgress?.coins || 1000) + coinsGained,
          rating: finalRating,
        }).then((upd) => setDailyProgress(upd));

        sound.playCelebration();
        setTimeout(() => {
          setStatusMessage(`🏆 مبروك! فزت بمباراة التحدي ضد ${activeChallenge.opponentName} وحصلت على ${coinsGained} كوينز 🪙 و +${bonusElo} نقطة ELO إضافية!`);
        }, 1500);
      } else if (winner === 0) {
        coinsGained = 50; // Standard match victory bonus
        updateUserCoinsAndInventoryInFirebase({
          coins: (dailyProgress?.coins || 1000) + coinsGained,
        }).then((upd) => setDailyProgress(upd));
      }

      // Save match in Firebase Firestore (preserving latest 20 matches)
      saveMatchToFirebase({
        opponentName: opponentDisplayName,
        winner: winner === 0 ? 'player' : 'opponent',
        playerPoints: updatedScore[0],
        opponentPoints: updatedScore[1],
        ratingAfter: finalRating,
        coinsWon: winner === 0 ? coinsGained : (activeChallenge ? -activeChallenge.entryStake : 0),
      });

      // Celebrate newly unlocked achievements!
      if (winner === 0 && result.newlyUnlocked && result.newlyUnlocked.length > 0) {
        sound.playCelebration();
        const names = result.newlyUnlocked.map((a) => a.title).join(' • ');
        setTimeout(() => {
          setStatusMessage(`🎖️ وسام ذهبي جديد تم إنجازه: ${names}! تفقد بروفايلك`);
        }, 1200);
      }

      // Record daily match completion in Firebase for Daily Reward unlock
      recordDailyMatchInFirebase()
        .then((updated) => {
          if (updated) {
            setDailyProgress(updated);
            const today = getTodayDateString();
            if (updated.lastClaimedDate !== today) {
              setTimeout(() => {
                setStatusMessage('🎁 أحسنت! أكملت شرط مباراة اليوم بنجاح ومكافأتك اليومية جاهزة للاستلام الآن!');
              }, 2500);
            }
          }
        })
        .catch(() => {});

      // Trigger festive celebration confetti upon winning round or match!
      triggerVictoryConfetti(isMatch);

      setVictoryState({
        isOpen: true,
        winner,
        roundPoints: points,
        isMatchWin: isMatch,
      });
      setPhase('roundFinished');

      if (gameMode === 'online') {
        broadcastOnlineState({
          matchScore: updatedScore,
          phase: 'roundFinished',
        });
      }
    },
    [gameMode, broadcastOnlineState]
  );

  // End a Turn and Pass to Opponent
  const endTurn = useCallback(() => {
    setSelectedTrackIndex(null);
    setSelectedDie(null);
    setHintedTrackIndex(null);
    setRemainingDice([]);
    setTurnInitialState(null);

    const nextPlayer: Player = turn === 0 ? 1 : 0;
    setTurn(nextPlayer);
    setPhase('turnRoll');
    const msg = `دور ${PLAYER_NAMES[nextPlayer]} — ${
      gameMode === 'ai' && nextPlayer === 1 ? 'الكمبيوتر يستعد للرمي...' : 'ارمِ الزهر'
    }`;
    setStatusMessage(msg);

    if (gameMode === 'online') {
      broadcastOnlineState({
        turn: nextPlayer,
        phase: 'turnRoll',
        remainingDice: [],
        statusMessage: msg,
      });
    }
  }, [turn, gameMode, broadcastOnlineState]);

  // Execute a Single Move
  const executeMove = useCallback(
    (move: Move) => {
      const fromName = getPointDisplayName(turn, move.from);
      const toName = getPointDisplayName(turn, move.to);
      let actionType: 'move' | 'bearOff' | 'pin' | 'stack' = move.to >= 24 ? 'bearOff' : 'move';
      if (gameVariant === 'mahbousa' && move.to < 24) {
        const oppTrack = 23 - move.to;
        const opponent: Player = turn === 0 ? 1 : 0;
        if ((boardState as BoardStateMahbousa).c[opponent][oppTrack] === 1) {
          actionType = 'pin';
        } else if (boardState.c[turn][move.to] > 0) {
          actionType = 'stack';
        }
      } else if (move.to < 24 && boardState.c[turn][move.to] > 0) {
        actionType = 'stack';
      }

      sound.playCheckerMove(actionType);
      setHintedTrackIndex(null);

      // Record human move for AI learning
      if (turn === 0 || gameMode === 'passAndPlay') {
        recordHumanMove(boardState, turn, move);
      }

      currentTurnMovesRef.current.push({
        die: move.die,
        fromName,
        toName,
        actionType: actionType === 'stack' ? 'move' : actionType,
      });

      const nextState = gameVariant === 'mahbousa'
        ? applyMoveMahbousa(boardState as BoardStateMahbousa, turn, move)
        : applyMove31(boardState as BoardState31, turn, move);

      setBoardState(nextState);
      setSelectedTrackIndex(null);
      setSelectedDie(null);

      // Consume die
      const updatedDice = remainingDice.slice();
      const dieIdx = updatedDice.indexOf(move.die);
      if (dieIdx !== -1) updatedDice.splice(dieIdx, 1);
      setRemainingDice(updatedDice);

      // 1. Check Win Condition by Bearing Off (all 15 checkers borne off)
      if (nextState.o[turn] === 15) {
        const opponent: Player = turn === 0 ? 1 : 0;
        const isKhashab = nextState.o[opponent] === 0;
        const pts = gameVariant === 'mahbousa'
          ? (isKhashab ? 2 : 1)
          : (15 - nextState.o[opponent]);
        const newScore: [number, number] = [matchScore[0], matchScore[1]];
        newScore[turn] += pts;
        setMatchScore(newScore);

        if (roll) {
          const entry: GameLogEntry = {
            id: Math.random().toString(36).substring(2, 9),
            roundNumber,
            player: turn,
            roll,
            diceName: getDiceCallName(roll[0], roll[1]),
            moves: [...currentTurnMovesRef.current],
            skipped: false,
            scoreAfter: newScore,
            timestamp: new Date().toLocaleTimeString('ar-EG'),
          };
          setGameLogs((prev) => [entry, ...prev]);
        }

        handleFinishRound(turn, pts, newScore, isKhashab ? 'khashab' : 'normal');
        return;
      }

      // 2. Mahbousa: Check Khashab Instant Win (حبس قشاط بداية الخصم الأخير في نقطة الصفر)
      if (gameVariant === 'mahbousa' && isKhashabWin(nextState as BoardStateMahbousa, turn)) {
        const pts = 2; // Mars / Khashab = 2 points
        const newScore: [number, number] = [matchScore[0], matchScore[1]];
        newScore[turn] += pts;
        setMatchScore(newScore);

        if (roll) {
          const entry: GameLogEntry = {
            id: Math.random().toString(36).substring(2, 9),
            roundNumber,
            player: turn,
            roll,
            diceName: getDiceCallName(roll[0], roll[1]),
            moves: [...currentTurnMovesRef.current],
            skipped: false,
            scoreAfter: newScore,
            timestamp: new Date().toLocaleTimeString('ar-EG'),
          };
          setGameLogs((prev) => [entry, ...prev]);
        }

        setStatusMessage(`فوز كاسح (خشب)! تم حبس قشاط بداية الخصم في نقطة الصفر! +٢ نقطة.`);
        handleFinishRound(turn, pts, newScore, 'khashab');
        return;
      }

      // 3. Tawla 31 Only: Check Win Condition by Trapping Opponent in Home Quadrant
      if (gameVariant === 'tawla31') {
        const opponent: Player = turn === 0 ? 1 : 0;
        if (isHomeQuadrantBlocked(nextState as BoardState31, opponent)) {
          const pts = 15;
          const newScore: [number, number] = [matchScore[0], matchScore[1]];
          newScore[turn] += pts;
          setMatchScore(newScore);

          if (roll) {
            const entry: GameLogEntry = {
              id: Math.random().toString(36).substring(2, 9),
              roundNumber,
              player: turn,
              roll,
              diceName: getDiceCallName(roll[0], roll[1]),
              moves: [...currentTurnMovesRef.current],
              skipped: false,
              scoreAfter: newScore,
              timestamp: new Date().toLocaleTimeString('ar-EG'),
            };
            setGameLogs((prev) => [entry, ...prev]);
          }

          setStatusMessage(`سد كامل! قُفل ربع لم ${PLAYER_NAMES[opponent]} بالكامل! +١٥ نقطة.`);
          handleFinishRound(turn, pts, newScore, 'sadd_kamel');
          return;
        }
      }

      // 3. Check Remaining Dice
      if (updatedDice.length === 0) {
        if (roll) {
          const entry: GameLogEntry = {
            id: Math.random().toString(36).substring(2, 9),
            roundNumber,
            player: turn,
            roll,
            diceName: getDiceCallName(roll[0], roll[1]),
            moves: [...currentTurnMovesRef.current],
            skipped: false,
            scoreAfter: matchScore,
            timestamp: new Date().toLocaleTimeString('ar-EG'),
          };
          setGameLogs((prev) => [entry, ...prev]);
        }
        endTurn();
      } else {
        const nextLegal = gameVariant === 'mahbousa'
          ? getLegalMovesMahbousa(nextState as BoardStateMahbousa, turn, updatedDice)
          : getLegalMoves31(nextState as BoardState31, turn, updatedDice);
        if (nextLegal.length === 0) {
          if (roll) {
            const entry: GameLogEntry = {
              id: Math.random().toString(36).substring(2, 9),
              roundNumber,
              player: turn,
              roll,
              diceName: getDiceCallName(roll[0], roll[1]),
              moves: [...currentTurnMovesRef.current],
              skipped: false,
              scoreAfter: matchScore,
              timestamp: new Date().toLocaleTimeString('ar-EG'),
            };
            setGameLogs((prev) => [entry, ...prev]);
          }
          setStatusMessage('لا توجد حركات أخرى قانونية مع الزهر المتبقي — تم تمرير الدور.');
          setTimeout(() => {
            endTurn();
          }, 1100);
        }
      }

      if (gameMode === 'online') {
        broadcastOnlineState({
          boardState: nextState,
          remainingDice: updatedDice,
        });
      }
    },
    [
      boardState,
      turn,
      remainingDice,
      matchScore,
      roundNumber,
      roll,
      gameMode,
      endTurn,
      handleFinishRound,
      broadcastOnlineState,
    ]
  );

  // Execute Combined Move (دعم النقل المباشر للمسافات المتعددة بما فيها الدبل ٣+٣+٣+٣=١٢)
  const executeCombinedMove = useCallback(
    (combinedMove: CombinedMove) => {
      setHintedTrackIndex(null);

      const movesToExecute = combinedMove.moves && combinedMove.moves.length > 0
        ? combinedMove.moves
        : [combinedMove.firstMove, combinedMove.secondMove];

      const lastMove = movesToExecute[movesToExecute.length - 1];
      let finalActionType: 'move' | 'bearOff' | 'pin' | 'stack' = lastMove.to >= 24 ? 'bearOff' : 'move';
      if (gameVariant === 'mahbousa' && lastMove.to < 24) {
        const oppTrack = 23 - lastMove.to;
        const opponent: Player = turn === 0 ? 1 : 0;
        if ((boardState as BoardStateMahbousa).c[opponent][oppTrack] === 1) {
          finalActionType = 'pin';
        }
      }
      sound.playCheckerMove(finalActionType);

      let currentState = boardState;

      for (let i = 0; i < movesToExecute.length; i++) {
        const m = movesToExecute[i];
        if (turn === 0 || gameMode === 'passAndPlay') {
          recordHumanMove(currentState as BoardState31, turn, m);
        }

        const fromName = getPointDisplayName(turn, m.from);
        const toName = getPointDisplayName(turn, m.to);
        const actionType = m.to >= 24 ? 'bearOff' : 'move';

        currentTurnMovesRef.current.push({
          die: m.die,
          fromName,
          toName,
          actionType,
        });

        currentState = gameVariant === 'mahbousa'
          ? applyMoveMahbousa(currentState as BoardStateMahbousa, turn, m)
          : applyMove31(currentState as BoardState31, turn, m);
      }

      setBoardState(currentState);
      setSelectedTrackIndex(null);
      setSelectedDie(null);

      // Consume the exact dice used for this combined move
      const updatedDice = remainingDice.slice();
      for (const d of combinedMove.dice) {
        const idx = updatedDice.indexOf(d);
        if (idx !== -1) updatedDice.splice(idx, 1);
      }
      setRemainingDice(updatedDice);

      // 1. Check Win Condition by Bearing Off
      if (currentState.o[turn] === 15) {
        const opponent: Player = turn === 0 ? 1 : 0;
        const isKhashab = currentState.o[opponent] === 0;
        const pts = gameVariant === 'mahbousa'
          ? (isKhashab ? 2 : 1)
          : (15 - currentState.o[opponent]);
        const newScore: [number, number] = [matchScore[0], matchScore[1]];
        newScore[turn] += pts;
        setMatchScore(newScore);

        if (roll) {
          const entry: GameLogEntry = {
            id: Math.random().toString(36).substring(2, 9),
            roundNumber,
            player: turn,
            roll,
            diceName: getDiceCallName(roll[0], roll[1]),
            moves: [...currentTurnMovesRef.current],
            skipped: false,
            scoreAfter: newScore,
            timestamp: new Date().toLocaleTimeString('ar-EG'),
          };
          setGameLogs((prev) => [entry, ...prev]);
        }

        handleFinishRound(turn, pts, newScore, isKhashab ? 'khashab' : 'normal');
        return;
      }

      // 2. Mahbousa: Check Khashab Instant Win
      if (gameVariant === 'mahbousa' && isKhashabWin(currentState as BoardStateMahbousa, turn)) {
        const pts = 2;
        const newScore: [number, number] = [matchScore[0], matchScore[1]];
        newScore[turn] += pts;
        setMatchScore(newScore);

        if (roll) {
          const entry: GameLogEntry = {
            id: Math.random().toString(36).substring(2, 9),
            roundNumber,
            player: turn,
            roll,
            diceName: getDiceCallName(roll[0], roll[1]),
            moves: [...currentTurnMovesRef.current],
            skipped: false,
            scoreAfter: newScore,
            timestamp: new Date().toLocaleTimeString('ar-EG'),
          };
          setGameLogs((prev) => [entry, ...prev]);
        }

        setStatusMessage(`فوز كاسح (خشب)! تم حبس قشاط بداية الخصم في نقطة الصفر! +٢ نقطة.`);
        handleFinishRound(turn, pts, newScore, 'khashab');
        return;
      }

      // 3. Tawla 31 Only: Check Win Condition by Trapping Opponent
      if (gameVariant === 'tawla31') {
        const opponent: Player = turn === 0 ? 1 : 0;
        if (isHomeQuadrantBlocked(currentState as BoardState31, opponent)) {
          const pts = 15;
          const newScore: [number, number] = [matchScore[0], matchScore[1]];
          newScore[turn] += pts;
          setMatchScore(newScore);

          if (roll) {
            const entry: GameLogEntry = {
              id: Math.random().toString(36).substring(2, 9),
              roundNumber,
              player: turn,
              roll,
              diceName: getDiceCallName(roll[0], roll[1]),
              moves: [...currentTurnMovesRef.current],
              skipped: false,
              scoreAfter: newScore,
              timestamp: new Date().toLocaleTimeString('ar-EG'),
            };
            setGameLogs((prev) => [entry, ...prev]);
          }

          setStatusMessage(`سد كامل! قُفل ربع لم ${PLAYER_NAMES[opponent]} بالكامل! +١٥ نقطة.`);
          handleFinishRound(turn, pts, newScore, 'sadd_kamel');
          return;
        }
      }

      // 4. Check if turn should end or if more dice remain
      if (updatedDice.length === 0) {
        if (roll) {
          const entry: GameLogEntry = {
            id: Math.random().toString(36).substring(2, 9),
            roundNumber,
            player: turn,
            roll,
            diceName: getDiceCallName(roll[0], roll[1]),
            moves: [...currentTurnMovesRef.current],
            skipped: false,
            scoreAfter: matchScore,
            timestamp: new Date().toLocaleTimeString('ar-EG'),
          };
          setGameLogs((prev) => [entry, ...prev]);
        }

        if (gameMode === 'online') {
          broadcastOnlineState({
            boardState: currentState,
            remainingDice: [],
          });
        }

        endTurn();
      } else {
        // If dice still remain (e.g. played 2 out of 4 on a double)
        const nextLegal = gameVariant === 'mahbousa'
          ? getLegalMovesMahbousa(currentState as BoardStateMahbousa, turn, updatedDice)
          : getLegalMoves31(currentState as BoardState31, turn, updatedDice);

        if (nextLegal.length === 0) {
          if (roll) {
            const entry: GameLogEntry = {
              id: Math.random().toString(36).substring(2, 9),
              roundNumber,
              player: turn,
              roll,
              diceName: getDiceCallName(roll[0], roll[1]),
              moves: [...currentTurnMovesRef.current],
              skipped: false,
              scoreAfter: matchScore,
              timestamp: new Date().toLocaleTimeString('ar-EG'),
            };
            setGameLogs((prev) => [entry, ...prev]);
          }
          setStatusMessage('لا توجد حركات أخرى قانونية مع الزهر المتبقي — تم تمرير الدور.');
          setTimeout(() => {
            endTurn();
          }, 1100);
        }
      }
    },
    [
      boardState,
      turn,
      matchScore,
      roundNumber,
      roll,
      gameMode,
      endTurn,
      handleFinishRound,
      broadcastOnlineState,
    ]
  );

  // Undo Last Move in Current Turn
  const handleUndoMove = () => {
    if (!turnInitialState || isSpectator) return;
    setBoardState(
      gameVariant === 'mahbousa'
        ? cloneStateMahbousa(turnInitialState.board as BoardStateMahbousa)
        : cloneState31(turnInitialState.board as BoardState31)
    );
    setRemainingDice([...turnInitialState.dice]);
    setSelectedTrackIndex(null);
    setSelectedDie(null);
    setHintedTrackIndex(null);
    currentTurnMovesRef.current = [];
    setStatusMessage('تم التراجع عن النقلة. اختر حركة أخرى.');
  };

  // AI Hint Suggestion
  const handleRequestHint = () => {
    if (phase !== 'playerMove' || remainingDice.length === 0 || isSpectator) return;
    const bestMove = gameVariant === 'mahbousa'
      ? getBestMoveMahbousa(boardState as BoardStateMahbousa, turn, remainingDice, 'pro')
      : getBestMove31(boardState as BoardState31, turn, remainingDice, 'pro');

    if (bestMove) {
      setHintedTrackIndex(bestMove.from);
      setStatusMessage(
        `اقتراح: حرّك قشاط الخانة ${getPointDisplayName(turn, bestMove.from)} بزهرة (${bestMove.die})`
      );
      setTimeout(() => setHintedTrackIndex(null), 3500);
    }
  };

  // Roll 1 die (1..6)
  const rollDie = () => 1 + Math.floor(Math.random() * 6);

  // Check before rolling: if player has NO legal move with ANY possible die, do NOT roll!
  useEffect(() => {
    if (phase === 'turnRoll' && isCompletelyBlocked && !isRolling && !isSpectator) {
      setStatusMessage(
        `اللاعب ${PLAYER_NAMES[turn]} مقفول عليه تماماً ومفيش أي نقلة بأي زهر — الدور ينتقل للخصم مباشرة دون رمي الزهر.`
      );
      const timer = setTimeout(() => {
        endTurn();
      }, 1600);
      return () => clearTimeout(timer);
    }
  }, [phase, isCompletelyBlocked, isRolling, turn, endTurn, isSpectator]);

  // Handle Dice Rolling
  const handleRollDice = useCallback(() => {
    if (isRolling || isSpectator) return;

    if (phase === 'turnRoll' && isCompletelyBlocked) {
      setStatusMessage(
        `اللاعب ${PLAYER_NAMES[turn]} مقفول عليه تماماً — مفيش رمي زهر والدور ينتقل للخصم.`
      );
      endTurn();
      return;
    }

    if (phase === 'turnRoll') {
      setRoll(null);
    } else if (phase === 'initialRoll') {
      if (initialRollStep === 'white') {
        setInitialWhiteDie(null);
      } else if (initialRollStep === 'black') {
        setInitialBlackDie(null);
      }
    }

    setIsRolling(true);
    sound.playDiceRoll();
  }, [isRolling, isSpectator, phase, initialRollStep, isCompletelyBlocked, turn, endTurn]);

  // Invoked when the 3D dice physically land and settle inside the board
  const handleRollComplete = useCallback(
    ([d1, d2]: [number, number]) => {
      setIsRolling(false);

      if (phase === 'initialRoll') {
        if (initialRollStep === 'white') {
          // White rolled single die
          const whiteVal = d1;
          setInitialWhiteDie(whiteVal);
          setInitialRollStep('black');
          const msg = `الأبيض رمى: ${toArabicDigits(whiteVal)} (${getDiceSingleName(whiteVal)}) — دور الأسود يرمي ظهره الآن 🎲`;
          setStatusMessage(msg);

          if (gameMode === 'online') {
            broadcastOnlineState({
              statusMessage: msg,
            });
          }

          // If Black is AI, AI automatically rolls its single die after a short realistic delay
          if (gameMode === 'ai') {
            setTimeout(() => {
              setIsRolling(true);
              sound.playDiceRoll();
            }, 850);
          }
        } else if (initialRollStep === 'black') {
          // Black rolled single die
          const blackVal = d2;
          const whiteVal = initialWhiteDie || d1;
          setInitialBlackDie(blackVal);
          setInitialRoll([whiteVal, blackVal]);

          if (whiteVal > blackVal) {
            setTurn(0);
            const msg = `الأبيض رمى (${toArabicDigits(whiteVal)}) والأسود رمى (${toArabicDigits(blackVal)}) — الأبيض أعلى ويبدأ اللعب! 🎲`;
            setStatusMessage(msg);

            if (gameMode === 'online') {
              broadcastOnlineState({
                initialRoll: [whiteVal, blackVal],
                turn: 0,
                statusMessage: msg,
              });
            }

            setTimeout(() => {
              setPhase('turnRoll');
              setInitialRollStep('done');
            }, 1800);
          } else if (blackVal > whiteVal) {
            setTurn(1);
            const msg = `الأسود رمى (${toArabicDigits(blackVal)}) والأبيض رمى (${toArabicDigits(whiteVal)}) — الأسود أعلى ويبدأ اللعب! 🎲`;
            setStatusMessage(msg);

            if (gameMode === 'online') {
              broadcastOnlineState({
                initialRoll: [whiteVal, blackVal],
                turn: 1,
                statusMessage: msg,
              });
            }

            setTimeout(() => {
              setPhase('turnRoll');
              setInitialRollStep('done');
            }, 1800);
          } else {
            // Tie!
            const msg = `تعادل في رمية البداية (${toArabicDigits(whiteVal)} - ${toArabicDigits(blackVal)})! إعادة الرمي لتحديد من يبدأ 🎲`;
            setStatusMessage(msg);

            setTimeout(() => {
              setInitialWhiteDie(null);
              setInitialBlackDie(null);
              setInitialRoll(null);
              setInitialRollStep('white');
              setStatusMessage('تعادل في الرمية! الأبيض يرمي أولاً لتحديد البادئ 🎲');
            }, 2000);
          }
        }
      } else if (phase === 'turnRoll') {
        setRoll([d1, d2]);
        currentTurnMovesRef.current = [];

        // In Egyptian Tawla rules: doubles ALWAYS grant 4 moves!
        const diceList = d1 === d2 ? [d1, d1, d1, d1] : [d1, d2];
        setRemainingDice(diceList);

        setTurnInitialState({
          board: gameVariant === 'mahbousa'
            ? cloneStateMahbousa(boardState as BoardStateMahbousa)
            : cloneState31(boardState as BoardState31),
          dice: [...diceList],
        });

        const callName = getDiceCallName(d1, d2);
        const sweetCall = getSweetVoicePhrase(d1, d2);
        setSweetPhrase(sweetCall);

        const legal = gameVariant === 'mahbousa'
          ? getLegalMovesMahbousa(boardState as BoardStateMahbousa, turn, diceList)
          : getLegalMoves31(boardState as BoardState31, turn, diceList);

        if (legal.length === 0) {
          setPhase('playerMove');
          setRemainingDice([]);
          setStatusMessage(`${callName}: مفيش أي حركة قانونية بهذا الزهر (سدّة) — الدور ينتقل للخصم مباشرة.`);
          const entry: GameLogEntry = {
            id: Math.random().toString(36).substring(2, 9),
            roundNumber,
            player: turn,
            roll: [d1, d2],
            diceName: callName,
            moves: [],
            skipped: true,
            scoreAfter: matchScore,
            timestamp: new Date().toLocaleTimeString('ar-EG'),
          };
          setGameLogs((prev) => [entry, ...prev]);

          if (gameMode === 'online') {
            broadcastOnlineState({
              roll: [d1, d2],
              remainingDice: [],
              statusMessage: `${callName}: مفيش أي حركة قانونية (سدّة) — تمرير الدور.`,
            });
          }

          setTimeout(() => {
            endTurn();
          }, 1600);
        } else {
          const nextPhase = gameMode === 'ai' && turn === 1 ? 'aiThinking' : 'playerMove';
          setPhase(nextPhase);
          setSelectedTrackIndex(null);

          const rollDetail = d1 === d2
            ? `${callName} (بَفّة دبل ٤ نقلات! 🔥)`
            : `${callName} (المجموع: ${toArabicDigits(d1 + d2)})`;
          const currentPName = turn === 0 ? activeWhiteName : activeBlackName;
          const msg = `${currentPName} رمى ${rollDetail} — اضغط القشاط ثم الخانة اللي عايز تروحها.`;
          setStatusMessage(msg);

          if (gameMode === 'online') {
            broadcastOnlineState({
              roll: [d1, d2],
              remainingDice: diceList,
              phase: 'playerMove',
              statusMessage: msg,
            });
          }
        }
      }
    },
    [
      phase,
      initialRollStep,
      initialWhiteDie,
      turn,
      gameMode,
      gameVariant,
      boardState,
      roundNumber,
      matchScore,
      endTurn,
      broadcastOnlineState,
      activeWhiteName,
      activeBlackName,
    ]
  );

  // AI Turn Loop (with opponent counter-move lookahead)
  useEffect(() => {
    if (gameMode !== 'ai' || turn !== 1) return;

    if (phase === 'turnRoll') {
      if (isCompletelyBlocked) {
        const timer = setTimeout(() => {
          endTurn();
        }, 1400);
        return () => clearTimeout(timer);
      }
      const timer = setTimeout(() => {
        handleRollDice();
      }, 700);
      return () => clearTimeout(timer);
    }

    if (phase === 'aiThinking' && remainingDice.length > 0) {
      const timer = setTimeout(() => {
        const bestMove = gameVariant === 'mahbousa'
          ? getBestMoveMahbousa(boardState as BoardStateMahbousa, 1, remainingDice, aiDifficulty)
          : getBestMove31(boardState as BoardState31, 1, remainingDice, aiDifficulty);

        if (bestMove) {
          executeMove(bestMove);
        } else {
          endTurn();
        }
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [
    gameMode,
    turn,
    phase,
    remainingDice,
    boardState,
    aiDifficulty,
    isCompletelyBlocked,
    handleRollDice,
    executeMove,
    endTurn,
  ]);

  // Next Round: Winner of previous round starts directly without initial roll! (التعديل رقم ٢)
  const startNextRound = () => {
    const nextR = roundNumber + 1;
    setBoardState(createInitialState(gameVariant));
    setSelectedTrackIndex(null);
    setHintedTrackIndex(null);
    setTurnInitialState(null);
    setInitialRoll(null);
    setRoll(null);
    setSweetPhrase(null);
    setRemainingDice([]);
    setVictoryState(null);
    setRoundNumber(nextR);

    // Rule 2: Winner of previous round starts the next round directly!
    if (lastRoundWinner !== null) {
      setTurn(lastRoundWinner);
      setPhase('turnRoll');
      const msg = `الجولة ${nextR}: الفائز السابق (${PLAYER_NAMES[lastRoundWinner]}) يبدأ الرمي مباشرة!`;
      setStatusMessage(msg);

      if (gameMode === 'online') {
        broadcastOnlineState({
          boardState: createInitialState(gameVariant),
          turn: lastRoundWinner,
          phase: 'turnRoll',
          roundNumber: nextR,
          roll: null,
          remainingDice: [],
          statusMessage: msg,
        });
      }
    } else {
      setPhase('initialRoll');
      resetOpeningRoll();
      setStatusMessage('رمية البداية لتحديد من يبدأ — دور الأبيض يرمي ظهر واحد 🎲');
    }
  };

  // Reset Entire Match
  const resetEntireMatch = () => {
    setMatchScore([0, 0]);
    setRoundNumber(1);
    setLastRoundWinner(null);
    setBoardState(createInitialState(gameVariant));
    setSelectedTrackIndex(null);
    setHintedTrackIndex(null);
    setTurnInitialState(null);
    resetOpeningRoll();
    setRoll(null);
    setSweetPhrase(null);
    setRemainingDice([]);
    setPhase('initialRoll');
    setVictoryState(null);
    setStatusMessage('تم بدء مباراة جديدة. الأبيض يرمي ظهر واحد لتحديد البادئ 🎲');
  };

  // Compute Legal Moves and Combined Moves for currently selected point
  const currentLegalMoves = useMemo(() => {
    if (phase !== 'playerMove' && phase !== 'aiThinking') return [];
    return gameVariant === 'mahbousa'
      ? getLegalMovesMahbousa(boardState as BoardStateMahbousa, turn, remainingDice)
      : getLegalMoves31(boardState as BoardState31, turn, remainingDice);
  }, [gameVariant, phase, boardState, turn, remainingDice]);

  const currentCombinedMoves = useMemo(() => {
    if (phase !== 'playerMove' && phase !== 'aiThinking') return [];
    if (selectedTrackIndex === null) return [];
    return gameVariant === 'mahbousa'
      ? getCombinedMovesMahbousaForSelection(
          boardState as BoardStateMahbousa,
          turn,
          selectedTrackIndex,
          remainingDice,
          currentLegalMoves
        )
      : getCombinedMovesForSelection(
          boardState as BoardState31,
          turn,
          selectedTrackIndex,
          remainingDice,
          currentLegalMoves
        );
  }, [gameVariant, phase, boardState, turn, selectedTrackIndex, remainingDice, currentLegalMoves]);

  const canUndo = turnInitialState !== null && remainingDice.length < turnInitialState.dice.length;

  const latestChatMessageSummary = useMemo<{ text: string; sender: string } | null>(() => {
    if (activeSpeechBubble) {
      return { text: activeSpeechBubble.text, sender: activeSpeechBubble.sender };
    }
    if (chatMessages.length > 0) {
      const last = chatMessages[chatMessages.length - 1];
      return { text: last.text, sender: last.senderName };
    }
    return null;
  }, [activeSpeechBubble, chatMessages]);

  if (currentScreen === 'lobby') {
    return (
      <>
        <LobbyScreen
          onStartGame={handleStartGameFromLobby}
          onOpenFriends={() => setIsFriendsOpen(true)}
          onOpenTournaments={() => setIsTournamentsOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenProfile={() => setIsProfileModalOpen(true)}
          onOpenRules={() => setIsRulesOpen(true)}
          onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
          onOpenConnectedAccounts={() => setIsConnectedAccountsOpen(true)}
          onOpenStore={() => setIsStoreOpen(true)}
          onOpenChallenges={() => setIsChallengesOpen(true)}
          onOpenGooglePlay={() => setIsGooglePlayOpen(true)}
          isGoogleConnected={Boolean(googleProfile)}
          googleProfile={googleProfile}
          coins={dailyProgress?.coins || 1000}
          currentTheme={boardTheme}
          playerName={playerName}
          onlineFriendsCount={3}
        />

        {/* Modals accessible from Lobby */}
        <ConnectedAccountsModal
          isOpen={isConnectedAccountsOpen}
          onClose={() => setIsConnectedAccountsOpen(false)}
          googleProfile={googleProfile}
          onGoogleProfileChange={(prof) => {
            setGoogleProfile(prof);
            if (prof?.displayName) setPlayerName(prof.displayName);
          }}
          dailyProgress={dailyProgress}
        />

        <StoreModal
          isOpen={isStoreOpen}
          onClose={() => setIsStoreOpen(false)}
          dailyProgress={dailyProgress}
          onUpdateDailyProgress={setDailyProgress}
          currentTheme={boardTheme}
          onSelectTheme={setBoardTheme}
          currentDiceStyle={diceStyle}
          onSelectDiceStyle={setDiceStyle}
          googleProfile={googleProfile}
          onOpenGoogleConnect={() => setIsConnectedAccountsOpen(true)}
        />

        <ChallengeMatchesModal
          isOpen={isChallengesOpen}
          onClose={() => setIsChallengesOpen(false)}
          userCoins={dailyProgress?.coins || 1000}
          userRating={dailyProgress?.rating || 1290}
          onStartChallengeMatch={handleStartChallengeMatch}
          selectedVariant={gameVariant}
        />

        <GooglePlayModal
          isOpen={isGooglePlayOpen}
          onClose={() => setIsGooglePlayOpen(false)}
        />

        <LeaderboardModal
          isOpen={isLeaderboardOpen}
          onClose={() => setIsLeaderboardOpen(false)}
          currentUserProgress={dailyProgress}
        />
        <FriendsModal
          isOpen={isFriendsOpen}
          onClose={() => setIsFriendsOpen(false)}
          onInviteFriend={handleInviteFriend}
          userPlayerName={playerName}
        />

        <TournamentsModal
          isOpen={isTournamentsOpen}
          onClose={() => setIsTournamentsOpen(false)}
          onStartTournamentMatch={handleStartTournamentMatch}
        />

        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          currentTheme={boardTheme}
          onSelectTheme={setBoardTheme}
          soundEnabled={soundEnabled}
          onToggleSound={toggleSound}
          aiDifficulty={aiDifficulty}
          onChangeAIDifficulty={setAiDifficulty}
          onOpenAiLab={() => setIsAiLabOpen(true)}
          onOpenConnectedAccounts={() => setIsConnectedAccountsOpen(true)}
          onOpenStore={() => setIsStoreOpen(true)}
        />

        <ProfileAndStatsModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
        />

        <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />

        <AIDicePhysicsLabModal
          isOpen={isAiLabOpen}
          onClose={() => setIsAiLabOpen(false)}
          onTestRoll={handleRollDice}
        />
      </>
    );
  }

  return (
    <div className={`min-h-screen ${THEMES[boardTheme].appBackground} text-[#f5ebd9] flex flex-col justify-between selection:bg-amber-600/30 font-['Cairo'] transition-colors duration-500`}>
      {/* In-Game Master Control Strip */}
      <div className="w-full max-w-[1100px] mx-auto px-2 pt-2">
        <div className="flex items-center justify-between gap-2 bg-[#200f07]/95 border border-amber-800/60 rounded-2xl px-3 py-1.5 shadow-md backdrop-blur-md">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentScreen('lobby')}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#2e1509] hover:bg-[#43200e] text-amber-300 hover:text-white border border-amber-700/60 text-xs font-black transition-all cursor-pointer shadow-sm active:scale-95"
              title="العودة لشاشة اللعبة الرئيسية"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>الواجهة الرئيسية</span>
            </button>

            <span className="text-xs font-black text-amber-200/90 hidden sm:inline">
              {gameVariant === 'mahbousa' ? 'طاولة المحبوسة' : 'طاولة ٣١ المصرية'}
            </span>
          </div>

          {/* In-Game Live Speech Bubble Banner */}
          <AnimatePresence>
            {activeSpeechBubble && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.92 }}
                className="hidden md:flex items-center gap-1.5 px-3 py-0.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 text-amber-950 font-black text-xs shadow-lg border border-amber-300"
              >
                <span>💬 {activeSpeechBubble.sender}:</span>
                <span className="text-white">"{activeSpeechBubble.text}"</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-1.5">
            {/* Quick Dice Style Picker */}
            <button
              onClick={() => setIsDiceStyleOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#2e1509] hover:bg-[#43200e] text-amber-200 border border-amber-700/60 text-xs font-bold transition-all cursor-pointer"
              title="اختيار شكل وخامة الزهر"
            >
              <Dices className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">شكل الزهر</span>
            </button>

            {/* Quick Sound Toggle */}
            <button
              onClick={toggleSound}
              className="p-1.5 rounded-xl bg-[#2e1509] hover:bg-[#43200e] text-amber-300 border border-amber-700/60 transition-all cursor-pointer"
              title={soundEnabled ? 'كتم الصوت' : 'تشغيل الصوت'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-stone-500" />}
            </button>

            {/* In-Game Live Chat Button */}
            <button
              onClick={() => setIsChatOpen(true)}
              className="relative flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-950 hover:bg-amber-900 border border-amber-500/70 text-amber-200 text-xs font-black transition-all cursor-pointer shadow-sm active:scale-95"
              title="شات الطاولة المباشر والعبارات السريعة"
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
              <span>الشات</span>
              {chatMessages.length > 0 && (
                <span className="min-w-[16px] h-[16px] px-1 rounded-full bg-amber-400 text-stone-950 font-black text-[9px] flex items-center justify-center">
                  {chatMessages.length}
                </span>
              )}
            </button>

            {/* Friends Button */}
            <button
              onClick={() => setIsFriendsOpen(true)}
              className="p-1.5 rounded-xl bg-[#2e1509] hover:bg-[#43200e] text-amber-300 border border-amber-700/60 transition-all cursor-pointer hidden sm:flex"
              title="قائمة الأصدقاء"
            >
              <Users className="w-4 h-4 text-amber-300" />
            </button>

            {/* Tournaments Button */}
            <button
              onClick={() => setIsTournamentsOpen(true)}
              className="p-1.5 rounded-xl bg-[#2e1509] hover:bg-[#43200e] text-amber-300 border border-amber-700/60 transition-all cursor-pointer hidden sm:flex"
              title="المسابقات والبطولات"
            >
              <Trophy className="w-4 h-4 text-amber-300" />
            </button>

            {/* Win Equity Bar Toggle Button */}
            <button
              onClick={() => setShowEquityBar(!showEquityBar)}
              className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                showEquityBar
                  ? 'bg-amber-600 text-white border-amber-400 shadow-sm'
                  : 'bg-[#2e1509] hover:bg-[#43200e] text-amber-300 border-amber-700/60'
              }`}
              title="مؤشر التحليل التكتيكي الفوري (GNUbg Equity)"
            >
              <TrendingUp className="w-4 h-4" />
            </button>

            {/* Luck vs Skill Analytics Button */}
            <button
              onClick={() => setIsLuckModalOpen(true)}
              className="p-1.5 rounded-xl bg-[#2e1509] hover:bg-[#43200e] text-amber-300 border border-amber-700/60 transition-all cursor-pointer"
              title="تحليل مقياس الحظ والمهارة وتوزيع النرد"
            >
              <Dices className="w-4 h-4 text-amber-300" />
            </button>

            {/* Match Replay & Export Button */}
            <button
              onClick={() => setIsLogOpen(true)}
              className="p-1.5 rounded-xl bg-[#2e1509] hover:bg-[#43200e] text-amber-300 border border-amber-700/60 transition-all cursor-pointer"
              title="إعادة مشاهدة وتصدير الجيم"
            >
              <Film className="w-4 h-4 text-amber-300" />
            </button>

            {/* Leaderboard Button */}
            <button
              onClick={() => setIsLeaderboardOpen(true)}
              className="p-1.5 rounded-xl bg-[#2e1509] hover:bg-[#43200e] text-amber-300 border border-amber-700/60 transition-all cursor-pointer"
              title="لوحة الشرف — أفضل ١٠ لاعبين (Firebase)"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
            </button>

            {/* Daily Rewards Button (Firebase) */}
            <button
              onClick={() => setIsDailyRewardsOpen(true)}
              className="relative p-1.5 rounded-xl bg-[#2e1509] hover:bg-[#43200e] text-amber-300 border border-amber-700/60 transition-all cursor-pointer"
              title="المكافآت اليومية (Firebase)"
            >
              <Gift className="w-4 h-4 text-amber-400" />
              {dailyProgress?.lastMatchPlayedDate === getTodayDateString() &&
                dailyProgress?.lastClaimedDate !== getTodayDateString() && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-emerald-950 animate-ping" />
                )}
            </button>

            {/* Store Button */}
            <button
              onClick={() => setIsStoreOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-black text-xs transition-all cursor-pointer shadow-sm active:scale-95"
              title="متجر الطاولة وخامات الزهر"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{dailyProgress?.coins || 1000} 🪙</span>
            </button>

            {/* Challenge Matches Button */}
            <button
              onClick={() => setIsChallengesOpen(true)}
              className="p-1.5 rounded-xl bg-[#2e1509] hover:bg-[#43200e] text-rose-300 border border-amber-700/60 transition-all cursor-pointer"
              title="مباريات التحدي بالرهان"
            >
              <Swords className="w-4 h-4 text-rose-400" />
            </button>

            {/* Google Play / Android Button */}
            <button
              onClick={() => setIsGooglePlayOpen(true)}
              className="p-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-600/50 transition-all cursor-pointer"
              title="تنزيل التطبيق على Google Play و Android"
            >
              <Download className="w-4 h-4 text-emerald-400" />
            </button>

            {/* Connected Google Account Button */}
            <button
              onClick={() => setIsConnectedAccountsOpen(true)}
              className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                googleProfile
                  ? 'bg-blue-950/40 border-blue-500/60 text-blue-300'
                  : 'bg-[#2e1509] hover:bg-[#43200e] text-amber-300 border-amber-700/60'
              }`}
              title="حساب Google وحفظ البيانات السحابية"
            >
              <Globe2 className="w-4 h-4" />
            </button>

            {/* Settings & Themes Button */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-1.5 rounded-xl bg-[#2e1509] hover:bg-[#43200e] text-amber-300 border border-amber-700/60 transition-all cursor-pointer"
              title="الإعدادات وخامة الخشب"
            >
              <Settings className="w-4 h-4 text-amber-300" />
            </button>
          </div>
        </div>
      </div>
      {/* Top Header & Scoreboard */}
      <ScoreBoard
        score={matchScore}
        round={roundNumber}
        turn={turn}
        isAiTurn={gameMode === 'ai' && turn === 1}
        gameMode={gameMode}
        gameVariant={gameVariant}
        aiDifficulty={aiDifficulty}
        soundEnabled={soundEnabled}
        theme={boardTheme}
        pipCounts={pipCounts}
        whitePlayerName={activeWhiteName}
        blackPlayerName={activeBlackName}
        latestChatMessage={latestChatMessageSummary}
        onOpenChat={() => setIsChatOpen(true)}
        onToggleSound={toggleSound}
        onChangeMode={(m) => {
          if (m === 'online') {
            setIsOnlineModalOpen(true);
          } else {
            setGameMode(m);
            resetEntireMatch();
          }
        }}
        onChangeVariant={(v) => {
          setGameVariant(v);
          setBoardState(createInitialState(v));
          setMatchScore([0, 0]);
          setRoundNumber(1);
          setLastRoundWinner(null);
          setSelectedTrackIndex(null);
          setHintedTrackIndex(null);
          setTurnInitialState(null);
          resetOpeningRoll();
          setRoll(null);
          setRemainingDice([]);
          setPhase('initialRoll');
          setVictoryState(null);
          setStatusMessage(
            v === 'mahbousa'
              ? 'تم التبديل إلى لعبة المحبوسة الأصلية. الأبيض يرمي ظهر واحد لتحديد البادئ 🎲'
              : 'تم التبديل إلى طاولة ٣١ المصرية الأصلية. الأبيض يرمي ظهر واحد لتحديد البادئ 🎲'
          );
        }}
        onChangeTheme={setBoardTheme}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsOpen(true)}
        onOpenLearningModal={() => setIsLearningModalOpen(true)}
        onOpenOnlineModal={() => setIsOnlineModalOpen(true)}
        onChangeDifficulty={setAiDifficulty}
        onResetGame={resetEntireMatch}
        onOpenLog={() => setIsLogOpen(true)}
        onOpenRules={() => setIsRulesOpen(true)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
      />

      {/* Online Room Management Bar when in online mode */}
      {gameMode === 'online' && onlineRoom && (
        <OnlineRoomBar
          roomState={onlineRoom}
          clientId={clientId}
          playerName={playerName}
          onUpdatePlayerName={(name) => {
            setPlayerName(name);
            localStorage.setItem('tawla_player_name', name);
          }}
          onTakeSeat={handleTakeSeat}
          onLeaveSeat={handleLeaveSeat}
          onExitOnlineMode={() => {
            if (wsRef.current) wsRef.current.close();
            setOnlineRoom(null);
            setOnlineOpponentBot(null);
            setGameMode('ai');
            resetEntireMatch();
          }}
          onAddBotOpponent={() => handleQuickMatchWithBot()}
        />
      )}

      {/* Main Playing Field */}
      <main className="flex-1 flex flex-col items-center justify-center py-1 sm:py-2">
        {/* Dynamic Status & Roll Control Outside the Board */}
        <div className="w-full max-w-[1100px] px-3 py-1.5 mb-1.5 flex items-center justify-center text-center">
          {/* Status Message & Dice Announcement */}
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#24130a]/95 border border-[#522d16] shadow-md text-xs sm:text-sm font-semibold text-amber-200 backdrop-blur-sm">
            {sweetPhrase && (
              <span className="flex items-center gap-1 text-amber-400 font-black">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                {sweetPhrase}
                <span className="text-amber-500/60">·</span>
              </span>
            )}
            <span>{statusMessage}</span>
          </div>
        </div>

        {/* Crystal-Clear Opening Roll Announcement Banner ("ورميه الافتتاحيه اللي يجيب اكبر يبتدي اللعب وضح كل واحد جاب كام") */}
        {/* Real-time Win Equity & Blunder Indicator Bar (Proposal 1) */}
        <WinEquityBar
          evaluation={equityEval}
          isVisible={showEquityBar}
          onToggleVisibility={() => setShowEquityBar(false)}
        />

        {/* Handcrafted Luxury Tawla Board */}
        <Board
          state={boardState}
          turn={turn}
          selectedTrackIndex={selectedTrackIndex}
          selectedDie={selectedDie}
          hintedTrackIndex={hintedTrackIndex}
          legalMoves={currentLegalMoves}
          combinedMoves={currentCombinedMoves}
          theme={boardTheme}
          pipCounts={pipCounts}
          canUndo={canUndo}
          onUndoMove={handleUndoMove}
          onRequestHint={handleRequestHint}
          onOpenThemeModal={() => setIsThemeModalOpen(true)}
          onSelectTrackPoint={(idx) => setSelectedTrackIndex(idx === -1 ? null : idx)}
          onExecuteMove={executeMove}
          onExecuteCombinedMove={executeCombinedMove}
          isAiTurn={gameMode === 'ai' && turn === 1}
          isSpectator={isSpectator}
          phase={phase}
          roll={roll}
          initialRoll={initialRoll}
          initialRollStep={initialRollStep}
          initialWhiteDie={initialWhiteDie}
          initialBlackDie={initialBlackDie}
          remainingDice={remainingDice}
          isRolling={isRolling}
          onRoll={handleRollDice}
          onRollComplete={handleRollComplete}
          onSelectDie={setSelectedDie}
          isCompletelyBlocked={isCompletelyBlocked}
          sweetPhrase={sweetPhrase}
          diceStyle={diceStyle}
        />

        {/* Under-Board Persistent Fixed Action Bar (Glows when it is player's turn, dims when opponent's turn) */}
        <div className="w-full max-w-[1100px] px-3 py-2 mt-1 flex items-center justify-center">
          <div className="w-full max-w-[480px]">
            {canRollNow ? (
              /* Glowing active button when it's MY turn to roll */
              <button
                onClick={handleRollDice}
                className="w-full flex items-center justify-center gap-2.5 py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-amber-950 font-black text-sm sm:text-base border-2 border-amber-300 shadow-[0_0_30px_rgba(245,158,11,0.85),0_8px_25px_rgba(0,0,0,0.6)] animate-pulse transition-all cursor-pointer transform active:scale-95"
              >
                <Dices className="w-5 h-5 text-amber-950 animate-bounce" />
                <span>
                  {phase === 'initialRoll'
                    ? (initialRollStep === 'white'
                        ? 'ارمِ ظهر البداية — دور الأبيض (فردة واحدة) 🎲'
                        : 'ارمِ ظهر البداية — دور الأسود (فردة واحدة) 🎲')
                    : `ارمِ الزهر — دورك الآن (${PLAYER_NAMES[turn]}) 🎲`}
                </span>
              </button>
            ) : isRolling ? (
              /* Rolling animation state */
              <div className="w-full flex items-center justify-center gap-2.5 py-3 px-6 rounded-2xl bg-[#2b160a]/90 border border-amber-500/60 text-amber-200 font-bold text-sm shadow-md">
                <Dices className="w-5 h-5 text-amber-400 animate-spin" />
                <span>جاري رمي الزهر جوا الطاولة...</span>
              </div>
            ) : !isMyActiveTurn ? (
              /* Dimmed/off state when it's the OPPONENT's turn */
              <div className="w-full flex items-center justify-center gap-2.5 py-3 px-6 rounded-2xl bg-[#140c07]/80 border border-stone-800 text-stone-500/80 font-bold text-sm shadow-none cursor-not-allowed select-none">
                <Hourglass className="w-4 h-4 text-stone-600 animate-spin" style={{ animationDuration: '4s' }} />
                <span>دور الخصم ({PLAYER_NAMES[turn]})...</span>
              </div>
            ) : phase === 'playerMove' ? (
              /* Player move phase state */
              <div className="w-full flex items-center justify-center gap-2.5 py-3 px-6 rounded-2xl bg-[#24130a]/80 border border-amber-800/60 text-amber-200/90 font-bold text-sm shadow-sm">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>
                  {roll && roll[0] === roll[1]
                    ? `دورك للتحريك — زهر دبل [ ${toArabicDigits(roll[0])} · ${toArabicDigits(roll[1])} ] (متبقي ${toArabicDigits(remainingDice.length)} نقلات)`
                    : `دورك للتحريك — الزهر المتبقي: [ ${remainingDice.map(toArabicDigits).join(' · ')} ]`}
                </span>
              </div>
            ) : isCompletelyBlocked ? (
              /* Completely blocked state */
              <div className="w-full flex items-center justify-center gap-2.5 py-3 px-6 rounded-2xl bg-stone-900/90 border border-stone-700 text-stone-400 font-bold text-sm shadow-none cursor-not-allowed">
                <span>🚫 مقفول تماماً — ملوش رمي في هذا الدور</span>
              </div>
            ) : null}
          </div>
        </div>
      </main>

      {/* Modern Café-style Footer */}
      <footer className="w-full py-2 px-4 text-center text-[11px] text-amber-200/50 border-t border-[#3a1f10]/60">
        <span>تطبيق الطاولة المصرية الأصيل بمواصفات عالمية · طاولة ٣١ والمحبوسة · لعب أونلاين برابط مباشر ومفصلات نحاسية</span>
      </footer>

      {/* Online Room Modal */}
      <OnlineRoomModal
        isOpen={isOnlineModalOpen}
        onClose={() => setIsOnlineModalOpen(false)}
        onJoinOrCreateRoom={(code, name) => {
          setPlayerName(name);
          connectToRoom(code, name);
        }}
        onQuickMatchWithBot={() => handleQuickMatchWithBot()}
      />

      {/* Theme Selection Modal */}
      <ThemeModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        currentTheme={boardTheme}
        onSelectTheme={setBoardTheme}
      />

      {/* Comprehensive Game & Board Settings Modal (with 20 Board Styles) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentTheme={boardTheme}
        onSelectTheme={setBoardTheme}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        aiDifficulty={aiDifficulty}
        onChangeAIDifficulty={setAiDifficulty}
        onOpenAiLab={() => setIsAiLabOpen(true)}
        onOpenConnectedAccounts={() => setIsConnectedAccountsOpen(true)}
        onOpenStore={() => setIsStoreOpen(true)}
      />

      {/* Friends List & Invites Modal */}
      <FriendsModal
        isOpen={isFriendsOpen}
        onClose={() => setIsFriendsOpen(false)}
        onInviteFriend={handleInviteFriend}
        userPlayerName={playerName}
      />

      {/* Tournaments & Competitions Bracket Modal */}
      <TournamentsModal
        isOpen={isTournamentsOpen}
        onClose={() => setIsTournamentsOpen(false)}
        onStartTournamentMatch={handleStartTournamentMatch}
      />

      {/* In-Game Live Chat & Egyptian Quick Phrases Modal */}
      <InGameChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        messages={chatMessages}
        onSendMessage={handleSendMessage}
        currentUserName={playerName}
        isOnline={gameMode === 'online'}
      />

      {/* Custom Dice Style Modal */}
      <DiceStyleModal
        isOpen={isDiceStyleOpen}
        onClose={() => setIsDiceStyleOpen(false)}
        currentStyle={diceStyle}
        onSelectStyle={setDiceStyle}
      />

      {/* AI Learning Profile Modal */}
      <AILearningModal
        isOpen={isLearningModalOpen}
        onClose={() => setIsLearningModalOpen(false)}
      />

      {/* Game Log Modal */}
      <GameLogModal
        isOpen={isLogOpen}
        onClose={() => setIsLogOpen(false)}
        logs={gameLogs}
        onClearLogs={() => setGameLogs([])}
      />

      {/* Profile, Recharts Stats & Leaderboard Modal */}
      <ProfileAndStatsModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Rules & Dictionary Modal */}
      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />

      {/* AI Dice Physics Lab Modal */}
      <AIDicePhysicsLabModal
        isOpen={isAiLabOpen}
        onClose={() => setIsAiLabOpen(false)}
        onTestRoll={handleRollDice}
      />

      {/* Victory / Round Win Modal with Confetti & Direct Analytics */}
      {victoryState && (
        <VictoryModal
          isOpen={victoryState.isOpen}
          winner={victoryState.winner}
          roundPoints={victoryState.roundPoints}
          isMatchWin={victoryState.isMatchWin}
          score={matchScore}
          onNextRound={startNextRound}
          onNewMatch={resetEntireMatch}
          onOpenLuckStats={() => setIsLuckModalOpen(true)}
          onOpenReplay={() => setIsLogOpen(true)}
          onCelebration={() => triggerVictoryConfetti(Boolean(victoryState.isMatchWin))}
        />
      )}

      {/* Luck vs Skill Analytics & Dice Distribution Modal (Proposal 3) */}
      <LuckAndStatsModal
        isOpen={isLuckModalOpen}
        onClose={() => setIsLuckModalOpen(false)}
        logs={gameLogs}
        winner={victoryState?.winner}
      />

      {/* Daily Rewards Modal (Firebase) */}
      <DailyRewardsModal
        isOpen={isDailyRewardsOpen}
        onClose={() => setIsDailyRewardsOpen(false)}
        progress={dailyProgress}
        onRewardClaimed={(updatedProgress, reward) => {
          setDailyProgress(updatedProgress);
          if (reward.type === 'points') {
            setStatusMessage(`🪙 مبروك! استلمت ${reward.title} وأضيفت لنقاطك اليومية!`);
          } else if (reward.type === 'theme') {
            setBoardTheme(reward.value as BoardTheme);
            setStatusMessage(`🎨 مبروك! فتحت واستلمت تصميم: ${reward.title}!`);
          }
        }}
        onApplyTheme={(theme) => {
          setBoardTheme(theme);
          setStatusMessage(`🎨 تم تطبيق تصميم اللوحة: ${THEMES[theme]?.name || theme}`);
        }}
      />

      {/* Leaderboard Modal (Firebase Top 10) */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        currentUserProgress={dailyProgress}
      />

      {/* Connected Google Account Modal */}
      <ConnectedAccountsModal
        isOpen={isConnectedAccountsOpen}
        onClose={() => setIsConnectedAccountsOpen(false)}
        googleProfile={googleProfile}
        onGoogleProfileChange={(prof) => {
          setGoogleProfile(prof);
          if (prof?.displayName) setPlayerName(prof.displayName);
        }}
        dailyProgress={dailyProgress}
      />

      {/* Royal Tawla Store Modal (Themes, Dice Materials, Coins) */}
      <StoreModal
        isOpen={isStoreOpen}
        onClose={() => setIsStoreOpen(false)}
        dailyProgress={dailyProgress}
        onUpdateDailyProgress={setDailyProgress}
        currentTheme={boardTheme}
        onSelectTheme={setBoardTheme}
        currentDiceStyle={diceStyle}
        onSelectDiceStyle={setDiceStyle}
        googleProfile={googleProfile}
        onOpenGoogleConnect={() => setIsConnectedAccountsOpen(true)}
      />

      {/* Challenge Matches Modal (Stakes & Rewards) */}
      <ChallengeMatchesModal
        isOpen={isChallengesOpen}
        onClose={() => setIsChallengesOpen(false)}
        userCoins={dailyProgress?.coins || 1000}
        userRating={dailyProgress?.rating || 1290}
        onStartChallengeMatch={handleStartChallengeMatch}
        selectedVariant={gameVariant}
      />

      {/* Google Play / Android PWA TWA Modal */}
      <GooglePlayModal
        isOpen={isGooglePlayOpen}
        onClose={() => setIsGooglePlayOpen(false)}
      />
    </div>
  );
}
