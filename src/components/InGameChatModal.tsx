import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  MessageCircle,
  Send,
  Smile,
  Sparkles,
  Zap,
} from 'lucide-react';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  isQuickPhrase?: boolean;
  timestamp: number;
}

const QUICK_EGYPTIAN_PHRASES = [
  'شيش بيش يا معلم! 🎲',
  'دو بارة في الجون! 🔥',
  'يا حريف الطاولة 😎',
  'الملعوب ملعوب يا باشا 😉',
  'بالراحة شوية على مهلك ⏳',
  'يا سلام سلم على الرمية! 👏',
  'حظك نار النهاردة! 🎯',
  'محبوسة محبوسة خلاص! 🔒',
  'هاتها من الشبكة يا باشا ⚽',
  'عاش والله رمية أستاذ 🎩',
  'الدستة في أيدك سحر 🪄',
  'العب من غير توتر يا كابتن ☕',
];

interface InGameChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (text: string, isQuickPhrase?: boolean) => void;
  currentUserName: string;
  isOnline: boolean;
}

export const InGameChatModal: React.FC<InGameChatModalProps> = ({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  currentUserName,
  isOnline,
}) => {
  const [inputText, setInputText] = useState('');
  const [activeTab, setActiveTab] = useState<'quick' | 'free'>('quick');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim(), false);
    setInputText('');
  };

  const handleSendQuick = (phrase: string) => {
    onSendMessage(phrase, true);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          className="relative w-full max-w-lg h-[80vh] max-h-[580px] rounded-3xl bg-gradient-to-b from-[#24130a] via-[#1a0e07] to-[#120803] border-2 border-amber-600/70 shadow-2xl flex flex-col text-amber-100 font-['Cairo'] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-amber-800/40 bg-[#1c0d06]/80">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-600/20 text-amber-300 border border-amber-500/40">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-sm text-amber-100 flex items-center gap-2">
                  <span>شات الطاولة المباشر</span>
                  {isOnline ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                      أونلاين مباشر 🟢
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                      طاولة محلية
                    </span>
                  )}
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-amber-300 hover:text-white bg-[#35190c] hover:bg-[#4d2512] border border-amber-700/60 transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Tabs: عبارات سريعة / رسائل نصية */}
          <div className="flex items-center gap-2 px-5 py-2 border-b border-amber-900/40 bg-[#160a04]/90 text-xs font-bold">
            <button
              onClick={() => setActiveTab('quick')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'quick'
                  ? 'bg-amber-600 text-amber-950 font-black shadow-md'
                  : 'text-amber-200/70 hover:text-amber-100 hover:bg-[#2e1509]'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>عبارات القهوة السريعة</span>
            </button>

            <button
              onClick={() => setActiveTab('free')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'free'
                  ? 'bg-amber-600 text-amber-950 font-black shadow-md'
                  : 'text-amber-200/70 hover:text-amber-100 hover:bg-[#2e1509]'
              }`}
            >
              <Smile className="w-3.5 h-3.5" />
              <span>شات حر ({messages.length})</span>
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {activeTab === 'quick' ? (
              <div className="grid grid-cols-2 gap-2">
                {QUICK_EGYPTIAN_PHRASES.map((phrase, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendQuick(phrase)}
                    className="p-3 rounded-2xl bg-[#241107] hover:bg-[#381a0b] border border-amber-700/50 hover:border-amber-400 text-right text-xs font-bold text-amber-100 transition-all cursor-pointer active:scale-95 shadow-sm"
                  >
                    {phrase}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {messages.length === 0 ? (
                  <div className="text-center py-10 text-xs text-amber-300/50 bg-[#180a04]/60 rounded-2xl border border-amber-900/40">
                    لا توجد رسائل بعد. أرسل تحية لمنافسك على الطاولة!
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMe = m.senderName === currentUserName;
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div className="text-[10px] text-amber-300/60 mb-0.5 px-1 font-bold">
                          {isMe ? 'أنت' : m.senderName}
                        </div>
                        <div
                          className={`max-w-[80%] px-3.5 py-2 rounded-2xl text-xs font-bold leading-relaxed shadow-md ${
                            isMe
                              ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-amber-50 rounded-br-none'
                              : 'bg-[#281308] border border-amber-800/60 text-amber-100 rounded-bl-none'
                          }`}
                        >
                          {m.text}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Text Input Footer */}
          <div className="p-3 border-t border-amber-800/40 bg-[#180a04]/90 flex items-center gap-2">
            <input
              type="text"
              placeholder="اكتب رسالة لمنافسك..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 px-4 py-2 rounded-xl bg-[#241107] border border-amber-800/60 text-xs text-amber-100 placeholder-amber-400/40 focus:outline-none focus:border-amber-500"
            />
            <button
              onClick={handleSend}
              disabled={!inputText.trim()}
              className="p-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-amber-950 font-black cursor-pointer shadow-md transition-all active:scale-95"
            >
              <Send className="w-4 h-4 rotate-180" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
