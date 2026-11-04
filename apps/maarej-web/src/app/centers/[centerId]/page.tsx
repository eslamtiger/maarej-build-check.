import {notFound,redirect} from 'next/navigation';
import {marketplaceCenters,resolveCenter} from '@/marketplace/adapters/places';
import {CenterProfile} from '@/marketplace/components/place-profile';
export function generateStaticParams(){return [...marketplaceCenters.map(c=>({centerId:c.id})),...marketplaceCenters.map(c=>({centerId:c.legacyId}))];}
export async function generateMetadata({params}:{params:Promise<{centerId:string}>}){const {centerId}=await params;const c=resolveCenter(centerId);return {title:c?`${c.name} | معارج`:'سنتر | معارج'};}
export default async function Page({params}:{params:Promise<{centerId:string}>}){const {centerId}=await params;const c=resolveCenter(centerId);if(!c)notFound();if(c.id!==centerId)redirect(`/centers/${c.id}`);return <CenterProfile center={c}/>;}
