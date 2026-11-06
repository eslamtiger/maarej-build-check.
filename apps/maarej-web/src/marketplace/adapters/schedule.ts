// Demo weekly timetable: which teacher teaches which group, in which room of which center, and how full it is.
// Built deterministically from the demo teachers and centers (same ids → same week every time). Not real data.
import {marketplaceCenters} from './places';
import {marketplaceTeachers} from './teachers';
import type {CenterDTO} from '../types/place';
import type {TeacherSearchDTO} from '../types/teacher';

export const days=['السبت','الأحد','الاتنين','التلات','الأربع','الخميس','الجمعة'] as const;
export const OPEN=10,CLOSE=22; // centers open 10:00 → 22:00
export type Session={id:string;centerId:string;room:number;day:number;start:number;dur:number;teacherId:string;subject:string;stage:string;enrolled:number;capacity:number;price:number;status:'booked'|'request'};

// Guest teachers: they fill the timetables so a week looks realistic, but have no profile page (name only).
const guestNames=['أ. هبة الشريف','أ. محمود سعيد','أ. دينا عادل','أ. طارق منير','أ. رانيا فتحي','أ. إيهاب لطفي','أ. شيماء جمال','أ. وليد حسني','أ. ميار صلاح','أ. حسام الدين','أ. نهى عبد الله','أ. كريم فوزي','أ. أميرة بدر','أ. صلاح رشدي','أ. ليلى مراد','أ. عمرو خليل','أ. سمر ياسين','أ. باسم الجندي','أ. منى زكي','أ. هاني عزت','أ. رشا نبيل','أ. تامر حافظ','أ. إيمان سالم','أ. شادي كمال','أ. غادة رمزي','أ. ماجد توفيق','أ. دعاء مجدي','أ. بسمة رضا','أ. أشرف لبيب','أ. يمنى حلمي'];
const guestSubjects=['الرياضيات','العلوم','اللغة العربية','اللغة الإنجليزية','الفيزياء','الكيمياء','الأحياء','التاريخ','الجغرافيا','الحاسب'];
const guestStages=['ابتدائي','إعدادي','ثانوي'];
export const guests:readonly TeacherSearchDTO[]=guestNames.map((name,i)=>({id:`guest-${i+1}`,legacyId:`guest-${i+1}`,name,subjects:[guestSubjects[(i*3)%guestSubjects.length]],subjectKeys:[],stages:[guestStages[i%3],guestStages[(i+1)%3]],systems:[],areas:[],governorates:[],price:{min:120+(i%5)*20,max:200+(i%7)*20,currency:'EGP' as const,unit:'حصة' as const},provenance:{kind:'demo' as const,source:'schedule guests'}}));
export const hasProfile=(id:string)=>marketplaceTeachers.some(t=>t.id===id);

const rng=(seed:string)=>{let h=2166136261;for(const ch of seed){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}return ()=>{h^=h<<13;h^=h>>>17;h^=h<<5;return ((h>>>0)%10000)/10000;};};
const centersFor=(area:string,gov:string)=>{const same=marketplaceCenters.filter(c=>c.area===area);return same.length?same:marketplaceCenters.filter(c=>c.governorate===gov);};

