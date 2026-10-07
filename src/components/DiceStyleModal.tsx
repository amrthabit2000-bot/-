import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Dices, Check, Sparkles } from 'lucide-react';
import { CarvedDieView } from './AIDicePhysicsLabModal';

export type DiceStyle = 'ivory' | 'ebony' | 'ruby' | 'walnut' | 'casinoWhite';

export interface DiceStyleConfig {
  id: DiceStyle;
  name: string;
  desc: string;
  emoji: string;
  primaryColor: string;
}

export const DICE_STYLES: Record<DiceStyle, DiceStyleConfig> = {
  ivory: {
    id: 'ivory',
    name: 'عاج وعظم مصري دافئ (الأصلي)',
    desc: 'خامة العظم والعاج الطبيعي المعتّق بلون دافئ مريح للعين وغير فاقع',
    emoji: '🦴',
    primaryColor: '#faedd2',
  },
  ebony: {
    id: 'ebony',
    name: 'أبنوس أسود ملكي',
    desc: 'خشب أبنوس أسواني داكن مع نقاط ذهبية غائرة',
    emoji: '🖤',
    primaryColor: '#12141a',
  },
  ruby: {
    id: 'ruby',
    name: 'عقيق قرمزي فاخر',
    desc: 'راتنج بلوري أحمر ياقوتي كطاولات الكازينو العالمية',
    emoji: '💎',
    primaryColor: '#6b1426',
  },
  walnut: {
    id: 'walnut',
    name: 'خشب جوز محفور',
    desc: 'مكعبات خشب جوز طبيعي بنقاط محفورة بلون القطران',
    emoji: '🪵',
    primaryColor: '#3d2010',
  },
  casinoWhite: {
    id: 'casinoWhite',
    name: 'راتنج أبيض ناصع',
    desc: 'خامة الراتنج الأبيض الصقيل المعتمدة في بطولات الباكجامون',
    emoji: '🎲',
    primaryColor: '#ffffff',
  },
};

interface DiceStyleModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStyle: DiceStyle;
  onSelectStyle: (style: DiceStyle) => void;
}

export const DiceStyleModal: React.FC<DiceStyleModalProps> = ({
  isOpen,
  onClose,
  currentStyle,
  onSelectStyle,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="relative w-full max-w-md rounded-3xl bg-gradient-to-b from-[#24130a] via-[#1a0e07] to-[#120803] border-2 border-amber-600/70 shadow-2xl p-5 sm:p-6 text-amber-100 font-['Cairo']"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-amber-800/40">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-600/20 text-amber-300 border border-amber-500/40">
                <Dices className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-base text-amber-100">اختيار شكل وخامة الزهر</h3>
                <p className="text-[11px] text-amber-300/70">
                  حدد خامة النرد المحفور المفضل لديك على الرقعة
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-amber-300 hover:text-white bg-[#35190c] hover:bg-[#4d2512] border border-amber-700/60 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* List of Styles */}
          <div className="space-y-2.5">
            {(Object.keys(DICE_STYLES) as DiceStyle[]).map((styleKey) => {
              const s = DICE_STYLES[styleKey];
              const isSelected = currentStyle === styleKey;

              return (
                <div
                  key={styleKey}
                  onClick={() => {
                    onSelectStyle(styleKey);
                    onClose();
                  }}
                  className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#381a0b] border-amber-400 shadow-md'
                      : 'bg-[#1b0d06] border-amber-900/50 hover:bg-[#251208] hover:border-amber-700/70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-1.5 rounded-xl bg-[#2a1409] border border-amber-800/40">
                      {s.emoji}
                    </span>
                    <div>
                      <div className="font-black text-sm text-amber-100 flex items-center gap-2">
                        <span>{s.name}</span>
                        {isSelected && (
                          <span className="text-[10px] px-2 py-0.2 rounded-full bg-amber-400 text-amber-950 font-black">
                            مفعّل
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-amber-300/70 mt-0.5">{s.desc}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <CarvedDieView value={5} size={32} />
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-amber-400 bg-amber-400 text-amber-950' : 'border-amber-700'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
