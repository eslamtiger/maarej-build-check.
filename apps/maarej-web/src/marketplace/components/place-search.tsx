'use client';
import {useEffect,useMemo,useState,useCallback} from 'react';
import {MapPin,Map as MapIcon,Banknote,UsersRound,Sparkles,ArrowUpDown,Building2,DoorOpen} from 'lucide-react';
import {marketplaceCenters,marketplaceSpaces,emptyPlaceFilters,filterPlaces,placeOptions,activePlaceFilters,parsePlaceQuery,serializePlaceQuery,featureLabel,placePhoto,governorates} from '../adapters/places';
import {governorateFromUrl,withGovernorate} from '../adapters/location';
import type {PlaceFilters} from '../types/place';
import {PublicMarketplaceShell} from './public-shell';
import {CenterCard,SpaceCard} from './place-card';
import {PlaceMap} from './place-map';
import type {MapItem} from './place-map';
import {SearchTop,SearchBox,Segmented,Toolbar,FilterPill,StarToggle,ResetPill,ChoiceSheet,MultiSheet,RangeSheet,ResultsHead,Empty,MapFirst} from './search-kit';
import type {Choice} from './search-kit';
import c from './cards.module.css';
import k from './search-kit.module.css';

// Centers and study spaces are one page ("المنشآت التعليمية") with a toggle on top. Same filters, same cards.
const copy={
 centers:{title:'السناتر',search:'سنتر، منطقة أو تجهيز',unit:'سنتر',seatUnit:'طالب',money:'ج.م / ساعة',step:25},
 spaces:{title:'مساحات المذاكرة',search:'مساحة، منطقة أو تجهيز',unit:'مساحة',seatUnit:'أفراد',money:'ج.م',step:25},
} as const;
type Sheet=null|'gov'|'area'|'price'|'seats'|'feature'|'sort';
const sorts:Choice[]=[{value:'rating',label:'الأعلى تقييمًا'},{value:'priceAsc',label:'الأقل سعرًا'},{value:'priceDesc',label:'الأعلى سعرًا'}];
const split=(v:string)=>v?v.split(','):[];

