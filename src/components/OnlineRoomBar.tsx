import React, { useState } from 'react';
import { Copy, Check, Users, Eye, Link, UserCheck, LogOut, Bot } from 'lucide-react';
import { OnlineRoomState } from '../types/tawla';

interface OnlineRoomBarProps {
  roomState: OnlineRoomState | null;
  clientId: string;
  playerName: string;
  onUpdatePlayerName: (name: string) => void;
  onTakeSeat: (seat: 'white' | 'black') => void;
  onLeaveSeat: () => void;
  onExitOnlineMode: () => void;
  onAddBotOpponent?: () => void;
}

export const OnlineRoomBar: React.FC<OnlineRoomBarProps> = ({
  roomState,
  clientId,
  playerName,
  onUpdatePlayerName,
  onTakeSeat,
  onLeaveSeat,
  onExitOnlineMode,
  onAddBotOpponent,
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(playerName);

  if (!roomState) return null;

  const isWhite = roomState.white?.id === clientId;
  const isBlack = roomState.black?.id === clientId;
  const isSpectator = !isWhite && !isBlack;

  const roomLink = `${window.location.origin}${window.location.pathname}?room=${roomState.roomCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(roomLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveName = () => {
    if (tempName.trim()) {
      onUpdatePlayerName(tempName.trim());
    }
    setIsEditingName(false);
  };

  return (
    <div className="w-full max-w-[1100px] mx-auto px-2 sm:px-4 py-2 bg-gradient-to-r from-[#201006] via-[#2f170b] to-[#201006] rounded-2xl border-2 border-amber-600/50 shadow-xl text-amber-100 font-['Cairo'] mb-2">
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        {/* Room Code & Copy Link */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-950/90 border border-amber-500/60 rounded-xl shadow-inner">
            <span className="text-[11px] text-amber-300 font-bold">غرفة:</span>
            <span className="font-mono text-xs sm:text-sm font-black text-amber-100 tracking-wider">
              {roomState.roomCode}
            </span>
          </div>

          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1 bg-amber-700/80 hover:bg-amber-600 text-white rounded-xl text-xs font-bold border border-amber-400/60 cursor-pointer shadow transition-all active:scale-95"
            title="انسخ رابط الغرفة وابعته لأصحابك يدخلوا ويلعبوا أو يتفرجوا"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Link className="w-3.5 h-3.5" />}
            <span>{copied ? 'تم نسخ الرابط!' : 'مشاركة الرابط'}</span>
          </button>
        </div>

        {/* Player Name Tag */}
        <div className="flex items-center gap-1 text-xs">
          <span className="text-amber-300/80">اسمك:</span>
          {isEditingName ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                className="px-2 py-0.5 bg-black/60 border border-amber-400 rounded text-amber-100 text-xs w-28 focus:outline-none"
                autoFocus
              />
              <button
                onClick={handleSaveName}
                className="px-2 py-0.5 bg-amber-600 rounded text-white text-[11px] font-bold cursor-pointer"
              >
                حفظ
              </button>
            </div>
          ) : (
            <span
              onClick={() => setIsEditingName(true)}
              className="font-bold text-amber-200 cursor-pointer hover:underline border-b border-dashed border-amber-400/50"
              title="اضغط لتغيير اسمك"
            >
              {playerName} ✏️
            </span>
          )}
        </div>

        {/* Seats: White & Black */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* White Seat */}
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#fbf8f2] border border-[#a89882] shadow-sm" />
            {roomState.white ? (
              <div className="flex items-center gap-1 px-2.5 py-0.5 bg-black/40 border border-white/20 rounded-lg text-xs font-bold">
                <span className={isWhite ? 'text-emerald-300' : 'text-amber-100'}>
                  {roomState.white.name} {isWhite ? '(أنت)' : ''}
                </span>
                {isWhite && (
                  <button
                    onClick={onLeaveSeat}
                    className="mr-1 text-[10px] text-red-400 hover:text-red-300 cursor-pointer"
                    title="القيام من المقعد"
                  >
                    (قم)
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => onTakeSeat('white')}
                className="px-2.5 py-0.5 rounded-lg bg-emerald-700/80 hover:bg-emerald-600 text-white font-bold text-xs border border-emerald-400 cursor-pointer transition-all shadow active:scale-95"
              >
                اقعد أبيض
              </button>
            )}
          </div>

          {/* Black Seat */}
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#400e18] border border-[#6d2432] shadow-sm" />
            {roomState.black ? (
              <div className="flex items-center gap-1 px-2.5 py-0.5 bg-black/40 border border-white/20 rounded-lg text-xs font-bold">
                <span className={isBlack ? 'text-emerald-300' : 'text-amber-100'}>
                  {roomState.black.name} {isBlack ? '(أنت)' : ''}
                </span>
                {isBlack && (
                  <button
                    onClick={onLeaveSeat}
                    className="mr-1 text-[10px] text-red-400 hover:text-red-300 cursor-pointer"
                    title="القيام من المقعد"
                  >
                    (قم)
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onTakeSeat('black')}
                  className="px-2.5 py-0.5 rounded-lg bg-emerald-700/80 hover:bg-emerald-600 text-white font-bold text-xs border border-emerald-400 cursor-pointer transition-all shadow active:scale-95"
                >
                  اقعد أسود
                </button>
                {onAddBotOpponent && (
                  <button
                    onClick={onAddBotOpponent}
                    className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-700/90 hover:bg-amber-600 text-white font-bold text-xs border border-amber-400 cursor-pointer transition-all shadow active:scale-95"
                    title="دعوة لاعب ذكاء اصطناعي محترف للمقعد الشاغر فوراً"
                  >
                    <Bot className="w-3.5 h-3.5 text-amber-200" />
                    <span>لعب مع بوت 🤖</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Spectators Count */}
          <div className="flex items-center gap-1 text-xs text-amber-200/70 px-2 py-0.5 bg-black/30 rounded-lg border border-white/5">
            <Eye className="w-3.5 h-3.5 text-blue-400" />
            <span>متفرجون: {roomState.spectators.length}</span>
            {isSpectator && <span className="text-[10px] text-blue-300 font-bold">(أنت متفرج)</span>}
          </div>

          {/* Exit Online Room */}
          <button
            onClick={onExitOnlineMode}
            className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-700/50 text-[11px] text-red-200 cursor-pointer transition-colors"
            title="الخروج من اللعب الأونلاين"
          >
            <LogOut className="w-3 h-3" />
            <span>مغادرة الغرفة</span>
          </button>
        </div>
      </div>

      {/* Helpful Room Guide Banner */}
      <div className="mt-1.5 pt-1 border-t border-amber-800/40 flex items-center justify-between text-[11px] text-amber-200/80 px-1">
        <span>✨ <strong>الربع المضيء</strong> = ربع اللم لكل لاعب (فيه قشاط الخصم في البداية).</span>
        <span className="text-amber-300 font-semibold">اضغط القشاط ثم الخانة اللي عايز تروحها.</span>
      </div>
    </div>
  );
};
