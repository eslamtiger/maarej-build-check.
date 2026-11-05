import raw from '../data/legacy-teachers.json';
import aliases from '../data/teacher-id-map.json';
import {teacherIdentityByAlias,teacherIdentityById} from '@/product/teacher-identities';
import {subjectIdByAlias} from '@/product/subject-identities';
import type {TeacherSearchDTO} from '../types/teacher';
const provinces:Record<string,string>={'القاهرة':'القاهرة','المعادي':'القاهرة','حلوان':'القاهرة','مصر الجديدة':'القاهرة','مدينة نصر':'القاهرة','القاهرة الجديدة':'القاهرة','التجمع الخامس':'القاهرة','الرحاب':'القاهرة','شبرا':'القاهرة','الجيزة':'الجيزة','الدقي':'الجيزة','المهندسين':'الجيزة','الشيخ زايد':'الجيزة','6 أكتوبر':'الجيزة','الهرم':'الجيزة','فيصل':'الجيزة'};
// Teacher photos from Unsplash (Unsplash License, free for commercial use). Demo only: real teachers will upload their own.
const teacherPhotos:Record<number,string>={1:'1611682060613-597ef6d1464b',2:'1623813793112-ece62d9f8da4',5:'1596664427764-1a29079a6b6e',10:'1617942798594-3da7aafc372c',12:'1640222495570-1fc4a557961f',14:'1561442748-c50715dc32f6',16:'1564644987545-8a0cb717b59f',18:'1690166444476-8cc4c0f24032',20:'1611682060567-d7b07878d380',22:'1756272714913-be6e76dece4b',24:'1640262653864-c68ca500f365',26:'1790082154124-1c8be61f0750',28:'1770802675097-21a1b19ad8bf',30:'1634707532472-00e23a3a5f43',3:'1791732604698-6fe653ecccdf',4:'1770096951056-c94a812e9fd4',6:'1790575169061-15439394f785',7:'1705645930353-0e335311ef20',8:'1709675155252-f00141380412',9:'1520341280432-4749d4d7bcf9',11:'1792793534631-f8b6d0027e91',13:'1728516687003-58347d3412b3',15:'1586446470888-4192bbc8c2eb',17:'1638016329956-1127c6e4c96f',19:'1756699279298-c89cdef354ab',21:'1790575169259-4d47793c31b7',23:'1633888630520-c6de62eae744',25:'1641723345469-e7cd0c037f62',27:'1699297847223-277843a374dc',29:'1633116179568-0183958979e9'};
const teacherPhoto=(id:number)=>teacherPhotos[id]?`https://images.unsplash.com/photo-${teacherPhotos[id]}?auto=format&fit=crop&crop=faces&w=600&h=600&q=70`:undefined;
const list=(value:unknown,fallback?:string)=>[...new Set((Array.isArray(value)?value:[fallback]).filter((s):s is string=>typeof s==='string'&&!!s))];
export const marketplaceTeachers:readonly TeacherSearchDTO[]=raw.map(t=>{
 const alias=aliases.find(a=>a.legacyId===String(t.id));if(!alias)throw new Error('Missing teacher migration alias');
 const identity=teacherIdentityByAlias('marketplace',String(t.id));if(!identity)throw new Error('Missing canonical teacher identity');
 const areas=list(t.teachingAreas,t.area),prices=t.lessonPrices?.map(p=>p.price).filter(p=>Number.isFinite(p)&&p>=0)??[];
 return {id:identity.id,legacyId:alias.legacyId,name:identity.name,subjectIds:list(t.subjectKeys,t.subjectKey).map(subjectIdByAlias).filter(id=>id!==undefined),image:teacherPhoto(t.id)??t.image??undefined,subjects:list(t.subjects,t.subject),subjectKeys:list(t.subjectKeys,t.subjectKey),stages:list(t.stage),systems:list(t.systems,t.system),areas,governorates:list(areas.map(a=>provinces[a]).filter(Boolean)),rating:typeof t.rating==='number'?t.rating:undefined,reviewCount:typeof t.reviews==='number'?t.reviews:undefined,price:prices.length?{min:Math.min(...prices),max:Math.max(...prices),currency:'EGP',unit:'حصة'}:undefined,provenance:{kind:'demo',source:t.source}};
});
export function resolveMarketplaceTeacher(id:string){return marketplaceTeachers.find(t=>t.id===id||t.legacyId===id);}

export function resolvePublicTeacherIdentity(id:string){return resolveMarketplaceTeacher(id)??teacherIdentityById(id);}
