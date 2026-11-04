import {OrderPage} from '@/components/student/orders/order-page';
import {getStudentOrder,studentOrderFixtures} from '@/data/student-orders-demo';
export const metadata={title:'طلب الحجز | معارج'};
// Static-export fixture routes. Live order IDs need an authenticated adapter later.
export function generateStaticParams(){return [...studentOrderFixtures.map(o=>({orderId:o.id})),{orderId:'demo-not-found'}];}
export default async function Page({params}:{params:Promise<{orderId:string}>}){const {orderId}=await params;return <OrderPage order={getStudentOrder(orderId)}/>;}
