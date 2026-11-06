import type {Metadata} from 'next';
import {ParentLearning} from '@/marketplace/components/parent/parent-pages';
export const metadata:Metadata={title:'المستوى التعليمي',description:'الدرجات والحضور والتطور لكل ابن.'};
export default function Page(){return <ParentLearning/>;}
