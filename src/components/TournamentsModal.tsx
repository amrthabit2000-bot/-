import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Trophy,
  Award,
  Crown,
  Medal,
  ChevronLeft,
  Play,
  Sparkles,
  Flame,
  CheckCircle2,
  PlusCircle,
  Users,
  Target,
} from 'lucide-react';
import { GameVariant } from '../types/tawla';

export interface Tournament {
  id: string;
  name: string;
  subtitle: string;
  icon: string;
  variant: GameVariant;
  roundsCount: number;
  currentRound: number; // 1 = Quarter, 2 = Semi, 3 = Final
  prize: string;
  cupColor: string;
  isCustom?: boolean;
  opponents: Array<{
    name: string;
    avatar: string;
    level: string;
    defeated: boolean;
  }>;
}

const DEFAULT_TOURNAMENTS: Tournament[] = [
  {
    id: 'fishawy_cup',
    name: 'كأس مقهى الفيشاوي الذهبي',
    subtitle: 'أعرق بطولات خان الخليلي والحسين — طاولة ٣١ الكلاسيكية',
    icon: '🏆',
    variant: 'tawla31',
    roundsCount: 3,
    currentRound: 1,
    prize: 'كأس الفيشاوي الذهبي + لقب أستاذ الخان',
    cupColor: 'from-amber-400 to-amber-600',
    opponents: [
      { name: 'أسطى حسين النحاس', avatar: '🧔🏻‍♂️', level: 'متوسط', defeated: false },
      { name: 'المعلم رضا الفيشاوي', avatar: '👳🏽‍♂️', level: 'محترف', defeated: false },
      { name: 'الحاج عثمان الباشا', avatar: '👨🏼‍🦳', level: 'حريف أسطوري', defeated: false },
    ],
  },
  {
    id: 'abdeen_cup',
    name: 'كأس قصر عابدين للمحبوسة',
    subtitle: 'بطولة المحترفين الرسمية لقواعد المحبوسة والكشتبان',
    icon: '👑',
    variant: 'mahbousa',
    roundsCount: 3,
    currentRound: 1,
    prize: 'الوشاح الخديوي الملكي + وسام المحبوسة',
    cupColor: 'from-red-500 to-rose-700',
    opponents: [
      { name: 'سامح بك الألفي', avatar: '👨🏻‍💼', level: 'متوسط', defeated: false },
      { name: 'دكتور رأفت فهمي', avatar: '👨🏼‍🏫', level: 'محترف', defeated: false },
      { name: 'الجنرال توفيق', avatar: '🎖️', level: 'داهية المحبوسة', defeated: false },
    ],
  },
  {
    id: 'nile_championship',
    name: 'دوري أبطال النيل الأسبوعي',
    subtitle: 'منافسات سريعة ونقاط تصنيف للمتصدرين على مستوى الجمهورية',
    icon: '⚡',
    variant: 'tawla31',
    roundsCount: 3,
    currentRound: 2,
    prize: 'درع النيل الفضي + درجات تصنيف Elo',
    cupColor: 'from-cyan-400 to-blue-600',
    opponents: [
      { name: 'كابتن هشام', avatar: '👨🏽', level: 'مبتدئ', defeated: true },
      { name: 'أمير الدوبارة', avatar: '😎', level: 'محترف', defeated: false },
      { name: 'شريف المنياوي', avatar: '🎩', level: 'أستاذ طاولة', defeated: false },
    ],
  },
];

interface TournamentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTournamentMatch: (tourn: Tournament) => void;
}

