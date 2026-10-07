import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Users,
  UserPlus,
  Play,
  Check,
  Search,
  Trophy,
  Sparkles,
  Share2,
  Copy,
} from 'lucide-react';
import { toArabicDigits } from '../utils/rules31';

export interface Friend {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'playing' | 'offline';
  title: string;
  winRate: number;
  totalMatches: number;
}

const DEFAULT_FRIENDS: Friend[] = [
  {
    id: 'f_1',
    name: 'عماد الشيمي (المعلم)',
    avatar: '🧔🏻‍♂️',
    status: 'online',
    title: 'حريف طاولة ٣١',
    winRate: 68,
    totalMatches: 142,
  },
  {
    id: 'f_2',
    name: 'كريم الباشا',
    avatar: '👨🏽‍💼',
    status: 'playing',
    title: 'أستاذ المحبوسة',
    winRate: 74,
    totalMatches: 210,
  },
  {
    id: 'f_3',
    name: 'ياسمين فؤاد',
    avatar: '👩🏻‍🦰',
    status: 'online',
    title: 'بطلة مقهى الفيشاوي',
    winRate: 61,
    totalMatches: 88,
  },
  {
    id: 'f_4',
    name: 'محمود الصعيدي',
    avatar: '👳🏽‍♂️',
    status: 'offline',
    title: 'سفير البكجامون',
    winRate: 59,
    totalMatches: 165,
  },
  {
    id: 'f_5',
    name: 'طارق الألفي',
    avatar: '👨🏻‍💻',
    status: 'online',
    title: 'عاشق الدوبارة',
    winRate: 53,
    totalMatches: 79,
  },
];

interface FriendsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInviteFriend: (friend: Friend) => void;
  userPlayerName: string;
}

