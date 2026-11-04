import centersRaw from '../data/centers.json';
import spacesRaw from '../data/spaces.json';
import type {CenterDTO,SpaceDTO,PlaceFilters,PlaceSort} from '../types/place';
import {normalizeArabic} from './search';

// Same area → governorate mapping as the teacher adapter (V6 location hierarchy).
const provinces:Record<string,string>={'القاهرة':'القاهرة','المعادي':'القاهرة','حلوان':'القاهرة','مصر الجديدة':'القاهرة','مدينة نصر':'القاهرة','القاهرة الجديدة':'القاهرة','التجمع الخامس':'القاهرة','الرحاب':'القاهرة','شبرا':'القاهرة','الجيزة':'الجيزة','الدقي':'الجيزة','المهندسين':'الجيزة','الشيخ زايد':'الجيزة','6 أكتوبر':'الجيزة','الهرم':'الجيزة','فيصل':'الجيزة'};

// Arabic labels for the equipment names used in the V6 data.
const featureLabels:Record<string,string>={'Wi‑Fi':'واي فاي','Projector':'بروجكتور','Whiteboard':'سبورة','Smart Screen':'شاشة ذكية','TV':'شاشة عرض','Microphone':'ميكروفون','Video Conference':'اجتماعات فيديو','Lockers':'خزائن'};
export const featureLabel=(f:string)=>featureLabels[f]??f;

export const marketplaceCenters:readonly CenterDTO[]=centersRaw.map(c=>{
 const prices=c.rooms.map(r=>r.price),seats=c.rooms.map(r=>r.seats);
 return {...c,governorate:provinces[c.area]??'القاهرة',reviewsByRole:c.reviewsByRole as CenterDTO['reviewsByRole'],
  price:{min:Math.min(...prices),max:Math.max(...prices)},maxSeats:Math.max(...seats),provenance:{kind:'demo',source:c.source}};
});
export const marketplaceSpaces:readonly SpaceDTO[]=spacesRaw.map(s=>({...s,provenance:{kind:'demo',source:s.source}}));

export function resolveCenter(id:string){return marketplaceCenters.find(c=>c.id===id||c.legacyId===id);}
export function resolveSpace(id:string){return marketplaceSpaces.find(s=>s.id===id||s.legacyId===id);}

export const emptyPlaceFilters:PlaceFilters={q:'',governorate:'',area:'',seats:'',feature:'',rating:'',minPrice:'',maxPrice:'',sort:'default'};

type Place={name:string;type:string;area:string;governorate:string;rating:number;reviews:number;features:string[];price:{min:number;max:number}};
const capacityOf=(p:CenterDTO|SpaceDTO)=>'maxSeats' in p?p.maxSeats:p.capacity;

export function filterPlaces<T extends CenterDTO|SpaceDTO>(places:readonly T[],f:PlaceFilters):T[]{
 const q=normalizeArabic(f.q),min=f.minPrice!==''?Number(f.minPrice):undefined,max=f.maxPrice!==''?Number(f.maxPrice):undefined,seats=f.seats?Number(f.seats):0;
 const rows=places.filter(p=>
  (!q||normalizeArabic([p.name,p.type,p.area,p.governorate,...p.features.map(featureLabel)].join(' ')).includes(q))&&
  (!f.governorate||p.governorate===f.governorate)&&(!f.area||p.area===f.area)&&
  (!seats||capacityOf(p)>=seats)&&(!f.feature||p.features.includes(f.feature))&&
  (!f.rating||p.rating>Number(f.rating))&&
  (min===undefined||p.price.max>=min)&&(max===undefined||p.price.min<=max));
 const sorters:Record<PlaceSort,((a:T,b:T)=>number)|undefined>={default:undefined,rating:(a,b)=>b.rating-a.rating||b.reviews-a.reviews,priceAsc:(a,b)=>a.price.min-b.price.min,priceDesc:(a,b)=>b.price.max-a.price.max};
 const sorter=sorters[f.sort];return sorter?[...rows].sort(sorter):rows;
}

export function placeOptions(places:readonly Place[]){
 const uniq=(values:string[])=>[...new Set(values)].sort((a,b)=>a.localeCompare(b,'ar'));
 return {governorates:uniq(places.map(p=>p.governorate)),areas:uniq(places.map(p=>p.area)),features:uniq(places.flatMap(p=>p.features))};
}
export function areasFor(places:readonly Place[],governorate:string){return placeOptions(places.filter(p=>!governorate||p.governorate===governorate)).areas;}
export function activePlaceFilters(f:PlaceFilters){return Object.entries(f).filter(([k,v])=>k!=='sort'&&!!v.trim()).length;}

export function parsePlaceQuery(params:URLSearchParams,places:readonly Place[]):PlaceFilters{
 const f={...emptyPlaceFilters},o=placeOptions(places);f.q=(params.get('q')??'').slice(0,160);
 for(const [key,allowed] of [['governorate',o.governorates],['area',o.areas],['feature',o.features],['rating',['3','4']],['seats',['5','10','20','30']]] as const){const v=params.get(key)??'';if((allowed as readonly string[]).includes(v))f[key]=v;}
 for(const key of ['minPrice','maxPrice'] as const){const v=params.get(key);if(v!==null&&v.trim()!==''&&Number.isFinite(Number(v))&&Number(v)>=0)f[key]=String(Number(v));}
 const sort=params.get('sort');if(sort==='rating'||sort==='priceAsc'||sort==='priceDesc')f.sort=sort;return f;
}
export function serializePlaceQuery(f:PlaceFilters){const p=new URLSearchParams();for(const [k,v] of Object.entries(f))if(v&&!(k==='sort'&&v==='default'))p.set(k,v);return p.toString();}

// A neutral Google Maps search for the demo coordinates (no live availability implied).
export const directionsHref=(lat:number,lng:number)=>`https://www.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}`;

// V6 stock photo for a place (review use only; licence unconfirmed for commercial launch).
export const placePhoto=(kind:'center'|'space',id:string)=>'/marketplace/places/'+kind+'-'+id.split('-')[1]+'.jpg';
