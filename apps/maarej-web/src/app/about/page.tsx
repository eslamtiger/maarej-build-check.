import type {Metadata} from 'next';
import {AboutMaarej} from '@/marketplace/components/about';
export const metadata:Metadata={title:'عن معارج',description:'معارج بيجمع المدرسين والسناتر ومساحات المذاكرة ومساحة الطالب في مكان واحد.'};
export default function Page(){return <AboutMaarej/>;}
