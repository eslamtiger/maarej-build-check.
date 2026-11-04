import type {Metadata} from 'next';
import {PlaceSearch} from '@/marketplace/components/place-search';
export const metadata:Metadata={title:'السناتر التعليمية | معارج',description:'قارن السناتر والقاعات حسب المنطقة والسعة والتجهيزات وسعر الساعة.'};
export default function Page(){return <PlaceSearch kind="centers"/>;}
