import type {Metadata} from 'next';
import {ParentHome} from '@/marketplace/components/parent-home';
export const metadata:Metadata={title:'مساحة ولي الأمر',description:'متابعة الأبناء: الجدول والدرجات والمدرسين والمجموعات والتقدم والهوية والمدفوعات.'};
export default function Page(){return <ParentHome/>;}
