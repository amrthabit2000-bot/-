import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Trophy,
  Settings,
  Dices,
  Bot,
  Smartphone,
  Globe2,
  ArrowRight,
  Sparkles,
  Crown,
  BookOpen,
  ShoppingBag,
  Swords,
  Coins,
  Download,
  User,
} from 'lucide-react';
import { GameMode, GameVariant, BoardTheme, AIDifficulty } from '../types/tawla';
import { THEMES } from '../utils/themes';
import { GoogleAccountProfile } from '../utils/firebase';

interface LobbyScreenProps {
  onStartGame: (variant: GameVariant, mode: GameMode, difficulty?: AIDifficulty) => void;
  onOpenFriends: () => void;
  onOpenTournaments: () => void;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  onOpenRules: () => void;
  onOpenLeaderboard: () => void;
  onOpenConnectedAccounts: () => void;
  onOpenStore: () => void;
  onOpenChallenges: () => void;
  onOpenGooglePlay: () => void;
  isGoogleConnected?: boolean;
  googleProfile?: GoogleAccountProfile | null;
  coins?: number;
  currentTheme: BoardTheme;
  playerName: string;
  onlineFriendsCount: number;
}

export const LobbyScreen: React.FC<LobbyScreenProps> = ({
  onStartGame,
  onOpenFriends,
  onOpenTournaments,
  onOpenSettings,
  onOpenProfile,
  onOpenRules,
  onOpenLeaderboard,
  onOpenConnectedAccounts,
  onOpenStore,
  onOpenChallenges,
  onOpenGooglePlay,
  isGoogleConnected,
  googleProfile,
  coins = 1000,
  currentTheme,
  playerName,
  onlineFriendsCount,
}) => {
  const [step, setStep] = useState<'selectVariant' | 'selectMode'>('selectVariant');
  const [selectedVariant, setSelectedVariant] = useState<GameVariant>('tawla31');
  const [selectedAiDiff, setSelectedAiDiff] = useState<AIDifficulty>('learned');

  const handleSelectVariant = (variant: GameVariant) => {
    setSelectedVariant(variant);
    setStep('selectMode');
  };

  const handleChooseMode = (mode: GameMode) => {
    onStartGame(selectedVariant, mode, selectedAiDiff);
  };

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-b from-[#180a04] via-[#120602] to-[#080301] text-amber-100 font-['Cairo'] flex flex-col justify-between overflow-x-hidden selection:bg-amber-600 selection:text-white">
      {/* Background Subtle Woodgrain / Arabesque Glow */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Top Lounge Header */}
      <header className="relative z-10 w-full max-w-5xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-3 border-b border-amber-900/40">
        {/* User Profile Pill & Coins Balance */}
        <div className="flex items-center gap-2">
          <div
            onClick={onOpenProfile}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-[#231208]/90 border border-amber-700/50 hover:border-amber-500 transition-all cursor-pointer shadow-md"
          >
            {googleProfile?.photoURL ? (
              <img
                src={googleProfile.photoURL}
                alt={playerName}
                className="w-9 h-9 rounded-xl border border-amber-400 object-cover shadow"
              />
            ) : (
              <span className="text-2xl p-1 rounded-xl bg-amber-950/80 border border-amber-600/40">
                🧔🏻‍♂️
              </span>
            )}
            <div className="text-right">
              <div className="font-black text-xs sm:text-sm text-amber-100 leading-tight">
                {googleProfile?.displayName || playerName || 'حريف الطاولة'}
              </div>
              <div className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                <span>أستاذ طاولة</span>
                <span className="text-amber-500">•</span>
                <span>⭐ المستوى ٥</span>
              </div>
            </div>
          </div>

          {/* Golden Coins Balance Button -> Opens Store */}
          <button
            onClick={onOpenStore}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs shadow-md transition-all cursor-pointer active:scale-95"
            title="رصيد الكوينز ومتجر الطاولة"
          >
            <Coins className="w-4 h-4 fill-stone-950" />
            <span>{coins.toLocaleString('ar-EG')} 🪙</span>
          </button>
        </div>

        {/* Top Action Icons: Store, Challenges, Google Play, Leaderboard, Google Account, Settings */}
        <div className="flex items-center gap-2">
          {/* Store Modal Button (🛍️) */}
          <button
            onClick={onOpenStore}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-[#2e1509] hover:bg-[#43200e] border border-amber-600/70 hover:border-amber-400 text-amber-300 font-black text-xs cursor-pointer shadow-md transition-all active:scale-95"
            title="متجر الطاولة وخامات الزهر"
          >
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">المتجر</span>
          </button>

          {/* Challenge Matches Button (⚔️) */}
          <button
            onClick={onOpenChallenges}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-gradient-to-r from-red-950 to-amber-950 hover:from-red-900 hover:to-amber-900 border border-amber-500/70 text-amber-200 font-black text-xs cursor-pointer shadow-md transition-all active:scale-95"
            title="مباريات التحدي بالرهان"
          >
            <Swords className="w-4 h-4 text-rose-400" />
            <span className="hidden sm:inline">التحدي ⚔️</span>
          </button>

          {/* Google Play & Android Download Button */}
          <button
            onClick={onOpenGooglePlay}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-emerald-950/70 hover:bg-emerald-900/70 border border-emerald-500/60 text-emerald-300 font-black text-xs cursor-pointer shadow-md transition-all active:scale-95"
            title="تنزيل التطبيق على Google Play و Android"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span className="hidden md:inline">Google Play</span>
          </button>

          {/* Leaderboard Button */}
          <button
            onClick={onOpenLeaderboard}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 border border-amber-300 text-stone-950 font-black text-xs cursor-pointer shadow-lg transition-all"
            title="لوحة الشرف — أفضل ١٠ لاعبين"
          >
            <Crown className="w-4 h-4 fill-stone-950 text-stone-950" />
            <span className="hidden sm:inline">المتصدرين</span>
          </button>

          {/* Connected Google Account */}
          <button
            onClick={onOpenConnectedAccounts}
            className={`p-2.5 rounded-2xl border transition-all cursor-pointer shadow-md ${
              isGoogleConnected
                ? 'bg-blue-950/60 border-blue-400 text-blue-300'
                : 'bg-[#231208] hover:bg-[#341a0c] border-amber-700/60 text-amber-200'
            }`}
            title="حساب Google وحفظ البيانات السحابية"
          >
            <Globe2 className={`w-5 h-5 ${isGoogleConnected ? 'text-blue-400' : 'text-amber-300'}`} />
          </button>

          {/* Friends Button */}
          <button
            onClick={onOpenFriends}
            className="relative p-2.5 rounded-2xl bg-[#231208] hover:bg-[#341a0c] border border-amber-700/60 hover:border-amber-400 text-amber-200 transition-all cursor-pointer shadow-md hidden sm:flex"
            title="قائمة الأصدقاء"
          >
            <Users className="w-5 h-5 text-amber-300" />
            {onlineFriendsCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-500 text-stone-950 font-black text-[10px] flex items-center justify-center border-2 border-[#180a04]">
                {onlineFriendsCount}
              </span>
            )}
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-2.5 rounded-2xl bg-[#231208] hover:bg-[#341a0c] border border-amber-700/60 hover:border-amber-400 text-amber-200 transition-all cursor-pointer shadow-md"
            title="إعدادات الطاولة والخشب"
          >
            <Settings className="w-5 h-5 text-amber-300" />
          </button>
        </div>
      </header>

      {/* Main Choice Screen */}
      <main className="relative z-10 w-full max-w-5xl mx-auto px-4 py-4 sm:py-6 flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {/* STEP 1: SELECT VARIANT (طاولة ٣١ vs المحبوسة) */}
          {step === 'selectVariant' && (
            <motion.div
              key="step-variant"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Grand Welcome Heading */}
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-950/80 border border-amber-600/60 text-amber-300 text-xs font-bold mb-1 shadow-inner">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>طاولة زهر مصرية أصيلة بمفصلات نحاس ورخام ملكي</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-black text-amber-50 drop-shadow-md">
                  اختر نوع اللعبة المفضلة لديك
                </h1>
                <p className="text-xs sm:text-sm text-amber-200/70 max-w-md mx-auto">
                  استمتع بأشهر الألعاب التراثية الشعبية بقواعدها الرسمية الدقيقة وأصوات المقاهي المصرية
                </p>
              </div>

              {/* Two Grand Variant Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* 1. طاولة ٣١ المصرية */}
                <div
                  onClick={() => handleSelectVariant('tawla31')}
                  className="group relative p-6 sm:p-7 rounded-3xl bg-gradient-to-b from-[#2d1509] via-[#210f05] to-[#170a03] border-2 border-amber-600/60 hover:border-amber-400 shadow-2xl hover:shadow-[0_0_25px_rgba(245,158,11,0.3)] transition-all cursor-pointer flex flex-col justify-between hover:scale-[1.02]"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-4xl p-3 rounded-2xl bg-amber-950/80 border border-amber-600/50 shadow-inner group-hover:scale-110 transition-transform">
                        🎲
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/50">
                        الأكثر شعبية بمصر
                      </span>
                    </div>

                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-amber-100 group-hover:text-white transition-colors">
                        طاولة ٣١ المصرية الأصلية
                      </h2>
                      <p className="text-xs sm:text-sm text-amber-200/80 mt-2 leading-relaxed">
                        اللعبة التراثية الأقدم والأشهر! سباق القواشيط حول الرقعة، الدخول لمنطقة الديار، وخروج القواشيط للفوز بمجموع ٣١ نقطة مع ضرب البَفّة وحسابات الدستة.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-amber-800/40 flex items-center justify-between">
                    <span className="text-xs text-amber-400/80 font-bold">
                      قواعد شعبية معتمدة ١٠٠٪
                    </span>
                    <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 group-hover:from-amber-500 group-hover:to-amber-600 text-amber-950 font-black text-xs shadow-md transition-all">
                      <span>اختيار طاولة ٣١</span>
                      <ArrowRight className="w-4 h-4 rotate-180" />
                    </button>
                  </div>
                </div>

                {/* 2. لعبة المحبوسة */}
                <div
                  onClick={() => handleSelectVariant('mahbousa')}
                  className="group relative p-6 sm:p-7 rounded-3xl bg-gradient-to-b from-[#2d1509] via-[#210f05] to-[#170a03] border-2 border-amber-600/60 hover:border-amber-400 shadow-2xl hover:shadow-[0_0_25px_rgba(245,158,11,0.3)] transition-all cursor-pointer flex flex-col justify-between hover:scale-[1.02]"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-4xl p-3 rounded-2xl bg-amber-950/80 border border-amber-600/50 shadow-inner group-hover:scale-110 transition-transform">
                        🔒
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/50">
                        أصول الطاولة الأصيلة
                      </span>
                    </div>

                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-amber-100 group-hover:text-white transition-colors">
                        لعبة المحبوسة
                      </h2>
                      <p className="text-xs sm:text-sm text-amber-200/80 mt-2 leading-relaxed">
                        لعبة الحبس والتكتيك العريق! لا أكل للقواشيط، بل حبس قشاط الخصم وتجميده في مكانه حتى تحريره، مع فنون التجميع والدفاع المحكم وإنزال القواشيط.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-amber-800/40 flex items-center justify-between">
                    <span className="text-xs text-rose-400/80 font-bold">
                      تحدي استراتيجي محكم
                    </span>
                    <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 group-hover:from-amber-500 group-hover:to-amber-600 text-amber-950 font-black text-xs shadow-md transition-all">
                      <span>اختيار المحبوسة</span>
                      <ArrowRight className="w-4 h-4 rotate-180" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: SELECT MODE */}
          {step === 'selectMode' && (
            <motion.div
              key="step-mode"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Back to Step 1 & Title */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setStep('selectVariant')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#261309] hover:bg-[#381a0b] text-amber-300 hover:text-white border border-amber-700/60 text-xs font-bold transition-all cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>تغيير نوع اللعبة</span>
                </button>

                <div className="text-right">
                  <span className="text-xs text-amber-300/70">اللعبة المختارة:</span>
                  <span className="font-black text-sm text-amber-100 mr-1.5 bg-amber-950/80 px-2.5 py-0.5 rounded-lg border border-amber-600/50">
                    {selectedVariant === 'tawla31' ? 'طاولة ٣١ المصرية 🎲' : 'طاولة المحبوسة 🔒'}
                  </span>
                </div>
              </div>

              <div className="text-center space-y-1">
                <h2 className="text-2xl sm:text-3xl font-black text-amber-50">
                  اختر طريقة ومكان اللعب
                </h2>
                <p className="text-xs text-amber-300/70">
                  هل تريد اللعب مع الذكاء الاصطناعي، وجهاً لوجه مع صديق، أم عبر الإنترنت؟
                </p>
              </div>

              {/* Three Game Mode Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* 1. ضد الكمبيوتر */}
                <div
                  onClick={() => handleChooseMode('ai')}
                  className="group relative p-5 rounded-3xl bg-gradient-to-b from-[#2d1509] via-[#210f05] to-[#170a03] border-2 border-amber-600/60 hover:border-amber-400 shadow-xl hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all cursor-pointer flex flex-col justify-between hover:scale-[1.02]"
                >
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-amber-600/20 border border-amber-500/40 text-amber-300 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Bot className="w-6 h-6" />
                    </div>

                    <h3 className="text-lg font-black text-amber-100 group-hover:text-white">
                      ضد الكمبيوتر (AI)
                    </h3>
                    <p className="text-xs text-amber-200/75 mt-1.5 leading-relaxed">
                      العب ضد ذكاء اصطناعي متقدم يتعلم من أخطائك، مع خيارات متعددة لمستوى الصعوبة.
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-amber-800/40">
                    <button className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 group-hover:from-amber-500 group-hover:to-amber-600 text-amber-950 font-black text-xs shadow-md transition-all">
                      لعب فردي 🤖
                    </button>
                  </div>
                </div>

                {/* 2. لاعبين على نفس الهاتف */}
                <div
                  onClick={() => handleChooseMode('passAndPlay')}
                  className="group relative p-5 rounded-3xl bg-gradient-to-b from-[#2d1509] via-[#210f05] to-[#170a03] border-2 border-amber-600/60 hover:border-amber-400 shadow-xl hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all cursor-pointer flex flex-col justify-between hover:scale-[1.02]"
                >
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-amber-600/20 border border-amber-500/40 text-amber-300 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Smartphone className="w-6 h-6" />
                    </div>

                    <h3 className="text-lg font-black text-amber-100 group-hover:text-white">
                      لاعبان (Pass & Play)
                    </h3>
                    <p className="text-xs text-amber-200/75 mt-1.5 leading-relaxed">
                      العب وجهاً لوجه مع صديق أو أحد أفراد العائلة على نفس الموبايل مثل رقعة الطاولة الحقيقية!
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-amber-800/40">
                    <button className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 group-hover:from-amber-500 group-hover:to-amber-600 text-amber-950 font-black text-xs shadow-md transition-all">
                      لعب مشترك 📱
                    </button>
                  </div>
                </div>

                {/* 3. أونلاين عبر الإنترنت */}
                <div
                  onClick={() => handleChooseMode('online')}
                  className="group relative p-5 rounded-3xl bg-gradient-to-b from-[#2d1509] via-[#210f05] to-[#170a03] border-2 border-amber-600/60 hover:border-amber-400 shadow-xl hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all cursor-pointer flex flex-col justify-between hover:scale-[1.02]"
                >
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Globe2 className="w-6 h-6" />
                    </div>

                    <h3 className="text-lg font-black text-amber-100 group-hover:text-white flex items-center gap-1.5">
                      <span>أونلاين عبر الإنترنت</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    </h3>
                    <p className="text-xs text-amber-200/75 mt-1.5 leading-relaxed">
                      أنشئ غرفة برمز سري وتحدَّ أصدقاءك عن بعد مع شات فوري وبث مباشر للرميات وحركات القواشيط.
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-amber-800/40">
                    <button className="w-full py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 group-hover:from-emerald-500 group-hover:to-emerald-600 text-stone-950 font-black text-xs shadow-md transition-all">
                      دخول الأونلاين 🌐
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Info & Quick Switcher */}
      <footer className="relative z-10 w-full max-w-5xl mx-auto px-4 py-3 border-t border-amber-900/40 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-amber-300/60">
        <div className="flex items-center gap-2">
          <span>الطراز المفعّل:</span>
          <button
            onClick={onOpenSettings}
            className="font-bold text-amber-200 hover:text-white flex items-center gap-1 bg-[#231208] px-2.5 py-0.5 rounded-lg border border-amber-700/50 cursor-pointer"
          >
            <span>{THEMES[currentTheme]?.iconEmoji}</span>
            <span>{THEMES[currentTheme]?.name}</span>
          </button>
        </div>

        <div>
          تطبيق الطاولة المصرية الأصيل — مرخص بمواصفات المقاهي والبطولات الشعبية
        </div>
      </footer>
    </div>
  );
};
