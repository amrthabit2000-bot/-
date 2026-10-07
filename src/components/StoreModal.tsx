import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Coins,
  Sparkles,
  Check,
  X,
  Dices,
  Palette,
  ShieldCheck,
  Zap,
  Gift,
  PlusCircle,
  Crown,
} from 'lucide-react';
import { BoardTheme } from '../types/tawla';
import { THEMES } from '../utils/themes';
import { DICE_STYLES, DiceStyle } from './DiceStyleModal';
import {
  UserDailyProgress,
  updateUserCoinsAndInventoryInFirebase,
  GoogleAccountProfile,
} from '../utils/firebase';
import { sound } from '../utils/audio';

interface StoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  dailyProgress: UserDailyProgress | null;
  onUpdateDailyProgress: (progress: UserDailyProgress) => void;
  currentTheme: BoardTheme;
  onSelectTheme: (theme: BoardTheme) => void;
  currentDiceStyle: string;
  onSelectDiceStyle: (style: DiceStyle) => void;
  googleProfile: GoogleAccountProfile | null;
  onOpenGoogleConnect: () => void;
}

export const THEME_PRICES: Record<BoardTheme, number> = {
  arabesque: 0, // Free default
  mahogany: 300,
  aswanEbony: 600,
  alexShell: 650,
  beechWood: 450,
  goldenOak: 500,
  oliveWood: 500,
  royalAcacia: 550,
  smokedBurl: 550,
  burmaTeak: 600,
  cedarLebanon: 650,
  cairoCafe1920: 700,
  fatimidInlay: 1000,
  brassEbony: 850,
  canadianMaple: 750,
  darkCherry: 800,
  sandalwood: 850,
  volcanicAsh: 900,
  abdeenVelvet: 1500,
  khanElKhalili: 1200,
};

export const DICE_PRICES: Record<string, number> = {
  ivory: 0, // Free default
  ebony: 350,
  ruby: 500,
  walnut: 400,
  casinoWhite: 300,
};

