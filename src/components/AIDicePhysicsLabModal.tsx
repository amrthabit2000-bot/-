import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Brain,
  Sparkles,
  Gauge,
  TrendingUp,
  RotateCcw,
  CheckCircle2,
  Cpu,
  Layers,
  Activity,
  Dices,
  Award,
  Zap,
} from 'lucide-react';
import { aiDiceEngine, AdaptivePhysicsWeights, RollTelemetry, ProCalibration } from '../utils/aiDiceEngine';
import { toArabicDigits } from '../utils/rules31';
import { getDiceCallName } from '../utils/diceNames';

interface AIDicePhysicsLabModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTestRoll?: () => void;
}

// 3x3 Grid Coordinates for standard dice pips (1 to 6)
const PIPS_MAP: Record<number, [number, number][]> = {
  1: [[1, 1]],
  2: [[0, 0], [2, 2]],
  3: [[0, 0], [1, 1], [2, 2]],
  4: [[0, 0], [2, 0], [0, 2], [2, 2]],
  5: [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]],
  6: [[0, 0], [2, 0], [0, 1], [2, 1], [0, 2], [2, 2]],
};

// Luxury Solid Ivory Die Face with Deep Inset Shadow (خامة العاج الطبيعي بظلال داخلية عميقة محفورة)
export const CarvedDieView: React.FC<{ value: number; size?: number; className?: string }> = ({
  value,
  size = 56,
  className = '',
}) => {
  const pips = PIPS_MAP[value] || [];
  const pipSize = Math.max(5, Math.round(size * 0.185));

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: '#fbf8f1',
        /* Realistic Ivory Texture Gradients & Satin Specular */
        backgroundImage: `
          radial-gradient(ellipse at 28% 22%, rgba(255, 255, 255, 0.96) 0%, rgba(253, 249, 241, 0.5) 45%, rgba(238, 229, 212, 0.75) 100%),
          linear-gradient(135deg, rgba(255, 255, 255, 0.65) 0%, rgba(246, 239, 225, 0.3) 50%, rgba(230, 220, 201, 0.65) 100%),
          repeating-linear-gradient(115deg, rgba(195, 175, 145, 0.05) 0px, rgba(195, 175, 145, 0.05) 1px, transparent 1px, transparent 5px)
        `,
        borderColor: '#ded5c2',
        boxShadow:
          '0 8px 22px rgba(0, 0, 0, 0.55), inset 0 2px 2px rgba(255, 255, 255, 0.95), inset 0 -2px 3px rgba(195, 180, 150, 0.4)',
      }}
      className={`relative rounded-2xl border p-2 select-none flex-shrink-0 flex items-center justify-center ${className}`}
    >
      <div className="w-full h-full grid grid-cols-3 grid-rows-3 items-center justify-items-center">
        {[0, 1, 2].map((r) =>
          [0, 1, 2].map((c) => {
            const hasPip = pips.some(([pr, pc]) => pr === r && pc === c);
            if (!hasPip) return <div key={`${r}-${c}`} className="w-full h-full" />;

            return (
              <div
                key={`${r}-${c}`}
                style={{
                  width: `${pipSize}px`,
                  height: `${pipSize}px`,
                  background:
                    'radial-gradient(circle at 45% 40%, #06070a 0%, #101217 65%, #1c202a 100%)',
                  /* Deep Multi-Layer Inset Box Shadow: محفورة فعلياً داخل جسم الزهر العاجي */
                  boxShadow:
                    'inset 0 3px 5px rgba(0, 0, 0, 0.98), inset 0 1px 2px rgba(0, 0, 0, 0.95), inset 0 -1px 1.5px rgba(255, 255, 255, 0.22), 0 0.5px 1px rgba(255, 255, 255, 0.65)',
                }}
                className="rounded-full"
              />
            );
          })
        )}
      </div>
    </div>
  );
};

