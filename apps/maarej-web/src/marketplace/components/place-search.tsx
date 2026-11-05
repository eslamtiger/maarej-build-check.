'use client';
import {useEffect,useMemo,useState} from 'react';
import {Search,X,RotateCcw,SlidersHorizontal,List,Map as MapIcon,Star,Check} from 'lucide-react';
import {marketplaceCenters,marketplaceSpaces,emptyPlaceFilters,filterPlaces,placeOptions,areasFor,activePlaceFilters,parsePlaceQuery,serializePlaceQuery,featureLabel,placePhoto} from '../adapters/places';
import type {PlaceFilters} from '../types/place';
import {PublicMarketplaceShell} from './public-shell';
import {CenterCard,SpaceCard} from './place-card';
import {PlaceMap} from './place-map';
import type {MapItem} from './place-map';
import styles from './places.module.css';
import d from './discover.module.css';

const copy={
 centers:{eyebrow:'سناتر تعليمية',title:'لاقي السنتر والقاعة المناسبة',lead:'قارن القاعات حسب المنطقة والسعة والتجهيزات وسعر الساعة.',search:'اسم السنتر أو المنطقة أو تجهيز',seats:'سعة القاعة',price:'سعر القاعة (ج.م / ساعة)',unit:'سنتر',empty:'مفيش سنتر مطابق للفلاتر دي.',pricePresets:[['حتى 300',{minPrice:'',maxPrice:'300'}],['300 – 500',{minPrice:'300',maxPrice:'500'}],['أكتر من 500',{minPrice:'500',maxPrice:''}]]},
 spaces:{eyebrow:'مساحات مذاكرة وعمل',title:'مساحة هادية تذاكر فيها',lead:'مكتبات وغرف دراسة وقاعات فرق، قارن السعة والتجهيزات.',search:'اسم المساحة أو نوعها أو المنطقة',seats:'السعة',price:'نطاق السعر (ج.م)',unit:'مساحة',empty:'مفيش مساحة مطابقة للفلاتر دي.',pricePresets:[['حتى 100',{minPrice:'',maxPrice:'100'}],['100 – 250',{minPrice:'100',maxPrice:'250'}],['أكتر من 250',{minPrice:'250',maxPrice:''}]]},
} as const;

