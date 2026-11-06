import type {Metadata} from 'next';
import {ParentSettings} from '@/marketplace/components/parent/parent-pages';
export const metadata:Metadata={title:'الإعدادات',description:'التنبيهات ومصروف الأبناء والعرض.'};
export default function Page(){return <ParentSettings/>;}
