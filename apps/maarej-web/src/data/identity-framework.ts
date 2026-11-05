// Maarej identity framework: the single place for identity names, stages and growth domains.
// Source: «The Brief — Gamification & Identity v0.1» (30 Oct 2026), sections 4–6.
// Status: structure is approved in principle; names are proposed and every promotion
// requirement is still being written. `requirements: null` renders as «الشروط قيد الإعداد».
// When the rules are approved, fill `requirements` here; the UI needs no change.

export type FrameworkStatus = "proposed" | "approved";
export type IdentityDefinition = {
  id: string;
  order: number;
  name: string;
  question: string;
  focus: string;
  requirements: string[] | null;
};
export type IdentityStageDefinition = { id: "foundation" | "practice" | "mastery"; name: string; meaning: string; requirements: string[] | null };
export type GrowthDomainDefinition = { id: string; name: string; builds: string; optional?: boolean };

export const identityFrameworkStatus: { names: FrameworkStatus; requirements: FrameworkStatus } = { names: "proposed", requirements: "proposed" };

export const identityDefinitions: readonly IdentityDefinition[] = [
  { id: "explorer", order: 1, name: "المستكشف", question: "أنا مين؟ وإيه اللي أقدر أتعلمه؟", focus: "الفضول، والوعي بنفسك، والتجربة، وطلب المساعدة", requirements: null },
  { id: "learner", order: 2, name: "المتعلم", question: "إزاي أتعلم وأتحسن؟", focus: "إنك تستفيد من الملاحظات، وتجرب طرق مذاكرة، وتقبل التحدي", requirements: null },
  { id: "organizer", order: 3, name: "المنظّم", question: "أقدر أدير نفسي؟", focus: "التخطيط، والتركيز، وإدارة الوقت، وترتيب الأولويات", requirements: null },
  { id: "responsible", order: 4, name: "المسؤول", question: "ينفع حد يعتمد عليّ؟", focus: "الوفاء بالالتزام، والصدق، وتحمّل النتيجة", requirements: null },
  { id: "initiator", order: 5, name: "المبادر", question: "بابدأ من نفسي؟", focus: "إنك تختار وتقرر وتكتشف المشكلة وتبدأ من غير ما حد يقولك", requirements: null },
  { id: "contributor", order: 6, name: "المساهم", question: "بضيف قيمة للناس؟", focus: "التعاون، والتعاطف، ومساعدة غيرك، والشغل الجماعي", requirements: null },
  { id: "impact-maker", order: 7, name: "صانع الأثر", question: "إيه اللي عايز أضيفه للعالم؟", focus: "هدف ليه معنى، ومشروع ممتد، وأثر أكبر منك", requirements: null },
];

export const identityStages: readonly IdentityStageDefinition[] = [
  { id: "foundation", name: "التأسيس", meaning: "بتفهم السلوك وبتجربه، ولسه محتاج تذكير ودعم", requirements: null },
  { id: "practice", name: "الممارسة", meaning: "بتطبقه بنفسك في أكتر من موقف", requirements: null },
  { id: "mastery", name: "الثبات", meaning: "بقى جزء منك وبيظهر في مواقف مختلفة على مدار الوقت", requirements: null },
];

// Areas of the student's life the identity is built from (brief §6).
export const growthDomains: readonly GrowthDomainDefinition[] = [
  { id: "mind", name: "التعلم والتفكير", builds: "الفضول، والتفكير، وحل المشكلات" },
  { id: "self-management", name: "إدارة نفسك", builds: "التخطيط، والتركيز، وإدارة الوقت" },
  { id: "persistence", name: "المثابرة", builds: "الاستمرار، والتعلم من الغلط، وتغيير الطريقة" },
  { id: "values", name: "المسؤولية والقيم", builds: "الالتزام، والصدق، والوفاء بالوعد" },
  { id: "emotions", name: "الوعي بمشاعرك", builds: "إنك تفهم مشاعرك وتعبّر عنها وتتحكم فيها" },
  { id: "relationships", name: "العلاقات والتعاون", builds: "التعاطف، والتواصل، والشغل مع الفريق" },
  { id: "agency", name: "الاستقلال", builds: "الاختيار، والقرار، والمبادرة" },
  { id: "purpose", name: "الهدف والأثر", builds: "معنى لِلّي بتعمله، وخدمة غيرك" },
  { id: "wellbeing", name: "الصحة والنشاط", builds: "نشاط يناسب قدرتك، ومش شرط للترقية", optional: true },
];

export function identityIndexByName(name?: string | null) {
  return name ? identityDefinitions.findIndex(item => item.name === name) : -1;
}
export function stageIndexByName(name?: string | null) {
  return name ? identityStages.findIndex(item => item.name === name) : -1;
}
