import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe2, Link, Sparkles, Users, X, Play, Bot, Zap } from 'lucide-react';

interface OnlineRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinOrCreateRoom: (roomCode: string, playerName: string) => void;
  onQuickMatchWithBot?: () => void;
}

export const OnlineRoomModal: React.FC<OnlineRoomModalProps> = ({
  isOpen,
  onClose,
  onJoinOrCreateRoom,
  onQuickMatchWithBot,
}) => {
  const [roomCode, setRoomCode] = useState(
    () => `TAWLA-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [playerName, setPlayerName] = useState(
    () => localStorage.getItem('tawla_player_name') || 'حريف الطاولة'
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomCode.trim() && playerName.trim()) {
      localStorage.setItem('tawla_player_name', playerName.trim());
      onJoinOrCreateRoom(roomCode.trim().toUpperCase(), playerName.trim());
      onClose();
    }
  };

  const handleGenerateNewCode = () => {
    setRoomCode(`TAWLA-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm font-['Cairo']">
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 15 }}
          className="relative w-full max-w-md bg-gradient-to-b from-[#24130a] to-[#120803] border-2 border-amber-600/50 rounded-3xl p-5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.95)] text-[#f5ecd9]"
          dir="rtl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#4d2d18] pb-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-600/30 border border-amber-400/60 flex items-center justify-center shadow">
                <Globe2 className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-amber-100 flex items-center gap-2">
                  <span>اللعب أونلاين مع الأصدقاء</span>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </h2>
                <p className="text-xs text-amber-200/70">
                  شارك الرابط مع أصحابك للعب معاً أو المشاهدة المباشرة
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#3a1d0d] hover:bg-[#522913] text-amber-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Instant Match with Advanced Online Bot */}
          {onQuickMatchWithBot && (
            <div className="mb-4">
              <button
                type="button"
                onClick={() => {
                  onQuickMatchWithBot();
                  onClose();
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-emerald-900/90 via-teal-900/80 to-emerald-950 border border-emerald-500/60 hover:border-emerald-400 text-emerald-100 shadow-lg cursor-pointer transition-all hover:scale-[1.01] active:scale-95 group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600/30 border border-emerald-400/50 flex items-center justify-center text-emerald-300">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-black text-white flex items-center gap-1.5">
                      <span>لعب فوري ضد متصدري الأونلاين</span>
                      <span className="text-[10px] bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40">
                        بوتات متقدمة
                      </span>
                    </div>
                    <div className="text-[11px] text-emerald-200/70 mt-0.5">
                      مطابقة فورية في ثانية واحدة دون انتظار أي لاعب!
                    </div>
                  </div>
                </div>
                <Zap className="w-4 h-4 text-emerald-400 group-hover:scale-125 transition-transform ml-1" />
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Player Name */}
            <div>
              <label className="block text-xs font-bold text-amber-200 mb-1">
                اسمك في اللعبة:
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="اكتب اسمك..."
                className="w-full px-3.5 py-2.5 bg-[#170a04] border border-[#522c15] rounded-xl text-amber-100 font-bold focus:outline-none focus:border-amber-400 transition-all text-sm"
                required
              />
            </div>

            {/* Room Code */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-amber-200">
                  كود الغرفة:
                </label>
                <button
                  type="button"
                  onClick={handleGenerateNewCode}
                  className="text-[11px] text-amber-400 hover:underline cursor-pointer"
                >
                  توليد كود جديد 🎲
                </button>
              </div>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="مثال: TAWLA-1234"
                className="w-full px-3.5 py-2.5 bg-[#170a04] border border-[#522c15] rounded-xl text-amber-100 font-mono font-black focus:outline-none focus:border-amber-400 transition-all text-base tracking-wider uppercase text-center"
                required
              />
            </div>

            <div className="p-3 bg-[#190c05] rounded-xl border border-[#3d1e0d] text-xs text-amber-200/80 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-amber-300">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>كيف يعمل اللعب الأونلاين؟</span>
              </div>
              <p className="text-[11px] text-amber-200/70 leading-relaxed">
                • بعد الدخول، يمكنك نسخ الرابط وإرساله لأصحابك.
                <br />
                • أول لاعبين يختاران "اقعد أبيض" و"اقعد أسود" ويلعبان ضد بعضهما.
                <br />
                • أي شخص آخر يدخل الرابط يصبح متفرجاً يشاهد الرميات والحركات مباشرة لحظة بلحظة!
              </p>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#4d2d18]/60">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#2e1509] hover:bg-[#431f0e] text-amber-200 text-xs font-bold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-500 text-white font-black text-sm border border-amber-400/60 shadow-lg cursor-pointer transition-all active:scale-95"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>دخول / إنشاء الغرفة</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
