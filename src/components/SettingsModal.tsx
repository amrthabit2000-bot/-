import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Settings,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Cpu,
  Dices,
  Palette,
  Sparkles,
  Check,
  Zap,
} from 'lucide-react';
import { BoardTheme, AIDifficulty } from '../types/tawla';
import { THEMES, ThemeConfig } from '../utils/themes';
import { sound } from '../utils/audio';
import { aiDiceEngine } from '../utils/aiDiceEngine';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: BoardTheme;
  onSelectTheme: (theme: BoardTheme) => void;
  soundEnabled: boolean;
  onToggleSound: (enabled: boolean) => void;
  aiDifficulty: AIDifficulty;
  onChangeAIDifficulty: (diff: AIDifficulty) => void;
  onOpenAiLab?: () => void;
  onOpenConnectedAccounts?: () => void;
  onOpenStore?: () => void;
}

type TabType = 'theme' | 'sound' | 'physics' | 'ai';

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme,
  soundEnabled,
  onToggleSound,
  aiDifficulty,
  onChangeAIDifficulty,
  onOpenAiLab,
  onOpenConnectedAccounts,
  onOpenStore,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('theme');
  const [themeFilter, setThemeFilter] = useState<'all' | 'wood' | 'inlay' | 'cloth' | 'antique'>('all');
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(sound.voiceEnabled);
  const [volume, setVolume] = useState<number>(sound.volume);
  const [isProDice, setIsProDice] = useState<boolean>(aiDiceEngine.getProMode());

  if (!isOpen) return null;

  const handleToggleVoice = (enabled: boolean) => {
    sound.voiceEnabled = enabled;
    setVoiceEnabled(enabled);
  };

  const handleChangeVolume = (newVol: number) => {
    sound.volume = newVol;
    setVolume(newVol);
  };

  const handleToggleProDice = (enabled: boolean) => {
    aiDiceEngine.setProMode(enabled);
    setIsProDice(enabled);
  };

  const themeList = Object.keys(THEMES) as BoardTheme[];
  const filteredThemes = themeList.filter((k) => {
    if (themeFilter === 'all') return true;
    return THEMES[k].category === themeFilter;
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="relative w-full max-w-4xl max-h-[92vh] overflow-hidden rounded-3xl bg-gradient-to-b from-[#25140b] via-[#1a0e07] to-[#120803] border-2 border-amber-600/70 shadow-2xl flex flex-col text-amber-100 font-['Cairo']"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-amber-800/40 bg-[#1c0d06]/60">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-900 border border-amber-400/70 shadow-md">
                <Settings className="w-6 h-6 text-amber-100" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-amber-100 flex items-center gap-2">
                  <span>إعدادات اللعبة وخامة الطاولة</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    ٢٠ طراز فاخر
                  </span>
                </h2>
                <p className="text-xs text-amber-300/70">
                  تخصيص شكل وخشب الرقعة، الأصوات، رميات النرد، ومستوى الذكاء الاصطناعي
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-amber-300 hover:text-white bg-[#35190c] hover:bg-[#4d2512] border border-amber-700/60 transition-all cursor-pointer"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 px-6 pt-3 pb-2 border-b border-amber-900/50 bg-[#180a04]/80 overflow-x-auto text-xs font-bold">
            <button
              onClick={() => setActiveTab('theme')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'theme'
                  ? 'bg-amber-600 text-amber-950 font-black shadow-md'
                  : 'text-amber-200/70 hover:text-amber-100 hover:bg-[#2e1509]'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>أشكال الطاولة والخشب ({themeList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('sound')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'sound'
                  ? 'bg-amber-600 text-amber-950 font-black shadow-md'
                  : 'text-amber-200/70 hover:text-amber-100 hover:bg-[#2e1509]'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>الأصوات والمنادي</span>
            </button>

            <button
              onClick={() => setActiveTab('physics')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'physics'
                  ? 'bg-amber-600 text-amber-950 font-black shadow-md'
                  : 'text-amber-200/70 hover:text-amber-100 hover:bg-[#2e1509]'
              }`}
            >
              <Dices className="w-4 h-4" />
              <span>فيزياء الزهر والمختبر</span>
            </button>

            <button
              onClick={() => setActiveTab('ai')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'ai'
                  ? 'bg-amber-600 text-amber-950 font-black shadow-md'
                  : 'text-amber-200/70 hover:text-amber-100 hover:bg-[#2e1509]'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>صعوبة الذكاء الاصطناعي</span>
            </button>
          </div>

          {/* Tab Content Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6">
            {/* TAB 1: 20 LUXURY BOARD THEMES & WOODS */}
            {activeTab === 'theme' && (
              <div className="space-y-4">
                {/* Theme Category Filter Pills */}
                <div className="flex flex-wrap items-center gap-2 pb-1">
                  {[
                    { id: 'all', label: 'كافة الأشكال (٢٠)' },
                    { id: 'wood', label: 'أخشاب طبيعية' },
                    { id: 'inlay', label: 'تطعيم صدف وأرابيسك' },
                    { id: 'cloth', label: 'مخمل وجلود ولباد' },
                    { id: 'antique', label: 'طرازات تراثية عتيقة' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setThemeFilter(cat.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        themeFilter === cat.id
                          ? 'bg-amber-500/20 text-amber-200 border-amber-500 font-black shadow-sm'
                          : 'bg-[#220f06] text-amber-300/60 border-amber-900/60 hover:text-amber-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Grid of 20 Themes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {filteredThemes.map((key) => {
                    const t = THEMES[key];
                    const isSelected = currentTheme === key;

                    return (
                      <div
                        key={key}
                        onClick={() => onSelectTheme(key)}
                        className={`group relative p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-gradient-to-br from-[#3d1c0c] to-[#261106] border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.35)] scale-[1.01]'
                            : 'bg-[#1b0d06]/90 border-amber-900/50 hover:border-amber-700/80 hover:bg-[#251208]'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2.5">
                              <span className="text-2xl drop-shadow-md">{t.iconEmoji}</span>
                              <div>
                                <h3 className="text-sm font-black text-amber-100 flex items-center gap-1.5">
                                  <span>{t.name}</span>
                                  {isSelected && (
                                    <span className="p-0.5 rounded-full bg-amber-400 text-amber-950">
                                      <Check className="w-3 h-3 stroke-[3]" />
                                    </span>
                                  )}
                                </h3>
                              </div>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-700/50 font-bold">
                              {t.category === 'wood'
                                ? 'خشب طبيعي'
                                : t.category === 'inlay'
                                ? 'صدف وأرابيسك'
                                : t.category === 'cloth'
                                ? 'مخمل وقماش'
                                : 'تراث عتيق'}
                            </span>
                          </div>

                          <p className="text-xs text-amber-200/75 leading-relaxed line-clamp-2 mb-3">
                            {t.description}
                          </p>
                        </div>

                        {/* Visual Swatch Preview Strip with Point Triangles */}
                        <div className="relative h-10 w-full rounded-xl overflow-hidden border border-amber-800/40 bg-gradient-to-r p-1 flex items-center justify-between">
                          <div
                            className={`absolute inset-0 bg-gradient-to-r ${t.boardOuterCase} opacity-90`}
                          />
                          <div className="relative z-10 w-full flex items-center justify-around px-2">
                            <div className="flex items-center gap-1.5">
                              <div
                                className={`w-5 h-7 rounded-sm shadow-sm ${t.pointEven}`}
                                title="مثلث أرقام زوجية"
                              />
                              <div
                                className={`w-5 h-7 rounded-sm shadow-sm ${t.pointOdd}`}
                                title="مثلث أرقام فردية"
                              />
                              <div
                                className={`w-5 h-7 rounded-sm shadow-sm ${t.pointEven}`}
                                title="مثلث أرقام زوجية"
                              />
                            </div>
                            <span className="text-[10px] font-black text-amber-200/90 drop-shadow">
                              {isSelected ? '✓ الطراز المفعّل' : 'اضغط للاختيار'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: SOUND & ANNOUNCER */}
            {activeTab === 'sound' && (
              <div className="space-y-5 max-w-xl mx-auto py-2">
                {/* Master Sound Effects */}
                <div className="p-4 rounded-2xl bg-[#1d0e06] border border-amber-800/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-600/20 text-amber-300 border border-amber-600/40">
                      {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="font-black text-sm text-amber-100">المؤثرات الصوتية لطاولة الزهر</div>
                      <div className="text-xs text-amber-300/70">
                        طقطقة حركة القواشيط، اصطدام النرد بالخشب، وصوت الفوز
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onToggleSound(!soundEnabled)}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                      soundEnabled
                        ? 'bg-amber-600 text-amber-950 border-amber-400'
                        : 'bg-[#2a1309] text-stone-400 border-stone-700'
                    }`}
                  >
                    {soundEnabled ? 'مفعّل' : 'مكتوم'}
                  </button>
                </div>

                {/* Egyptian Announcer Voice */}
                <div className="p-4 rounded-2xl bg-[#1d0e06] border border-amber-800/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-600/20 text-amber-300 border border-amber-600/40">
                      {voiceEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="font-black text-sm text-amber-100">صوت المنادي المصري الأصيل</div>
                      <div className="text-xs text-amber-300/70">
                        نداء الرميات المصرية التراثية: شيش بيش، دو بارة، دوش، جهار يك...
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleVoice(!voiceEnabled)}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                      voiceEnabled
                        ? 'bg-amber-600 text-amber-950 border-amber-400'
                        : 'bg-[#2a1309] text-stone-400 border-stone-700'
                    }`}
                  >
                    {voiceEnabled ? 'مفعّل' : 'مكتوم'}
                  </button>
                </div>

                {/* Volume Slider */}
                <div className="p-4 rounded-2xl bg-[#1d0e06] border border-amber-800/50 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-200">
                    <span>مستوى الصوت العام:</span>
                    <span>{Math.round(volume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={(e) => handleChangeVolume(parseFloat(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                {/* Royal Store Card */}
                {onOpenStore && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-[#291308] to-[#1a0c05] border-2 border-amber-500/60 flex items-center justify-between gap-3 shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-amber-500 text-stone-950 font-black text-xl flex items-center justify-center shadow">
                        🛍️
                      </div>
                      <div>
                        <div className="font-black text-sm text-amber-100 flex items-center gap-1.5">
                          <span>متجر الطاولة وخامات الزهر</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                            حصري 🪙
                          </span>
                        </div>
                        <div className="text-xs text-amber-200/70">
                          شراء أشكال طاولات خشبية وخامات زهر ملكية باستخدام الكوينز
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        onClose();
                        onOpenStore();
                      }}
                      className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs cursor-pointer shadow-md transition-all active:scale-95"
                    >
                      فتح المتجر 🪙
                    </button>
                  </div>
                )}

                {/* Google & Accounts Connection Card */}
                {onOpenConnectedAccounts && (
                  <div className="p-4 rounded-2xl bg-[#1d0e06] border border-blue-500/50 flex items-center justify-between gap-3 shadow">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/40 text-xl flex items-center justify-center">
                        🌐
                      </div>
                      <div>
                        <div className="font-black text-sm text-white">ربط الحسابات السحابية (Google)</div>
                        <div className="text-xs text-amber-300/70">
                          حفظ مستواك وترتيبك ونقاطك عبر حساب Google
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        onClose();
                        onOpenConnectedAccounts();
                      }}
                      className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-stone-950 font-black text-xs cursor-pointer shadow-md transition-all active:scale-95"
                    >
                      إدارة الحسابات 🔗
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: DICE PHYSICS & LAB */}
            {activeTab === 'physics' && (
              <div className="space-y-5 max-w-xl mx-auto py-2">
                {/* Featured: Open AI Physics Lab Button */}
                {onOpenAiLab && (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950 via-[#3a1d0e] to-[#200e06] border-2 border-amber-500/80 shadow-[0_4px_20px_rgba(245,158,11,0.25)] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl bg-amber-500 text-stone-950 font-black shadow-md flex items-center justify-center">
                        <Dices className="w-6 h-6 animate-spin" style={{ animationDuration: '6s' }} />
                      </div>
                      <div>
                        <div className="font-black text-sm sm:text-base text-amber-100 flex items-center gap-1.5">
                          <span>مختبر فيزياء الزهر الذكي</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-stone-950 font-bold">
                            الذكاء الاصطناعي
                          </span>
                        </div>
                        <div className="text-xs text-amber-200/80 mt-0.5">
                          فحص فيزياء الزهر، محاكاة الارتداد العشوائي على اللباد، وتوازن النرد المحفور
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        onClose();
                        onOpenAiLab();
                      }}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs sm:text-sm shadow-lg transition-all cursor-pointer whitespace-nowrap active:scale-95"
                    >
                      فتح المختبر 🎲
                    </button>
                  </div>
                )}

                {/* Pro Player Throw Mode */}
                <div className="p-4 rounded-2xl bg-[#1d0e06] border border-amber-800/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-600/20 text-amber-300 border border-amber-600/40">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-black text-sm text-amber-100">
                        نمط رمية اللاعب المحترف (Pro Throw)
                      </div>
                      <div className="text-xs text-amber-300/70">
                        معصم ثابت، ٤ دورات كاملة في الهواء للعشوائية التامة بدون ارتداد طائش
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleProDice(!isProDice)}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                      isProDice
                        ? 'bg-amber-600 text-amber-950 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                        : 'bg-[#2a1309] text-stone-400 border-stone-700'
                    }`}
                  >
                    {isProDice ? 'مفعّل' : 'عادي'}
                  </button>
                </div>
              </div>
            )}

            {/* TAB 4: AI DIFFICULTY */}
            {activeTab === 'ai' && (
              <div className="space-y-4 max-w-xl mx-auto py-2">
                <div className="text-xs text-amber-300/80 mb-2">
                  اختر مستوى ذكاء ومهارة الكمبيوتر المنافس في مباريات طاولة ٣١ والمحبوسة:
                </div>

                {[
                  {
                    id: 'learned',
                    title: 'ذكاء اصطناعي ذاتي التعلّم (Adaptive AI)',
                    desc: 'يتعلم من أخطائه وحركاتك المسجلة ويطور خطته باستمرار',
                    badge: 'موصى به',
                  },
                  {
                    id: 'pro',
                    title: 'حريف طاولة محترف (Pro Champion)',
                    desc: 'حسابات استراتيجية عميقة لحماية القواشيط وحبس المنافس وقفل الخانات',
                    badge: 'صعب جداً',
                  },
                  {
                    id: 'medium',
                    title: 'لاعب مقهى متمرس (Medium)',
                    desc: 'لعب كلاسيكي متوازن يناسب المباريات الممتعة والمتكافئة',
                    badge: 'متوسط',
                  },
                  {
                    id: 'easy',
                    title: 'لاعب مبتدئ (Easy)',
                    desc: 'حركات بسيطة ومريحة للتعلم وتجربة القواعد لأول مرة',
                    badge: 'سهل',
                  },
                ].map((lvl) => {
                  const isCur = aiDifficulty === lvl.id;
                  return (
                    <div
                      key={lvl.id}
                      onClick={() => onChangeAIDifficulty(lvl.id as AIDifficulty)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                        isCur
                          ? 'bg-[#381a0b] border-amber-400 shadow-md'
                          : 'bg-[#1b0d06] border-amber-900/60 hover:bg-[#251208]'
                      }`}
                    >
                      <div>
                        <div className="font-black text-sm text-amber-100 flex items-center gap-2">
                          <span>{lvl.title}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-700/60 font-bold">
                            {lvl.badge}
                          </span>
                        </div>
                        <div className="text-xs text-amber-300/70 mt-1">{lvl.desc}</div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isCur ? 'border-amber-400 bg-amber-400 text-amber-950' : 'border-amber-700'
                        }`}
                      >
                        {isCur && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-amber-800/40 bg-[#190a04]/90 text-xs">
            <span className="text-amber-300/60">
              طراز الطاولة الحالي: <strong className="text-amber-200">{THEMES[currentTheme].name}</strong>
            </span>
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-amber-950 font-black shadow-md transition-all cursor-pointer"
            >
              حفظ وإغلاق
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
