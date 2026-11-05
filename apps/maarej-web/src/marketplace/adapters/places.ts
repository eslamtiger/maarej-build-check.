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
// Demo space names and types shown in Arabic (the V6 dataset mixes English brand-style names).
const spaceNames:Record<string,string>={'spc-01':'ركن المذاكرة','spc-02':'مساحة تركيز','spc-04':'مكتب ومذاكرة','spc-05':'الركن الهادي','spc-07':'العُش','spc-08':'معمل المذاكرة','spc-10':'محطة تركيز','spc-11':'نتعلّم سوا','spc-13':'ساحة الفريق','spc-14':'بيت الأفكار','spc-15':'ملتقى المذاكرة','spc-16':'مكتبي','spc-17':'براح','spc-19':'ذهن','spc-20':'مرسى المذاكرة','spc-21':'الركن المبدع','spc-22':'ورشة المذاكرة','spc-23':'قاعدة الفريق','spc-24':'غرفة تركيز','spc-25':'شغل وتعلّم','spc-27':'دور المذاكرة','spc-28':'مكتبك','spc-30':'مكان التعلّم'};
const spaceTypes:Record<string,string>={'Maker Space':'مساحة تصنيع','Media / Podcast':'استوديو بودكاست'};
export const marketplaceSpaces:readonly SpaceDTO[]=spacesRaw.map(s=>({...s,name:spaceNames[s.id]??s.name,type:spaceTypes[s.type]??s.type,provenance:{kind:'demo',source:s.source}}));

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

// Photos from Unsplash (Unsplash License: free for commercial use, no attribution required), hotlinked from their CDN.
// Centers get classrooms and training rooms; spaces get study rooms and coworking desks. Picked by id so a place keeps its photo everywhere.
const centerPhotos=['1580582932707-520aed937b7b','1635424239131-32dc44986b56','1519406596751-0a3ccc4937fe','1762176264161-09219da49794','1762176263996-a0713a49ee4d','1766476210492-824c8a4b79b2','1757192420362-3629ce30d2e3','1757193714692-44cdf07a5377','1786397685301-2421a92593ee','1541829070764-84a7d30dd3f3','1510531704581-5b2870972060','1733568414840-bcf218851fc3','1658200542476-68e8adf747ff','1757194455505-1433ab2cd758','1789654499247-67ddedd251cc'];
const spacePhotos=['1497366811353-6870744d04b2','1770816307817-2fa6131e3a9b','1606836576983-8b458e75221d','1759301495186-d3787210df5b','1765729003706-355ca161736d','1600508774634-4e11d34730e2','1614070776241-fb47cec38278','1549637642-90187f64f420','1754607812143-12d421b1db11','1777896193454-8b4863264f0b','1687291058463-b19f5a0d4081','1789654499278-dd06937e20a1','1731816803705-54ab8fbd6a8f','1593588332695-cd49488a8ec8','1497215728101-856f4ea42174'];
export const placePhoto=(kind:'center'|'space',id:string,width=800)=>{
 const list=kind==='center'?centerPhotos:spacePhotos,n=Number(id.split('-')[1])||1;
 return `https://images.unsplash.com/photo-${list[(n-1)%list.length]}?auto=format&fit=crop&w=${width}&q=70`;
};
