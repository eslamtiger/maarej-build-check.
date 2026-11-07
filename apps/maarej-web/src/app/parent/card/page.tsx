import type {Metadata} from 'next';
import {ParentCardPage} from '@/marketplace/components/parent/people-pages';
export const metadata:Metadata={title:'صفحة ولي الأمر',description:'بيانات التواصل مع ولي الأمر.'};
export default function Page(){return <ParentCardPage/>;}
