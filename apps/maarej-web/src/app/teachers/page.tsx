import type {Metadata} from 'next';
import {TeacherSearch} from '@/marketplace/components/teacher-search';
export const metadata:Metadata={title:'البحث عن المدرسين | معارج',description:'اكتشف المدرسين حسب المادة والمرحلة والمنطقة والتقييم ونطاق السعر.'};
export default function Page(){return <TeacherSearch/>;}
