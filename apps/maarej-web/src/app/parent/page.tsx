import { ArrowLeft, Sparkles } from "lucide-react";
import { ActivityCard, Identity, MaarejButton, ProgressBar, RecognitionCard, ScheduleItem, SectionHeader, VisualPanel } from "@maarej/ui";
import { ExperienceShell } from "@/components/ExperienceShell";

export default function ParentShellPage() {
  return <ExperienceShell experience="parent" active="home">
    <div className="shell-topline"><span className="version-pill"><Sparkles size={14}/> V1.00 · Parent Shell</span><span className="context-label">Clarity & Intervention</span></div>
    <VisualPanel className="hero-panel"><Identity name="أحمد يوسف" role="ولي أمر"/><div className="hero-grid"><div className="hero-copy"><span className="m-eyebrow">OVERVIEW</span><h1>اعرف بسرعة: يوسف عامل إيه؟</h1><p>نفس بيانات الطالب، لكن الترجمة هنا إدارية وطمأنة ومتابعة: تحسن، التزام، درجات، حضور، ملاحظات، القادم، وما إذا كان هناك شيء يحتاج تدخل ولي الأمر.</p><div className="hero-actions"><MaarejButton>عرض متابعة يوسف</MaarejButton><MaarejButton variant="secondary">تبديل الابن</MaarejButton></div></div><div className="focus-card"><div><small>Weekly signal</small><h3>أسبوع مستقر ويتحسن</h3><p>الالتزام جيد، وهناك تقدم واضح في الرياضيات. يحتاج مراجعة قصيرة لموعد واجب الفيزياء.</p></div><div className="focus-card__meta"><span>آخر تحديث اليوم</span><span>يوسف · أولى ثانوي</span></div></div></div></VisualPanel>
    <div className="content-grid">
      <div className="stack">
        <VisualPanel className="card-pad"><SectionHeader eyebrow="THIS WEEK" title="الصورة السريعة"/><div className="parent-signal-grid"><div className="signal-card"><small>الحضور</small><strong>92%</strong><em>مستقر</em></div><div className="signal-card"><small>المهام</small><strong>8 / 9</strong><em>جيد</em></div><div className="signal-card"><small>متوسط الدرجات</small><strong>84%</strong><em>+6% هذا الأسبوع</em></div><div className="signal-card"><small>التفاعل</small><strong>جيد</strong><em>2 Recognition</em></div></div></VisualPanel>
        <VisualPanel className="card-pad"><SectionHeader eyebrow="TEACHER SIGNAL" title="ماذا قال المدرسون؟"/><RecognitionCard title="تحسن في طريقة الحل" body="بدأ يوسف يكتب خطوات الحل بشكل أوضح ويشارك في مناقشة المسائل." by="أ. خالد محمود"/></VisualPanel>
        <VisualPanel className="card-pad"><SectionHeader eyebrow="UPCOMING" title="القادم" action={<MaarejButton variant="ghost">فتح الجدول <ArrowLeft size={16}/></MaarejButton>}/><div className="stack"><ScheduleItem emphasized time="غدًا 05:30 م" title="حصة رياضيات" meta="مجموعة التفوق · سنتر الرواد"/><ScheduleItem time="غدًا 08:00 م" title="موعد تسليم واجب الفيزياء" meta="المهمة لم تكتمل بعد"/></div></VisualPanel>
      </div>
      <div className="stack">
        <VisualPanel className="card-pad"><SectionHeader eyebrow="PROGRESS" title="اتجاه التقدم"/><ProgressBar value={78} label="التعلم"/><div className="m-spacer-3"/><ProgressBar value={91} label="الالتزام"/><div className="m-spacer-3"/><ProgressBar value={69} label="التعاون"/><div className="m-spacer-3"/><ProgressBar value={73} label="المبادرة"/></VisualPanel>
        <div className="attention-card"><small>NEEDS ATTENTION</small><h3>متابعة واجب الفيزياء</h3><p>لم يُسلّم بعد وموعده غدًا. هذه إشارة متابعة وليست Gamification لولي الأمر.</p></div>
        <VisualPanel className="card-pad"><SectionHeader eyebrow="RECENT" title="آخر النشاط"/><ActivityCard title="Recognition جديد من مدرس الرياضيات" meta="منذ 3 ساعات" tone="amber"/><ActivityCard title="اكتمل اختبار كيمياء" meta="النتيجة 17/20" tone="mint"/><ActivityCard title="حضور مجموعة اللغة العربية" meta="أمس · منتظم"/></VisualPanel>
      </div>
    </div>
  </ExperienceShell>;
}
