import React from 'react';
import { AIDifficulty, BoardTheme, GameMode, GameVariant, Player } from '../types/tawla';
import { PLAYER_NAMES } from '../utils/diceNames';
import {
  Bot,
  Brain,
  Globe2,
  MessageSquare,
  Users,
} from 'lucide-react';

interface ScoreBoardProps {
  score: [number, number];
  round: number;
  turn: Player;
  isAiTurn: boolean;
  gameMode: GameMode;
  gameVariant: GameVariant;
  aiDifficulty: AIDifficulty;
  soundEnabled: boolean;
  theme: BoardTheme;
  pipCounts: [number, number];
  whitePlayerName?: string;
  blackPlayerName?: string;
  latestChatMessage?: { text: string; sender: string } | null;
  onOpenChat?: () => void;
  onToggleSound?: () => void;
  onChangeMode: (mode: GameMode) => void;
  onChangeVariant: (variant: GameVariant) => void;
  onChangeTheme?: (theme: BoardTheme) => void;
  onOpenThemeModal?: () => void;
  onOpenSettingsModal?: () => void;
  onOpenLearningModal: () => void;
  onOpenOnlineModal: () => void;
  onChangeDifficulty: (diff: AIDifficulty) => void;
  onResetGame?: () => void;
  onOpenLog?: () => void;
  onOpenRules?: () => void;
  onOpenProfileModal?: () => void;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  score,
  round,
  turn,
  isAiTurn,
  gameMode,
  gameVariant,
  aiDifficulty,
  pipCounts,
  whitePlayerName,
  blackPlayerName,
  latestChatMessage,
  onOpenChat,
  onChangeMode,
  onChangeVariant,
  onOpenLearningModal,
  onOpenOnlineModal,
  onChangeDifficulty,
}) => {
  return (
    <header className="w-full max-w-[1100px] mx-auto px-2 sm:px-4 py-1.5 flex flex-col gap-2 font-['Cairo']">
      {/* Main Scoreboard & Turn Display */}
      <div className="grid grid-cols-3 items-center bg-gradient-to-r from-[#29150b] via-[#3a1f11] to-[#29150b] p-2.5 sm:p-3 rounded-2xl border border-[#593219] shadow-xl">
        {/* White Player Panel */}
        <div
          className={`flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2.5 rounded-xl transition-all ${
            turn === 0
              ? 'bg-amber-950/70 ring-2 ring-amber-400/90 shadow-lg'
              : 'opacity-80'
          }`}
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-white via-[#f7f2e5] to-[#c7b493] border-2 border-[#a38c6b] flex items-center justify-center font-bold text-xs text-stone-900 shadow">
            {turn === 0 && <span className="w-2.5 h-2.5 rounded-full bg-amber-600 animate-ping" />}
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-bold text-amber-100 flex items-center gap-1">
              <span>{whitePlayerName || PLAYER_NAMES[0]}</span>
              {turn === 0 && <span className="text-[10px] text-amber-400 font-bold">(دوره)</span>}
            </span>
            <span className="text-lg sm:text-2xl font-black text-amber-300 font-mono" dir="ltr">
              {score[0]} <span className="text-xs text-amber-200/60 font-normal">pts</span>
            </span>
            <span className="text-[11px] text-amber-200/70 font-mono" dir="ltr">
              باقي: {pipCounts[0]} نقلة
            </span>
          </div>
        </div>

        {/* Center Target & Game Status with Latest Chat Bubble (فوق الطاولة عند حتة النتيجة وأرقام إنجليزية) */}
        <div className="flex flex-col items-center justify-center text-center px-1">
          {/* Latest Chat Message directly above the score */}
          {latestChatMessage ? (
            <button
              onClick={onOpenChat}
              className="mb-1.5 flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-600/40 via-amber-500/30 to-amber-600/40 hover:from-amber-600/60 hover:to-amber-500/50 border border-amber-400/90 text-amber-100 text-xs shadow-lg transition-all cursor-pointer group max-w-[240px] sm:max-w-[320px] animate-pulse"
              title="اضغط للرد أو فتح شات الطاولة"
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-300 shrink-0 group-hover:scale-110 transition-transform" />
              <span className="font-black text-amber-300 shrink-0 truncate max-w-[70px]">{latestChatMessage.sender}:</span>
              <span className="truncate text-white font-semibold">"{latestChatMessage.text}"</span>
            </button>
          ) : (
            <button
              onClick={onOpenChat}
              className="mb-1 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/25 hover:bg-black/45 border border-amber-800/40 text-amber-300/70 hover:text-amber-200 text-[11px] transition-all cursor-pointer"
              title="فتح الشات المباشر"
            >
              <MessageSquare className="w-3 h-3 text-amber-400/70" />
              <span>شات الطاولة 💬</span>
            </button>
          )}

          <div className="text-[10px] sm:text-xs font-bold text-amber-300/80 tracking-widest uppercase font-mono" dir="ltr">
            TARGET: 31
          </div>
          {/* English score numbers (0 - 0) */}
          <div className="text-xl sm:text-3xl font-black text-amber-400 font-mono my-0.5 tracking-wider select-none" dir="ltr">
            {score[0]} - {score[1]}
          </div>
          <div className="text-[10px] sm:text-xs font-semibold text-amber-200/90 truncate max-w-[220px]">
            {turn === 0 ? `دور ${whitePlayerName || 'الأبيض'}` : isAiTurn ? 'الكمبيوتر يفكر...' : `دور ${blackPlayerName || 'الأسود'}`}
          </div>
        </div>

        {/* Black Player Panel */}
        <div
          className={`flex items-center justify-end gap-2 sm:gap-3 p-1.5 sm:p-2.5 rounded-xl transition-all ${
            turn === 1
              ? 'bg-amber-950/70 ring-2 ring-amber-400/90 shadow-lg'
              : 'opacity-80'
          }`}
        >
          <div className="flex flex-col text-left">
            <span className="text-xs sm:text-sm font-bold text-amber-100 flex items-center justify-end gap-1">
              {turn === 1 && <span className="text-[10px] text-amber-400 font-bold">(دوره)</span>}
              <span>{blackPlayerName || PLAYER_NAMES[1]}</span>
            </span>
            <span className="text-lg sm:text-2xl font-black text-amber-300 font-mono text-left" dir="ltr">
              {score[1]} <span className="text-xs text-amber-200/60 font-normal">pts</span>
            </span>
            <span className="text-[11px] text-amber-200/70 font-mono text-left" dir="ltr">
              باقي: {pipCounts[1]} نقلة
            </span>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#453427] via-[#241a13] to-[#0c0806] border-2 border-[#574334] flex items-center justify-center font-bold text-xs text-amber-200 shadow">
            {turn === 1 && <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />}
          </div>
        </div>
      </div>

      {/* Control Tabs: Variant, Mode, Difficulty (بدون زر الإعدادات والخشب المكرر) */}
      <div className="flex items-center justify-between gap-2 flex-wrap text-xs pt-0.5">
        {/* Variant Selector: طاولة ٣١ vs المحبوسة */}
        <div className="flex items-center gap-1 bg-[#231208] p-1 rounded-lg border border-[#482815]">
          <span className="text-[11px] text-[#c0a886] px-1 font-medium">اللعبة:</span>
          <button
            onClick={() => onChangeVariant('tawla31')}
            className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
              gameVariant === 'tawla31'
                ? 'bg-amber-700 text-amber-50 shadow'
                : 'text-amber-200/70 hover:text-amber-100'
            }`}
          >
            طاولة ٣١
          </button>
          <button
            onClick={() => onChangeVariant('mahbousa')}
            className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
              gameVariant === 'mahbousa'
                ? 'bg-amber-700 text-amber-50 shadow'
                : 'text-amber-200/70 hover:text-amber-100'
            }`}
          >
            المحبوسة
          </button>
        </div>

        {/* Game Mode: Vs AI vs 2 Players */}
        <div className="flex items-center gap-1 bg-[#231208] p-1 rounded-lg border border-[#482815]">
          <button
            onClick={() => onChangeMode('ai')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
              gameMode === 'ai'
                ? 'bg-amber-700 text-amber-50 shadow'
                : 'text-amber-200/70 hover:text-amber-100'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>ضد الكمبيوتر</span>
          </button>
          <button
            onClick={() => onChangeMode('passAndPlay')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
              gameMode === 'passAndPlay'
                ? 'bg-amber-700 text-amber-50 shadow'
                : 'text-amber-200/70 hover:text-amber-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>لاعبان</span>
          </button>
          <button
            onClick={onOpenOnlineModal}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
              gameMode === 'online'
                ? 'bg-emerald-700 text-white shadow ring-1 ring-emerald-400'
                : 'text-amber-200/70 hover:text-amber-100 hover:bg-[#32170a]'
            }`}
            title="اللعب أونلاين عبر رابط وكود غرفة مع الأصدقاء والمتفرجين"
          >
            <Globe2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>أونلاين</span>
          </button>
        </div>

        {/* AI Difficulty Levels */}
        {gameMode === 'ai' && (
          <div className="flex items-center gap-1 bg-[#231208] p-1 rounded-lg border border-[#482815]">
            <span className="text-[11px] text-[#c0a886] px-1 font-medium">المستوى:</span>
            {(['easy', 'medium', 'pro', 'learned'] as AIDifficulty[]).map((diff) => {
              const labels = {
                easy: 'مبتدئ',
                medium: 'متوسط',
                pro: 'حريف',
                learned: 'متعلم 🧠',
              };
              const active = aiDifficulty === diff;
              return (
                <button
                  key={diff}
                  onClick={() => onChangeDifficulty(diff)}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                    active
                      ? 'bg-amber-600/90 text-amber-50 shadow-sm ring-1 ring-amber-300'
                      : 'text-amber-200/60 hover:text-amber-200'
                  }`}
                  title={diff === 'learned' ? 'يتعلم من لعب الناس وخططك' : undefined}
                >
                  {labels[diff]}
                </button>
              );
            })}

            {/* Inspect Learned Stats Button */}
            <button
              onClick={onOpenLearningModal}
              className="p-1 rounded text-amber-400 hover:text-amber-200 bg-amber-950/60 border border-amber-600/40 cursor-pointer shadow-sm transition-all"
              title="عرض إحصائيات ما تعلمه الكمبيوتر من لعبك"
            >
              <Brain className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
