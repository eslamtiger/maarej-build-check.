'use client';
import {useEffect,useMemo,useState,useCallback} from 'react';
import {BookOpen,GraduationCap,MapPin,Banknote,School,ArrowUpDown} from 'lucide-react';
import {marketplaceTeachers} from '../adapters/teachers';
import {marketplaceCenters,marketplaceSpaces} from '../adapters/places';
import {emptyFilters,filterTeachers,searchOptions,activeFilterCount,parseTeacherQuery,serializeTeacherQuery} from '../adapters/search';
import type {SearchFilters} from '../types/teacher';
import {PublicMarketplaceShell} from './public-shell';
import {TeacherCard,teacherGradient} from './teacher-card';
import {PlaceMap} from './place-map';
import type {MapItem} from './place-map';
import {SearchTop,SearchBox,Toolbar,FilterPill,StarToggle,ResetPill,ChoiceSheet,Count,Empty,Split} from './search-kit';
import type {Choice} from './search-kit';
import c from './cards.module.css';
import k from './search-kit.module.css';

const options=searchOptions(marketplaceTeachers);
// Teachers have an area, not an address: each pin sits near the middle of that area (from the demo places), nudged a little so pins don't stack.
const areaInfo=(()=>{const m=new Map<string,{lat:number;lng:number;n:number;gov:string}>();
 for(const p of [...marketplaceCenters,...marketplaceSpaces]){const a=m.get(p.area)??{lat:0,lng:0,n:0,gov:p.governorate};a.lat+=p.lat;a.lng+=p.lng;a.n++;m.set(p.area,a);}
 return m;})();
const hash=(s:string)=>[...s].reduce((h,ch)=>(h*31+ch.charCodeAt(0))%9973,7);
const spot=(area:string,id:string)=>{const a=areaInfo.get(area);const lat=a?a.lat/a.n:30.04,lng=a?a.lng/a.n:31.24,h=hash(id);return {lat:lat+((h%7)-3)*.004,lng:lng+((Math.floor(h/7)%7)-3)*.004};};
const initials=(name:string)=>name.replace(/^أ\.\s*/,'').split(' ').slice(0,2).map(s=>s[0]).join(' ');

type Sheet=null|'subject'|'stage'|'area'|'price'|'system'|'sort';
const prices:Choice[]=[{value:'-150',label:'حتى 150'},{value:'150-250',label:'150 – 250'},{value:'250-',label:'أكتر من 250'}];
const sorts:Choice[]=[{value:'rating',label:'الأعلى تقييمًا'},{value:'priceAsc',label:'الأقل سعرًا'},{value:'priceDesc',label:'الأعلى سعرًا'}];
const list=(values:readonly string[]):Choice[]=>values.map(v=>({value:v,label:v}));
const areaChoices:Choice[]=[...new Set(marketplaceTeachers.flatMap(t=>t.areas))].map(a=>({value:a,label:a,group:areaInfo.get(a)?.gov??'أخرى'})).sort((x,y)=>(x.group??'').localeCompare(y.group??'','ar')||x.label.localeCompare(y.label,'ar'));