export const AIDicePhysicsLabModal: React.FC<AIDicePhysicsLabModalProps> = ({
  isOpen,
  onClose,
  onTestRoll,
}) => {
  const [weights, setWeights] = useState<AdaptivePhysicsWeights>(aiDiceEngine.getWeights());
  const [history, setHistory] = useState<RollTelemetry[]>(aiDiceEngine.getHistory());
  const [proCalibration, setProCalibration] = useState<ProCalibration>(aiDiceEngine.getProCalibration());
  const [isProMode, setIsProMode] = useState<boolean>(aiDiceEngine.getProMode());
  const [isCalibratingPro, setIsCalibratingPro] = useState<boolean>(false);
  const [proMessage, setProMessage] = useState<string | null>(null);

  // Interactive Live Dice Preview Pair
  const [previewDice, setPreviewDice] = useState<[number, number]>([6, 5]);

  useEffect(() => {
    if (isOpen) {
      setWeights(aiDiceEngine.getWeights());
      const h = aiDiceEngine.getHistory();
      setHistory(h);
      setProCalibration(aiDiceEngine.getProCalibration());
      setIsProMode(aiDiceEngine.getProMode());

      if (h.length > 0) {
        setPreviewDice(h[h.length - 1].outcome);
      }
    }
  }, [isOpen]);

  const handleToggleProMode = (enabled: boolean) => {
    setIsProMode(enabled);
    aiDiceEngine.setProMode(enabled);
  };

  const handleCalibrateProWithAI = async () => {
    setIsCalibratingPro(true);
    setProMessage(null);
    try {
      const cal = await aiDiceEngine.calibrateProThrowWithAI();
      setProCalibration(cal);
      setWeights(aiDiceEngine.getWeights());
      setProMessage('تمت معايرة حركة الزهر بالذكاء الاصطناعي لمحاكاة رمية الحريف المحترف بنجاح!');
    } catch {
      setProMessage('تمت المعايرة الرياضية المحلية بنجاح.');
    } finally {
      setIsCalibratingPro(false);
    }
  };

  const handleResetLearning = () => {
    aiDiceEngine.resetLearning();
    setWeights(aiDiceEngine.getWeights());
    setHistory(aiDiceEngine.getHistory());
    setProCalibration(aiDiceEngine.getProCalibration());
    setProMessage(null);
  };

  const rollLabDice = () => {
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    setPreviewDice([d1, d2]);
    aiDiceEngine.recordRollResult([d1, d2], 38, 2, 1);
    setWeights(aiDiceEngine.getWeights());
    setHistory(aiDiceEngine.getHistory());
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-gradient-to-b from-[#26150b] via-[#1a0e07] to-[#120803] border-2 border-amber-600/70 shadow-2xl p-5 sm:p-7 text-amber-100 font-['Cairo']"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 rounded-full text-amber-300 hover:text-white bg-[#3d2010]/80 hover:bg-[#522d16] border border-amber-700/60 transition-all cursor-pointer"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6 border-b border-amber-800/40 pb-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-900 border border-amber-400/80 shadow-lg text-amber-100">
              <Brain className="w-7 h-7 text-amber-200 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-amber-100">
                  مختبر الذكاء الاصطناعي لفيزياء الزهر
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/50">
                  Adaptive AI Physics Lab
                </span>
              </div>
              <p className="text-xs sm:text-sm text-amber-300/80">
                تحليل النتائج التاريخية ومعايرة عشوائية الرمي لمحاكاة رمية لاعب طاولة محترف (Pro Player Throw).
              </p>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {/* Naturalness Rating */}
            <div className="p-3.5 rounded-2xl bg-[#341b0e]/80 border border-amber-700/50 flex flex-col justify-between">
              <div className="flex items-center justify-between text-amber-300 text-xs font-bold">
                <span>مؤشر الواقعية</span>
                <Gauge className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-2">
                {toArabicDigits(weights.naturalnessScore)}%
              </div>
              <div className="text-[10px] text-amber-300/60 mt-1">طبيعي بنسبة استثنائية</div>
            </div>

            {/* Total Learned Rolls */}
            <div className="p-3.5 rounded-2xl bg-[#341b0e]/80 border border-amber-700/50 flex flex-col justify-between">
              <div className="flex items-center justify-between text-amber-300 text-xs font-bold">
                <span>الرميات التاريخية</span>
                <TrendingUp className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-amber-200 mt-2">
                {toArabicDigits(history.length)}
              </div>
              <div className="text-[10px] text-amber-300/60 mt-1">عينة إحصائية حية</div>
            </div>

            {/* Pro Wrist Stability */}
            <div className="p-3.5 rounded-2xl bg-[#341b0e]/80 border border-amber-700/50 flex flex-col justify-between">
              <div className="flex items-center justify-between text-amber-300 text-xs font-bold">
                <span>ثبات المعصم</span>
                <Award className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-amber-300 mt-2">
                {toArabicDigits((proCalibration.wristStability * 100).toFixed(0))}%
              </div>
              <div className="text-[10px] text-amber-300/60 mt-1">تحكم نقرة اليد المحترفة</div>
            </div>

            {/* Pro Tumble Factor */}
            <div className="p-3.5 rounded-2xl bg-[#341b0e]/80 border border-amber-700/50 flex flex-col justify-between">
              <div className="flex items-center justify-between text-amber-300 text-xs font-bold">
                <span>عزم التقليب</span>
                <Cpu className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-cyan-300 mt-2">
                ×{toArabicDigits(proCalibration.proTumbleFactor.toFixed(2))}
              </div>
              <div className="text-[10px] text-amber-300/60 mt-1">٤ دورات كاملة للعشوائية</div>
            </div>
          </div>

          {/* AI Pro Throw Randomness Calibration Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#29140a] via-[#35190c] to-[#29140a] border-2 border-amber-500/70 shadow-xl mb-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-amber-600/30 border border-amber-500/60">
                  <Award className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-amber-100 flex items-center gap-2">
                    <span>معايرة عشوائية الزهر كرمية لاعب محترف</span>
                    {isProMode && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        مفعّل الآن
                      </span>
                    )}
                  </h3>
                  <p className="text-[11px] text-amber-300/80">
                    خوارزمية ذكاء اصطناعي تفحص نتائج الرميات السابقة وتضبط عزم المعصم وتدوير الأوجه.
                  </p>
                </div>
              </div>

              {/* Pro Mode Toggle Switch */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleProMode(!isProMode)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                    isProMode
                      ? 'bg-amber-600 text-amber-950 border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.6)]'
                      : 'bg-[#1e0e06] text-stone-400 border-stone-700 hover:text-stone-200'
                  }`}
                >
                  <Zap className={`w-3.5 h-3.5 ${isProMode ? 'fill-current' : ''}`} />
                  <span>{isProMode ? 'نمط المحترف نشط' : 'نمط عادي'}</span>
                </button>

                <button
                  onClick={handleCalibrateProWithAI}
                  disabled={isCalibratingPro}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:bg-stone-800 text-amber-50 text-xs font-black transition-all cursor-pointer shadow-md"
                >
                  <Activity className={`w-3.5 h-3.5 ${isCalibratingPro ? 'animate-spin' : ''}`} />
                  <span>{isCalibratingPro ? 'جاري المعايرة...' : 'معايرة بالذكاء الاصطناعي'}</span>
                </button>
              </div>
            </div>

            {/* AI Pro Insights Content */}
            <div className="bg-[#150a04]/90 p-3.5 rounded-xl border border-amber-900/60 space-y-2">
              <div className="text-xs text-amber-200/90 leading-relaxed flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-300">تحليل العشوائية التاريخية: </span>
                  <span>{proCalibration.analysis}</span>
                </div>
              </div>

              <div className="text-xs text-emerald-300/90 leading-relaxed flex items-start gap-2 border-t border-amber-900/40 pt-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-emerald-300">تكنيك الحريف المحترف: </span>
                  <span>{proCalibration.proInsight}</span>
                </div>
              </div>

              {proMessage && (
                <div className="text-[11px] text-amber-300 font-bold bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-700/50 mt-1">
                  ✓ {proMessage}
                </div>
              )}
            </div>
          </div>

          {/* Interactive Carved Inset-Shadow Dice Showcase Bay */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#201007] via-[#2d170a] to-[#201007] border border-amber-600/60 shadow-inner mb-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-amber-200 font-bold text-sm">
                <Dices className="w-4 h-4 text-amber-400" />
                <span>معاينة تصميم النرد المحفور بظلال داخلية (Inset Shadow Pips)</span>
              </div>
              <button
                onClick={rollLabDice}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-700 hover:bg-amber-600 text-amber-100 text-xs font-bold transition-all cursor-pointer shadow-md"
              >
                <span>رمي تجريبي 🎲</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-around gap-4 bg-[#140a04]/80 p-4 rounded-2xl border border-amber-900/60">
              {/* Pair of Realistic Solid Ivory Carved Dice */}
              <div className="flex items-center gap-6">
                {/* Die 1 */}
                <div className="relative flex flex-col items-center">
                  <CarvedDieView value={previewDice[0]} size={62} />
                </div>

                {/* Die 2 */}
                <div className="relative flex flex-col items-center">
                  <CarvedDieView value={previewDice[1]} size={62} />
                </div>
              </div>

              {/* Callout Information */}
              <div className="text-center sm:text-right">
                <div className="text-sm font-black text-amber-300">
                  {getDiceCallName(previewDice[0], previewDice[1])}
                </div>
                <div className="text-xs text-amber-200/80 mt-1">
                  المجموع: {toArabicDigits(previewDice[0] + previewDice[1])} · نقاط محفورة كروياً بظل داخلي غائر
                </div>
                <div className="text-[11px] text-emerald-400 font-bold mt-1">
                  ✓ ظلال داخلية (Inset Shadow) تمنع البروز وتُبرز الحفر الواقعي
                </div>
              </div>
            </div>
          </div>

          {/* Recent Rolls Telemetry with Miniature Carved Inset-Shadow Dice */}
          <div className="mb-5">
            <h3 className="text-sm font-bold text-amber-200 mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>سجل الرميات التاريخية المتعلم منها ({toArabicDigits(history.length)}):</span>
            </h3>
            {history.length === 0 ? (
              <div className="text-center py-4 text-xs text-amber-300/50 bg-[#1f0f07]/60 rounded-xl border border-amber-900/40">
                لم يتم تسجيل رميات في هذه الجلسة بعد. ارمِ الزهر في اللعبة لتدريب المحرك تلقائياً.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1">
                {history.slice(-14).reverse().map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#2e170c] border border-amber-700/40 text-xs text-amber-200 shadow-sm"
                  >
                    <div className="flex items-center gap-1">
                      <CarvedDieView value={r.outcome[0]} size={22} />
                      <CarvedDieView value={r.outcome[1]} size={22} />
                    </div>
                    <span className="font-black text-amber-400">
                      [{toArabicDigits(r.outcome[0])} - {toArabicDigits(r.outcome[1])}]
                    </span>
                    <span className="text-[10px] text-amber-300/60">
                      ({toArabicDigits(r.durationFrames)} إطار)
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions Footer */}
          <div className="flex items-center justify-between border-t border-amber-800/40 pt-4 text-xs">
            <button
              onClick={handleResetLearning}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-amber-400/80 hover:text-amber-200 bg-[#32170b] hover:bg-[#42200f] border border-amber-800/50 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة ضبط المعايير</span>
            </button>

            <div className="flex items-center gap-2">
              {onTestRoll && (
                <button
                  onClick={() => {
                    onClose();
                    onTestRoll();
                  }}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-amber-50 font-black shadow-lg cursor-pointer transition-all"
                >
                  تجربة رمية الحريف المحترف 🎲
                </button>
              )}
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-[#3d2010] hover:bg-[#4d2814] text-amber-200 font-bold border border-amber-700/60 cursor-pointer transition-all"
              >
                إغلاق
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
