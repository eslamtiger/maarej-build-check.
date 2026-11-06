import type {Metadata} from 'next';
import {ParentDashboard} from '@/marketplace/components/parent/parent-pages';
export const metadata:Metadata={title:'ولي الأمر',description:'الأبناء والرصيد والتنبيهات في مكان واحد.'};
export default function Page(){return <ParentDashboard/>;}
