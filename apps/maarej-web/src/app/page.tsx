import type {Metadata} from 'next';
import {MarketplaceHome} from '@/marketplace/components/marketplace-home';
export const metadata:Metadata={title:'معارج | اكتشف المدرّس المناسب',description:'Marketplace معارج — استكشاف المدرسين والمواد ومناطق التدريس.'};
export default function Page(){return <MarketplaceHome/>;}