export const StoreModal: React.FC<StoreModalProps> = ({
  isOpen,
  onClose,
  dailyProgress,
  onUpdateDailyProgress,
  currentTheme,
  onSelectTheme,
  currentDiceStyle,
  onSelectDiceStyle,
  googleProfile,
  onOpenGoogleConnect,
}) => {
  const [activeTab, setActiveTab] = useState<'themes' | 'dice' | 'coins'>('themes');
  const [purchaseMsg, setPurchaseMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  if (!isOpen) return null;

  const userCoins = dailyProgress?.coins || 1000;
  const unlockedThemes = dailyProgress?.unlockedThemes || ['arabesque'];
  const unlockedDice = dailyProgress?.unlockedDiceStyles || ['ivory'];

  const showNotification = (text: string, type: 'success' | 'error') => {
    setPurchaseMsg({ text, type });
    setTimeout(() => setPurchaseMsg(null), 3500);
  };

  const handleBuyTheme = async (themeKey: BoardTheme, price: number) => {
    if (unlockedThemes.includes(themeKey)) {
      onSelectTheme(themeKey);
      showNotification(`تم تجهيز طراز: ${THEMES[themeKey].name} بنجاح!`, 'success');
      return;
    }

    if (userCoins < price) {
      showNotification(`رصيدك غير كافٍ! تحتاج ${price - userCoins} كوينز إضافية. يمكنك شحن كوينز أو الفوز بمباريات التحدي.`, 'error');
      return;
    }

    const newCoins = userCoins - price;
    const newUnlocked = [...unlockedThemes, themeKey];

    const updated = await updateUserCoinsAndInventoryInFirebase({
      coins: newCoins,
      unlockedThemes: newUnlocked,
      selectedTheme: themeKey,
    });

    onUpdateDailyProgress(updated);
    onSelectTheme(themeKey);
    sound.playCheckerMove('move');
    showNotification(`مبروك! اشتريت ${THEMES[themeKey].name} وخُصم ${price} كوينز. تم حفظ العنصر في حسابك!`, 'success');
  };

  const handleBuyDice = async (styleKey: string, price: number) => {
    if (unlockedDice.includes(styleKey)) {
      onSelectDiceStyle(styleKey as DiceStyle);
      showNotification(`تم تجهيز خامة: ${DICE_STYLES[styleKey as DiceStyle]?.name || styleKey} بنجاح!`, 'success');
      return;
    }

    if (userCoins < price) {
      showNotification(`رصيدك غير كافٍ! تحتاج ${price - userCoins} كوينز إضافية.`, 'error');
      return;
    }

    const newCoins = userCoins - price;
    const newUnlocked = [...unlockedDice, styleKey];

    const updated = await updateUserCoinsAndInventoryInFirebase({
      coins: newCoins,
      unlockedDiceStyles: newUnlocked,
      selectedDiceStyle: styleKey,
    });

    onUpdateDailyProgress(updated);
    onSelectDiceStyle(styleKey as DiceStyle);
    sound.playCheckerMove('move');
    showNotification(`مبروك! اشتريت خامة الزهر الجديدة وخُصم ${price} كوينز. تم حفظ العنصر في حسابك!`, 'success');
  };

  const handleClaimFreeDailyCoins = async () => {
    const bonus = 300;
    const newCoins = userCoins + bonus;
    const updated = await updateUserCoinsAndInventoryInFirebase({
      coins: newCoins,
    });
    onUpdateDailyProgress(updated);
    sound.playDiceRoll();
    showNotification(`🎁 تم إضافة ${bonus} كوينز مجانية إلى رصيدك!`, 'success');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md font-['Cairo']">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="relative w-full max-w-3xl bg-gradient-to-b from-[#25130b] via-[#1a0c06] to-[#0f0603] border-2 border-amber-600/70 rounded-3xl p-4 sm:p-6 shadow-[0_20px_70px_rgba(0,0,0,0.95)] text-[#f5ecd9] flex flex-col max-h-[92vh] overflow-hidden"
          dir="rtl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#3b1d0c] pb-3 mb-3 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-stone-950 flex items-center justify-center shadow-lg text-2xl font-black">
                🛍️
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-black text-amber-100 flex items-center gap-2">
                  <span>متجر الطاولة وخامات الزهر</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                    حصري 🪙
                  </span>
                </h2>
                <p className="text-xs text-amber-200/70 mt-0.5">
                  استبدل كوينزك بأفخم أشكال الطاولات الخشبية وخامات الزهر الملكي
                </p>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#2e1509] hover:bg-[#43200e] text-amber-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Coins & Google Status Bar */}
          <div className="flex items-center justify-between flex-wrap gap-2 p-3 rounded-2xl bg-[#2b150a]/80 border border-amber-700/50 mb-3 shrink-0">
            {/* Balance */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-amber-200/80 font-bold">رصيدك الحالي:</span>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-amber-950 font-black text-sm shadow">
                <Coins className="w-4 h-4 fill-amber-950" />
                <span>{userCoins.toLocaleString('ar-EG')} كوينز</span>
              </div>
            </div>

            {/* Google Sync Status */}
            <div>
              {googleProfile ? (
                <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-bold bg-emerald-950/50 px-2.5 py-1 rounded-xl border border-emerald-500/40">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>محفوظ في حساب Google ({googleProfile.displayName || 'متصل'})</span>
                </div>
              ) : (
                <button
                  onClick={onOpenGoogleConnect}
                  className="flex items-center gap-1.5 text-xs text-blue-300 hover:text-white font-bold bg-blue-950/60 hover:bg-blue-900/60 px-3 py-1 rounded-xl border border-blue-500/40 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>اربط حساب Google لحفظ مشترياتك في السحاب</span>
                </button>
              )}
            </div>
          </div>

          {/* Notification Alert */}
          {purchaseMsg && (
            <div
              className={`p-2.5 mb-3 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0 ${
                purchaseMsg.type === 'success'
                  ? 'bg-emerald-950/70 border border-emerald-500/60 text-emerald-200'
                  : 'bg-rose-950/70 border border-rose-500/60 text-rose-200'
              }`}
            >
              <span>{purchaseMsg.type === 'success' ? '✅' : '⚠️'}</span>
              <span>{purchaseMsg.text}</span>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mb-3 shrink-0 border-b border-[#3b1d0c] pb-2">
            <button
              onClick={() => setActiveTab('themes')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'themes'
                  ? 'bg-amber-600 text-stone-950 shadow-md ring-1 ring-amber-300'
                  : 'bg-[#2e1509] hover:bg-[#3d1d0c] text-amber-200/70 hover:text-amber-100'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>أشكال الطاولات الخشبية ({Object.keys(THEMES).length})</span>
            </button>

            <button
              onClick={() => setActiveTab('dice')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'dice'
                  ? 'bg-amber-600 text-stone-950 shadow-md ring-1 ring-amber-300'
                  : 'bg-[#2e1509] hover:bg-[#3d1d0c] text-amber-200/70 hover:text-amber-100'
              }`}
            >
              <Dices className="w-4 h-4" />
              <span>خامات الزهر الملكي ({Object.keys(DICE_STYLES).length})</span>
            </button>

            <button
              onClick={() => setActiveTab('coins')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'coins'
                  ? 'bg-amber-600 text-stone-950 shadow-md ring-1 ring-amber-300'
                  : 'bg-[#2e1509] hover:bg-[#3d1d0c] text-amber-200/70 hover:text-amber-100'
              }`}
            >
              <Coins className="w-4 h-4" />
              <span>شحن الكوينز 🪙</span>
            </button>
          </div>

          {/* Tab Content (Scrollable) */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
            {/* 1. Themes Tab */}
            {activeTab === 'themes' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(Object.keys(THEMES) as BoardTheme[]).map((key) => {
                  const item = THEMES[key];
                  const price = THEME_PRICES[key] ?? 600;
                  const isOwned = unlockedThemes.includes(key);
                  const isCurrent = currentTheme === key;

                  return (
                    <div
                      key={key}
                      className={`p-3 rounded-2xl border transition-all flex flex-col justify-between gap-2.5 ${
                        isCurrent
                          ? 'bg-[#3b1d0c] border-amber-400 shadow-lg ring-1 ring-amber-400'
                          : isOwned
                          ? 'bg-[#251208]/90 border-amber-800/60 hover:border-amber-600/70'
                          : 'bg-[#1a0c06]/80 border-[#3d1d0c] hover:border-amber-700/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm text-amber-100">{item.name}</span>
                            {isCurrent && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                                قيد الاستخدام
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-amber-200/70 mt-1 line-clamp-2">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div className="flex items-center justify-between pt-2 border-t border-[#3b1c0c]">
                        {isOwned ? (
                          <div className="flex items-center justify-between w-full">
                            <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" />
                              <span>مملوكة</span>
                            </span>
                            <button
                              onClick={() => {
                                onSelectTheme(key);
                                showNotification(`تم اختيار ${item.name}!`, 'success');
                              }}
                              disabled={isCurrent}
                              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                isCurrent
                                  ? 'bg-amber-950/60 text-amber-400/50 cursor-default'
                                  : 'bg-amber-600 hover:bg-amber-500 text-stone-950 shadow active:scale-95'
                              }`}
                            >
                              {isCurrent ? 'مفعلة' : 'تجهيز'}
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-1 text-amber-400 font-black text-xs">
                              <Coins className="w-3.5 h-3.5 fill-amber-400" />
                              <span>{price.toLocaleString('ar-EG')} كوينز</span>
                            </div>
                            <button
                              onClick={() => handleBuyTheme(key, price)}
                              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                            >
                              شراء الآن
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 2. Dice Styles Tab */}
            {activeTab === 'dice' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(Object.keys(DICE_STYLES) as DiceStyle[]).map((key) => {
                  const item = DICE_STYLES[key];
                  const price = DICE_PRICES[key] ?? 400;
                  const isOwned = unlockedDice.includes(key);
                  const isCurrent = currentDiceStyle === key;

                  return (
                    <div
                      key={key}
                      className={`p-3 rounded-2xl border transition-all flex flex-col justify-between gap-2.5 ${
                        isCurrent
                          ? 'bg-[#3b1d0c] border-amber-400 shadow-lg ring-1 ring-amber-400'
                          : isOwned
                          ? 'bg-[#251208]/90 border-amber-800/60 hover:border-amber-600/70'
                          : 'bg-[#1a0c06]/80 border-[#3d1d0c] hover:border-amber-700/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-amber-500/40 shrink-0"
                          style={{ backgroundColor: item.primaryColor }}
                        >
                          {item.emoji}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm text-amber-100">{item.name}</span>
                            {isCurrent && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                                قيد الاستخدام
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-amber-200/70 mt-1 line-clamp-2">
                            {item.desc}
                          </p>
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div className="flex items-center justify-between pt-2 border-t border-[#3b1c0c]">
                        {isOwned ? (
                          <div className="flex items-center justify-between w-full">
                            <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" />
                              <span>مملوكة</span>
                            </span>
                            <button
                              onClick={() => {
                                onSelectDiceStyle(key);
                                showNotification(`تم اختيار ${item.name}!`, 'success');
                              }}
                              disabled={isCurrent}
                              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                isCurrent
                                  ? 'bg-amber-950/60 text-amber-400/50 cursor-default'
                                  : 'bg-amber-600 hover:bg-amber-500 text-stone-950 shadow active:scale-95'
                              }`}
                            >
                              {isCurrent ? 'مفعلة' : 'تجهيز'}
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-1 text-amber-400 font-black text-xs">
                              <Coins className="w-3.5 h-3.5 fill-amber-400" />
                              <span>{price.toLocaleString('ar-EG')} كوينز</span>
                            </div>
                            <button
                              onClick={() => handleBuyDice(key, price)}
                              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                            >
                              شراء الآن
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 3. Coins Packages Tab */}
            {activeTab === 'coins' && (
              <div className="space-y-3">
                {/* Free Daily Claim Banner */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-[#1b2b18] to-emerald-950/70 border border-emerald-500/50 flex items-center justify-between gap-3 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-600/30 text-emerald-300 flex items-center justify-center text-2xl border border-emerald-400/40">
                      🎁
                    </div>
                    <div>
                      <div className="font-black text-sm text-emerald-200">منحة ضيافة القهوة اليومية</div>
                      <div className="text-xs text-emerald-300/80">احصل على ٣٠٠ كوينز مجاناً كل يوم لتجربة الطاولات والرهانات</div>
                    </div>
                  </div>
                  <button
                    onClick={handleClaimFreeDailyCoins}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-xs shadow-md cursor-pointer transition-all active:scale-95"
                  >
                    استلام ٣٠٠ 🪙
                  </button>
                </div>

                {/* Coin Store Packages */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl bg-[#251208]/90 border border-amber-700/60 flex flex-col justify-between items-center text-center gap-3">
                    <div className="text-3xl">🪙</div>
                    <div>
                      <div className="font-black text-sm text-amber-100">كيس الدنانير</div>
                      <div className="text-lg font-black text-amber-400 mt-1">٢,٥٠٠ كوينز</div>
                      <div className="text-[11px] text-amber-200/60 mt-0.5">مناسب لفتح طاولتين وخامتي زهر</div>
                    </div>
                    <button
                      onClick={() => {
                        const newCoins = userCoins + 2500;
                        updateUserCoinsAndInventoryInFirebase({ coins: newCoins }).then(onUpdateDailyProgress);
                        sound.playDiceRoll();
                        showNotification('تمت إضافة ٢,٥٠٠ كوينز إلى رصيدك بنجاح!', 'success');
                      }}
                      className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-black text-xs shadow cursor-pointer transition-all active:scale-95"
                    >
                      شحن (عرض خاص)
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#32170b] border-2 border-amber-400 flex flex-col justify-between items-center text-center gap-3 shadow-xl relative">
                    <div className="absolute -top-2.5 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-black text-[10px] shadow">
                      الأكثر شعبية 🔥
                    </div>
                    <div className="text-3xl mt-1">💰</div>
                    <div>
                      <div className="font-black text-sm text-amber-100">صندوق المعلم الحريف</div>
                      <div className="text-lg font-black text-amber-400 mt-1">١٠,٠٠٠ كوينز</div>
                      <div className="text-[11px] text-amber-200/60 mt-0.5">للمشاركة في مباريات التحدي الكبرى</div>
                    </div>
                    <button
                      onClick={() => {
                        const newCoins = userCoins + 10000;
                        updateUserCoinsAndInventoryInFirebase({ coins: newCoins }).then(onUpdateDailyProgress);
                        sound.playDiceRoll();
                        showNotification('تمت إضافة ١٠,٠٠٠ كوينز إلى رصيدك بنجاح!', 'success');
                      }}
                      className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-black text-xs shadow-lg cursor-pointer transition-all active:scale-95"
                    >
                      شحن (باقة المعلم)
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#251208]/90 border border-amber-700/60 flex flex-col justify-between items-center text-center gap-3">
                    <div className="text-3xl">👑</div>
                    <div>
                      <div className="font-black text-sm text-amber-100">خزينة الباشا الملكية</div>
                      <div className="text-lg font-black text-amber-400 mt-1">٣٠,٠٠٠ كوينز</div>
                      <div className="text-[11px] text-amber-200/60 mt-0.5">تفتح جميع طاولات اللعبة كاملة</div>
                    </div>
                    <button
                      onClick={() => {
                        const newCoins = userCoins + 30000;
                        updateUserCoinsAndInventoryInFirebase({ coins: newCoins }).then(onUpdateDailyProgress);
                        sound.playDiceRoll();
                        showNotification('تمت إضافة ٣٠,٠٠٠ كوينز إلى رصيدك بنجاح!', 'success');
                      }}
                      className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-black text-xs shadow cursor-pointer transition-all active:scale-95"
                    >
                      شحن (باقة الباشا)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
