'use client';
import {OrderErrorState} from '@/components/student/orders/order-page';
export default function Error({reset}:{error:Error;reset:()=>void}){return <OrderErrorState onRetry={reset}/>;}
