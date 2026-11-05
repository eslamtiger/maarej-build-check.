'use client';
import {useEffect,useMemo,useState,useCallback} from 'react';
import {MapPin,Banknote,UsersRound,Sparkles,ArrowUpDown,Building2,DoorOpen} from 'lucide-react';
import {marketplaceCenters,marketplaceSpaces,emptyPlaceFilters,filterPlaces,placeOptions,activePlaceFilters,parsePlaceQuery,serializePlaceQuery,featureLabel,placePhoto} from '../adapters/places';
import type {PlaceFilters} from '../types/place';
import {PublicMarketplaceShell} from './public-shell';
import {CenterCard,SpaceCard} from './place-card';
import {PlaceMap} from './place-map';
import type {MapItem} from './place-map';
import {SearchTop,SearchBox,Segmented,Toolbar,FilterPill,StarToggle,ResetPill,ChoiceSheet,Count,Empty,Split} from './search-kit';
import type {Choice} from './search-kit';
import c from './cards.module.css';
import k from './search-kit.module.css';

// Centers and study spaces are one page ("المنشآت التعليمية") with a toggle on top. Same filters, same cards.
const copy={
 centers:{title:'السناتر',search:'سنتر، منطقة أو تجهيز',unit:'سنتر',seatUnit:'طالب',prices:[['',`300`,'حتى 300'],['300','500','300 – 500'],['500','','أكتر من 500']]},
 spaces:{title:'مساحات المذاكرة',search:'مساحة، منطقة أو تجهيز',unit:'مساحة',seatUnit:'أفراد',prices:[['','100','حتى 100'],['100','250','100 – 250'],['250','','أكتر من 250']]},
} as const;
type Sheet=null|'area'|'price'|'seats'|'feature'|'sort';
const sorts:Choice[]=[{value:'rating',label:'الأعلى تقييمًا'},{value:'priceAsc',label:'الأقل سعرًا'},{value:'priceDesc',label:'الأعلى سعرًا'}];