export const FriendsModal: React.FC<FriendsModalProps> = ({
  isOpen,
  onClose,
  onInviteFriend,
  userPlayerName,
}) => {
  const [friends, setFriends] = useState<Friend[]>(() => {
    try {
      const saved = localStorage.getItem('tawla_friends_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return DEFAULT_FRIENDS;
  });

  const [activeTab, setActiveTab] = useState<'list' | 'add'>('list');
  const [newFriendName, setNewFriendName] = useState('');
  const [copiedId, setCopiedId] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem('tawla_friends_v1', JSON.stringify(friends));
    } catch {
      // ignore
    }
  }, [friends]);

  if (!isOpen) return null;

  const handleAddFriend = () => {
    if (!newFriendName.trim()) return;
    const newF: Friend = {
      id: 'f_' + Math.random().toString(36).substring(2, 8),
      name: newFriendName.trim(),
      avatar: ['🧔🏽‍♂️', '👨🏻', '👱🏼‍♂️', '👩🏽', '👳🏻‍♂️'][Math.floor(Math.random() * 5)],
      status: 'online',
      title: 'لاعب جديد',
      winRate: Math.floor(Math.random() * 25) + 50,
      totalMatches: Math.floor(Math.random() * 40) + 10,
    };
    setFriends((prev) => [newF, ...prev]);
    setNewFriendName('');
    setActiveTab('list');
  };

  const handleCopyCode = () => {
    const inviteCode = 'TAWLA-' + Math.floor(1000 + Math.random() * 9000);
    navigator.clipboard.writeText(inviteCode);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const filtered = friends.filter((f) =>
    f.name.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="relative w-full max-w-xl max-h-[90vh] overflow-hidden rounded-3xl bg-gradient-to-b from-[#24130a] via-[#1a0d06] to-[#120803] border-2 border-amber-600/70 shadow-2xl flex flex-col text-amber-100 font-['Cairo']"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-amber-800/40 bg-[#1c0d06]/70">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-900 border border-amber-400/70 shadow-md">
                <Users className="w-6 h-6 text-amber-100" />
              </div>
              <div>
                <h2 className="text-xl font-black text-amber-100 flex items-center gap-2">
                  <span>قائمة الأصدقاء والمنافسين</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    {friends.filter((f) => f.status !== 'offline').length} متصلين الآن
                  </span>
                </h2>
                <p className="text-xs text-amber-300/70">
                  تحدَّ أصدقاءك في مباريات طاولة أونلاين مباشرة مع الشات
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

          {/* Navigation Bar */}
          <div className="flex items-center justify-between px-6 py-2.5 border-b border-amber-900/50 bg-[#160a04]/90">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('list')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'list'
                    ? 'bg-amber-600 text-amber-950 font-black shadow-md'
                    : 'text-amber-200/70 hover:text-amber-100 hover:bg-[#2e1509]'
                }`}
              >
                أصدقائي ({friends.length})
              </button>
              <button
                onClick={() => setActiveTab('add')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'add'
                    ? 'bg-amber-600 text-amber-950 font-black shadow-md'
                    : 'text-amber-200/70 hover:text-amber-100 hover:bg-[#2e1509]'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>إضافة صديق</span>
              </button>
            </div>

            {/* Quick Share Code */}
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-950/70 hover:bg-amber-900 border border-amber-700/60 text-[11px] font-bold text-amber-300 cursor-pointer transition-all"
              title="نسخ كود الدعوة"
            >
              {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedId ? 'تم النسخ!' : 'كود الدعوة'}</span>
            </button>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6">
            {activeTab === 'list' ? (
              <div className="space-y-3">
                {/* Search Bar */}
                <div className="relative mb-3">
                  <Search className="w-4 h-4 absolute right-3 top-3 text-amber-400/60" />
                  <input
                    type="text"
                    placeholder="ابحث بالاسم عن صديق..."
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    className="w-full pl-3 pr-9 py-2 rounded-xl bg-[#1c0d06] border border-amber-800/50 text-xs text-amber-100 placeholder-amber-400/40 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {filtered.length === 0 ? (
                  <div className="text-center py-8 text-xs text-amber-300/50 bg-[#1b0d06]/60 rounded-2xl border border-amber-900/40">
                    لا يوجد أصدقاء بهذا الاسم. اضغط على «إضافة صديق» لدعوة معارفك!
                  </div>
                ) : (
                  filtered.map((f) => (
                    <div
                      key={f.id}
                      className="p-3.5 rounded-2xl bg-[#1d0e06]/90 border border-amber-800/40 hover:border-amber-600/70 transition-all flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <span className="text-3xl p-1.5 rounded-2xl bg-[#2e170c] border border-amber-800/50 inline-block shadow-inner">
                            {f.avatar}
                          </span>
                          <span
                            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#1d0e06] ${
                              f.status === 'online'
                                ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                                : f.status === 'playing'
                                ? 'bg-amber-400 animate-pulse'
                                : 'bg-stone-500'
                            }`}
                            title={
                              f.status === 'online'
                                ? 'متصل الآن'
                                : f.status === 'playing'
                                ? 'يلعب طاولة حالياً'
                                : 'غير متصل'
                            }
                          />
                        </div>

                        <div>
                          <div className="font-black text-sm text-amber-100 flex items-center gap-1.5">
                            <span>{f.name}</span>
                            <span className="text-[10px] text-amber-400/80 font-bold bg-amber-950 px-2 py-0.2 rounded-full border border-amber-800/40">
                              {f.title}
                            </span>
                          </div>
                          <div className="text-[11px] text-amber-300/60 mt-0.5 flex items-center gap-2">
                            <span>نسبة الفوز: {toArabicDigits(f.winRate)}%</span>
                            <span>•</span>
                            <span>{toArabicDigits(f.totalMatches)} مباراة</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          onInviteFriend(f);
                          onClose();
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-amber-950 font-black text-xs shadow-md transition-all cursor-pointer active:scale-95"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>دعوة للعب</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-4 max-w-md mx-auto py-3">
                <div className="text-center mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-600/20 text-amber-300 border border-amber-500/40 flex items-center justify-center mx-auto mb-2">
                    <UserPlus className="w-6 h-6" />
                  </div>
                  <h3 className="font-black text-base text-amber-100">إضافة صديق جديد إلى قائمتك</h3>
                  <p className="text-xs text-amber-300/70 mt-1">
                    أدخل اسم أو كود الصديق ليتم حفظه واللعب معه في أي وقت
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-amber-200">اسم الصديق:</label>
                  <input
                    type="text"
                    placeholder="مثال: المعلم حسن، عمر الشريف..."
                    value={newFriendName}
                    onChange={(e) => setNewFriendName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#1c0d06] border border-amber-800/60 text-sm text-amber-100 placeholder-amber-400/40 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  onClick={handleAddFriend}
                  disabled={!newFriendName.trim()}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:opacity-50 text-amber-950 font-black text-sm shadow-lg transition-all cursor-pointer"
                >
                  إضافة إلى القائمة ✓
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