export function TeacherSearch(){
 const [f,setF]=useState<SearchFilters>({...emptyFilters});
 const [view,setView]=useState<'list'|'map'>('list');
 const [ready,setReady]=useState(false);
 const [sheet,setSheet]=useState<Sheet>(null);
 const [hoverId,setHoverId]=useState<string|null>(null);
 const [selectedId,setSelectedId]=useState<string|null>(null);
 useEffect(()=>{const read=()=>{const p=new URLSearchParams(location.search);setF(parseTeacherQuery(p,marketplaceTeachers));setView(p.get('view')==='map'?'map':'list');};read();setReady(true);addEventListener('popstate',read);return()=>removeEventListener('popstate',read);},[]);
 const query=serializeTeacherQuery(f,view);
 useEffect(()=>{if(ready)history.replaceState(null,'',location.pathname+(query?'?'+query:''));},[query,ready]);
 const set=(patch:Partial<SearchFilters>)=>{setF(prev=>({...prev,...patch}));setSelectedId(null);};
 const close=useCallback(()=>setSheet(null),[]);
 const results=filterTeachers(marketplaceTeachers,f),active=activeFilterCount({...f,q:''}),returnTo='/teachers'+(query?'?'+query:'');
 const mapItems:MapItem[]=useMemo(()=>results.filter(t=>t.areas.length).map(t=>({id:t.id,name:t.name,area:t.areas[0],...spot(t.areas[0],t.id),rating:t.rating??0,reviews:t.reviewCount??0,priceLabel:t.price?String(t.price.min):'—',priceNote:'من',priceUnit:'ج.م / حصة',href:`/teachers/${t.id}?returnTo=${encodeURIComponent(returnTo)}`,photo:t.image,fallback:{text:initials(t.name),bg:teacherGradient(t.id)}})),[results,returnTo]);
 const pick=(id:string|null)=>{setSelectedId(id);if(id&&view==='list')document.getElementById(`card-${id}`)?.scrollIntoView({block:'center',behavior:'smooth'});};
 const priceValue=f.minPrice||f.maxPrice?`${f.minPrice}-${f.maxPrice}`:'';
 const priceLabel=prices.find(p=>p.value===priceValue)?.label??(priceValue?`${f.minPrice||'0'} – ${f.maxPrice||'∞'}`:'');

 return <PublicMarketplaceShell active="teachers">
  <h1 className={k.srOnly}>المدرسين</h1>
  <SearchTop><SearchBox id="teacher-q" value={f.q} onChange={q=>set({q})} placeholder="مدرس، مادة أو منطقة"/></SearchTop>

  <Toolbar view={view} onView={setView}>
   {active>0&&<ResetPill onReset={()=>set({...emptyFilters,q:f.q})}/>}
   <FilterPill icon={BookOpen} label="المادة" value={f.subject} onOpen={()=>setSheet('subject')} onClear={()=>set({subject:''})}/>
   <FilterPill icon={GraduationCap} label="المرحلة" value={f.stage} onOpen={()=>setSheet('stage')} onClear={()=>set({stage:''})}/>
   <FilterPill icon={MapPin} label="المنطقة" value={f.area||f.governorate} onOpen={()=>setSheet('area')} onClear={()=>set({area:'',governorate:''})}/>
   <FilterPill icon={Banknote} label="السعر" value={priceLabel} onOpen={()=>setSheet('price')} onClear={()=>set({minPrice:'',maxPrice:''})}/>
   <StarToggle pressed={f.rating==='4'} onToggle={()=>set({rating:f.rating==='4'?'':'4'})}/>
   <FilterPill icon={School} label="النظام" value={f.system} onOpen={()=>setSheet('system')} onClear={()=>set({system:''})}/>
   <FilterPill icon={ArrowUpDown} label="الترتيب" value={sorts.find(s=>s.value===f.sort)?.label} onOpen={()=>setSheet('sort')} onClear={()=>set({sort:'default'})}/>
  </Toolbar>

  <Split view={view}
   list={<><Count n={results.length} unit="مدرس"/>
    {results.length===0?<Empty onReset={()=>set({...emptyFilters})}/>
    :<div className={c.grid}>{results.map((t,i)=><TeacherCard key={t.id} index={i} teacher={t} returnTo={returnTo} active={t.id===hoverId||t.id===selectedId} onHover={setHoverId}/>)}</div>}</>}
   map={<PlaceMap items={mapItems} activeId={hoverId} selectedId={selectedId} onHover={setHoverId} onSelect={pick} label="المدرسين"/>}/>

  <ChoiceSheet open={sheet==='subject'} icon={BookOpen} title="المادة" choices={list(options.subjects)} value={f.subject} onPick={ch=>set({subject:ch?.value??''})} onClose={close}/>
  <ChoiceSheet open={sheet==='stage'} icon={GraduationCap} title="المرحلة" choices={list(options.stages)} value={f.stage} onPick={ch=>set({stage:ch?.value??''})} onClose={close}/>
  <ChoiceSheet open={sheet==='area'} icon={MapPin} title="المنطقة" choices={areaChoices} value={f.area} onPick={ch=>set({area:ch?.value??'',governorate:ch&&ch.group!=='أخرى'?ch.group??'':''})} onClose={close}/>
  <ChoiceSheet open={sheet==='price'} icon={Banknote} title="سعر الحصة (ج.م)" choices={prices} value={priceValue} onPick={ch=>{const [minPrice='',maxPrice='']=(ch?.value??'-').split('-');set({minPrice,maxPrice});}} onClose={close}/>
  <ChoiceSheet open={sheet==='system'} icon={School} title="النظام" choices={list(options.systems)} value={f.system} onPick={ch=>set({system:ch?.value??''})} onClose={close}/>
  <ChoiceSheet open={sheet==='sort'} icon={ArrowUpDown} title="الترتيب" choices={sorts} value={f.sort==='default'?'':f.sort} allLabel="الافتراضي" onPick={ch=>set({sort:(ch?.value??'default') as SearchFilters['sort']})} onClose={close}/>
 </PublicMarketplaceShell>;
}
