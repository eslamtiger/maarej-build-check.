import type {Metadata} from 'next';
import {PlaceSearch} from '@/marketplace/components/place-search';
export const metadata:Metadata={title:'مساحات المذاكرة والعمل | معارج',description:'مكتبات وغرف دراسة وقاعات فرق، قارن السعة والتجهيزات.'};
export default function Page(){return <PlaceSearch kind="spaces"/>;}