export function PlaceSearch({kind}:{kind:'centers'|'spaces'}){
 const places=kind==='centers'?marketplaceCenters:marketplaceSpaces,t=copy[kind];
 const options=useMemo(()=>placeOptions(places),[places]);
 const [f,setF]=useState<PlaceFilters>(emptyPlaceFilters);
 const [ready,setReady]=useState(false);
 const [sheet,setSheet]=useState(false);
 const [view,setView]=useState<'list'|'map'>('list');
 const [hoverId,setHoverId]=useState<string|null>(null);
 const [selectedId,setSelectedId]=useState<string|null>(null);
 // Filters live in the URL so a search can be shared or restored with the back button.
 useEffect(()=>{setF(parsePlaceQuery(new URLSearchParams(location.search),places));setReady(true);},[places]);
 const query=serializePlaceQuery(f);
 useEffect(()=>{if(ready)history.replaceState(null,'',`${location.pathname}${query?`?${query}`:''}`);},[query,ready]);
 useEffect(()=>{if(!sheet)return;const k=(e:KeyboardEvent)=>{if(e.key==='Escape')setSheet(false);};document.addEventListener('keydown',k);const prev=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.removeEventListener('keydown',k);document.body.style.overflow=prev;};},[sheet]);
 const set=(key:keyof PlaceFilters,value:string)=>setF(prev=>({...prev,[key]:value,...(key==='governorate'?{area:''}:{})}));
 const centerRows=kind==='centers'?filterPlaces(marketplaceCenters,f):[];
 const spaceRows=kind==='spaces'?filterPlaces(marketplaceSpaces,f):[];
 const count=kind==='centers'?centerRows.length:spaceRows.length;
 const areas=areasFor(places,f.governorate),active=activePlaceFilters(f),returnTo=`/${kind}${query?`?${query}`:''}`;
 const priceWarning=f.minPrice!==''&&f.maxPrice!==''&&Number(f.minPrice)>Number(f.maxPrice);
 const mapItems:MapItem[]=(kind==='centers'?centerRows.map(c=>({id:c.id,name:c.name,area:c.area,lat:c.lat,lng:c.lng,rating:c.rating,reviews:c.reviews,priceLabel:String(c.price.min),priceNote:'القاعة من',href:`/centers/${c.id}?returnTo=${encodeURIComponent(returnTo)}`,photo:placePhoto('center',c.id)}))
  :spaceRows.map(s=>({id:s.id,name:s.name,area:s.area,lat:s.lat,lng:s.lng,rating:s.rating,reviews:s.reviews,priceLabel:String(s.price.min),priceNote:'السعر من',href:`/spaces/${s.id}?returnTo=${encodeURIComponent(returnTo)}`,photo:placePhoto('space',s.id)})));
 const activeId=hoverId;
 const pick=(id:string|null)=>{setSelectedId(id);if(id&&view==='list')document.getElementById(`card-${id}`)?.scrollIntoView({block:'center',behavior:'smooth'});};
 const presetOn=(p:{minPrice:string;maxPrice:string})=>f.minPrice===p.minPrice&&f.maxPrice===p.maxPrice;
 const topFeatures=useMemo(()=>{const n=new Map<string,number>();for(const p of places)for(const x of p.features)n.set(x,(n.get(x)??0)+1);return [...n.entries()].sort((a,b)=>b[1]-a[1]).slice(0,4).map(([x])=>x);},[places]);
 const pills:{key:string;label:string;clear:()=>void}[]=[
  f.governorate&&{key:'g',label:f.governorate,clear:()=>set('governorate','')},f.area&&{key:'a',label:f.area,clear:()=>set('area','')},
  f.seats&&{key:'s',label:`${t.seats} ${f.seats}+`,clear:()=>set('seats','')},f.feature&&{key:'f',label:featureLabel(f.feature),clear:()=>set('feature','')},
  f.rating&&{key:'r',label:`تقييم أعلى من ${f.rating}`,clear:()=>set('rating','')},
  (f.minPrice||f.maxPrice)&&{key:'p',label:`${f.minPrice||'0'} – ${f.maxPrice||'∞'} ج.م`,clear:()=>setF(p=>({...p,minPrice:'',maxPrice:''}))},
 ].filter((x):x is {key:string;label:string;clear:()=>void}=>!!x);

 return <PublicMarketplaceShell active={kind}>
  <section className={d.searchHead}>
   <div><h1>{t.title}</h1><p>{t.lead}</p></div>
   <div className={d.searchBar} role="search">
    <Search size={20} aria-hidden="true"/>
    <label htmlFor={`${kind}-q`} className={styles.srOnly}>{t.search}</label>
    <input id={`${kind}-q`} value={f.q} onChange={e=>set('q',e.target.value)} placeholder={t.search} autoComplete="off"/>
    {f.q&&<button type="button" onClick={()=>set('q','')} aria-label="مسح البحث"><X size={17}/></button>}
   </div>
  </section>

  <div className={d.toolbar}>
   <div className={d.chipRow} role="group" aria-label="فلاتر سريعة">
    {t.pricePresets.map(([label,p])=><button type="button" key={label} className={d.qchip} aria-pressed={presetOn(p)} onClick={()=>setF(prev=>presetOn(p)?{...prev,minPrice:'',maxPrice:''}:{...prev,...p})}>{label}</button>)}
    <button type="button" className={d.qchip} aria-pressed={f.rating==='4'} onClick={()=>set('rating',f.rating==='4'?'':'4')}><Star size={13} aria-hidden="true"/>تقييم +4</button>
    {topFeatures.map(x=><button type="button" key={x} className={d.qchip} aria-pressed={f.feature===x} onClick={()=>set('feature',f.feature===x?'':x)}>{featureLabel(x)}</button>)}
   </div>
   <div className={d.toolRight}>
    <button type="button" className={d.filterBtn} onClick={()=>setSheet(true)} aria-haspopup="dialog"><SlidersHorizontal size={17} aria-hidden="true"/>كل الفلاتر{active>0&&<b>{active}</b>}</button>
    <label className={d.sortBox}><span className={styles.srOnly}>الترتيب</span><select value={f.sort} onChange={e=>set('sort',e.target.value)}><option value="default">الترتيب: الافتراضي</option><option value="rating">الأعلى تقييمًا</option><option value="priceAsc">الأقل سعرًا</option><option value="priceDesc">الأعلى سعرًا</option></select></label>
    <div className={d.viewToggle} role="group" aria-label="طريقة العرض"><button type="button" aria-pressed={view==='list'} onClick={()=>setView('list')}><List size={16} aria-hidden="true"/>قائمة</button><button type="button" aria-pressed={view==='map'} onClick={()=>setView('map')}><MapIcon size={16} aria-hidden="true"/>خريطة</button></div>
   </div>
  </div>

  {pills.length>0&&<div className={d.pills} aria-label="الفلاتر المفعّلة">{pills.map(p=><button type="button" key={p.key} onClick={p.clear} aria-label={`إزالة ${p.label}`}>{p.label}<X size={13} aria-hidden="true"/></button>)}<button type="button" className={d.pillClear} onClick={()=>setF({...emptyPlaceFilters,sort:f.sort})}>مسح الكل</button></div>}
  {priceWarning&&<p role="status" className={styles.warning}>بداية النطاق أكبر من نهايته، عدّل السعر.</p>}

  <div className={d.split} data-view={view}>
   <section className={d.listCol} aria-live="polite" aria-busy={!ready}>
    <p className={d.count}><strong>{count}</strong> {t.unit}{f.q||active?' مطابق':' في معارج'}</p>
    {count===0?<div className={styles.empty}><p>{t.empty}</p><button type="button" onClick={()=>setF(emptyPlaceFilters)}><RotateCcw size={15} aria-hidden="true"/>اعرض الكل</button></div>
    :<div className={styles.grid}>{centerRows.map(c=><CenterCard key={c.id} center={c} returnTo={returnTo} active={c.id===hoverId||c.id===selectedId} onHover={setHoverId}/>)}{spaceRows.map(s=><SpaceCard key={s.id} space={s} returnTo={returnTo} active={s.id===hoverId||s.id===selectedId} onHover={setHoverId}/>)}</div>}
   </section>
   <aside className={d.mapCol} aria-label="الخريطة"><PlaceMap items={mapItems} activeId={activeId} selectedId={selectedId} onHover={setHoverId} onSelect={pick} label={`خريطة ${t.unit==='سنتر'?'السناتر':'المساحات'}`}/></aside>
  </div>

  {sheet&&<><div className={d.backdrop} onClick={()=>setSheet(false)}/>
   <section className={d.sheet} role="dialog" aria-modal="true" aria-labelledby="sheet-title">
    <header><h2 id="sheet-title">كل الفلاتر</h2><button type="button" onClick={()=>setSheet(false)} aria-label="إغلاق"><X size={20}/></button></header>
    <div className={d.sheetBody}>
     <label className={styles.field}><span>المحافظة</span><select value={f.governorate} onChange={e=>set('governorate',e.target.value)}><option value="">كل المحافظات</option>{options.governorates.map(g=><option key={g}>{g}</option>)}</select></label>
     <label className={styles.field}><span>المنطقة</span><select value={f.area} onChange={e=>set('area',e.target.value)}><option value="">كل المناطق</option>{areas.map(a=><option key={a}>{a}</option>)}</select></label>
     <label className={styles.field}><span>{t.seats}</span><select value={f.seats} onChange={e=>set('seats',e.target.value)}><option value="">أي سعة</option>{['5','10','20','30'].map(n=><option key={n} value={n}>{n} أو أكثر</option>)}</select></label>
     <fieldset className={styles.chips}><legend>التقييم</legend><button type="button" aria-pressed={!f.rating} onClick={()=>set('rating','')}>الكل</button>{['4','3'].map(v=><button type="button" key={v} aria-pressed={f.rating===v} onClick={()=>set('rating',f.rating===v?'':v)}>أعلى من {v}</button>)}</fieldset>
     <fieldset className={styles.chips}><legend>التجهيزات</legend><button type="button" aria-pressed={!f.feature} onClick={()=>set('feature','')}>أي تجهيزات</button>{options.features.map(x=><button type="button" key={x} aria-pressed={f.feature===x} onClick={()=>set('feature',f.feature===x?'':x)}>{featureLabel(x)}</button>)}</fieldset>
     <fieldset className={styles.priceRow}><legend>{t.price}</legend><label>من<input type="number" min="0" inputMode="numeric" dir="ltr" value={f.minPrice} onChange={e=>set('minPrice',e.target.value)} placeholder="—"/></label><label>إلى<input type="number" min="0" inputMode="numeric" dir="ltr" value={f.maxPrice} onChange={e=>set('maxPrice',e.target.value)} placeholder="—"/></label></fieldset>
     {priceWarning&&<p role="status" className={styles.warning}>بداية النطاق أكبر من نهايته، عدّل السعر.</p>}
    </div>
    <footer><button type="button" className={d.sheetReset} onClick={()=>setF({...emptyPlaceFilters,sort:f.sort})} disabled={active===0}><RotateCcw size={15} aria-hidden="true"/>مسح</button><button type="button" className={d.sheetApply} onClick={()=>setSheet(false)}><Check size={17} aria-hidden="true"/>اعرض {count} {t.unit}</button></footer>
   </section></>}
 </PublicMarketplaceShell>;
}
