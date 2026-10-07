import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  Award,
  BarChart3,
  CheckCircle2,
  Globe2,
  Lock,
  Medal,
  Sparkles,
  Trophy,
  User,
  X,
  Zap,
} from 'lucide-react';
import {
  getUserProfile,
  saveUserProfile,
  UserProfile,
  getLeaderboardEntries,
  getUserAchievements,
} from '../utils/userProfile';

interface ProfileAndStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileAndStatsModal: React.FC<ProfileAndStatsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'achievements' | 'profile' | 'leaderboard'>('stats');
  const [achievementFilter, setAchievementFilter] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [profile, setProfile] = useState<UserProfile>(getUserProfile());
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profile.name);

  if (!isOpen) return null;

  const leaderboard = getLeaderboardEntries(profile);
  const achievements = getUserAchievements(profile);
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  const filteredAchievements = achievements.filter((ach) => {
    if (achievementFilter === 'unlocked') return ach.unlocked;
    if (achievementFilter === 'locked') return !ach.unlocked;
    return true;
  });

  // Prepare data for Recharts
  const chartData = profile.matchHistory.map((m, idx) => ({
    name: `جولة ${idx + 1}`,
    winRate: m.winRate,
    rating: m.ratingAfter,
    result: m.winner === 'player' ? 'فوز' : 'خسارة',
    score: `${m.playerPoints} - ${m.opponentPoints}`,
  }));

  const handleSaveName = () => {
    if (nameInput.trim()) {
      const updated = { ...profile, name: nameInput.trim() };
      setProfile(updated);
      saveUserProfile(updated);
    }
    setIsEditingName(false);
  };

  const handleSelectAvatar = (emoji: string) => {
    const updated = { ...profile, avatarEmoji: emoji };
    setProfile(updated);
    saveUserProfile(updated);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md font-['Cairo']">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="relative w-full max-w-2xl bg-gradient-to-b from-[#24130a] via-[#1a0c06] to-[#100703] border-2 border-amber-600/50 rounded-3xl p-4 sm:p-6 shadow-[0_20px_70px_rgba(0,0,0,0.95)] text-[#f5ecd9] max-h-[92vh] flex flex-col"
          dir="rtl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#4d2d18] pb-3 mb-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 border border-amber-400 flex items-center justify-center shadow-lg text-2xl">
                {profile.avatarEmoji}
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-amber-100 flex items-center gap-2">
                  <span>{profile.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/60 text-amber-300 font-normal">
                    {profile.tierName}
                  </span>
                </h2>
                <div className="flex items-center gap-3 text-xs text-amber-200/70 mt-0.5">
                  <span className="flex items-center gap-1">
                    <span>{profile.countryName}</span>
                  </span>
                  <span>•</span>
                  <span className="text-emerald-400 font-bold font-mono">
                    التقييم: {profile.rating} نقطة
                  </span>
                  <span>•</span>
                  <button
                    onClick={() => setActiveTab('achievements')}
                    className="flex items-center gap-1 text-amber-300 hover:text-amber-100 font-bold cursor-pointer"
                  >
                    <span>🎖️ {unlockedCount}/{achievements.length} أوسمة</span>
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#3a1d0d] hover:bg-[#522913] text-amber-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-4 p-1 bg-[#160a04] border border-[#3b1d0c] rounded-2xl shrink-0">
            <button
              onClick={() => setActiveTab('stats')}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'stats'
                  ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md'
                  : 'text-amber-200/70 hover:text-amber-100 hover:bg-[#281308]'
              }`}
            >
              <BarChart3 className="w-4 h-4 shrink-0" />
              <span>الإحصائيات</span>
            </button>

            <button
              onClick={() => setActiveTab('achievements')}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'achievements'
                  ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md'
                  : 'text-amber-200/70 hover:text-amber-100 hover:bg-[#281308]'
              }`}
            >
              <Award className="w-4 h-4 shrink-0 text-amber-400" />
              <span>الأوسمة ({unlockedCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md'
                  : 'text-amber-200/70 hover:text-amber-100 hover:bg-[#281308]'
              }`}
            >
              <User className="w-4 h-4 shrink-0" />
              <span>البروفايل</span>
            </button>

            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'leaderboard'
                  ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md'
                  : 'text-amber-200/70 hover:text-amber-100 hover:bg-[#281308]'
              }`}
            >
              <Trophy className="w-4 h-4 shrink-0" />
              <span>الأبطال</span>
            </button>
          </div>

          {/* Tab Content (Scrollable) */}
          <div className="overflow-y-auto flex-1 pr-1 space-y-4">
            {/* TAB 1: RECHARTS STATS DASHBOARD */}
            {activeTab === 'stats' && (
              <div className="space-y-4">
                {/* KPI Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 rounded-2xl bg-[#1b0d06] border border-[#4d2812] flex flex-col items-center justify-center text-center shadow">
                    <span className="text-xs text-amber-200/60">إجمالي الجولات</span>
                    <span className="text-xl sm:text-2xl font-black text-amber-300 font-mono mt-1">
                      {profile.totalGames}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#1b0d06] border border-[#4d2812] flex flex-col items-center justify-center text-center shadow">
                    <span className="text-xs text-emerald-400/80">مرات الفوز</span>
                    <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono mt-1">
                      {profile.wins}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#1b0d06] border border-[#4d2812] flex flex-col items-center justify-center text-center shadow">
                    <span className="text-xs text-red-400/80">مرات الخسارة</span>
                    <span className="text-xl sm:text-2xl font-black text-red-400 font-mono mt-1">
                      {profile.losses}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#1b0d06] border border-[#4d2812] flex flex-col items-center justify-center text-center shadow">
                    <span className="text-xs text-amber-200/60">نسبة الفوز</span>
                    <span className="text-xl sm:text-2xl font-black text-amber-300 font-mono mt-1">
                      {((profile.wins / Math.max(1, profile.totalGames)) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                {/* Main Recharts Area Chart: Win Rate Evolution */}
                <div className="p-4 rounded-3xl bg-[#170a04] border border-[#3b1d0c] shadow-inner">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-amber-100 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>تطور نسبة فوزك مقابل الكمبيوتر عبر الجولات</span>
                    </h3>
                    <span className="text-xs text-emerald-400 font-mono font-bold bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                      مستوى متصاعد 📈
                    </span>
                  </div>

                  <div className="h-56 w-full" dir="ltr">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={chartData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="winRateGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#d97706" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#d97706" stopOpacity={0.05} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#451a03" opacity={0.3} />
                        <XAxis
                          dataKey="name"
                          stroke="#a16207"
                          fontSize={11}
                          tickLine={false}
                        />
                        <YAxis
                          domain={[0, 100]}
                          stroke="#a16207"
                          fontSize={11}
                          unit="%"
                          tickLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#241006',
                            border: '1px solid #78350f',
                            borderRadius: '12px',
                            color: '#fef3c7',
                            fontSize: '12px',
                            fontFamily: 'Cairo',
                          }}
                          formatter={(value: any) => [`${value}%`, 'نسبة الفوز الإجمالية']}
                        />
                        <Area
                          type="monotone"
                          dataKey="winRate"
                          stroke="#f59e0b"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#winRateGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Secondary Stats Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-[#170a04] border border-[#3b1d0c] flex items-center justify-between">
                    <div>
                      <span className="text-xs text-amber-200/60">سلسلة الانتصارات الحالية:</span>
                      <p className="text-base font-bold text-amber-100 mt-0.5">
                        {profile.currentStreak} فوز متتالي
                      </p>
                    </div>
                    <Zap className="w-6 h-6 text-amber-400" />
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#170a04] border border-[#3b1d0c] flex items-center justify-between">
                    <div>
                      <span className="text-xs text-amber-200/60">أعلى سلسلة انتصارات:</span>
                      <p className="text-base font-bold text-emerald-400 mt-0.5">
                        {profile.bestStreak} فوز متتالي
                      </p>
                    </div>
                    <Award className="w-6 h-6 text-emerald-400" />
                  </div>
                </div>

                {/* 20 Saved Matches History Section */}
                <div className="p-4 rounded-3xl bg-[#170a04] border border-[#3b1d0c] shadow-inner space-y-3">
                  <div className="flex items-center justify-between border-b border-[#3b1d0c] pb-2">
                    <h3 className="text-xs sm:text-sm font-bold text-amber-100 flex items-center gap-1.5">
                      <BarChart3 className="w-4 h-4 text-amber-400" />
                      <span>سجل آخر ٢٠ مباراة مسجلة (محفوظة في السحابة والجهاز):</span>
                    </h3>
                    <span className="text-[11px] font-mono text-amber-400/80 bg-amber-950/60 px-2 py-0.5 rounded-lg border border-amber-800/40">
                      {Math.min(profile.matchHistory.length, 20)} / 20 مباراة
                    </span>
                  </div>

                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {profile.matchHistory
                      .slice(-20)
                      .reverse()
                      .map((match, idx) => (
                        <div
                          key={match.id || idx}
                          className={`flex items-center justify-between p-2.5 rounded-xl border text-xs ${
                            match.winner === 'player'
                              ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200'
                              : 'bg-red-950/20 border-red-800/40 text-red-200'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                                match.winner === 'player'
                                  ? 'bg-emerald-600 text-stone-950'
                                  : 'bg-red-600 text-white'
                              }`}
                            >
                              {match.winner === 'player' ? '✓' : '✕'}
                            </span>
                            <div>
                              <div className="font-bold text-amber-100 flex items-center gap-1.5">
                                <span>ضد: {match.opponentName}</span>
                                <span className="text-[10px] text-amber-400/60 font-mono">
                                  ({match.date})
                                </span>
                              </div>
                              <div className="text-[10px] text-amber-200/60">
                                النتيجة: {match.playerPoints} - {match.opponentPoints} • التقييم:{' '}
                                {match.ratingAfter}
                              </div>
                            </div>
                          </div>

                          <span
                            className={`font-black text-xs px-2 py-0.5 rounded-lg ${
                              match.winner === 'player'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {match.winner === 'player' ? 'فوز 🏆' : 'هزيمة'}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: GOLDEN ACHIEVEMENTS & BADGES (الأوسمة الذهبية) */}
            {activeTab === 'achievements' && (
              <div className="space-y-4">
                {/* Header Progress Card */}
                <div className="p-4 rounded-3xl bg-gradient-to-br from-[#3b200d] via-[#241308] to-[#140803] border-2 border-amber-500/50 shadow-xl relative overflow-hidden">
                  <div className="flex items-center justify-between relative z-10 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#ffe082] via-[#ffd700] to-[#b45309] shadow-[0_0_15px_rgba(251,191,36,0.6)] flex items-center justify-center text-xl border border-amber-200">
                        🏆
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-amber-100">
                          أوسمة وإنجازات الطاولة الذهبية
                        </h3>
                        <p className="text-[11px] text-amber-200/70">
                          أوسمة شرف تُمنح لمهارات اللعب النادرة وسلاسل الفوز المتتالية
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-black text-amber-300 font-mono px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/40 shadow-inner">
                      {unlockedCount} / {achievements.length}
                    </span>
                  </div>

                  {/* Gold Progress Bar */}
                  <div className="w-full bg-[#170a04] h-2.5 rounded-full overflow-hidden p-[1px] border border-amber-900/60 relative z-10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(unlockedCount / Math.max(1, achievements.length)) * 100}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.8)]"
                    />
                  </div>
                </div>

                {/* Filter Chips */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAchievementFilter('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      achievementFilter === 'all'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-[#1b0d06] text-amber-200/60 hover:text-amber-100 border border-[#3d1f0f]'
                    }`}
                  >
                    الكل ({achievements.length})
                  </button>
                  <button
                    onClick={() => setAchievementFilter('unlocked')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      achievementFilter === 'unlocked'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-[#1b0d06] text-emerald-400/70 hover:text-emerald-300 border border-[#3d1f0f]'
                    }`}
                  >
                    المحققة ({unlockedCount}) 🌟
                  </button>
                  <button
                    onClick={() => setAchievementFilter('locked')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      achievementFilter === 'locked'
                        ? 'bg-stone-700 text-white shadow-sm'
                        : 'bg-[#1b0d06] text-amber-200/50 hover:text-amber-200 border border-[#3d1f0f]'
                    }`}
                  >
                    قيد الإنجاز ({achievements.length - unlockedCount}) 🔒
                  </button>
                </div>

                {/* Achievements Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredAchievements.map((ach) => (
                    <div
                      key={ach.id}
                      className={`relative p-3.5 rounded-3xl border transition-all flex flex-col justify-between overflow-hidden ${
                        ach.unlocked
                          ? 'bg-gradient-to-br from-[#381c0c] via-[#241207] to-[#170a04] border-amber-400/80 shadow-[0_0_18px_rgba(251,191,36,0.25)] ring-1 ring-amber-400/40'
                          : 'bg-[#140803]/85 border-[#3b1d0c] opacity-65'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* 24K Pure Gold Medallion Icon */}
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-2xl relative shadow-md ${
                            ach.unlocked
                              ? 'bg-gradient-to-br from-[#fff7cc] via-[#ffd700] via-[#f59e0b] to-[#92400e] border border-[#fffbeb] shadow-[0_0_14px_rgba(251,191,36,0.55)]'
                              : 'bg-[#221007] border border-[#3d1c0e] grayscale'
                          }`}
                        >
                          <span>{ach.iconEmoji}</span>
                          {ach.unlocked ? (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border border-white flex items-center justify-center shadow">
                              <CheckCircle2 className="w-3 h-3 text-white" />
                            </div>
                          ) : (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-black/80 border border-amber-900 flex items-center justify-center shadow">
                              <Lock className="w-2.5 h-2.5 text-amber-400" />
                            </div>
                          )}
                        </div>

                        {/* Text Details */}
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <h4
                              className={`text-xs sm:text-sm font-black flex items-center gap-1.5 ${
                                ach.unlocked ? 'text-amber-100 drop-shadow-sm' : 'text-amber-200/60'
                              }`}
                            >
                              <span>{ach.title}</span>
                            </h4>
                            <span
                              className={`text-[9px] px-2 py-0.5 rounded-full font-bold font-mono border ${
                                ach.rarity === 'mythic'
                                  ? 'bg-amber-950 text-amber-300 border-amber-400/60'
                                  : ach.rarity === 'royal'
                                  ? 'bg-purple-950/80 text-amber-200 border-purple-400/50'
                                  : 'bg-amber-950/70 text-amber-300 border-amber-600/50'
                              }`}
                            >
                              {ach.rarity === 'mythic' ? '👑 أسطوري' : ach.rarity === 'royal' ? '🎖️ ملكي' : '🌟 ذهبي'}
                            </span>
                          </div>

                          <p className="text-[11px] text-amber-200/80 font-semibold mt-0.5">
                            {ach.subtitle}
                          </p>
                          <p className="text-[10px] text-amber-200/50 mt-1 leading-relaxed">
                            {ach.description}
                          </p>
                        </div>
                      </div>

                      {/* Footer Requirement / Status */}
                      <div className="mt-3 pt-2.5 border-t border-[#3d1e0d] flex items-center justify-between text-[11px]">
                        <span className="text-amber-200/60 text-[10px]">
                          المطلوب: {ach.requirementText}
                        </span>
                        {ach.unlocked ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-1 text-[10px]">
                            <span>محقق ومكتمل 🌟</span>
                          </span>
                        ) : (
                          <span className="text-amber-200/40 flex items-center gap-1 text-[10px]">
                            <span>قيد الإنجاز 🔒</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: PROFILE & GLOBAL / NATIONAL RANK */}
            {activeTab === 'profile' && (
              <div className="space-y-4">
                {/* Ranking Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* National Rank */}
                  <div className="relative overflow-hidden p-4 rounded-3xl bg-gradient-to-br from-[#30160a] to-[#1c0c05] border-2 border-amber-500/50 shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-amber-200/80 font-bold flex items-center gap-1.5">
                        <Medal className="w-4 h-4 text-amber-400" />
                        <span>الترتيب على مستوى الدولة ({profile.countryName})</span>
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl sm:text-4xl font-black text-amber-300 font-mono">
                        #{profile.nationalRank}
                      </span>
                      <span className="text-xs text-emerald-400 font-bold">
                        أفضل 1% من اللاعبين 🇪🇬
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-200/60 mt-1">
                      ترتيبك الرسمي استناداً إلى نقاط الفوز ومستوى مواجهة الكمبيوتر الذكي
                    </p>
                  </div>

                  {/* Global Rank */}
                  <div className="relative overflow-hidden p-4 rounded-3xl bg-gradient-to-br from-[#24130b] to-[#140803] border-2 border-emerald-600/40 shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-emerald-200/80 font-bold flex items-center gap-1.5">
                        <Globe2 className="w-4 h-4 text-emerald-400" />
                        <span>الترتيب على مستوى العالم</span>
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl sm:text-4xl font-black text-emerald-300 font-mono">
                        #{profile.globalRank.toLocaleString('en-US')}
                      </span>
                      <span className="text-xs text-amber-300 font-bold">
                        بين ١٥٠ ألف لاعب 🌍
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-200/60 mt-1">
                      التصنيف العالمي الموحد للاعبي طاولة ٣١ المحترفين
                    </p>
                  </div>
                </div>

                {/* Showcase: Golden Badges Preview in Profile Tab */}
                <div className="p-4 rounded-3xl bg-gradient-to-r from-[#291309] to-[#180a04] border border-amber-600/40 shadow-inner">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs sm:text-sm font-bold text-amber-100 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-400" />
                      <span>الأوسمة الذهبية التي حصدتها ({unlockedCount} وسام):</span>
                    </h3>
                    <button
                      onClick={() => setActiveTab('achievements')}
                      className="text-xs text-amber-400 hover:text-amber-200 font-bold hover:underline cursor-pointer"
                    >
                      عرض جميع الأوسمة 🎖️
                    </button>
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {achievements
                      .filter((a) => a.unlocked)
                      .map((ach) => (
                        <div
                          key={ach.id}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-black/40 border border-amber-500/50 shadow shrink-0"
                          title={ach.description}
                        >
                          <span className="text-xl">{ach.iconEmoji}</span>
                          <div>
                            <span className="text-xs font-black text-amber-200 block">{ach.title}</span>
                            <span className="text-[9px] text-amber-300/60">{ach.rarity === 'mythic' ? 'أسطوري' : 'ذهبي'}</span>
                          </div>
                        </div>
                      ))}
                    {unlockedCount === 0 && (
                      <p className="text-xs text-amber-200/50 py-2">
                        العب وحقق انتصارات متتالية أو فوز "خشب" لتبدأ في حصد أوسمتك الذهبية!
                      </p>
                    )}
                  </div>
                </div>

                {/* Profile Edit Details */}
                <div className="p-4 rounded-3xl bg-[#170a04] border border-[#3b1d0c] space-y-3">
                  <h3 className="text-xs font-bold text-amber-200 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-amber-400" />
                    <span>تخصيص بيانات اللاعب:</span>
                  </h3>

                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className="text-[11px] text-amber-200/60 block mb-1">اسم اللاعب:</label>
                      {isEditingName ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={nameInput}
                            onChange={(e) => setNameInput(e.target.value)}
                            className="flex-1 px-3 py-1.5 rounded-xl bg-black/60 border border-amber-600 text-sm text-white focus:outline-none"
                            maxLength={24}
                          />
                          <button
                            onClick={handleSaveName}
                            className="px-4 py-1.5 rounded-xl bg-amber-600 text-white font-bold text-xs cursor-pointer"
                          >
                            حفظ
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-black/40 border border-[#4d2812]">
                          <span className="font-bold text-sm text-amber-100">{profile.name}</span>
                          <button
                            onClick={() => setIsEditingName(true)}
                            className="text-xs text-amber-400 hover:underline cursor-pointer"
                          >
                            تعديل الاسم
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Choose Avatar */}
                  <div>
                    <label className="text-[11px] text-amber-200/60 block mb-1.5">اختر الأفاتار الشخصي:</label>
                    <div className="flex items-center gap-2 flex-wrap">
                      {['🤴', '🧔', '👑', '🎩', '🦁', '🦅', '🎲', '🪵'].map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => handleSelectAvatar(emoji)}
                          className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-transform cursor-pointer ${
                            profile.avatarEmoji === emoji
                              ? 'bg-amber-600 ring-2 ring-amber-400 scale-110 shadow'
                              : 'bg-black/50 hover:bg-[#3d1c0e]'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: LEADERBOARD */}
            {activeTab === 'leaderboard' && (
              <div className="space-y-3">
                <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-600/30 text-xs text-amber-200/80 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>دوري كبار لاعبي الطاولة ٣١ على مستوى مصر والوطن العربي والعالم</span>
                </div>

                <div className="space-y-2">
                  {leaderboard.map((player) => (
                    <div
                      key={player.rank + player.name}
                      className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                        player.isCurrentUser
                          ? 'bg-gradient-to-r from-amber-950/90 via-[#3a190b] to-amber-950/90 border-amber-500 shadow-md ring-1 ring-amber-400/50'
                          : 'bg-[#170a04] border-[#3b1d0c]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Rank Badge */}
                        <div
                          className={`w-8 h-8 rounded-xl font-black font-mono flex items-center justify-center text-xs ${
                            player.rank === 1
                              ? 'bg-amber-400 text-amber-950 shadow-[0_0_10px_rgba(251,191,36,0.6)]'
                              : player.rank === 2
                              ? 'bg-slate-300 text-slate-900 shadow'
                              : player.rank === 3
                              ? 'bg-amber-700 text-amber-100 shadow'
                              : 'bg-black/50 text-amber-200/70 border border-amber-900'
                          }`}
                        >
                          #{player.rank}
                        </div>

                        {/* Avatar & Name */}
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{player.avatarEmoji}</span>
                          <div>
                            <p className="font-bold text-xs sm:text-sm text-amber-100 flex items-center gap-1.5">
                              <span>{player.name}</span>
                              <span className="text-[10px] text-amber-200/50">({player.country})</span>
                            </p>
                            <p className="text-[10px] text-amber-200/60">{player.tier}</p>
                          </div>
                        </div>
                      </div>

                      {/* Score & Win Rate */}
                      <div className="text-left font-mono">
                        <span className="text-sm font-black text-amber-300">
                          {player.rating} pt
                        </span>
                        <span className="block text-[10px] text-emerald-400">
                          {player.winRate}% فوز
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Close */}
          <div className="pt-3 border-t border-[#4d2d18]/60 mt-3 flex justify-end shrink-0">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-xl bg-amber-700 hover:bg-amber-600 text-white font-bold text-xs cursor-pointer transition-all shadow"
            >
              إغلاق
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
