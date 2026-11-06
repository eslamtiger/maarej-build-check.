import type {Metadata} from 'next';
import {ParentFinance} from '@/marketplace/components/parent/parent-pages';
export const metadata:Metadata={title:'المالية',description:'الرصيد والتحويلات للأبناء والمدفوعات.'};
export default function Page(){return <ParentFinance/>;}
