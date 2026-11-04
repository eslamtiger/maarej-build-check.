import {SourceTextModule,SyntheticModule,createContext} from 'node:vm';
import {stripTypeScriptTypes} from 'node:module';
import {readFileSync,existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import assert from 'node:assert/strict';
const root=resolve('apps/maarej-web/src'),context=createContext({console,URL,URLSearchParams,Date,Intl,Set,Map}),modules=new Map();
function getModule(file){if(modules.has(file))return modules.get(file);const text=readFileSync(file,'utf8');const m=file.endsWith('.json')?new SyntheticModule(['default'],function(){this.setExport('default',JSON.parse(text));},{context,identifier:file}):new SourceTextModule(stripTypeScriptTypes(text,{mode:'strip'}),{context,identifier:file});modules.set(file,m);return m;}
function linker(specifier,ref){let path=specifier.startsWith('@/')?resolve(root,specifier.slice(2)):resolve(dirname(ref.identifier),specifier);if(!existsSync(path))path+='.ts';return getModule(path);}
async function load(path){const m=getModule(resolve(root,path));if(m.status==='unlinked')await m.link(linker);if(m.status==='linked')await m.evaluate();return m.namespace;}
const data=await load('marketplace/adapters/teachers.ts'),search=await load('marketplace/adapters/search.ts');const rows=data.marketplaceTeachers;
assert.equal(rows.length,30);assert.equal(new Set(rows.map(t=>t.id)).size,30);
for(const t of rows){assert.match(t.id,/^tch-m1-[a-f0-9]{12}$/);assert.equal(data.resolveMarketplaceTeacher(t.legacyId).id,t.id);assert.equal(t.provenance.kind,'demo');assert.ok(!('availability' in t));assert.ok(!('lat' in t));if(t.image)assert.ok(existsSync(resolve('apps/maarej-web/public',t.image.slice(1))));}
assert.equal(search.normalizeArabic(' أَحْمَـد  إِبراهيم '),'احمد ابراهيم');assert.equal(search.normalizeArabic('على'),'علي');
assert.equal(search.filterTeachers(rows,search.emptyFilters).length,30);
assert.equal(search.filterTeachers(rows,{...search.emptyFilters,q:'ساره'}).length,0); // ta marbuta is deliberately not conflated with ha
assert.equal(search.filterTeachers(rows,{...search.emptyFilters,q:'سَارة'}).length,1);
assert.equal(search.filterTeachers(rows,{...search.emptyFilters,q:'لا يوجد اسم مطابق'}).length,0);
const areas=search.filterTeachers(rows,{...search.emptyFilters,area:'حلوان'});assert.ok(areas.length>0&&areas.every(t=>t.areas.includes('حلوان')));
const grades=search.filterTeachers(rows,{...search.emptyFilters,stage:'ثانوي',system:'دولي'});assert.ok(grades.every(t=>t.stages.includes('ثانوي')&&t.systems.includes('دولي')));
const ratings=search.filterTeachers(rows,{...search.emptyFilters,rating:'4'});assert.ok(ratings.length>0&&ratings.every(t=>t.rating>4));
const top=search.filterTeachers(rows,{...search.emptyFilters,sort:'rating'});assert.ok(top.every((t,i)=>!i||top[i-1].rating>=t.rating));
const cheap=search.filterTeachers(rows,{...search.emptyFilters,sort:'priceAsc'});assert.ok(cheap.every((t,i)=>!i||cheap[i-1].price.min<=t.price.min));
const expensive=search.filterTeachers(rows,{...search.emptyFilters,sort:'priceDesc'});assert.ok(expensive.every((t,i)=>!i||expensive[i-1].price.max>=t.price.max));
const base=rows[0],overlap=[{...base,id:'range',price:{min:100,max:200,currency:'EGP',unit:'حصة'}},{...base,id:'below',price:{min:40,max:80,currency:'EGP',unit:'حصة'}},{...base,id:'missing',price:undefined}];
assert.equal(search.filterTeachers(overlap,{...search.emptyFilters,minPrice:'150',maxPrice:'180'})[0].id,'range');assert.equal(search.filterTeachers(overlap,{...search.emptyFilters,minPrice:'220'}).length,0);
const f={...search.emptyFilters,q:'سارة',area:'المعادي',sort:'rating',minPrice:'100'},query=search.serializeTeacherQuery(f,'list');const parsed=search.parseTeacherQuery(new URLSearchParams(query),rows);assert.equal(JSON.stringify(parsed),JSON.stringify(f));assert.equal(new URLSearchParams(query).get('view'),'list');assert.equal(search.activeFilterCount(f),3);
const invalid=search.parseTeacherQuery(new URLSearchParams('minPrice=-3&maxPrice=nan&subject=unknown&sort=near&rating=9'),rows);assert.equal(JSON.stringify(invalid),JSON.stringify(search.emptyFilters));
assert.equal(search.serializeTeacherQuery({...search.emptyFilters},'map'),'');assert.equal(search.activeFilterCount(search.emptyFilters),0);
assert.equal(data.resolveMarketplaceTeacher('not-a-teacher'),undefined);
console.log('M1 passed: 30 stable aliases, Arabic matching, combined filters, price overlap, sorting, empty/reset state and safe query roundtrip.');