export const TournamentsModal: React.FC<TournamentsModalProps> = ({
  isOpen,
  onClose,
  onStartTournamentMatch,
}) => {
  const [tournaments, setTournaments] = useState<Tournament[]>(() => {
    try {
      const saved = localStorage.getItem('tawla_tournaments_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_TOURNAMENTS;
  });

  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [selectedTourn, setSelectedTourn] = useState<Tournament>(() => tournaments[0] || DEFAULT_TOURNAMENTS[0]);

  // Form states for creating a new competition
  const [newTournName, setNewTournName] = useState('');
  const [newTournVariant, setNewTournVariant] = useState<GameVariant>('tawla31');
  const [newTournRounds, setNewTournRounds] = useState<number>(3);
  const [newTournPrize, setNewTournPrize] = useState('كأس البطولة الذهبي ولقب الأسطورة');
  const [newTournIcon, setNewTournIcon] = useState('🏆');

  useEffect(() => {
    try {
      localStorage.setItem('tawla_tournaments_v1', JSON.stringify(tournaments));
    } catch {
      // ignore
    }
  }, [tournaments]);

  if (!isOpen) return null;

  const roundNames = ['دور الـ ٨ (ربع النهائي)', 'المربع الذهبي (نصف النهائي)', 'المباراة النهائية على الكأس 🏆'];

  const handleCreateTournament = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTournName.trim()) return;

    const oppPool = [
      { name: 'عماد الشيمي', avatar: '🧔🏻‍♂️', level: 'متوسط' },
      { name: 'كريم الباشا', avatar: '👨🏽‍💼', level: 'محترف' },
      { name: 'الحاج فوزي', avatar: '👨🏼‍🦳', level: 'حريف طاولة' },
      { name: 'المهندس رامي', avatar: '👨🏻‍💻', level: 'عاشق الدوبارة' },
      { name: 'كابتن حسام', avatar: '😎', level: 'داهية الزهر' },
    ];

    // Pick random opponents based on roundsCount
    const selectedOpps = [];
    for (let i = 0; i < newTournRounds; i++) {
      const oppTemplate = oppPool[i % oppPool.length];
      selectedOpps.push({
        name: oppTemplate.name,
        avatar: oppTemplate.avatar,
        level: i === newTournRounds - 1 ? 'بطل المسابقة الحالي' : oppTemplate.level,
        defeated: false,
      });
    }

    const created: Tournament = {
      id: 'tourn_' + Date.now(),
      name: newTournName.trim(),
      subtitle: `مسابقة خاصة في ${newTournVariant === 'mahbousa' ? 'طاولة المحبوسة' : 'طاولة ٣١ المصرية'} — ${newTournRounds} أدوار إقصائية`,
      icon: newTournIcon,
      variant: newTournVariant,
      roundsCount: newTournRounds,
      currentRound: 1,
      prize: newTournPrize.trim() || 'كأس المسابقة الخاص',
      cupColor: 'from-amber-400 to-amber-600',
      isCustom: true,
      opponents: selectedOpps,
    };

    setTournaments((prev) => [created, ...prev]);
    setSelectedTourn(created);
    setActiveTab('list');
    setNewTournName('');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="relative w-full max-w-3xl max-h-[92vh] overflow-hidden rounded-3xl bg-gradient-to-b from-[#26150b] via-[#1a0e07] to-[#120803] border-2 border-amber-600/70 shadow-2xl flex flex-col text-amber-100 font-['Cairo']"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-amber-800/40 bg-[#1c0d06]/70">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-800 border border-amber-400/70 shadow-md">
                <Trophy className="w-6 h-6 text-amber-100" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-amber-100 flex items-center gap-2">
                  <span>مسابقات وبطولات الطاولة المصرية</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    كؤوس وبطولات
                  </span>
                </h2>
                <p className="text-xs text-amber-300/70">
                  نافس في البطولات الرسمية أو أنشئ مسابقتك وتحدَّ حريفة الطاولة
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-amber-300 hover:text-white bg-[#35190c] hover:bg-[#4d2512] border border-amber-700/60 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Top Sub-tabs: البطولات / عمل مسابقة */}
          <div className="flex items-center justify-between px-6 py-2.5 border-b border-amber-900/50 bg-[#170a04]/90">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('list')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'list'
                    ? 'bg-amber-600 text-amber-950 font-black shadow-md'
                    : 'text-amber-200/70 hover:text-amber-100 hover:bg-[#2e1509]'
                }`}
              >
                البطولات المتاحة ({tournaments.length})
              </button>

              <button
                onClick={() => setActiveTab('create')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'create'
                    ? 'bg-amber-600 text-amber-950 font-black shadow-md'
                    : 'text-amber-200/70 hover:text-amber-100 hover:bg-[#2e1509]'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>عمل مسابقة جديدة</span>
              </button>
            </div>

            <span className="text-[11px] text-amber-400 font-bold hidden sm:inline">
              نظام خروج المغلوب المعتمد
            </span>
          </div>

          {/* Body Content */}
          {activeTab === 'create' ? (
            /* CREATE COMPETITION FORM */
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              <div className="bg-[#1e0e06] p-4 rounded-2xl border border-amber-800/40">
                <h3 className="text-base font-black text-amber-100 mb-1 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>إنشاء مسابقة طاولة مخصصة</span>
                </h3>
                <p className="text-xs text-amber-300/70 mb-4">
                  حدد اسم البطولة، ونوع اللعبة وجوائز الكأس لبدء المنافسة والتصفيات فوراً.
                </p>

                <form onSubmit={handleCreateTournament} className="space-y-4">
                  {/* Competition Name */}
                  <div>
                    <label className="block text-xs font-bold text-amber-200 mb-1">
                      اسم المسابقة أو البطولة
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: بطولة أبطال الحي الذهبية، كأس الصحاب..."
                      value={newTournName}
                      onChange={(e) => setNewTournName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#2b1409] border border-amber-700/60 text-xs text-amber-100 placeholder-amber-400/40 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* Variant Selection */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-amber-200 mb-1">
                        نوع اللعبة
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setNewTournVariant('tawla31')}
                          className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            newTournVariant === 'tawla31'
                              ? 'bg-amber-600 text-stone-950 font-black border-amber-400'
                              : 'bg-[#2b1409] text-amber-200 border-amber-800'
                          }`}
                        >
                          طاولة ٣١ المصرية 🎲
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewTournVariant('mahbousa')}
                          className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            newTournVariant === 'mahbousa'
                              ? 'bg-amber-600 text-stone-950 font-black border-amber-400'
                              : 'bg-[#2b1409] text-amber-200 border-amber-800'
                          }`}
                        >
                          طاولة المحبوسة 🔒
                        </button>
                      </div>
                    </div>

                    {/* Rounds Count */}
                    <div>
                      <label className="block text-xs font-bold text-amber-200 mb-1">
                        عدد أدوار البطولة
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setNewTournRounds(2)}
                          className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            newTournRounds === 2
                              ? 'bg-amber-600 text-stone-950 font-black border-amber-400'
                              : 'bg-[#2b1409] text-amber-200 border-amber-800'
                          }`}
                        >
                          دوران (نصف نهائي)
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewTournRounds(3)}
                          className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            newTournRounds === 3
                              ? 'bg-amber-600 text-stone-950 font-black border-amber-400'
                              : 'bg-[#2b1409] text-amber-200 border-amber-800'
                          }`}
                        >
                          ٣ أدوار (شامل الربع نهائي)
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Icon & Prize */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-amber-200 mb-1">
                        رمز وشعار الكأس
                      </label>
                      <div className="flex items-center gap-1.5 bg-[#2b1409] p-1.5 rounded-xl border border-amber-700/60 justify-around">
                        {['🏆', '👑', '⚡', '🥇', '🌟', '💎'].map((ico) => (
                          <button
                            key={ico}
                            type="button"
                            onClick={() => setNewTournIcon(ico)}
                            className={`p-1.5 rounded-lg text-lg transition-transform cursor-pointer ${
                              newTournIcon === ico
                                ? 'bg-amber-500 scale-110 shadow-sm'
                                : 'hover:bg-amber-900/60'
                            }`}
                          >
                            {ico}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-amber-200 mb-1">
                        الجائزة واللقب التذكاري
                      </label>
                      <input
                        type="text"
                        placeholder="مثال: كأس الباشا الذهبي + لقب أستاذ الطاولة"
                        value={newTournPrize}
                        onChange={(e) => setNewTournPrize(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#2b1409] border border-amber-700/60 text-xs text-amber-100 placeholder-amber-400/40 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-black text-sm shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                    >
                      <Trophy className="w-4 h-4 fill-current" />
                      <span>اعتماد وإنشاء المسابقة فوراً 🚀</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            /* TOURNAMENTS LIST & DETAILS */
            <>
              {/* Tournament Selection Tabs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 px-6 pt-3 pb-2 border-b border-amber-900/50 bg-[#170a04]/90 overflow-x-auto">
                {tournaments.map((t) => {
                  const isSelected = selectedTourn.id === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTourn(t)}
                      className={`p-3 rounded-2xl border transition-all text-right cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-gradient-to-r from-amber-900/80 to-[#381a0b] border-amber-400 shadow-md'
                          : 'bg-[#1b0d06]/80 border-amber-900/60 hover:bg-[#251208]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{t.icon}</span>
                        <div>
                          <div className="font-black text-xs sm:text-sm text-amber-100">{t.name}</div>
                          <div className="text-[10px] text-amber-300/70">
                            {t.variant === 'mahbousa' ? 'طاولة محبوسة' : 'طاولة ٣١'}
                            {t.isCustom && ' • مخصصة'}
                          </div>
                        </div>
                      </div>
                      {isSelected && <Flame className="w-4 h-4 text-amber-400 animate-pulse" />}
                    </button>
                  );
                })}
              </div>

              {/* Content Body: Tournament Bracket & Details */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
                {/* Selected Tournament Hero Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#2f160b] via-[#3a1b0d] to-[#2f160b] border border-amber-600/60 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl">{selectedTourn.icon}</span>
                      <h3 className="text-lg font-black text-amber-100">{selectedTourn.name}</h3>
                    </div>
                    <p className="text-xs text-amber-200/80 leading-relaxed max-w-lg mb-2">
                      {selectedTourn.subtitle}
                    </p>
                    <div className="text-xs text-amber-300 font-bold flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-400" />
                      <span>الجائزة: {selectedTourn.prize}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onStartTournamentMatch(selectedTourn);
                      onClose();
                    }}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-amber-950 font-black text-sm shadow-xl transition-all cursor-pointer flex items-center gap-2 active:scale-95 flex-shrink-0"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>دخول المباراة الآن 🎲</span>
                  </button>
                </div>

                {/* Visual Elimination Bracket (شجرة البطولة) */}
                <div>
                  <h4 className="text-sm font-black text-amber-200 mb-3 flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <span>شجرة التصفيات والمنافسين (Tournament Bracket)</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {selectedTourn.opponents.map((opp, idx) => {
                      const isCurrent = idx + 1 === selectedTourn.currentRound;
                      const isDefeated = opp.defeated;

                      return (
                        <div
                          key={idx}
                          className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                            isCurrent
                              ? 'bg-gradient-to-b from-[#3a1b0d] to-[#251006] border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.35)]'
                              : isDefeated
                              ? 'bg-[#150a04]/90 border-emerald-900/60 opacity-80'
                              : 'bg-[#1a0c05] border-amber-900/50'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between text-[11px] font-black text-amber-300/80 mb-2">
                              <span>{roundNames[idx] || `الدور ${idx + 1}`}</span>
                              {isDefeated ? (
                                <span className="text-emerald-400 flex items-center gap-1 font-bold">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> فوز
                                </span>
                              ) : isCurrent ? (
                                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black border border-amber-500/50 animate-pulse">
                                  مباراتك القادمة
                                </span>
                              ) : (
                                <span className="text-stone-500">مغلق</span>
                              )}
                            </div>

                            <div className="flex items-center gap-3 my-2">
                              <span className="text-3xl p-1.5 rounded-2xl bg-[#2b1409] border border-amber-800/40 inline-block">
                                {opp.avatar}
                              </span>
                              <div>
                                <div className="font-black text-sm text-amber-100">{opp.name}</div>
                                <div className="text-[11px] text-amber-300/60">{opp.level}</div>
                              </div>
                            </div>
                          </div>

                          <div className="text-[11px] text-amber-200/60 border-t border-amber-900/40 pt-2 mt-2">
                            {idx === selectedTourn.opponents.length - 1
                              ? 'المباراة الفاصلة للتتويج بالكأس 🏆'
                              : 'الفوز يؤهلك مباشرة للدور القادم'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
