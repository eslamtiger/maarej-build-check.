import raw from '../data/legacy-teachers.json';
import aliases from '../data/teacher-id-map.json';
import {teacherIdentityByAlias,teacherIdentityById} from '@/product/teacher-identities';
import {subjectIdByAlias} from '@/product/subject-identities';
import type {TeacherSearchDTO} from '../types/teacher';
const provinces:Record<string,string>={'القاهرة':'القاهرة','المعادي':'القاهرة','حلوان':'القاهرة','مصر الجديدة':'القاهرة','مدينة نصر':'القاهرة','القاهرة الجديدة':'القاهرة','التجمع الخامس':'القاهرة','الرحاب':'القاهرة','شبرا':'القاهرة','الجيزة':'الجيزة','الدقي':'الجيزة','المهندسين':'الجيزة','الشيخ زايد':'الجيزة','6 أكتوبر':'الجيزة','الهرم':'الجيزة','فيصل':'الجيزة'};
const list=(value:unknown,fallback?:string)=>[...new Set((Array.isArray(value)?value:[fallback]).filter((s):s is string=>typeof s==='string'&&!!s))];
export const marketplaceTeachers:readonly TeacherSearchDTO[]=raw.map(t=>{
 const alias=aliases.find(a=>a.legacyId===String(t.id));if(!alias)throw new Error('Missing teacher migration alias');
 const identity=teacherIdentityByAlias('marketplace',String(t.id));if(!identity)throw new Error('Missing canonical teacher identity');
 const areas=list(t.teachingAreas,t.area),prices=t.lessonPrices?.map(p=>p.price).filter(p=>Number.isFinite(p)&&p>=0)??[];
 return {id:identity.id,legacyId:alias.legacyId,name:identity.name,subjectIds:list(t.subjectKeys,t.subjectKey).map(subjectIdByAlias).filter(id=>id!==undefined),image:t.image??undefined,subjects:list(t.subjects,t.subject),subjectKeys:list(t.subjectKeys,t.subjectKey),stages:list(t.stage),systems:list(t.systems,t.system),areas,governorates:list(areas.map(a=>provinces[a]).filter(Boolean)),rating:typeof t.rating==='number'?t.rating:undefined,reviewCount:typeof t.reviews==='number'?t.reviews:undefined,price:prices.length?{min:Math.min(...prices),max:Math.max(...prices),currency:'EGP',unit:'حصة'}:undefined,provenance:{kind:'demo',source:t.source}};
});
export function resolveMarketplaceTeacher(id:string){return marketplaceTeachers.find(t=>t.id===id||t.legacyId===id);}

export function resolvePublicTeacherIdentity(id:string){return resolveMarketplaceTeacher(id)??teacherIdentityById(id);}