export function PlaceSearch({kind}:{kind:'centers'|'spaces'}){
 const places=kind==='centers'?marketplaceCenters:marketplaceSpaces,t=copy[kind];
 const options=useMemo(()=>placeOptions(places),[places]);
 const [f,setF]=useState<PlaceFilters>(emptyPlaceFilters);
 const [ready,setReady]=useState(false);
 const [sheet,setSheet]=useState<Sheet>(null);
 const [view,setView]=useState<'list'|'map'>('list');
 const [hoverId,setHoverId]=useState<string|null>(null);
 const [selectedId,setSelectedId]=useState<string|null>(null);
 // Filters live in the URL so a search can be shared or restored with the back button.
 useEffect(()=>{setF(parsePlaceQuery(new URLSearchParams(location.search),places));setReady(true);},[places]);
 const query=serializePlaceQuery(f);
 useEffect(()=>{if(ready)history.replaceState(null,'',`${location.pathname}${query?`?${query}`:''}`);},[query,ready]);
 const set=(patch:Partial<PlaceFilters>)=>setF(prev=>({...prev,...patch}));
 const close=useCallback(()=>setSheet(null),[]);
 const centerRows=kind==='centers'?filterPlaces(marketplaceCenters,f):[];
 const spaceRows=kind==='spaces'?filterPlaces(marketplaceSpaces,f):[];
 const count=kind==='centers'?centerRows.length:spaceRows.length;
 const active=activePlaceFilters({...f,q:''}),returnTo=`/${kind}${query?`?${query}`:''}`;
 const mapItems:MapItem[]=kind==='centers'?centerRows.map(x=>({id:x.id,name:x.name,area:x.area,lat:x.lat,lng:x.lng,rating:x.rating,reviews:x.reviews,priceLabel:String(x.price.min),priceNote:'من',priceUnit:'ج.م / ساعة',href:`/centers/${x.id}?returnTo=${encodeURIComponent(returnTo)}`,photo:placePhoto('center',x.id,300)}))
  :spaceRows.map(x=>({id:x.id,name:x.name,area:x.area,lat:x.lat,lng:x.lng,rating:x.rating,reviews:x.reviews,priceLabel:String(x.price.min),priceNote:'من',href:`/spaces/${x.id}?returnTo=${encodeURIComponent(returnTo)}`,photo:placePhoto('space',x.id,300)}));
 const pick=(id:string|null)=>{setSelectedId(id);if(id&&view==='list')document.getElementById(`card-${id}`)?.scrollIntoView({block:'center',behavior:'smooth'});};

 const areaChoices:Choice[]=options.governorates.flatMap(g=>[...new Set(places.filter(p=>p.governorate===g).map(p=>p.area))].sort((a,b)=>a.localeCompare(b,'ar')).map(a=>({value:a,label:a,group:g})));
 const priceList:readonly (readonly [string,string,string])[]=t.prices;
 const priceChoices:Choice[]=priceList.map(([min,max,label])=>({value:`${min}-${max}`,label}));
 const priceValue=f.minPrice||f.maxPrice?`${f.minPrice}-${f.maxPrice}`:'';
 const priceLabel=priceChoices.find(p=>p.value===priceValue)?.label??(priceValue?`${f.minPrice||'0'} – ${f.maxPrice||'∞'}`:'');
 const seatChoices:Choice[]=['5','10','20','30'].map(n=>({value:n,label:`${n}+ ${t.seatUnit}`}));
 const featureChoices:Choice[]=options.features.map(x=>({value:x,label:featureLabel(x)}));
 const sortLabel=sorts.find(s=>s.value===f.sort)?.label;

 return <PublicMarketplaceShell active={kind}>
  <h1 className={k.srOnly}>المنشآت التعليمية: {t.title}</h1>
  <SearchTop>
   <Segmented items={[{href:'/centers',label:'سناتر',count:marketplaceCenters.length,icon:Building2,active:kind==='centers'},{href:'/spaces',label:'مساحات مذاكرة',count:marketplaceSpaces.length,icon:DoorOpen,active:kind==='spaces'}]}/>
   <SearchBox id={`${kind}-q`} value={f.q} onChange={q=>set({q})} placeholder={t.search}/>
  </SearchTop>

  <Toolbar view={view} onView={setView}>
   {active>0&&<ResetPill onReset={()=>setF({...emptyPlaceFilters,q:f.q})}/>}
   <FilterPill icon={MapPin} label="المنطقة" value={f.area||f.governorate} onOpen={()=>setSheet('area')} onClear={()=>set({area:'',governorate:''})}/>
   <FilterPill icon={Banknote} label="السعر" value={priceLabel} onOpen={()=>setSheet('price')} onClear={()=>set({minPrice:'',maxPrice:''})}/>
   <StarToggle pressed={f.rating==='4'} onToggle={()=>set({rating:f.rating==='4'?'':'4'})}/>
   <FilterPill icon={UsersRound} label="السعة" value={f.seats?`${f.seats}+ ${t.seatUnit}`:''} onOpen={()=>setSheet('seats')} onClear={()=>set({seats:''})}/>
   <FilterPill icon={Sparkles} label="التجهيزات" value={f.feature?featureLabel(f.feature):''} onOpen={()=>setSheet('feature')} onClear={()=>set({feature:''})}/>
   <FilterPill icon={ArrowUpDown} label="الترتيب" value={sortLabel} onOpen={()=>setSheet('sort')} onClear={()=>set({sort:'default'})}/>
  </Toolbar>

  <Split view={view}
   list={<><Count n={count} unit={t.unit}/>
    {count===0?<Empty onReset={()=>setF(emptyPlaceFilters)}/>
    :<div className={c.grid}>{centerRows.map((x,i)=><CenterCard key={x.id} index={i} center={x} returnTo={returnTo} active={x.id===hoverId||x.id===selectedId} onHover={setHoverId}/>)}{spaceRows.map((x,i)=><SpaceCard key={x.id} index={i} space={x} returnTo={returnTo} active={x.id===hoverId||x.id===selectedId} onHover={setHoverId}/>)}</div>}</>}
   map={<PlaceMap items={mapItems} activeId={hoverId} selectedId={selectedId} onHover={setHoverId} onSelect={pick} label={t.title}/>}/>

  <ChoiceSheet open={sheet==='area'} icon={MapPin} title="المنطقة" choices={areaChoices} value={f.area} onPick={ch=>set({area:ch?.value??'',governorate:ch?.group??''})} onClose={close}/>
  <ChoiceSheet open={sheet==='price'} icon={Banknote} title={kind==='centers'?'سعر الساعة (ج.م)':'السعر (ج.م)'} choices={priceChoices} value={priceValue} onPick={ch=>{const [minPrice='',maxPrice='']=(ch?.value??'-').split('-');set({minPrice,maxPrice});}} onClose={close}/>
  <ChoiceSheet open={sheet==='seats'} icon={UsersRound} title="السعة" choices={seatChoices} value={f.seats} onPick={ch=>set({seats:ch?.value??''})} onClose={close}/>
  <ChoiceSheet open={sheet==='feature'} icon={Sparkles} title="التجهيزات" choices={featureChoices} value={f.feature} onPick={ch=>set({feature:ch?.value??''})} onClose={close}/>
  <ChoiceSheet open={sheet==='sort'} icon={ArrowUpDown} title="الترتيب" choices={sorts} value={f.sort==='default'?'':f.sort} allLabel="الافتراضي" onPick={ch=>set({sort:(ch?.value??'default') as PlaceFilters['sort']})} onClose={close}/>
 </PublicMarketplaceShell>;
}
