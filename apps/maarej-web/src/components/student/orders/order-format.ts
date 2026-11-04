import {formatArabicDate} from '@/lib/arabic-date';
const options={timeZone:'Africa/Cairo',numberingSystem:'latn'};
export function orderDate(s?:string){return s&&Number.isFinite(Date.parse(s))?formatArabicDate(s):undefined;}
export function orderTime(s?:string){return s&&Number.isFinite(Date.parse(s))?new Intl.DateTimeFormat('ar-EG',{...options,hour:'numeric',minute:'2-digit'}).format(new Date(s)):undefined;}
export function orderDay(s?:string){return s&&Number.isFinite(Date.parse(s))?new Intl.DateTimeFormat('ar-EG',{...options,weekday:'long'}).format(new Date(s)):undefined;}
export function orderMoney(amount:number,currency:string){return new Intl.NumberFormat('ar-EG',{style:'currency',currency,numberingSystem:'latn',maximumFractionDigits:2}).format(amount);}
export function receiptHref(payment:{transactionId?:string;amount:number},sources:readonly {id:string;amount:number;href:string}[]){return sources.find(t=>t.id===payment.transactionId&&t.amount===payment.amount)?.href;}

// Orders inherit navigation context only from a validated Student entry point.
export function orderNavigationContext(origin?:string|null){
 const path=origin?.split(/[?#]/)[0];
 if(path==='/student')return 'home';
 if(!path)return '';
 const inside=(base:string)=>path===base||path.startsWith(base+'/');
 if(inside('/student/learning')||inside('/student/schedule'))return 'learn';
 if(inside('/student/journey')||inside('/student/rewards'))return 'journey';
 if(inside('/student/finance'))return 'finance';
 if(['/student/account','/student/settings','/student/profile','/student/security','/student/plans'].some(inside))return 'account';
 return '';
}
