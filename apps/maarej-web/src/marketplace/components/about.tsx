import Link from 'next/link';
import {ArrowLeft} from 'lucide-react';
import {Mark,Marks} from './fun';
import {Arrow} from './doodles';
import {PublicMarketplaceShell} from './public-shell';
import {SectionTabs} from './profile-kit';
import {marketplaceTeachers} from '../adapters/teachers';
import {marketplaceCenters,marketplaceSpaces,placePhoto} from '../adapters/places';
import a from './about.module.css';
import h from './home.module.css';

// "About" is short on purpose: a photo collage, who it is for, three steps, what parents get, and the journey promise.
const audiences=[
 {e:'🧑‍🎓',title:'للطالب',text:'مدرس وسنتر ومكان مذاكرة، وحصصك وواجباتك في مكان واحد.'},
 {e:'👨‍👩‍👧',title:'لولي الأمر',text:'متابعة هادية وقرار صح من الأول.'},
 {e:'🧑‍🏫',title:'للمدرس',text:'صفحة واضحة بمواده ومجموعاته ومواعيده.'},
 {e:'🏫',title:'للسناتر',text:'القاعات والسعة والتجهيزات والحجز.'},
 {e:'📖',title:'لمساحات المذاكرة',text:'مكتبات وغرف دراسة وأماكن هادية.'},
] as const;
const forParents=[
 {e:'🛡️',title:'متابعة هادية',text:'الحضور والواجبات والدرجات قدامك.'},
 {e:'🤝',title:'ثقة أكبر',text:'الاتنين شايفين نفس الصورة.'},
 {e:'🎁',title:'مكافأة على المجهود',text:'إنت اللي بتحددها.'},
 {e:'⚖️',title:'اختيار صح',text:'قارن السعر والتقييم والمكان.'},
] as const;
const steps=[{e:'🔎',title:'دوّر',text:'مادة أو منطقة'},{e:'⚖️',title:'قارن',text:'سعر وتقييم ومكان'},{e:'🚀',title:'كمّل رحلتك',text:'حصصك وهويتك بتكبر'}] as const;

export function AboutMaarej(){
 const faces=marketplaceTeachers.filter(t=>t.image).slice(0,3);
 const photos=[marketplaceCenters[2],marketplaceCenters[6],marketplaceSpaces[3]].map((p,i)=>placePhoto(i<2?'center':'space',p.id,500));
 return <PublicMarketplaceShell active="about">
  <section className={a.hero}>
   <Marks items={[{e:'⭐',x:4,y:6,s:'md',a:'spin'},{e:'✨',x:50,y:4,s:'md',a:'pulse'}]}/>
   <div className={a.heroText}>
    <h1>معارج <span aria-hidden="true">🪜</span> تعليمك كله في مكان واحد</h1>
    <p>المدرس والسنتر والمكان المناسبين، ورحلة واضحة.</p>
    <div className={a.actions}><Link href="/teachers" className={a.primary}>ابحث عن مدرس<ArrowLeft size={18} aria-hidden="true"/></Link><Link href="/student" className={a.secondary}>ادخل مساحتي</Link></div>
   </div>
   <div className={a.collage} aria-hidden="true">
    {photos.map((src,i)=><img key={i} src={src} alt="" loading="eager"/>)}
    <span className={a.facesRow}>{faces.map(t=><img key={t.id} src={t.image} alt="" loading="eager"/>)}</span>
    <Mark e="🎓" a="float" s="xl" className={a.cap}/>
   </div>
  </section>
  <section className={a.block} id="sec-about-who" aria-labelledby="about-who"><h2 id="about-who"><Mark e="🤔" a="none" s="md"/> معارج لمين؟</h2>
   <div className={a.chips}>{audiences.map(({e,title,text})=><article key={title} className={a.chip}><Mark e={e} a="none" s="lg"/><div><b>{title}</b><p>{text}</p></div></article>)}</div>
  </section>
  <section className={a.block} id="sec-about-how" aria-labelledby="about-how"><h2 id="about-how"><Mark e="⚙️" a="none" s="md"/> بيشتغل إزاي؟</h2>
   <ol className={h.flow}>{steps.map(({e,title,text},i)=><><li key={title} className={h.step}><Mark e={e} a="bob" s="xl" className={h.big}/><b>{title}</b><small>{text}</small></li>{i<steps.length-1&&<li key={`${title}-a`} className={h.between} aria-hidden="true"><Arrow w={70}/></li>}</>)}</ol>
  </section>
  <section className={`${a.block} ${a.parents}`} id="sec-about-parents" aria-labelledby="about-parents"><h2 id="about-parents"><Mark e="👨‍👩‍👧" a="none" s="md"/> معارج لولي الأمر</h2>
   <div className={a.chips}>{forParents.map(({e,title,text})=><article key={title} className={a.chip}><Mark e={e} a="none" s="lg"/><div><b>{title}</b><p>{text}</p></div></article>)}</div>
  </section>
  <section className={`${a.block} ${a.values}`} id="sec-about-values" aria-labelledby="about-values"><h2 id="about-values"><Mark e="🚀" a="none" s="md"/> رحلة الطالب</h2>
   <ul>
    <li><Mark e="🌱" a="none" s="md"/>هويتك بتكبر بمجهودك، ومش بتنزل بسبب أسبوع ضعيف.</li>
    <li><Mark e="🙅" a="none" s="md"/>مفيش ترتيب عام بين الطلاب. كل واحد بيتقارن بنفسه.</li>
    <li><Mark e="🏅" a="none" s="md"/>المكافآت بتحتفل بالمجهود، لكنها ما بتشتريش الهوية.</li>
   </ul>
  </section>
  <SectionTabs items={[{id:'sec-about-who',label:'لمين',emoji:'👋'},{id:'sec-about-how',label:'إزاي',emoji:'⚙️'},{id:'sec-about-parents',label:'ولي الأمر',emoji:'👨‍👩‍👦'},{id:'sec-about-values',label:'الرحلة',emoji:'🧗'}]}/>
 </PublicMarketplaceShell>;
}
