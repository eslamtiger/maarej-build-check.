// Demo profile content (contact, intro words, branches, teacher reviews) until owners fill their own pages.
// Contact uses reserved example domains and a placeholder number, so nothing reaches a real person.
import type {CenterDTO} from '../types/place';
import type {TeacherSearchDTO} from '../types/teacher';
import type {ContactInfo,Review,ReviewRole} from '../components/profile-kit';

const slug=(id:string)=>{const x=id.replace(/[^a-z0-9]/gi,'').toLowerCase();return x.startsWith('tch')?`t${x.slice(-5)}`:x;};
// Placeholder number (not a real line) and reserved example domains.
export function demoContact(id:string):ContactInfo{
 const s=slug(id);
 return {phone:'+201000000000',whatsapp:'201000000000',email:`hello@${s}.example`,website:`https://${s}.example.com`,
  facebook:`https://example.com/facebook/${s}`,x:`https://example.com/x/${s}`,instagram:`https://example.com/instagram/${s}`,youtube:`https://example.com/youtube/${s}`};
}

const hash=(s:string)=>[...s].reduce((h,ch)=>(h*31+ch.charCodeAt(0))%9973,7);
const otherAreas=['الدقي','مدينة نصر','المعادي','6 أكتوبر','التجمع الخامس','الشيخ زايد','مصر الجديدة','الهرم'];
export function demoBranches(c:CenterDTO){const h=hash(c.id);if(h%3===0)return [];const n=1+(h%2);return otherAreas.filter(a=>a!==c.area).slice(h%4,h%4+n);}

export function managerNote(c:CenterDTO){
 return {who:`مدير ${c.name}`,role:'كلمة من الإدارة',text:`أهلًا بيكم في ${c.name}. هدفنا إن كل طالب يلاقي قاعة مريحة ومدرس شاطر في مكان قريب منه، وكل قاعة عندنا متجهزة عشان الحصة تمشي من غير ما حاجة تشغلكم.`};
}

const teacherReviewText:Record<ReviewRole,string[]>={
 students:['شرحه بسيط وبيرجع للنقطة لحد ما نفهمها.','الحصص منظمة والواجبات بتتصحح بسرعة.','بقيت أحب المادة بسببه.'],
 parents:['بيتابع مع ابني أول بأول وبيبعتلنا مستواه.','ملتزم بالمواعيد وبيهتم بكل طالب.'],
 teachers:['زميل محترم وبيشارك أفكار حلوة للمراجعات.'],
 centers:['ملتزم بالقاعة والمواعيد، والطلاب بيحبوه.'],
};
const firstNames=['أحمد','مريم','يوسف','سلمى','عمر','نور','كريم','هنا'];
export function demoTeacherReviews(t:TeacherSearchDTO){
 const h=hash(t.id),base=t.rating??4.5,out:Partial<Record<ReviewRole,Review[]>>={};
 (Object.keys(teacherReviewText) as ReviewRole[]).forEach((role,ri)=>{
  out[role]=teacherReviewText[role].slice(0,role==='students'?3:role==='parents'?2:1).map((text,i)=>({name:role==='centers'?'سنتر شريك':`${role==='parents'?'ولي أمر':role==='teachers'?'أ.':''} ${firstNames[(h+ri*3+i)%firstNames.length]}`.trim(),rating:Math.min(5,Math.max(3.5,Math.round((base+((h+i+ri)%5-2)*.15)*10)/10)),text}));
 });
 return out;
}

// Teacher's tips for students (demo until teachers write their own): two general + two picked by the teacher's id.
const tipPool=[
 {mark:'✅',spark:'😉',title:'لخّص بإيدك',text:'بعد كل حصة اكتب أهم 3 نقط في ورقة واحدة، وراجعها قبل الحصة الجاية.'},
 {mark:'😄',spark:'✔️',title:'مذاكرة قصيرة كل يوم',text:'نص ساعة كل يوم أحسن من 4 ساعات يوم الامتحان.'},
 {mark:'❓',spark:'😊',title:'اسأل من غير كسوف',text:'لو حاجة مش واضحة قولها في الحصة أو ابعتها رسالة. مفيش سؤال وحش.'},
 {mark:'😎',spark:'✔️',title:'حل امتحانات قديمة',text:'حل امتحان كامل كل أسبوع في وقته، وبعدين صحّح لنفسك.'},
 {mark:'😴',spark:'😉',title:'نام كويس',text:'النوم بيثبّت اللي ذاكرته. متسهرش ليلة الامتحان.'},
 {mark:'💯',spark:'😄',title:'حط هدف صغير',text:'قسّم الباب لأجزاء، وكل يوم خلّص جزء واحد بس.'},
];
export function demoTeacherTips(t:Pick<TeacherSearchDTO,'id'>){const h=hash(t.id);return [tipPool[0],tipPool[1],tipPool[2+(h%4)],tipPool[2+((h+1)%4)]];}

// One colour per teacher / center in timetables, so groups are easy to tell apart.
export const swatches=[
 {bg:'#EEEBFF',fg:'#3328A8',bd:'#C9C2F5'},{bg:'#E3F6EC',fg:'#0E6A4B',bd:'#9ED9BC'},{bg:'#FFF1D6',fg:'#7A4A00',bd:'#F6CF8A'},
 {bg:'#FDE8EF',fg:'#9B1C4A',bd:'#F2A9C0'},{bg:'#E2F1FB',fg:'#165E96',bd:'#9CCBEE'},{bg:'#EAF7E1',fg:'#3F6B12',bd:'#B6DE98'},
 {bg:'#F3E8FF',fg:'#6B21A8',bd:'#D4B4F6'},{bg:'#E6F7F8',fg:'#0F6670',bd:'#9ED8DD'},
] as const;
export const swatchFor=(key:string,order:readonly string[])=>swatches[Math.max(0,order.indexOf(key))%swatches.length];

const spaceReviewText:Partial<Record<ReviewRole,string[]>>={
 students:['المكان هادي ومناسب للمذاكرة لساعات.','النت سريع والكراسي مريحة.','الجاردن تحفة وقت البريك.'],
 parents:['مكان آمن ومنظم، وبنطمن على الولاد فيه.'],
};
export function demoPlaceReviews(id:string,rating:number){
 const h=hash(id),out:Partial<Record<ReviewRole,Review[]>>={};
 (Object.keys(spaceReviewText) as ReviewRole[]).forEach((role,ri)=>{out[role]=spaceReviewText[role]!.map((text,i)=>({name:role==='parents'?`ولي أمر ${firstNames[(h+i)%firstNames.length]}`:firstNames[(h+ri*3+i)%firstNames.length],rating:Math.min(5,Math.max(3.5,Math.round((rating+((h+i)%5-2)*.15)*10)/10)),text}));});
 return out;
}
