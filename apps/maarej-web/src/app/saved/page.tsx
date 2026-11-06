import type {Metadata} from 'next';
import {SavedPage} from '@/marketplace/components/saved-page';
export const metadata:Metadata={title:'المحفوظات',description:'المدرسين والسناتر ومساحات المذاكرة اللي حفظتها.'};
export default function Page(){return <SavedPage/>;}
