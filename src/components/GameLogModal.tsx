import React, { useState, useEffect } from 'react';
import { GameLogEntry } from '../types/tawla';
import {
  Check,
  ClipboardCopy,
  Download,
  FastForward,
  Film,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  Trash2,
  X,
} from 'lucide-react';
import { PLAYER_NAMES } from '../utils/diceNames';

interface GameLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: GameLogEntry[];
  onClearLogs: () => void;
}

export const GameLogModal: React.FC<GameLogModalProps> = ({
  isOpen,
  onClose,
  logs,
  onClearLogs,
}) => {
  const [activeTab, setActiveTab] = useState<'replay' | 'export'>('replay');
  const [replayIndex, setReplayIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);

  // Synchronize replay index with latest log on open
  useEffect(() => {
    if (isOpen && logs.length > 0) {
      setReplayIndex(logs.length - 1);
    }
  }, [isOpen, logs.length]);

  // Auto-play timer
  useEffect(() => {
    let interval: any = null;
    if (isPlaying && logs.length > 0) {
      interval = setInterval(() => {
        setReplayIndex((prev) => {
          if (prev >= logs.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1800);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, logs.length]);

  if (!isOpen) return null;

  const currentLog = logs[replayIndex];

  const generateFullLogText = () => {
    if (logs.length === 0) return 'لا يوجد حركات مسجلة بعد.';

    let text = `=== سجل لعبة الطاولة المصرية (طاولة ٣١ / المحبوسة) ===\n`;
    text += `تاريخ السجل: ${new Date().toLocaleString('ar-EG')}\n`;
    text += `إجمالي الأدوار المسجلة: ${logs.length}\n\n`;

    logs.forEach((l, idx) => {
      text += `[#${idx + 1}] الجولة ${l.roundNumber} - دور: ${PLAYER_NAMES[l.player]} (${l.timestamp})\n`;
      text += `الرمية: [${l.roll[0]}, ${l.roll[1]}] - النداء: ${l.diceName}\n`;
      if (l.skipped) {
        text += `الحركة: لا توجد حركة قانونية متاحة (تم تمرير الدور)\n`;
      } else {
        l.moves.forEach((m, mIdx) => {
          text += `  نقلة ${mIdx + 1}: زهرة (${m.die}) من [${m.fromName}] إلى [${m.toName}]\n`;
        });
      }
      text += `النتيجة بعد الدور: الأبيض ${l.scoreAfter[0]} — الأسود ${l.scoreAfter[1]}\n`;
      text += `----------------------------------------\n`;
    });

    return text;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateFullLogText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleDownload = () => {
    const text = generateFullLogText();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tawla_match_${new Date().toISOString().slice(0, 10)}.tawla.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md font-['Cairo']">
      <div className="relative w-full max-w-2xl max-h-[88vh] bg-gradient-to-b from-[#24130a] via-[#1a0c06] to-[#100703] border-2 border-amber-600/50 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-[#f5ecd9]" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#1d0f07] border-b border-[#4d2d17] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 border border-amber-300 flex items-center justify-center text-lg shadow">
              <Film className="w-5 h-5 text-amber-100" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-amber-100">
                إعادة مشاهدة وتصدير الجيم (Match Replay & Export)
              </h2>
              <p className="text-xs text-amber-200/60">
                استعراض مسار المباراة خطوة بخطوة وتوثيق النقلات
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#3a1d0d] hover:bg-[#522913] text-amber-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-4 py-2 bg-[#160a04] border-b border-[#3b1d0c] shrink-0 text-xs">
          <button
            onClick={() => setActiveTab('replay')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === 'replay'
                ? 'bg-amber-600 text-white shadow'
                : 'text-amber-200/70 hover:text-amber-100'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>مشغل الإعادة التفاعلي (Replay)</span>
          </button>

          <button
            onClick={() => setActiveTab('export')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl font-bold transition-all cursor-pointer ${
              activeTab === 'export'
                ? 'bg-amber-600 text-white shadow'
                : 'text-amber-200/70 hover:text-amber-100'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>السجل المكتوب والتصدير (Export)</span>
          </button>
        </div>

        {/* Tab 1: Interactive Replay Player */}
        {activeTab === 'replay' && (
          <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-between space-y-4">
            {logs.length === 0 ? (
              <div className="text-center py-16 text-amber-200/50 text-sm">
                لم يتم تسجيل أي نقلات بعد. ارمِ الزهر وابدأ اللعب لاستعراض شريط الإعادة هنا.
              </div>
            ) : (
              <>
                {/* Current Active Move Highlight Card */}
                <div className="p-4 rounded-3xl bg-gradient-to-br from-[#30160a] via-[#200e05] to-[#140803] border-2 border-amber-500/60 shadow-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-[#432311] pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
                      <span className="font-mono font-black text-amber-300 text-sm">
                        الدور #{replayIndex + 1} من {logs.length}
                      </span>
                      <span className="text-xs text-amber-200/60">
                        (الجولة {currentLog?.roundNumber})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                          currentLog?.player === 0
                            ? 'bg-[#fcf8ed] text-stone-900 border-amber-300'
                            : 'bg-black text-amber-200 border-stone-700'
                        }`}
                      >
                        {PLAYER_NAMES[currentLog?.player ?? 0]}
                      </span>
                      <span className="text-[11px] text-amber-200/50 font-mono">
                        {currentLog?.timestamp}
                      </span>
                    </div>
                  </div>

                  {/* Dice Call Visual */}
                  <div className="flex items-center justify-between bg-black/40 p-3 rounded-2xl border border-amber-900/40">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">🎲</span>
                      <div>
                        <div className="flex items-center gap-1.5 font-mono font-black text-amber-200 text-base">
                          <span>[{currentLog?.roll[0]}]</span>
                          <span>[{currentLog?.roll[1]}]</span>
                        </div>
                        <span className="text-xs text-amber-300 font-bold">
                          نداء الزهر: {currentLog?.diceName}
                        </span>
                      </div>
                    </div>

                    <div className="text-left font-mono text-xs text-amber-200/80">
                      <div>النتيجة بعد الدور:</div>
                      <span className="text-emerald-400 font-black">
                        الأبيض {currentLog?.scoreAfter[0]} — الأسود {currentLog?.scoreAfter[1]}
                      </span>
                    </div>
                  </div>

                  {/* Move Steps List */}
                  <div className="space-y-1.5">
                    <span className="text-xs text-amber-200/70 font-bold block">
                      النقلات المنفذة في هذا الدور:
                    </span>
                    {currentLog?.skipped ? (
                      <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-800/60 text-xs text-rose-300 italic">
                        لا توجد حركة قانونية متاحة — تم تمرير الدور
                      </div>
                    ) : (
                      currentLog?.moves.map((m, mIdx) => (
                        <div
                          key={mIdx}
                          className="flex items-center justify-between p-2 rounded-xl bg-[#1b0d06] border border-[#3b1d0c] text-xs text-amber-100"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-amber-600/80 text-white font-bold font-mono text-[10px] flex items-center justify-center">
                              {mIdx + 1}
                            </span>
                            <span>
                              نقل بزهرة <strong>({m.die})</strong>: من {m.fromName} إلى {m.toName}
                            </span>
                          </div>
                          <span className="text-[10px] text-amber-400 font-mono">
                            {m.actionType === 'pin' ? '📌 حبس قشاط' : m.actionType === 'bearOff' ? '✨ هبوط' : 'نقل'}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Timeline Slider & Player Controls */}
                <div className="p-3 rounded-2xl bg-[#170a04] border border-[#3b1d0c] space-y-3">
                  {/* Slider */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-amber-300 font-bold">1</span>
                    <input
                      type="range"
                      min={0}
                      max={logs.length - 1}
                      value={replayIndex}
                      onChange={(e) => {
                        setIsPlaying(false);
                        setReplayIndex(Number(e.target.value));
                      }}
                      className="flex-1 accent-amber-500 cursor-pointer h-2 bg-[#2d160b] rounded-lg"
                    />
                    <span className="text-xs font-mono text-amber-300 font-bold">
                      {logs.length}
                    </span>
                  </div>

                  {/* Playback Button Bar */}
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => {
                        setIsPlaying(false);
                        setReplayIndex(0);
                      }}
                      disabled={replayIndex === 0}
                      className="p-2 rounded-xl bg-[#281308] hover:bg-[#3d1d0c] text-amber-200 disabled:opacity-30 cursor-pointer transition-all"
                      title="البداية"
                    >
                      <SkipBack className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        setIsPlaying(false);
                        setReplayIndex((prev) => Math.max(0, prev - 1));
                      }}
                      disabled={replayIndex === 0}
                      className="px-3 py-1.5 rounded-xl bg-[#281308] hover:bg-[#3d1d0c] text-amber-200 font-bold text-xs disabled:opacity-30 cursor-pointer flex items-center gap-1 transition-all"
                    >
                      <span>السابق</span>
                    </button>

                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-black text-xs shadow-md cursor-pointer flex items-center gap-1.5 transition-all"
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-4 h-4" />
                          <span>إيقاف مؤقت</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          <span>تشغيل تلقائي</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setIsPlaying(false);
                        setReplayIndex((prev) => Math.min(logs.length - 1, prev + 1));
                      }}
                      disabled={replayIndex === logs.length - 1}
                      className="px-3 py-1.5 rounded-xl bg-[#281308] hover:bg-[#3d1d0c] text-amber-200 font-bold text-xs disabled:opacity-30 cursor-pointer flex items-center gap-1 transition-all"
                    >
                      <span>التالي</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsPlaying(false);
                        setReplayIndex(logs.length - 1);
                      }}
                      disabled={replayIndex === logs.length - 1}
                      className="p-2 rounded-xl bg-[#281308] hover:bg-[#3d1d0c] text-amber-200 disabled:opacity-30 cursor-pointer transition-all"
                      title="النهاية"
                    >
                      <SkipForward className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Tab 2: Full Log Text & Export */}
        {activeTab === 'export' && (
          <div className="flex-1 overflow-y-auto p-4 flex flex-col space-y-3 text-xs">
            {/* Actions Bar */}
            <div className="flex items-center justify-between bg-[#170a04] p-2.5 rounded-2xl border border-[#3b1d0c]">
              <span className="text-amber-200/80 font-bold">
                إجمالي السجلات: <strong className="text-amber-300 font-mono">{logs.length}</strong> دور
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  disabled={logs.length === 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold transition-all disabled:opacity-40 cursor-pointer shadow"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-200" />
                      <span>تم النسخ!</span>
                    </>
                  ) : (
                    <>
                      <ClipboardCopy className="w-3.5 h-3.5" />
                      <span>نسخ النص</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleDownload}
                  disabled={logs.length === 0}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold transition-all disabled:opacity-40 cursor-pointer shadow"
                  title="تحميل كملف نصي"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تصدير (.txt)</span>
                </button>

                <button
                  onClick={onClearLogs}
                  disabled={logs.length === 0}
                  className="p-1.5 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-200 transition-colors disabled:opacity-40 cursor-pointer"
                  title="مسح السجل"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Readonly Raw Text Area */}
            <div className="flex-1 bg-black/60 rounded-2xl border border-[#3b1d0c] p-3 font-mono text-[11px] text-amber-200/80 overflow-y-auto whitespace-pre-wrap leading-relaxed max-h-[46vh]">
              {generateFullLogText()}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2.5 pb-3 px-4 border-t border-[#4d2d18]/60 bg-[#170a04] flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-amber-700 hover:bg-amber-600 text-white font-bold text-xs cursor-pointer shadow transition-all"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
