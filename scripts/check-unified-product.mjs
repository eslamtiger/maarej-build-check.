import {SourceTextModule,SyntheticModule,createContext} from 'node:vm';
import {stripTypeScriptTypes} from 'node:module';
import {readFileSync,existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import assert from 'node:assert/strict';
const root=resolve('apps/maarej-web/src'),context=createContext({console,URL,Date,Intl,Set,Map}),modules=new Map();
function getModule(file){if(modules.has(file))return modules.get(file);const text=readFileSync(file,'utf8');const m=file.endsWith('.json')?new SyntheticModule(['default'],function(){this.setExport('default',JSON.parse(text));},{context,identifier:file}):new SourceTextModule(stripTypeScriptTypes(text,{mode:'strip'}),{context,identifier:file});modules.set(file,m);return m;}
function linker(s,ref){let p=s.startsWith('@/')?resolve(root,s.slice(2)):resolve(dirname(ref.identifier),s);if(!existsSync(p))p+='.ts';return getModule(p);}
async function load(p){const m=getModule(resolve(root,p));if(m.status==='unlinked')await m.link(linker);if(m.status==='linked')await m.evaluate();return m.namespace;}
const routes=await load('product/routes.ts'),identity=await load('product/teacher-identities.ts'),market=await load('marketplace/adapters/teachers.ts'),student=await load('data/student-records.ts');
for(const p of ['/','/teachers','/teachers/a','/centers','/centers/a','/spaces','/spaces/a'])assert.equal(routes.routeContext(p),'public',p);
for(const p of ['/student','/student/learning','/student/settings','/student/orders/demo-booking-001','/student/learning/teachers/ahmed-salem'])assert.equal(routes.routeContext(p),'student',p);
assert.equal(routes.routeContext('/students'),'other');assert.equal(routes.publicEntityHref('center','x'),'/centers/x');assert.equal(routes.publicEntityHref('cospace','x'),'/spaces/x');
assert.equal(identity.teacherIdentities.length,33);assert.equal(new Set(identity.teacherIdentities.map(t=>t.id)).size,33);
for(const t of market.marketplaceTeachers){assert.equal(identity.teacherIdentityById(t.id).name,t.name);assert.ok(t.subjectIds.length);}
for(const t of student.studentTeachers){assert.equal(identity.teacherIdentityById(t.canonicalTeacherId).name,t.name);assert.equal(identity.teacherIdentityByAlias('student',t.id).id,t.canonicalTeacherId);assert.equal(market.resolvePublicTeacherIdentity(t.canonicalTeacherId).name,t.name);assert.equal(student.sourceHref('teacher',t.id),routes.studentTeacherHref(t.id));}
console.log('U1 passed: context ownership, separate Center/CoSpace contracts, 33 canonical teacher identities, explicit Student aliases and shared Public projections.');
