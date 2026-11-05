'use client';
import {useEffect,useMemo,useState,useCallback} from 'react';
import {BookOpen,GraduationCap,MapPin,Map as MapIcon,Banknote,School,ArrowUpDown,Star} from 'lucide-react';
import {marketplaceTeachers} from '../adapters/teachers';
import {marketplaceCenters,marketplaceSpaces,areaGovernorate,governorates} from '../adapters/places';
import {governorateFromUrl,withGovernorate} from '../adapters/location';
import {emptyFilters,filterTeachers,searchOptions,activeFilterCount,parseTeacherQuery,serializeTeacherQuery} from '../adapters/search';
import type {SearchFilters} from '../types/teacher';
import {PublicMarketplaceShell} from './public-shell';
import {TeacherCard,teacherGradient} from './teacher-card';
import {PlaceMap} from './place-map';
import type {MapItem} from './place-map';
import {SearchTop,SearchBox,Toolbar,FilterPill,ResetPill,ChoiceSheet,MultiSheet,RangeSheet,ResultsHead,Empty,MapFirst} from './search-kit';
import type {Choice} from './search-kit';
import c from './cards.module.css';
import k from './search-kit.module.css';

const options=searchOptions(marketplaceTeachers);
// Teachers have an area, not an address: each pin sits near the middle of that area (from the demo places), nudged a little so pins don't stack.
const areaCenter=(()=>{const m=new Map<string,{lat:number;lng:number;n:number}>();
 for(const p of [...marketplaceCenters,...marketplaceSpaces]){const a=m.get(p.area)??{lat:0,lng:0,n:0};a.lat+=p.lat;a.lng+=p.lng;a.n++;m.set(p.area,a);}
 return m;})();
const hash=(s:string)=>[...s].reduce((h,ch)=>(h*31+ch.charCodeAt(0))%9973,7);
const spot=(area:string,id:string)=>{const a=areaCenter.get(area);const lat=a?a.lat/a.n:30.04,lng=a?a.lng/a.n:31.24,h=hash(id);return {lat:lat+((h%7)-3)*.004,lng:lng+((Math.floor(h/7)%7)-3)*.004};};
const initials=(name:string)=>name.replace(/^أ\.\s*/,'').split(' ').slice(0,2).map(s=>s[0]).join(' ');
const priceBounds:[number,number]=[Math.floor(Math.min(...marketplaceTeachers.flatMap(t=>t.price?[t.price.min]:[]))/10)*10,Math.ceil(Math.max(...marketplaceTeachers.flatMap(t=>t.price?[t.price.max]:[]))/10)*10];

type Sheet=null|'rating'|'subject'|'stage'|'gov'|'area'|'price'|'system'|'sort';
const ratings:Choice[]=[{value:'3',label:'⭐ أكتر من 3'},{value:'4',label:'⭐ أكتر من 4'},{value:'4.5',label:'⭐ أكتر من 4.5'}];
const sorts:Choice[]=[{value:'rating',label:'الأعلى تقييمًا'},{value:'priceAsc',label:'الأقل سعرًا'},{value:'priceDesc',label:'الأعلى سعرًا'}];
const list=(values:readonly string[]):Choice[]=>values.map(v=>({value:v,label:v}));
const allAreas=[...new Set(marketplaceTeachers.flatMap(t=>t.areas))];

