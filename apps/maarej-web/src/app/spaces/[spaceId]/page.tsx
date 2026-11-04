import {notFound,redirect} from 'next/navigation';
import {marketplaceSpaces,resolveSpace} from '@/marketplace/adapters/places';
import {SpaceProfile} from '@/marketplace/components/place-profile';
export function generateStaticParams(){return [...marketplaceSpaces.map(s=>({spaceId:s.id})),...marketplaceSpaces.map(s=>({spaceId:s.legacyId}))];}
export async function generateMetadata({params}:{params:Promise<{spaceId:string}>}){const {spaceId}=await params;const s=resolveSpace(spaceId);return {title:s?`${s.name} | معارج`:'مساحة | معارج'};}
export default async function Page({params}:{params:Promise<{spaceId:string}>}){const {spaceId}=await params;const s=resolveSpace(spaceId);if(!s)notFound();if(s.id!==spaceId)redirect(`/spaces/${s.id}`);return <SpaceProfile space={s}/>;}
