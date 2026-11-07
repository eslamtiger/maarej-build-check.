import type {Metadata} from 'next';
import {MePage} from '@/marketplace/components/parent/people-pages';
export const metadata:Metadata={title:'حسابي',description:'بياناتك الشخصية وطلبات ولي الأمر ورصيدك.'};
export default function Page(){return <MePage/>;}
