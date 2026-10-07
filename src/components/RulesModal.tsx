import React, { useState } from 'react';
import { X, BookOpen, Sparkles, CheckCircle2, ShieldAlert, Lock } from 'lucide-react';
import { DIE_NAMES, DOUBLE_NAMES, SPECIAL_NAMES } from '../utils/diceNames';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  const [tab, setTab] = useState<'mahbousa' | 'tawla31' | 'dice'>('mahbousa');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl max-h-[88vh] bg-[#22130a] border-2 border-[#5a341b] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-amber-100 font-['Cairo']">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#1a0e06] border-b border-[#4d2d17] shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h2 className="text-base sm:text-lg font-bold text-amber-100">
              دليل وقواعد ألعاب الطاولة المصرية (المحبوسة & طاولة ٣١)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-amber-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 p-2 bg-[#150a04] border-b border-[#3d1d0c] shrink-0">
          <button
            onClick={() => setTab('mahbousa')}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              tab === 'mahbousa'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-amber-200/70 hover:text-amber-100 hover:bg-[#281308]'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>لعبة المحبوسة الأصلية</span>
          </button>

          <button
            onClick={() => setTab('tawla31')}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              tab === 'tawla31'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-amber-200/70 hover:text-amber-100 hover:bg-[#281308]'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>طاولة ٣١ المصرية الأصلية</span>
          </button>

          <button
            onClick={() => setTab('dice')}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              tab === 'dice'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-amber-200/70 hover:text-amber-100 hover:bg-[#281308]'
            }`}
          >
            <span>🎲 قاموس أسماء الزهر</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs sm:text-sm text-amber-100/90 leading-relaxed">
          {/* TAB 1: MAHBOUSA RULES */}
          {tab === 'mahbousa' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#32170b] to-[#1f0d06] border border-amber-600/40">
                <h3 className="text-sm sm:text-base font-black text-amber-300 flex items-center gap-2 mb-1.5">
                  <Lock className="w-5 h-5 text-amber-400" />
                  <span>أصول وقوانين لعبة المحبوسة:</span>
                </h3>
                <p className="text-amber-100/90 leading-normal text-xs sm:text-sm">
                  المحبوسة هي لعبة استراتيجية مختلفة تماماً عن طاولة ٣١. تعتمد على مبدأ <strong>حبس قواشيط الخصم المفردة</strong>، وتتيح حرية تحريك أي قشاط من البداية دون الحاجة لانتظار وصول قشاط أول!
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#28140a] border border-[#4a2612]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-200">١. البداية وحرية تحريك القواشيط:</strong>
                    <p className="text-amber-100/80 mt-0.5">
                      يبدأ كل لاعب بـ ١٥ قشاطاً في نقطة البداية (الأبيض في الخانة ١ والأسود في الخانة المقابلة). <strong>يحق للاعب تحريك أي قشاط من البداية في أي رمية دون أي شروط مسبقة</strong> (لا يوجد قيد القشاط الأول).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#28140a] border border-[#4a2612]">
                  <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-200">٢. آلية الحبس (النزول فوق قشاط الخصم المفرد):</strong>
                    <p className="text-amber-100/80 mt-0.5">
                      إذا وُجد قشاط مفرد للخصم (بول بول) على أي خانة، يمكنك النزول عليه مباشرة بقشاطك. عند النزول، <strong>يتم حبس قشاط الخصم تحته</strong>، ويصبح عاجزاً عن الحركة تماماً طوال فترة وجود قشاطك فوقه، وتصبح الخانة ملكاً لك يمكنك إضافة المزيد من قواشيطك فوقها!
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#28140a] border border-[#4a2612]">
                  <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-200">٣. الخانات المحصنة (المقفولة):</strong>
                    <p className="text-amber-100/80 mt-0.5">
                      أي خانة تحتوي على قشاطين أو أكثر لنفس اللاعب، أو خانة يحبس فيها اللاعب قشاطاً للخصم، تُعتبر خانة محصنة ومقفولة، ولا يحق للخصم النزول عليها إطلاقاً.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#28140a] border border-amber-600/50">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-200">٤. البَفّة / الدبل (٤ نقلات كاملة):</strong>
                    <p className="text-amber-100/80 mt-0.5">
                      عند رمي رقمين متطابقين في النرد (مثل ٣-٣ أو ٥-٥ أو ٦-٦)، <strong>يحصل اللاعب على ٤ نقلات كاملة بقيمة الرقم الظاهر</strong> بدلاً من نقلتين وفق أصول اللعبة الأصلية.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#28140a] border border-amber-600/50">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-200">٥. قاعدة النرد الأكبر الإلزامية:</strong>
                    <p className="text-amber-100/80 mt-0.5">
                      في حال لم يتمكن اللاعب من لعب كلا النردين، <strong>يُجبر اللاعب على استخدام النرد الأكبر</strong> (أو مجموع النردين إن أمكن). لا يجوز لعب النرد الأصغر إذا كان ذلك يمنع استخدام النرد الأكبر!
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#28140a] border border-[#4a2612]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-200">٦. فوز الخشب الكاسح (حبس حجر البداية):</strong>
                    <p className="text-amber-100/80 mt-0.5">
                      إذا تمكن اللاعب من حبس قشاط البداية الأخير للخصم في خانة البداية قبل أن يتمكن من تحريكه، <strong>يخسر الخصم فوراً (خسارة خشب)</strong> وتُحسب المباراة فوزاً كاسحاً!
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#28140a] border border-[#4a2612]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-200">٧. شروط لم القواشيط (الخروج):</strong>
                    <p className="text-amber-100/80 mt-0.5">
                      لا يمكن البدء في لم القواشيط إلا بعد دخول جميع القواشيط الـ ١٥ في الربع الأخير. <strong>وشرط حاسم: لا يجوز لم أي قشاط إذا كان لديك قشاط واحد على الأقل محبوس في أي مكان على اللوحة!</strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TAWLA 31 RULES */}
          {tab === 'tawla31' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-[#2a170d] border border-[#4a2814]">
                <h3 className="text-sm sm:text-base font-black text-amber-300 flex items-center gap-2 mb-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>طاولة ٣١ المصرية الشعبية (الهدف ٣١ نقطة):</span>
                </h3>
                <p className="text-amber-100/80 text-xs sm:text-sm">
                  طاولة ٣١ هي أشهر ألعاب المقاهي المصرية الشعبية، تلعب بنظام النقاط التراكمية حتى ٣١ نقطة.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#28140a] border border-[#4a2612]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-200">١. القاعدة الذهبية (قيد القشاط الأول):</strong>
                    <p className="text-amber-100/80 mt-0.5">
                      لا يحق للاعب تحريك أي قشاط من الـ ١٤ قشاطاً المتبقين في البداية حتى يصل قشاطه الأول بالكامل إلى الربع الرابع (الخانات ١٨ إلى ٢٣).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#28140a] border border-[#4a2612]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-200">٢. قشاط واحد يقفل الباب:</strong>
                    <p className="text-amber-100/80 mt-0.5">
                      في طاولة ٣١، وجود قشاط واحد فقط للخصم على الخانة يجعلها مقفولة تماماً ولا يمكن النزول عليها (لا يوجد حبس أو أكل في ٣١).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#28140a] border border-[#4a2612]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-200">٣. السد التام في ربع البيت (فوز فوري بـ ١٥ نقطة):</strong>
                    <p className="text-amber-100/80 mt-0.5">
                      إذا أغلق اللاعب جميع خانات الربع الأخير للخصم قبل أن يدخل قشاطه الأول، يحرم الخصم من النزول ويفوز اللاعب فوراً بـ ١٥ نقطة كاملة.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DICE DICTIONARY */}
          {tab === 'dice' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-[#2a170d] border border-[#4a2814]">
                <h3 className="text-sm sm:text-base font-black text-amber-300 mb-1">
                  قاموس ومصطلحات أسماء الزهر المصرية الفارسية:
                </h3>
                <p className="text-amber-100/70 text-xs">
                  الأسماء التراثية المتداولة بين حريفة الطاولة في مصر والعالم العربي:
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(DIE_NAMES).map(([val, name]) => (
                  <div key={val} className="p-2.5 rounded-lg bg-[#28140a] border border-[#4a2612] flex items-center justify-between">
                    <span className="font-mono font-bold text-amber-400">زهرة ({val}):</span>
                    <span className="font-bold text-amber-100">{name}</span>
                  </div>
                ))}
              </div>

              <h4 className="font-bold text-amber-300 text-sm mt-3">أسماء الدبول (الأرقام المتطابقة):</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(DOUBLE_NAMES).map(([key, name]) => (
                  <div key={key} className="p-2.5 rounded-lg bg-[#28140a] border border-[#4a2612] flex items-center justify-between">
                    <span className="font-mono text-xs text-amber-400">({key}):</span>
                    <span className="font-bold text-amber-100 text-xs">{name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#1a0e06] border-t border-[#4d2d17] flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-amber-700 hover:bg-amber-600 text-white font-bold text-xs cursor-pointer transition-all shadow"
          >
            فهمت القواعد، يلا نلعب!
          </button>
        </div>
      </div>
    </div>
  );
};