function build(){
 const all:Session[]=[];
 const busy=new Set<string>(); // centerId:room:day:hour
 const free=(c:string,r:number,d:number,s:number,dur:number)=>{for(let h=s;h<s+dur;h++)if(busy.has(`${c}:${r}:${d}:${h}`))return false;return true;};
 const take=(c:string,r:number,d:number,s:number,dur:number)=>{for(let h=s;h<s+dur;h++)busy.add(`${c}:${r}:${d}:${h}`);};
 const teacherBusy=new Set<string>();
 for(const t of marketplaceTeachers){
  const r=rng(t.id),pool=t.areas.flatMap(a=>centersFor(a,t.governorates[0]??'القاهرة'));if(!pool.length)continue;
  const groups=6+Math.floor(r()*4);
  for(let g=0;g<groups;g++){
   for(let attempt=0;attempt<12;attempt++){
    const c=pool[Math.floor(r()*pool.length)],room=Math.floor(r()*c.rooms.length),day=Math.floor(r()*6),dur=r()<.3?1:2,start=r()<.7?14+Math.floor(r()*(CLOSE-14-dur+1)):OPEN+Math.floor(r()*(CLOSE-OPEN-dur+1)); // most groups run after school
    if(!free(c.id,room,day,start,dur)||[...Array(dur)].some((_,k)=>teacherBusy.has(`${t.id}:${day}:${start+k}`)))continue;
    take(c.id,room,day,start,dur);for(let k=0;k<dur;k++)teacherBusy.add(`${t.id}:${day}:${start+k}`);
    const capacity=c.rooms[room].seats,enrolled=Math.max(3,Math.round(capacity*(.45+r()*.55)));
    const lo=t.price?.min??100,hi=t.price?.max??lo;
    all.push({id:`${t.id}-${g}`,centerId:c.id,room,day,start,dur,teacherId:t.id,subject:t.subjects[g%Math.max(1,t.subjects.length)]??'',stage:t.stages[g%Math.max(1,t.stages.length)]??'',enrolled:Math.min(enrolled,capacity),capacity,price:Math.round((lo+(hi-lo)*r())/10)*10,status:'booked'});
    break;
   }
  }
 }
 // Make sure every room has a few groups: fill with teachers from the same governorate.
 // A teacher works with a handful of centers at most (≤5) and ≤12 groups a week.
 const centersOf=(id:string)=>new Set(all.filter(x=>x.teacherId===id).map(x=>x.centerId));
 const canTake=(id:string,center:string)=>{const cs=centersOf(id);return all.filter(x=>x.teacherId===id).length<12&&(cs.has(center)||cs.size<5);};
 for(const c of marketplaceCenters){const r=rng(c.id+'fill'),near=marketplaceTeachers.filter(t=>t.areas.includes(c.area)),local=near.length>=3?near:marketplaceTeachers.filter(t=>t.governorates.includes(c.governorate));if(!local.length)continue;
  c.rooms.forEach((rm,room)=>{let n=all.filter(x=>x.centerId===c.id&&x.room===room).length;
   for(let attempt=0;attempt<60&&n<3;attempt++){const t=local[Math.floor(r()*local.length)],day=Math.floor(r()*6),dur=r()<.3?1:2,start=r()<.75?14+Math.floor(r()*(CLOSE-14-dur+1)):OPEN+Math.floor(r()*(CLOSE-OPEN-dur+1));
    if(!canTake(t.id,c.id)||!free(c.id,room,day,start,dur)||[...Array(dur)].some((_,k)=>teacherBusy.has(`${t.id}:${day}:${start+k}`)))continue;
    take(c.id,room,day,start,dur);for(let k=0;k<dur;k++)teacherBusy.add(`${t.id}:${day}:${start+k}`);
    const capacity=rm.seats,lo=t.price?.min??100,hi=t.price?.max??lo,g=all.filter(x=>x.teacherId===t.id).length;
    all.push({id:`${t.id}-${c.id}-${room}-${n}`,centerId:c.id,room,day,start,dur,teacherId:t.id,subject:t.subjects[g%Math.max(1,t.subjects.length)]??'',stage:t.stages[g%Math.max(1,t.stages.length)]??'',enrolled:Math.min(capacity,Math.max(3,Math.round(capacity*(.45+r()*.55)))),capacity,price:Math.round((lo+(hi-lo)*r())/10)*10,status:'booked'});n++;}
  });}
 // Fill every room to a realistic week (15–19 groups) with guest teachers.
 for(const c of marketplaceCenters){const r=rng(c.id+'guests');
  c.rooms.forEach((rm,room)=>{const target=15+Math.floor(r()*5);let n=all.filter(x=>x.centerId===c.id&&x.room===room).length,k=0;
   for(let attempt=0;attempt<500&&n<target;attempt++){const gi=Math.floor(r()*guests.length),t=guests[gi],day=Math.floor(r()*7),dur=r()<.35?1:2,start=r()<.88?14+Math.floor(r()*(CLOSE-14-dur+1)):OPEN+Math.floor(r()*(CLOSE-OPEN-dur+1));
    if(day===6&&r()<.6)continue;
    if(!free(c.id,room,day,start,dur)||[...Array(dur)].some((_,q)=>teacherBusy.has(`${t.id}:${day}:${start+q}`)))continue;
    take(c.id,room,day,start,dur);for(let q=0;q<dur;q++)teacherBusy.add(`${t.id}:${day}:${start+q}`);
    const capacity=rm.seats,lo=t.price?.min??120,hi=t.price?.max??lo;
    all.push({id:`${t.id}-${c.id}-${room}-g${k++}`,centerId:c.id,room,day,start,dur,teacherId:t.id,subject:t.subjects[0],stage:t.stages[(n)%t.stages.length],enrolled:Math.min(capacity,Math.max(3,Math.round(capacity*(.3+r()*.7)))),capacity,price:Math.round((lo+(hi-lo)*r())/10)*10,status:'booked'});n++;}
  });}
 // A few pending reservation requests per center (shown in blue).
 for(const c of marketplaceCenters){const r=rng(c.id+'req');
  for(let k=0;k<2;k++){const room=Math.floor(r()*c.rooms.length),day=Math.floor(r()*6),start=OPEN+Math.floor(r()*(CLOSE-OPEN-1));
   if(!free(c.id,room,day,start,2))continue;take(c.id,room,day,start,2);
   const t=marketplaceTeachers[Math.floor(r()*marketplaceTeachers.length)];
   all.push({id:`${c.id}-req-${k}`,centerId:c.id,room,day,start,dur:2,teacherId:t.id,subject:t.subjects[0]??'',stage:t.stages[0]??'',enrolled:0,capacity:c.rooms[room].seats,price:0,status:'request'});}}
 return all;
}
export const sessions:readonly Session[]=build();
export const sessionsForCenter=(id:string)=>sessions.filter(s=>s.centerId===id);
export const sessionsForTeacher=(id:string)=>sessions.filter(s=>s.teacherId===id&&s.status==='booked');
export const centerById=(id:string):CenterDTO|undefined=>marketplaceCenters.find(c=>c.id===id);
export const teacherById=(id:string)=>marketplaceTeachers.find(t=>t.id===id)??guests.find(t=>t.id===id);
export const hourLabel=(h:number)=>{const x=h%12||12;return `${x} ${h<12?'ص':'م'}`;};
export const timeRange=(s:number,dur:number)=>`${hourLabel(s)} – ${hourLabel(s+dur)}`;
