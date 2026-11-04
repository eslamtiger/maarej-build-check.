import marketplaceSource from '../marketplace/data/legacy-teachers.json';
import marketplaceAliases from '../marketplace/data/teacher-id-map.json';
import {studentDemo} from '../data/student-v101';
import {teacherIds} from '../data/student-v103-view';
export type TeacherIdentity={id:string;name:string;aliases:readonly {scope:'marketplace'|'student';id:string}[];source:'marketplace-demo'|'student-demo'};
// Explicit aliases preserve existing Student URLs. No display-name matching between datasets.
const studentAliases:Record<string,string>={'ahmed-salem':'tch-student-001','khaled-mahmoud':'tch-student-002','mona-adel':'tch-student-003'};
export const teacherIdentities:readonly TeacherIdentity[]=[
 ...marketplaceSource.map(t=>{const alias=marketplaceAliases.find(a=>a.legacyId===String(t.id));if(!alias)throw new Error('Missing marketplace identity alias');return {id:alias.id,name:t.name,aliases:[{scope:'marketplace' as const,id:alias.legacyId}],source:'marketplace-demo' as const};}),
 ...studentDemo.learning.teachers.map(t=>{const alias=teacherIds[t.name];const id=studentAliases[alias];if(!id)throw new Error('Missing Student identity alias');return {id,name:t.name,aliases:[{scope:'student' as const,id:alias}],source:'student-demo' as const};}),
];
export function teacherIdentityById(id:string){return teacherIdentities.find(t=>t.id===id);}
export function teacherIdentityByAlias(scope:'marketplace'|'student',id:string){return teacherIdentities.find(t=>t.aliases.some(a=>a.scope===scope&&a.id===id));}
