import {notFound,redirect} from 'next/navigation';
import {marketplaceTeachers,resolveMarketplaceTeacher,resolvePublicTeacherIdentity} from '@/marketplace/adapters/teachers';
import {teacherIdentities} from '@/product/teacher-identities';
import {PublicTeacherPlaceholder} from '@/marketplace/components/teacher-placeholder';
import {PublicTeacherProfile} from '@/marketplace/components/teacher-profile';
export function generateStaticParams(){return [...teacherIdentities.map(t=>({teacherId:t.id})),...marketplaceTeachers.map(t=>({teacherId:t.legacyId}))];}
export async function generateMetadata({params}:{params:Promise<{teacherId:string}>}){const {teacherId}=await params;const teacher=resolvePublicTeacherIdentity(teacherId);return {title:teacher?`${teacher.name} | معارج`:'ملف المدرس | معارج'};}
export default async function Page({params}:{params:Promise<{teacherId:string}>}){
 const {teacherId}=await params;const t=resolvePublicTeacherIdentity(teacherId);if(!t)notFound();if(t.id!==teacherId)redirect(`/teachers/${t.id}`);
 // Marketplace teachers get the full profile; Student-only demo teachers keep the placeholder.
 const marketplace=resolveMarketplaceTeacher(t.id);
 return marketplace?<PublicTeacherProfile teacher={marketplace}/>:<PublicTeacherPlaceholder teacher={t}/>;
}
