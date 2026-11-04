// Product contexts, not separate applications. Reserved discovery entities stay distinct.
export type ProductContext='public'|'student'|'other';
export type PublicEntityType='teacher'|'center'|'cospace';
export function routeContext(path:string):ProductContext{const p=path.split(/[?#]/)[0];if(p==='/student'||p.startsWith('/student/'))return 'student';if(p==='/'||['/teachers','/centers','/spaces'].some(base=>p===base||p.startsWith(base+'/')))return 'public';return 'other';}
export const productRoutes={marketplace:'/',teachers:'/teachers',centers:'/centers',spaces:'/spaces',student:'/student',settings:'/student/account',orders:'/student/orders'} as const;
export function publicEntityHref(type:PublicEntityType,id:string){return `/${type==='teacher'?'teachers':type==='center'?'centers':'spaces'}/${encodeURIComponent(id)}`;}
export function studentTeacherHref(studentAlias:string){return `/student/learning/teachers/${encodeURIComponent(studentAlias)}`;}
