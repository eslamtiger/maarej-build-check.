import Link from 'next/link';
import {GraduationCap,Building2,DoorOpen,Route,Search,Scale,BookOpenCheck,ShieldCheck,ArrowLeft,HeartHandshake,Eye,Gift,CalendarCheck} from 'lucide-react';
import {PublicMarketplaceShell} from './public-shell';
import a from './about.module.css';

const audiences=[
 {Icon:BookOpenCheck,title:'للطالب',text:'تلاقي المدرس والسنتر والمكان اللي تذاكر فيه، وتتابع حصصك وواجباتك وتقدمك من مساحتك.'},
 {Icon:HeartHandshake,title:'لولي الأمر',text:'تطمن على ابنك أول بأول: حضوره وواجباته ودرجاته، وتختار له المدرس والسنتر الصح.'},
 {Icon:GraduationCap,title:'للمدرس',text:'صفحة واضحة بمواده ومجموعاته ومواعيده، عشان الطلاب يلاقوه ويقارنوا بسهولة.'},
 {Icon:Building2,title:'للسناتر',text:'القاعات والسعة والتجهيزات والموقع في صفحة واحدة.'},
 {Icon:DoorOpen,title:'لمساحات المذاكرة',text:'المكتبات وغرف الدراسة وقاعات الفرق، بأماكنها وتجهيزاتها.'},
] as const;
const forParents=[
 {Icon:Eye,title:'متابعة هادية',text:'الحضور والواجبات والدرجات قدامك، من غير ما تسأل كل يوم.'},
 {Icon:HeartHandshake,title:'ثقة بينك وبين ابنك',text:'الاتنين شايفين نفس الصورة، فالكلام بيبقى عن المجهود مش عن الشك.'},
 {Icon:Gift,title:'مكافأة على المجهود',text:'إنت اللي بتحددها، ومرتبطة بالتزام واضح.'},
 {Icon:CalendarCheck,title:'اختيار صح من الأول',text:'قارن المدرسين والسناتر بالسعر والتقييم والمكان قبل ما تدفع.'},
] as const;
const steps=[
 {Icon:Search,title:'دوّر',text:'بالمادة أو المنطقة أو اسم المدرس أو السنتر.'},
 {Icon:Scale,title:'قارن',text:'الأسعار والتجهيزات والتقييمات والموقع جنب بعض.'},
 {Icon:Route,title:'كمّل رحلتك',text:'من مساحتك: حصصك وواجباتك ومهامك، وهويتك اللي بتكبر معاك.'},
] as const;

export function AboutMaarej(){
 return <PublicMarketplaceShell active="about">
  <section className={a.hero}>
   <h1>معارج: تعليمك كله في مكان واحد</h1>
   <p>للطالب ولولي الأمر: المدرس والسنتر ومساحة المذاكرة المناسبين، ورحلة تعلم واضحة تتابعوها سوا.</p>
   <div className={a.actions}><Link href="/teachers" className={a.primary}>ابحث عن مدرس<ArrowLeft size={18} aria-hidden="true"/></Link><Link href="/student" className={a.secondary}>ادخل مساحتي</Link></div>
  </section>
  <section className={a.block} aria-labelledby="about-who"><h2 id="about-who">معارج لمين؟</h2>
   <div className={a.grid}>{audiences.map(({Icon,title,text})=><article key={title} className={a.card}><span className={a.icon}><Icon size={22} aria-hidden="true"/></span><h3>{title}</h3><p>{text}</p></article>)}</div>
  </section>
  <section className={`${a.block} ${a.parents}`} aria-labelledby="about-parents"><h2 id="about-parents">معارج لولي الأمر</h2>
   <div className={a.grid}>{forParents.map(({Icon,title,text})=><article key={title} className={a.card}><span className={a.icon}><Icon size={22} aria-hidden="true"/></span><h3>{title}</h3><p>{text}</p></article>)}</div>
  </section>
  <section className={a.block} aria-labelledby="about-how"><h2 id="about-how">بيشتغل إزاي؟</h2>
   <ol className={a.steps}>{steps.map(({Icon,title,text},i)=><li key={title}><span className={a.num}>{i+1}</span><div><h3><Icon size={18} aria-hidden="true"/>{title}</h3><p>{text}</p></div></li>)}</ol>
  </section>
  <section className={`${a.block} ${a.values}`} aria-labelledby="about-values"><h2 id="about-values">رحلة الطالب في معارج</h2>
   <ul>
    <li><ShieldCheck size={18} aria-hidden="true"/>هويتك بتكبر بسلوكك عبر الوقت، ومش بتنزل بسبب أسبوع ضعيف.</li>
    <li><ShieldCheck size={18} aria-hidden="true"/>مفيش ترتيب عام بين الطلاب. كل واحد بيتقارن بنفسه.</li>
    <li><ShieldCheck size={18} aria-hidden="true"/>المكافآت بتحتفل بالمجهود، لكنها ما بتشتريش الهوية.</li>
   </ul>
  </section>
 </PublicMarketplaceShell>;
}
