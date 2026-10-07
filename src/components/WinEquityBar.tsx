import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EquityEvaluation } from '../utils/equityCalculator';
import { ChevronDown, ChevronUp, Info, TrendingUp, AlertTriangle } from 'lucide-react';

interface WinEquityBarProps {
  evaluation: EquityEvaluation;
  isVisible: boolean;
  onToggleVisibility?: () => void;
}

export const WinEquityBar: React.FC<WinEquityBarProps> = ({
  evaluation,
  isVisible,
  onToggleVisibility,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  if (!isVisible) return null;

  const { whiteEquity, blackEquity, evalText, tacticalTip, isBlunderWarning, blunderMessage } =
    evaluation;

  return (
    <div className="w-full max-w-4xl mx-auto my-1 font-['Cairo'] select-none">
      <div className="bg-[#1b0d06]/95 border border-amber-600/40 rounded-2xl p-2 sm:p-2.5 shadow-lg backdrop-blur-sm">
        {/* Top Evaluation Row */}
        <div className="flex items-center justify-between text-xs mb-1.5 px-1">
          {/* White Side Equity */}
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#fcf8ed] border border-amber-300 shadow-sm" />
            <span className="font-bold text-amber-100">الأبيض</span>
            <span className="font-mono font-black text-amber-300 text-xs sm:text-sm">
              {whiteEquity}%
            </span>
          </div>

          {/* Center Tactical Evaluation Title / Blunder Alert */}
          <div className="flex items-center gap-1.5 text-center">
            {isBlunderWarning ? (
              <span className="text-[11px] font-bold text-rose-300 flex items-center gap-1 animate-pulse bg-rose-950/80 px-2 py-0.5 rounded-full border border-rose-600/50">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>{blunderMessage || 'ثغرة تكتيكية في النقلة'}</span>
              </span>
            ) : (
              <span className="text-[11px] font-bold text-amber-200/90 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                <span>{evalText}</span>
              </span>
            )}
          </div>

          {/* Black Side Equity */}
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-black text-amber-300 text-xs sm:text-sm">
              {blackEquity}%
            </span>
            <span className="font-bold text-stone-300">الأسود</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#1c0f08] border border-stone-600 shadow-sm" />
          </div>
        </div>

        {/* The Live Equity Bar (Multi-colored gradient with position marker) */}
        <div className="relative h-2.5 sm:h-3 w-full bg-[#0d0502] rounded-full overflow-hidden p-[1px] border border-[#3b1d0c] shadow-inner flex">
          {/* White Equity Fill */}
          <motion.div
            initial={false}
            animate={{ width: `${whiteEquity}%` }}
            transition={{ type: 'spring', damping: 20, stiffness: 120 }}
            className="h-full bg-gradient-to-r from-amber-200 via-[#fff8db] to-[#ffd700] rounded-r-full shadow-[0_0_8px_rgba(255,235,150,0.6)]"
          />

          {/* Black Equity Fill */}
          <motion.div
            initial={false}
            animate={{ width: `${blackEquity}%` }}
            transition={{ type: 'spring', damping: 20, stiffness: 120 }}
            className="h-full bg-gradient-to-l from-stone-800 via-[#2d180d] to-[#451e0d] rounded-l-full"
          />

          {/* Center 50% Balance Marker */}
          <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[2px] bg-amber-500/70 z-10 shadow" />
        </div>

        {/* Collapsible Tactical Hint & AI Engine Advice */}
        <div className="flex items-center justify-between mt-1 px-1 text-[10px] text-amber-200/60">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-1 hover:text-amber-200 transition-colors cursor-pointer"
          >
            <Info className="w-3 h-3 text-amber-400" />
            <span>نصيحة محرك التحليل التكتيكي (GNUbg Engine)</span>
            {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {onToggleVisibility && (
            <button
              onClick={onToggleVisibility}
              className="hover:text-amber-200 transition-colors cursor-pointer"
            >
              إخفاء المؤشر
            </button>
          )}
        </div>

        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-1.5 pt-1.5 border-t border-[#3b1d0c] text-[11px] text-amber-100/90 leading-relaxed overflow-hidden"
            >
              <div className="p-2 rounded-xl bg-black/40 border border-amber-900/40">
                <span className="font-bold text-amber-300">💡 النصيحة التكتيكية: </span>
                <span>{tacticalTip}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
