import type {Metadata} from 'next';
import {ParentTeachers} from '@/marketplace/components/parent/parent-pages';
export const metadata:Metadata={title:'المدرسين والسناتر',description:'جدول ومدرسين وسناتر كل ابن.'};
export default function Page(){return <ParentTeachers/>;}
