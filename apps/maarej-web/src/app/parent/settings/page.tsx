import type {Metadata} from 'next';
import {ParentSettings} from '@/marketplace/components/parent/parent-pages';
export const metadata:Metadata={title:'حسابي',description:'بياناتك وصفحتك اللي بيشوفها المدرسين والأبناء المربوطين.'};
export default function Page(){return <ParentSettings/>;}
