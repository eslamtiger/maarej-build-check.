import type {Metadata} from 'next';
import {LoginPage} from '@/marketplace/components/login';
export const metadata:Metadata={title:'تسجيل الدخول',description:'سجّل دخولك أو اعمل حساب جديد في معارج عشان تحجز قاعة أو تنضم لحصة.'};
export default function Page(){return <LoginPage/>;}
