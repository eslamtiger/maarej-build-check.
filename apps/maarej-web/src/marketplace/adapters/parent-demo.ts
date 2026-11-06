// Parent area demo: one parent with three children at three different stages. Each child's groups are real demo
// groups from the weekly timetable (same teachers, centers, prices), so links open the real profiles.
// Grades, attendance, identity and transfers are illustrative only (no real payments, no fees invented).
import {sessions,teacherById,centerById,hasProfile} from './schedule';
import type {Session} from './schedule';
import {identityDefinitions,identityStages} from '../../data/identity-framework';

export type ChildGrade={subject:string;score:number;trend:number;exams:{name:string;score:number;of:number}[]};
export type Transfer={id:string;month:string;group:string;teacher:string;amount:number;status:'paid'|'due'|'late';date:string};
export type Child={id:string;name:string;emoji:string;color:string;stage:'ابتدائي'|'إعدادي'|'ثانوي';grade:string;
 groups:Session[];grades:ChildGrade[];attendance:{present:number;absent:number};homework:{done:number;total:number};
 identity:{name:string;stage:string;next:string;steps:number;of:number};streak:number;badges:{e:string;name:string;earned:boolean}[];
 progress:{month:string;score:number}[];transfers:Transfer[]};

const h=(s:string)=>{let x=2166136261;for(const c of s){x^=c.charCodeAt(0);x=Math.imul(x,16777619);}return x>>>0;};
// Up to 5 groups for the child's stage, one per subject, spread over the week.
// Subjects that make sense for each stage.
const stageSubjects:Record<string,RegExp>={'ابتدائي':/العربية|الإنجليزية|الرياضيات|العلوم|الدراسات/,'إعدادي':/العربية|الإنجليزية|الرياضيات|العلوم|الدراسات|الحاسب/,'ثانوي':/العربية|الإنجليزية|الرياضيات|الفيزياء|الكيمياء|الأحياء|التاريخ|الجغرافيا/};
function groupsFor(stage:string,seed:string){
 const pool=sessions.filter(s=>s.status==='booked'&&s.stage===stage&&s.enrolled<s.capacity&&hasProfile(s.teacherId)&&stageSubjects[stage].test(s.subject));
 const picked:Session[]=[],subjects=new Set<string>(),slots=new Set<string>();
 const order=[...pool].sort((a,b)=>h(seed+a.id)-h(seed+b.id));
 for(const s of order){if(picked.length>=5)break;if(subjects.has(s.subject)||[...Array(s.dur)].some((_,k)=>slots.has(`${s.day}:${s.start+k}`)))continue;
  picked.push(s);subjects.add(s.subject);for(let k=0;k<s.dur;k++)slots.add(`${s.day}:${s.start+k}`);}
 return picked.sort((a,b)=>a.day-b.day||a.start-b.start);
}
const months=['يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر'];
function build(id:string,name:string,emoji:string,color:string,stage:Child['stage'],grade:string,identityIdx:number,stageIdx:number,base:number):Child{
 const groups=groupsFor(stage,id),r=h(id);
 const grades=groups.map((g,i)=>{const score=Math.min(98,base+((r>>i)%14)-4),trend=((r>>(i+3))%9)-3;
  return {subject:g.subject,score,trend,exams:[{name:'اختبار شهر سبتمبر',score:Math.round((score-trend-3)/5),of:20},{name:'اختبار شهر أكتوبر',score:Math.round(score/5),of:20}]};});
 const transfers:Transfer[]=groups.flatMap((g,i)=>{const t=teacherById(g.teacherId);return ['نوفمبر','أكتوبر','سبتمبر'].map((m,j)=>{const k=2-j;return {id:`${g.id}-${k}`,month:m,group:`${g.subject} · ${centerById(g.centerId)?.name??''}`,teacher:t?.name??'',amount:g.price*4,
  status:(k<2?'paid':(r>>i)%3===0?'late':'due') as Transfer['status'],date:k<2?`${3+i}/${9+k}`:`${5+i}/11`};});}).sort((a,b)=>['نوفمبر','أكتوبر','سبتمبر'].indexOf(a.month)-['نوفمبر','أكتوبر','سبتمبر'].indexOf(b.month));
 const idDef=identityDefinitions[identityIdx],nextDef=identityDefinitions[identityIdx+1];
 return {id,name,emoji,color,stage,grade,groups,grades,attendance:{present:20+(r%6),absent:r%3},homework:{done:9+(r%5),total:14},
  identity:{name:idDef.name,stage:identityStages[stageIdx].name,next:stageIdx<2?identityStages[stageIdx+1].name:nextDef?.name??'',steps:2+(r%3),of:5},
  streak:3+(r%9),badges:[{e:'🎯',name:'حضور كامل',earned:true},{e:'📚',name:'دودة كتب',earned:(r&1)===1},{e:'⏰',name:'في الميعاد',earned:true},{e:'🤝',name:'زميل جدع',earned:(r&2)===2},{e:'🚀',name:'قفزة',earned:false}],
  progress:months.map((m,i)=>({month:m,score:Math.min(97,base-8+i*3+((r>>i)%5))})),transfers};
}
export const parentDemo={name:'أ. منى عبد الحميد',children:[
 build('kid-maryam','مريم','👧','#E8577F','ابتدائي','الصف الخامس الابتدائي',0,1,86),
 build('kid-omar','عمر','🧒','#1FA774','إعدادي','الصف الثاني الإعدادي',2,0,78),
 build('kid-youssef','يوسف','👦','#4B3FD6','ثانوي','الصف الثالث الثانوي',2,1,82),
] as Child[]};