export function PlaceSearch({kind}:{kind:'centers'|'spaces'}){
 const places=kind==='centers'?marketplaceCenters:marketplaceSpaces,t=copy[kind];
 const options=useMemo(()=>placeOptions(places),[places]);
 const bounds=useMemo<[number,number]>(()=>[Math.floor(Math.min(...places.map(p=>p.price.min))/t.step)*t.step,Math.ceil(Math.max(...places.map(p=>p.price.max))/t.step)*t.step],[places,t.step]);
 const [f,setF]=useState<PlaceFilters>(emptyPlaceFilters);
 const [ready,setReady]=useState(false);
 const [sheet,setSheet]=useState<Sheet>(null);
 const [hoverId,setHoverId]=useState<string|null>(null);
 const [selectedId,setSelectedId]=useState<string|null>(null);
 // Filters live in the URL so a search can be shared or restored with the back button.
 useEffect(()=>{const p=new URLSearchParams(location.search),parsed=parsePlaceQuery(p,places);setF({...parsed,governorate:governorateFromUrl(p,parsed.governorate)});setReady(true);},[places]);
 const query=withGovernorate(serializePlaceQuery(f),f.governorate);
 useEffect(()=>{if(ready)history.replaceState(null,'',`${location.pathname}?${query}`);},[query,ready]);
 const set=(patch:Partial<PlaceFilters>)=>{setF(prev=>({...prev,...patch}));setSelectedId(null);};
 const close=useCallback(()=>setSheet(null),[]);
 const centerRows=kind==='centers'?filterPlaces(marketplaceCenters,f):[];
 const spaceRows=kind==='spaces'?filterPlaces(marketplaceSpaces,f):[];
 const count=kind==='centers'?centerRows.length:spaceRows.length;
 const active=activePlaceFilters({...f,q:'',governorate:''}),returnTo=`/${kind}?${query}`;
 const mapItems:MapItem[]=kind==='centers'?centerRows.map(x=>({id:x.id,name:x.name,area:x.area,lat:x.lat,lng:x.lng,rating:x.rating,reviews:x.reviews,priceLabel:String(x.price.min),priceNote:'من',href:'',photo:placePhoto('center',x.id,160)}))
  :spaceRows.map(x=>({id:x.id,name:x.name,area:x.area,lat:x.lat,lng:x.lng,rating:x.rating,reviews:x.reviews,priceLabel:String(x.price.min),priceNote:'من',href:'',photo:placePhoto('space',x.id,160)}));
 // Tapping a pin brings that place to the top of the list and scrolls to its card.
 const pick=(id:string|null)=>{setSelectedId(id);if(id)setTimeout(()=>document.getElementById(`card-${id}`)?.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}),60);};
 const first=<T extends {id:string}>(rows:T[])=>selectedId?[...rows.filter(r=>r.id===selectedId),...rows.filter(r=>r.id!==selectedId)]:rows;

 const areaChoices:Choice[]=options.governorates.filter(g=>!f.governorate||g===f.governorate).flatMap(g=>[...new Set(places.filter(p=>p.governorate===g).map(p=>p.area))].sort((a,b)=>a.localeCompare(b,'ar')).map(a=>({value:a,label:a,group:f.governorate?undefined:g})));
 const lo=f.minPrice?Number(f.minPrice):bounds[0],hi=f.maxPrice?Number(f.maxPrice):bounds[1];
 const priceLabel=f.minPrice||f.maxPrice?`${lo} – ${hi}${f.maxPrice?'':'+'}`:'';
 const seatChoices:Choice[]=['5','10','20','30'].map(n=>({value:n,label:`${n}+ ${t.seatUnit}`}));
 const features=split(f.feature),featureChoices:Choice[]=options.features.map(x=>({value:x,label:featureLabel(x)}));
 const featureValue=features.length?(features.length===1?featureLabel(features[0]):`التجهيزات · ${features.length}`):'';
 const sortLabel=sorts.find(s=>s.value===f.sort)?.label;

 return <PublicMarketplaceShell active={kind}>
  <h1 className={k.srOnly}>المنشآت التعليمية: {t.title}</h1>
  <SearchTop>
   <Segmented items={[{href:'/centers',label:'سناتر',count:marketplaceCenters.length,icon:Building2,active:kind==='centers'},{href:'/spaces',label:'مساحات مذاكرة',count:marketplaceSpaces.length,icon:DoorOpen,active:kind==='spaces'}]}/>
   <SearchBox id={`${kind}-q`} value={f.q} onChange={q=>set({q})} placeholder={t.search}/>
  </SearchTop>

  <Toolbar>
   {active>0&&<ResetPill onReset={()=>set({...emptyPlaceFilters,q:f.q,governorate:f.governorate,sort:f.sort})}/>}
   <FilterPill icon={MapIcon} label={f.governorate?'المحافظة':'كل المحافظات'} value={f.governorate} onOpen={()=>setSheet('gov')}/>
   <FilterPill icon={MapPin} label="المنطقة" value={f.area} onOpen={()=>setSheet('area')} onClear={()=>set({area:''})}/>
   <FilterPill icon={Banknote} label="السعر" value={priceLabel} onOpen={()=>setSheet('price')} onClear={()=>set({minPrice:'',maxPrice:''})}/>
   <StarToggle pressed={f.rating==='4'} onToggle={()=>set({rating:f.rating==='4'?'':'4'})}/>
   <FilterPill icon={Sparkles} label="التجهيزات" value={featureValue} onOpen={()=>setSheet('feature')} onClear={()=>set({feature:''})}/>
   <FilterPill icon={UsersRound} label="السعة" value={f.seats?`${f.seats}+ ${t.seatUnit}`:''} onOpen={()=>setSheet('seats')} onClear={()=>set({seats:''})}/>
  </Toolbar>

  <MapFirst
   map={<PlaceMap items={mapItems} activeId={hoverId} selectedId={selectedId} onHover={setHoverId} onSelect={pick} label={t.title}/>}
   list={<><ResultsHead n={count} unit={t.unit} sortLabel={sortLabel} onSort={()=>setSheet('sort')}/>
    {count===0?<Empty onReset={()=>set({...emptyPlaceFilters,governorate:''})}/>
    :<div className={c.grid}>{first(centerRows).map((x,i)=><CenterCard key={x.id} index={i} center={x} returnTo={returnTo} active={x.id===hoverId||x.id===selectedId} picked={x.id===selectedId} onHover={setHoverId}/>)}{first(spaceRows).map((x,i)=><SpaceCard key={x.id} index={i} space={x} returnTo={returnTo} active={x.id===hoverId||x.id===selectedId} picked={x.id===selectedId} onHover={setHoverId}/>)}</div>}</>}/>

  <ChoiceSheet open={sheet==='gov'} icon={MapIcon} title="المحافظة" choices={governorates.map(g=>({value:g,label:g}))} value={f.governorate} allLabel="كل المحافظات" onPick={ch=>{const g=ch?.value??'';set({governorate:g,area:g&&f.area&&!places.some(p=>p.area===f.area&&p.governorate===g)?'':f.area});}} onClose={close}/>
  <ChoiceSheet open={sheet==='area'} icon={MapPin} title={f.governorate?`المنطقة · ${f.governorate}`:'المنطقة'} choices={areaChoices} value={f.area} onPick={ch=>set({area:ch?.value??'',...(ch?.group?{governorate:ch.group}:{})})} onClose={close}/>
  <RangeSheet open={sheet==='price'} icon={Banknote} title="السعر" bounds={bounds} step={t.step} value={[lo,hi]} money={t.money} count={count} unit={t.unit} onChange={([a,b])=>set({minPrice:a>bounds[0]?String(a):'',maxPrice:b<bounds[1]?String(b):''})} onClose={close}/>
  <MultiSheet open={sheet==='feature'} icon={Sparkles} title="التجهيزات" choices={featureChoices} values={features} count={count} unit={t.unit} onChange={v=>set({feature:v.join(',')})} onClose={close}/>
  <ChoiceSheet open={sheet==='seats'} icon={UsersRound} title="السعة" choices={seatChoices} value={f.seats} onPick={ch=>set({seats:ch?.value??''})} onClose={close}/>
  <ChoiceSheet open={sheet==='sort'} icon={ArrowUpDown} title="الترتيب" choices={sorts} value={f.sort==='default'?'':f.sort} allLabel="الافتراضي" onPick={ch=>set({sort:(ch?.value??'default') as PlaceFilters['sort']})} onClose={close}/>
 </PublicMarketplaceShell>;
}
