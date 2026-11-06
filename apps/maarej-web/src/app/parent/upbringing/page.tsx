import type {Metadata} from 'next';
import {ParentUpbringing} from '@/marketplace/components/parent/parent-pages';
export const metadata:Metadata={title:'التربية',description:'الهوية وجوانب الشخصية والعادات لكل ابن.'};
export default function Page(){return <ParentUpbringing/>;}
