// Parent area demo: one parent with three children at three different stages. Each child's groups are real demo
// groups from the weekly timetable (same teachers, centers, prices), so links open the real profiles.
// Grades, attendance, upbringing notes, wallet balances and transfers are illustrative only:
// no real money, and no fees or commissions are shown (none are approved).
import {sessions,teacherById,centerById,hasProfile} from './schedule';
import type {Session} from './schedule';
import {identityDefinitions,identityStages,growthDomains} from '../../data/identity-framework';

export type Exam={name:string;score:number;of:number;date:string};
export type SubjectRecord={subject:string;teacherId:string;centerId:string;session:Session;score:number;trend:number;
 attendance:{present:number;absent:number;late:number};homework:{done:number;total:number};exams:Exam[];note:string};
export type Payment={id:string;childId:string;month:string;subject:string;teacher:string;center:string;amount:number;status:'paid'|'due'|'late';payer:'parent'|'child';date:string};
export type LedgerItem={id:string;kind:'topup'|'toChild'|'payment';amount:number;childId?:string;label:string;date:string};
export type Domain={id:string;name:string;level:number;note:string};
export type Child={id:string;name:string;initial:string;stage:'ابتدائي'|'إعدادي'|'ثانوي';grade:string;school:string;
 subjects:SubjectRecord[];yearTrend:{label:string;score:number}[];
 identity:{name:string;stage:string;next:string;steps:number;of:number};
 domains:Domain[];strengths:string[];watch:string[];habits:{label:string;value:number}[];activities:{name:string;note:string}[];
 recognitions:{from:string;text:string;date:string}[];wallet:number;payments:Payment[]};

const h=(s:string)=>{let x=2166136261;for(const c of s){x^=c.charCodeAt(0);x=Math.imul(x,16777619);}return x>>>0;};
// Subjects that make sense for each stage.
const stageSubjects:Record<string,RegExp>={'ابتدائي':/العربية|الإنجليزية|الرياضيات|العلوم|الدراسات/,'إعدادي':/العربية|الإنجليزية|الرياضيات|العلوم|الدراسات|الحاسب/,'ثانوي':/العربية|الإنجليزية|الرياضيات|الفيزياء|الكيمياء|الأحياء|التاريخ|الجغرافيا/};
// Up to 5 groups for the child's stage, one per subject, not overlapping in the week.
function groupsFor(stage:string,seed:string){
 const pool=sessions.filter(s=>s.status==='booked'&&s.stage===stage&&s.enrolled<s.capacity&&hasProfile(s.teacherId)&&stageSubjects[stage].test(s.subject));
 const picked:Session[]=[],subjects=new Set<string>(),slots=new Set<string>();
 for(const s of [...pool].sort((a,b)=>h(seed+a.id)-h(seed+b.id))){if(picked.length>=5)break;if(subjects.has(s.subject)||[...Array(s.dur)].some((_,k)=>slots.has(`${s.day}:${s.start+k}`)))continue;
  picked.push(s);subjects.add(s.subject);for(let k=0;k<s.dur;k++)slots.add(`${s.day}:${s.start+k}`);}
 return picked.sort((a,b)=>a.day-b.day||a.start-b.start);
}
const notes=['بيشارك كويس في الحصة ومحتاج يركّز في المسائل الطويلة.','مستواه ثابت، وأحسن لو راجع قبل الاختبار بيومين.','اتحسّن الشهر ده، خصوصًا في الواجبات.','محتاج يسأل أكتر لما حاجة مش واضحة.','منظّم في كراسته وبيسلّم في الميعاد.'];
const yearLabels=['فبراير','مارس','أبريل','مايو','سبتمبر','أكتوبر','نوفمبر'];
const months=['نوفمبر','أكتوبر','سبتمبر'];

