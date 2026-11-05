export const studentDemo = {
  identity: { name: "يوسف أحمد", stage: "الصف الأول الثانوي" },
  home: {
    date: "الأحد، 28 سبتمبر",
    nextSession: { title: "مجموعة التفوق · رياضيات", teacher: "أ. أحمد سالم", place: "سنتر النخبة", time: "4:30 م" },
    urgentHomework: { title: "واجب الجبر يستحق اليوم", meta: "5 مسائل · متبقي 3 مسائل", due: "8:00 م" },
    weeklyProgress: { overall: 78, attendance: 92, tasksDone: 8, tasksTotal: 10, streakDays: 6 },
    mission: { title: "حافظ على انتظامك هذا الأسبوع", remaining: "متبقي يومان على نهاية المهمة" },
  },
  learning: {
    summary: { groups: 3, homework: 2, exams: 1 },
    groups: [
      { subject: "رياضيات", name: "مجموعة التفوق", teacher: "أ. أحمد سالم", location: "سنتر النخبة", next: "اليوم · 4:30 م", progress: 68, status: "نشط" },
      { subject: "فيزياء", name: "أساسيات الفيزياء", teacher: "أ. خالد محمود", location: "أونلاين", next: "الأحد · 7:00 م", progress: 54, status: "نشط" },
      { subject: "اللغة العربية", name: "لغة وتعبير", teacher: "أ. منى عادل", location: "سنتر النخبة", next: "الإثنين · 5:00 م", progress: 81, status: "نشط" },
    ],
    homework: [
      { title: "تدريبات الجبر · الدرس 4", subject: "رياضيات", due: "اليوم 8:00 م", status: "مطلوب" },
      { title: "ورقة مسائل الحركة", subject: "فيزياء", due: "غدًا 6:00 م", status: "مطلوب" },
      { title: "تعبير: أثر القراءة", subject: "اللغة العربية", due: "تم التسليم أمس", status: "تم التسليم" },
      { title: "مراجعة المعادلات", subject: "رياضيات", due: "راجعه المدرس", status: "تمت المراجعة" },
      { title: "ورقة تطبيقات الحركة", subject: "فيزياء", due: "تأخر موعد التسليم", status: "متأخر" },
    ],
    exams: {
      upcoming: [{ name: "اختبار الوحدة الثانية", subject: "فيزياء", date: "الأحد 4 أكتوبر", time: "6:00 م" }],
      previous: [{ name: "اختبار الجبر القصير", subject: "رياضيات", date: "24 سبتمبر", score: "8/10", status: "النتيجة منشورة" }],
    },
    teachers: [
      { name: "أ. أحمد سالم", subject: "رياضيات", group: "مجموعة التفوق", rating: 4.9 },
      { name: "أ. خالد محمود", subject: "فيزياء", group: "أساسيات الفيزياء", rating: 4.8 },
      { name: "أ. منى عادل", subject: "اللغة العربية", group: "لغة وتعبير", rating: 4.9 },
    ],
    materials: [
      { name: "ملخص الوحدة الأولى", type: "PDF", subject: "رياضيات", meta: "12 صفحة" },
      { name: "بنك أسئلة الحركة", type: "Question bank", subject: "فيزياء", meta: "35 سؤالًا" },
      { name: "مراجعة التعبير", type: "Review", subject: "اللغة العربية", meta: "آخر تحديث اليوم" },
    ],

  },
  journey: {
    growth: [
      ["التعلم", "قوي"], ["الالتزام", "ممتاز"], ["التعاون", "جيد"],
      ["الشخصية", "يتطور"], ["النشاط", "جيد"], ["المبادرة", "يتطور"],
    ] as const,
    mission: { track: "الالتزام", title: "حافظ على حضورك المنتظم", context: "مجموعة التفوق · الرياضيات", value: 80, progressText: "4 / 5", remaining: "احضر الحصة الجاية وتكمّل المهمة." },
    badges: [
      { name: "ملتزم", meta: "حضور منتظم · مكتسبة", state: "earned", meaning: "حضرت بانتظام وتابعت واجباتك طول الفترة.", source: "النظام", earnedDate: "25 سبتمبر", how: "حافظ على حضورك في مواعيدك طول الفترة." },
      { name: "مفكر الحصة", meta: "من أ. أحمد · مكتسبة", state: "earned", meaning: "مدرسك شاف منك مشاركة مميزة وطريقة تفكير حلوة في الحصة.", source: "أ. أحمد سالم", earnedDate: "1 أكتوبر", how: "المدرس بيديها لما يشوف مشاركة مميزة في المجموعة." },
      { name: "مبادر", meta: "بتقرّب منها", state: "progress", meaning: "إنك تبدأ من نفسك وتعمل أكتر من المطلوب منك.", source: "النظام", earnedDate: null, how: "شارك في الحصة من نفسك، وخد مهام زيادة لما تكون متاحة." },
      { name: "متعاون", meta: "لسه مقفولة", state: "locked", meaning: "إنك تساعد زمايلك وتشتغل معاهم في المجموعة.", source: "النظام", earnedDate: null, how: "بتتفتح لما تساعد زميل أو تشارك في شغل جماعي." },
    ],
    recognition: [
      { title: "أ. أحمد منحك «مفكر الحصة»", meta: "اليوم · مجموعة التفوق" },
      { title: "ولي الأمر أشاد بالتزامك", meta: "أمس · الحضور الأسبوعي" },
    ],
    reward: { amount: 200, title: "مكافأة انتظام الحضور", funder: "ولي الأمر", condition: "حافظ على حضور 90% حتى نهاية الشهر", progress: 92, status: "ممولة ومحجوزة" },
  },
  schedule: {
    selectedDate: "2026-10-02",
    days: [
      { iso: "2026-10-02", day: "الجمعة", number: 2 },
      { iso: "2026-10-03", day: "السبت", number: 3 },
      { iso: "2026-10-04", day: "الأحد", number: 4 },
      { iso: "2026-10-05", day: "الإثنين", number: 5 },
      { iso: "2026-10-06", day: "الثلاثاء", number: 6 },
    ],
    events: [
      { id: "session-math", time: "4:30 م", type: "حصة", tone: "blue", title: "رياضيات · مجموعة التفوق", meta: "أ. أحمد سالم · سنتر النخبة", detail: "حصة المجموعة المجدولة لليوم.", cta: "فتح المجموعة", href: "/student/learning" },
      { id: "homework-algebra", time: "7:00 م", type: "تسليم واجب", tone: "rose", title: "واجب الجبر · الدرس 4", meta: "آخر موعد للتسليم اليوم", detail: "أكمل الواجب قبل موعد التسليم.", cta: "فتح الواجب", href: "/student/learning" },
      { id: "review-physics", time: "8:30 م", type: "مراجعة", tone: "amber", title: "مراجعة اختبار الفيزياء", meta: "اختبار الأحد · 6:00 م", detail: "مراجعة شخصية قبل الاختبار القادم.", cta: "عرض الاختبارات", href: "/student/learning" },
    ],
  },
  notifications: [
    { title: "تم تأكيد دفع مجموعة الرياضيات", context: "مجموعة التفوق", time: "منذ 20 دقيقة", unread: true, href: "/student/finance" },
    { title: "تم تمويل مكافأة جديدة", context: "انتظام الحضور", time: "منذ ساعتين", unread: true, href: "/student/rewards/attendance" },
    { title: "طلب السحب بانتظار موافقة ولي الأمر", context: "500 ج.م", time: "أمس", unread: false, href: "/student/finance" },
    { title: "لديك واجب يستحق اليوم", context: "رياضيات · واجب الجبر", time: "اليوم", unread: true, href: "/student/learning" },
  ],
  plans: {
    pricingVersionId: "pricing-version-from-backend",
    currentPlan: "الخطة الحالية",
    billingCycleToggleSupported: true,
    prices: null as null | Record<string, number>,
  },
  finance: {
    available: 1240,
    heldRewards: 200,
    transactions: [
      { title: "مجموعة التفوق", context: "أ. أحمد سالم", date: "27 سبتمبر", amount: -360, status: "مؤكد" },
      { title: "إضافة رصيد", context: "بطاقة دفع", date: "25 سبتمبر", amount: 1000, status: "مؤكد" },
      { title: "مكافأة انتظام الحضور", context: "من ولي الأمر", date: "24 سبتمبر", amount: 200, status: "محجوزة" },
    ],
  },
} as const;
