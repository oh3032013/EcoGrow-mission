import { BookOpen, Cpu, Crown, Film, Gamepad2, Globe, Users, X } from 'lucide-react';
import { UI_TEXT, type Language } from '../game/i18n';

interface TeamMember {
  num: number;
  name: string;
  role: string;
  arDesc: string;
  enDesc: string;
  icon: typeof Crown;
}

const TEAM_MEMBERS: TeamMember[] = [
  {
    num: 1,
    name: 'Alhoda',
    role: 'Team Leader & Scientific Researcher',
    arDesc:
      'قيادة الفريق، البحث العلمي، تحليل التحدي، تطوير الفكرة والحل الابتكاري، وضع منهجية العمل، والإشراف على تكامل أجزاء المشروع.',
    enDesc:
      'Team leadership, scientific research, challenge analysis, innovative solution design, methodology planning, and overseeing project integration.',
    icon: Crown,
  },
  {
    num: 2,
    name: 'Olfat',
    role: 'Research Coordinator',
    arDesc:
      'تنسيق الجانب البحثي، جمع المصادر والمعلومات العلمية، إجراء الأبحاث المساندة، وتحليل المعلومات وتوثيقها.',
    enDesc:
      'Coordinating research workflows, gathering scientific sources, conducting supporting studies, and analyzing and documenting findings.',
    icon: BookOpen,
  },
  {
    num: 3,
    name: 'Omar',
    role: 'Game Developer',
    arDesc:
      'تصميم وتطوير الألعاب والعناصر التفاعلية داخل المشروع وتحسين تجربة المستخدم.',
    enDesc:
      'Designing and developing interactive gameplay mechanics and enhancing overall player experience.',
    icon: Gamepad2,
  },
  {
    num: 4,
    name: 'Momen',
    role: 'Web Developer',
    arDesc:
      'تطوير وبرمجة الموقع الإلكتروني، بناء وظائف المنصة، وربط مكونات المشروع التقنية.',
    enDesc:
      'Developing the web platform, implementing core web functionality, and integrating technical project components.',
    icon: Globe,
  },
  {
    num: 5,
    name: 'Youssef',
    role: 'Hardware Developer',
    arDesc:
      'البحث والتطوير في مجال الهاردوير، ودراسة الحلول الإلكترونية وإمكانية دمجها مع المنظومة.',
    enDesc:
      'Hardware R&D, evaluating electronic sensing/control solutions, and studying system integration.',
    icon: Cpu,
  },
  {
    num: 6,
    name: 'Hana',
    role: 'Video Editor',
    arDesc:
      'مونتاج الفيديوهات، إعداد المحتوى المرئي، وتجهيز الفيديو التعريفي والعرض البصري للمشروع.',
    enDesc:
      'Video editing, visual storytelling, and producing the project introduction and showcase presentation.',
    icon: Film,
  },
];

interface TeamModalProps {
  lang: Language;
  onClose: () => void;
}

export function TeamModal({ lang, onClose }: TeamModalProps) {
  const t = UI_TEXT[lang];

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-3 sm:p-5 bg-black/70 pointer-events-auto"
      role="dialog"
      aria-modal="true"
      aria-label={t.teamTitle}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="parchment-panel rounded-xl w-full max-w-3xl max-h-[88vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b-2 border-[#c9b086] bg-[#ebd8b5]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-[#169c4f] text-white flex items-center justify-center border-2 border-[#0e5c2e] shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="font-display text-lg sm:text-2xl font-bold text-[#2c1e14] truncate">
                {t.teamTitle}
              </h2>
              <p className="text-xs text-[#694d36] truncate">{t.teamSubtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Team List"
            className="wood-button p-1.5 rounded cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Team Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {TEAM_MEMBERS.map((member) => {
            const Icon = member.icon;
            return (
              <div
                key={member.name}
                className="p-3.5 rounded-xl bg-[#fbf2e1] border-2 border-[#d6be96] flex flex-col gap-2"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#3d7a47] text-[#fdf3dc] flex items-center justify-center font-mono-tabular font-bold text-sm border border-[#244e2b] shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1" dir="ltr">
                    <div className="flex items-center gap-2">
                      <span className="font-mono-tabular text-xs font-bold px-1.5 py-0.5 rounded bg-[#e8d5b0] text-[#5c4028]">
                        {member.num}
                      </span>
                      <h3 className="font-display font-bold text-base text-[#2c1e14] truncate">
                        {member.name}
                      </h3>
                    </div>
                    <div className="text-xs font-semibold text-[#2a6e39] truncate">
                      {member.role}
                    </div>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-[#4a3322] leading-relaxed">
                  {lang === 'ar' ? member.arDesc : member.enDesc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