export function TeacherSearch(){
 const [f,setF]=useState<SearchFilters>({...emptyFilters});
 const [ready,setReady]=useState(false);
 const [sheet,setSheet]=useState<Sheet>(null);
 const [hoverId,setHoverId]=useState<string|null>(null);
 const [selectedId,setSelectedId]=useState<string|null>(null);
 useEffect(()=>{const read=()=>{const p=new URLSearchParams(location.search),parsed=parseTeacherQuery(p,marketplaceTeachers);setF({...parsed,governorate:governorateFromUrl(p,parsed.governorate)});};read();setReady(true);addEventListener('popstate',read);return()=>removeEventListener('popstate',read);},[]);
 const query=withGovernorate(serializeTeacherQuery(f,'list'),f.governorate);
 useEffect(()=>{if(ready)history.replaceState(null,'',`${location.pathname}?${query}`);},[query,ready]);
 const set=(patch:Partial<SearchFilters>)=>{setF(prev=>({...prev,...patch}));setSelectedId(null);};
 const close=useCallback(()=>setSheet(null),[]);
 const results=filterTeachers(marketplaceTeachers,f),active=activeFilterCount({...f,q:'',governorate:''}),returnTo=`/teachers?${query}`;
 const ordered=selectedId?[...results.filter(t=>t.id===selectedId),...results.filter(t=>t.id!==selectedId)]:results;
 const mapItems:MapItem[]=useMemo(()=>results.filter(t=>t.areas.length).map(t=>{const area=(f.area&&t.areas.includes(f.area)?f.area:t.areas.find(a=>!f.governorate||areaGovernorate.get(a)===f.governorate))??t.areas[0];
  return {id:t.id,name:t.name,area,...spot(area,t.id),rating:t.rating??0,reviews:t.reviewCount??0,priceLabel:t.price?String(t.price.min):'—',priceNote:'من',href:'',photo:t.image?.replace('w=600&h=600','w=120&h=120'),fallback:{text:initials(t.name),bg:teacherGradient(t.id)}};}),[results,f.area,f.governorate]);
 // Tapping a face on the map brings that teacher to the top of the list and scrolls to the card.
 const pick=(id:string|null)=>{setSelectedId(id);if(id)setTimeout(()=>document.getElementById(`card-${id}`)?.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}),60);};
 const subjects=f.subject?f.subject.split(','):[];
 const lo=f.minPrice?Number(f.minPrice):priceBounds[0],hi=f.maxPrice?Number(f.maxPrice):priceBounds[1];
 const priceLabel=f.minPrice||f.maxPrice?`${lo} – ${hi}${f.maxPrice?'':'+'}`:'';
 const areaChoices:Choice[]=allAreas.filter(a=>!f.governorate||areaGovernorate.get(a)===f.governorate).map(a=>({value:a,label:a,group:f.governorate?undefined:areaGovernorate.get(a)??'أخرى'})).sort((x,y)=>(x.group??'').localeCompare(y.group??'','ar')||x.label.localeCompare(y.label,'ar'));

 return <PublicMarketplaceShell active="teachers">
  <h1 className={k.srOnly}>المدرسين</h1>
  <SearchTop><SearchBox id="teacher-q" value={f.q} onChange={q=>set({q})} placeholder="مدرس، مادة أو منطقة"/></SearchTop>

  <Toolbar>
   {active>0&&<ResetPill onReset={()=>set({...emptyFilters,q:f.q,governorate:f.governorate,sort:f.sort})}/>}
   <FilterPill icon={MapIcon} label={f.governorate?'المحافظة':'كل المحافظات'} value={f.governorate} onOpen={()=>setSheet('gov')}/>
   <FilterPill icon={MapPin} label="المنطقة" value={f.area} onOpen={()=>setSheet('area')} onClear={()=>set({area:''})}/>
   <FilterPill icon={School} label="النظام" value={f.system} onOpen={()=>setSheet('system')} onClear={()=>set({system:''})}/>
   <FilterPill icon={GraduationCap} label="المرحلة" value={f.stage} onOpen={()=>setSheet('stage')} onClear={()=>set({stage:''})}/>
   <FilterPill icon={BookOpen} label="المادة" value={subjects.length?(subjects.length===1?subjects[0]:`${subjects[0]} +${subjects.length-1}`):''} onOpen={()=>setSheet('subject')} onClear={()=>set({subject:''})}/>
   <FilterPill icon={Banknote} label="السعر" value={priceLabel} onOpen={()=>setSheet('price')} onClear={()=>set({minPrice:'',maxPrice:''})}/>
   <FilterPill icon={Star} label="التقييم" value={f.rating?`${f.rating}+`:''} onOpen={()=>setSheet('rating')} onClear={()=>set({rating:''})}/>
  </Toolbar>

  <MapFirst
   map={<PlaceMap items={mapItems} activeId={hoverId} selectedId={selectedId} onHover={setHoverId} onSelect={pick} label="المدرسين" shape="round"/>}
   list={<><ResultsHead n={results.length} unit="مدرس" sortLabel={sorts.find(s=>s.value===f.sort)?.label} onSort={()=>setSheet('sort')}/>
    {results.length===0?<Empty onReset={()=>set({...emptyFilters})}/>
    :<div className={c.grid}>{ordered.map((t,i)=><TeacherCard key={t.id} index={i} teacher={t} returnTo={returnTo} active={t.id===hoverId||t.id===selectedId} picked={t.id===selectedId} onHover={setHoverId}/>)}</div>}</>}/>

  <MultiSheet open={sheet==='subject'} icon={BookOpen} title="المادة" choices={list(options.subjects)} values={subjects} count={results.length} unit="مدرس" onChange={v=>set({subject:v.join(',')})} onClose={close}/>
  <ChoiceSheet open={sheet==='stage'} icon={GraduationCap} title="المرحلة" choices={list(options.stages)} value={f.stage} onPick={ch=>set({stage:ch?.value??''})} onClose={close}/>
  <ChoiceSheet open={sheet==='gov'} icon={MapIcon} title="المحافظة" choices={governorates.map(g=>({value:g,label:g}))} value={f.governorate} allLabel="كل المحافظات" onPick={ch=>{const g=ch?.value??'';set({governorate:g,area:g&&f.area&&areaGovernorate.get(f.area)!==g?'':f.area});}} onClose={close}/>
  <ChoiceSheet open={sheet==='area'} icon={MapPin} title={f.governorate?`المنطقة · ${f.governorate}`:'المنطقة'} choices={areaChoices} value={f.area} onPick={ch=>set({area:ch?.value??'',...(ch?.group&&ch.group!=='أخرى'?{governorate:ch.group}:{})})} onClose={close}/>
  <RangeSheet open={sheet==='price'} icon={Banknote} title="سعر الحصة" bounds={priceBounds} step={10} value={[lo,hi]} money="ج.م / حصة" count={results.length} unit="مدرس" onChange={([a,b])=>set({minPrice:a>priceBounds[0]?String(a):'',maxPrice:b<priceBounds[1]?String(b):''})} onClose={close}/>
  <ChoiceSheet open={sheet==='system'} icon={School} title="النظام" choices={list(options.systems)} value={f.system} onPick={ch=>set({system:ch?.value??''})} onClose={close}/>
  <ChoiceSheet open={sheet==='rating'} icon={Star} title="التقييم" choices={ratings} value={f.rating} onPick={ch=>set({rating:ch?.value??''})} onClose={close}/>
  <ChoiceSheet open={sheet==='sort'} icon={ArrowUpDown} title="الترتيب" choices={sorts} value={f.sort==='default'?'':f.sort} allLabel="الافتراضي" onPick={ch=>set({sort:(ch?.value??'default') as SearchFilters['sort']})} onClose={close}/>
 </PublicMarketplaceShell>;
}
