import { studentDemo } from "./student-v101";

// Presentation-only seed/config for V1.02. It does not alter the product data model.
export const studentV102View = {
  home: {
    dailyMission: {
      title: studentDemo.home.urgentHomework.title,
      due: studentDemo.home.urgentHomework.due,
      completed: 2,
      total: 5,
      progress: 40,
      href: "/student/learning",
    },
    nextAchievement: {
      name: "مبادر",
      hint: "استمر في المبادرات المؤهلة داخل أنشطتك",
      state: "progress" as const,
    },
  },
  growthTracks: [
    { key: "learning", label: "التعلم", value: 78, why: "إنجاز 8 من 10 مهام هذا الأسبوع.", lastRecognition: "استمر تقدمك الأكاديمي خلال الأسبوع.", next: "أكمل المهام المتبقية في مجموعاتك." },
    { key: "commitment", label: "الالتزام", value: 92, why: "انتظام الحضور هو أقوى إشارة لديك هذا الأسبوع.", lastRecognition: "ولي الأمر أشاد بالتزامك بالحضور.", next: "حافظ على حضور الحصة القادمة." },
    { key: "cooperation", label: "التعاون", value: 65, why: "لديك نشاط مسجل داخل سياق المجموعة.", lastRecognition: "لا يوجد تقدير جديد في هذا المسار حاليًا.", next: "استمر في المشاركة داخل المجموعة عندما توجد فرصة مؤهلة." },
    { key: "character", label: "الشخصية", value: 70, why: "المسار يتحسن وفق نشاطك الحالي.", lastRecognition: "لا يوجد تقدير جديد في هذا المسار حاليًا.", next: "استمر في السلوكيات المعتمدة المرتبطة بهذا المسار." },
    { key: "activity", label: "النشاط", value: 54, why: "هناك مساحة أكبر للنشاط خلال الفترة الحالية.", lastRecognition: "لا يوجد تقدير جديد في هذا المسار حاليًا.", next: "شارك في نشاط مؤهل عندما يظهر داخل مجموعتك." },
    { key: "initiative", label: "المبادرة", value: 61, why: "شارة «مبادر» ما زالت قيد التقدم.", lastRecognition: "تقدمك في المبادرة مستمر.", next: "استمر في المبادرات المؤهلة داخل أنشطتك المعتمدة." },
  ],
  newAchievement: {
    id: "thinker-session-2026-09-28",
    title: "مفكر الحصة",
    body: "منحك أ. أحمد تقديرًا لمشاركة مميزة وطريقة تفكير لافتة أثناء الحصة.",
    track: "التعلم",
    href: "/student/journey",
  },
  badges: {
    "ملتزم": { icon: "shield", track: "الالتزام", progress: 100 },
    "مفكر الحصة": { icon: "lightbulb", track: "التعلم", progress: 100, newlyUnlocked: true },
    "مبادر": { icon: "rocket", track: "المبادرة", progress: 61 },
    "متعاون": { icon: "handshake", track: "التعاون", progress: 0 },
  } as const,
  groupAttention: {
    "مجموعة التفوق": "واجب اليوم",
    "أساسيات الفيزياء": "اختبار غدًا",
  } as Record<string,string>,
} as const;
