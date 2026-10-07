import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Palette, Sparkles, X } from 'lucide-react';
import { BoardTheme } from '../types/tawla';
import { THEMES } from '../utils/themes';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: BoardTheme;
  onSelectTheme: (theme: BoardTheme) => void;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 12 }}
          className="relative w-full max-w-2xl bg-gradient-to-b from-[#211107] to-[#120803] border-2 border-amber-600/40 rounded-3xl p-4 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.95)] text-[#f5ecd9] font-['Cairo']"
          dir="rtl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#4d2d18] pb-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-700/40 border border-amber-400/50 flex items-center justify-center shadow">
                <Palette className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-amber-100 flex items-center gap-2">
                  <span>مظهر الرقعة وخلفية الطاولة</span>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </h2>
                <p className="text-xs text-amber-200/70">
                  اختر من بين أفخم أنواع الأخشاب، القماش المخملي الملكي، والرخام الإيطالي
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#3a1d0d] hover:bg-[#522913] text-amber-200 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Theme Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[65vh] overflow-y-auto pr-1">
            {(Object.keys(THEMES) as BoardTheme[]).map((themeKey) => {
              const theme = THEMES[themeKey];
              const isSelected = currentTheme === themeKey;

              return (
                <div
                  key={themeKey}
                  onClick={() => {
                    onSelectTheme(themeKey);
                    onClose();
                  }}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between gap-3 group relative overflow-hidden ${
                    isSelected
                      ? 'bg-[#3b1d0c]/90 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.3)] ring-2 ring-amber-400/60'
                      : 'bg-[#1e0e06]/80 border-[#4a2612] hover:border-amber-600/70 hover:bg-[#281308]'
                  }`}
                >
                  {/* Top Bar with Emoji and Name */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{theme.iconEmoji}</span>
                      <div>
                        <h3 className="font-extrabold text-sm sm:text-base text-amber-100 flex items-center gap-1.5">
                          <span>{theme.name}</span>
                          {isSelected && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500 text-stone-950 font-black">
                              محدد
                            </span>
                          )}
                        </h3>
                      </div>
                    </div>

                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                        isSelected
                          ? 'bg-amber-500 border-amber-300 text-stone-950'
                          : 'border-[#542d17] group-hover:border-amber-500/50'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>

                  {/* Visual Swatch Preview of Points & Board */}
                  <div className="relative w-full h-12 rounded-xl overflow-hidden border border-[#522c15] p-1 flex items-center justify-between bg-black/40">
                    {/* Simulated Board Swatch */}
                    <div className="flex items-center gap-1 w-full h-full">
                      {[0, 1, 2, 3, 4, 5].map((idx) => {
                        const isEven = idx % 2 === 0;
                        return (
                          <div
                            key={idx}
                            className={`flex-1 h-full rounded ${
                              isEven ? theme.pointEven : theme.pointOdd
                            } shadow-sm`}
                          />
                        );
                      })}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-amber-200/60 leading-relaxed font-sans">
                    {theme.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Footer note */}
          <div className="mt-4 pt-3 border-t border-[#4d2d18]/60 flex items-center justify-between text-xs text-amber-200/50">
            <span>يتغير شكل الرقعة والمثلثات والأجواء المحيطة فوراً.</span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-600 text-white font-bold cursor-pointer transition-all"
            >
              تم
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