function build(id:string,name:string,stage:Child['stage'],grade:string,school:string,identityIdx:number,stageIdx:number,base:number,wallet:number):Child{
 const r=h(id),groups=groupsFor(stage,id);
 const subjects:SubjectRecord[]=groups.map((g,i)=>{const score=Math.min(97,base+((r>>i)%14)-5),trend=((r>>(i+3))%9)-3,absent=(r>>(i+1))%3;
  return {subject:g.subject,teacherId:g.teacherId,centerId:g.centerId,session:g,score,trend,attendance:{present:9-absent,absent,late:(r>>(i+2))%2},homework:{done:5+((r>>i)%3),total:8},
   exams:[{name:'اختبار سبتمبر',score:Math.round((score-trend-4)/5),of:20,date:'28/9'},{name:'اختبار أكتوبر',score:Math.round((score-trend)/5),of:20,date:'26/10'},{name:'تقييم نوفمبر',score:Math.round(score/5),of:20,date:'4/11'}],
   note:notes[(r>>i)%notes.length]};});
 const payments:Payment[]=groups.flatMap((g,i)=>{const t=teacherById(g.teacherId);return months.map((m,j)=>({id:`${g.id}-${j}`,childId:id,month:m,subject:g.subject,teacher:t?.name??'',center:centerById(g.centerId)?.name??'',amount:g.price*4,
  status:(j>0?'paid':(r>>i)%3===0?'late':'due') as Payment['status'],payer:((r>>(i+j))%3===0?'child':'parent') as Payment['payer'],date:j>0?`${3+i}/${11-j}`:''}));});
 const idDef=identityDefinitions[identityIdx],nextDef=identityDefinitions[identityIdx+1];
 const domains=growthDomains.filter(d=>!d.optional).slice(0,6).map((d,i)=>({id:d.id,name:d.name,level:2+((r>>(i*2))%3),note:d.builds}));
 const best=[...domains].sort((a,b)=>b.level-a.level),weak=[...domains].sort((a,b)=>a.level-b.level);
 return {id,name,initial:name.charAt(0),stage,grade,school,subjects,
  yearTrend:yearLabels.map((label,i)=>({label,score:Math.min(96,base-7+Math.round(i*1.6)+((r>>i)%6)-2)})),
  identity:{name:idDef.name,stage:identityStages[stageIdx].name,next:stageIdx<2?identityStages[stageIdx+1].name:nextDef?.name??'',steps:2+(r%3),of:5},
  domains,strengths:best.slice(0,2).map(d=>d.name),watch:weak.slice(0,1).map(d=>d.name),
  habits:[{label:'تسليم الواجب في ميعاده',value:70+(r%25)},{label:'الحضور في الميعاد',value:80+(r%18)},{label:'المشاركة في الحصة',value:55+(r%35)},{label:'المراجعة قبل الاختبار',value:45+(r%40)}],
  activities:[{name:['كورة القدم','السباحة','الرسم'][r%3],note:'مرتين في الأسبوع'},{name:['القراءة','الشطرنج','البرمجة'][(r>>2)%3],note:'نشاط حر'}],
  recognitions:subjects.slice(0,2).map((x,i)=>({from:teacherById(x.teacherId)?.name??'',text:['ساعد زمايله في حل المسائل','سلّم كل واجبات الشهر في ميعادها'][i],date:['12/10','2/11'][i]})),
  wallet,payments};
}
export const parentDemo={name:'منى عبد الحميد',wallet:2400,children:[
 build('kid-maryam','مريم','ابتدائي','الصف الخامس الابتدائي','مدرسة النصر',0,1,86,150),
 build('kid-omar','عمر','إعدادي','الصف الثاني الإعدادي','مدرسة المستقبل',2,0,77,80),
 build('kid-youssef','يوسف','ثانوي','الصف الثالث الثانوي','مدرسة الأورمان',2,1,82,320),
] as Child[]};
// Opening ledger (demo): top-ups and transfers already made this term.
export const parentLedger:LedgerItem[]=[
 {id:'l1',kind:'topup',amount:3000,label:'شحن الرصيد',date:'1/11'},
 {id:'l2',kind:'toChild',amount:300,childId:'kid-youssef',label:'تحويل ليوسف',date:'2/11'},
 {id:'l3',kind:'toChild',amount:150,childId:'kid-maryam',label:'تحويل لمريم',date:'2/11'},
 {id:'l4',kind:'toChild',amount:150,childId:'kid-omar',label:'تحويل لعمر',date:'3/11'},
];

// Simple derived numbers used across the pages.
export const avgScore=(c:Child)=>Math.round(c.subjects.reduce((a,s)=>a+s.score,0)/Math.max(1,c.subjects.length));
export const attendanceRate=(c:Child)=>{const p=c.subjects.reduce((a,s)=>a+s.attendance.present,0),t=c.subjects.reduce((a,s)=>a+s.attendance.present+s.attendance.absent,0);return t?Math.round(p/t*100):0;};
export const homeworkRate=(c:Child)=>{const d=c.subjects.reduce((a,s)=>a+s.homework.done,0),t=c.subjects.reduce((a,s)=>a+s.homework.total,0);return t?Math.round(d/t*100):0;};
export function alertsFor(c:Child){
 const out:{tone:'warn'|'info';text:string;href:string}[]=[];
 for(const s of c.subjects)if(s.trend<=-2)out.push({tone:'warn',text:`${s.subject}: الدرجة نزلت ${Math.abs(s.trend)}%`,href:'/parent/learning'});
 const absent=c.subjects.reduce((a,s)=>a+s.attendance.absent,0);if(absent>=4)out.push({tone:'warn',text:`${absent} غياب الشهر ده`,href:'/parent/learning'});
 const late=c.payments.filter(p=>p.status==='late').length;if(late)out.push({tone:'warn',text:`${late} مدفوعات متأخرة`,href:'/parent/finance'});
 return out;
}
