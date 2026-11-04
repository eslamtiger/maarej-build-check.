import {SourceTextModule,SyntheticModule,createContext} from 'node:vm';
import {stripTypeScriptTypes} from 'node:module';
import {readFileSync,existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import assert from 'node:assert/strict';
const root=resolve('apps/maarej-web/src'),context=createContext({console,URL,Date,Intl,Set,Map});
const modules=new Map();
function getModule(file){
 if(modules.has(file))return modules.get(file);
 if(file.endsWith('.json')){const m=new SyntheticModule(['default'],function(){this.setExport('default',JSON.parse(readFileSync(file,'utf8')));},{context,identifier:file});modules.set(file,m);return m;}
 const code=stripTypeScriptTypes(readFileSync(file,'utf8'),{mode:'strip'});
 const m=new SourceTextModule(code,{context,identifier:file});modules.set(file,m);return m;
}
function linker(specifier,ref){let path=specifier.startsWith('@/')?resolve(root,specifier.slice(2)):resolve(dirname(ref.identifier),specifier);if(!existsSync(path))path+='.ts';return getModule(path);}
async function load(path){const m=getModule(resolve(root,path));if(m.status==='unlinked')await m.link(linker);if(m.status==='linked')await m.evaluate();return m.namespace;}
const fixtures=await load('data/student-orders-demo.ts'),model=await load('data/student-orders.ts'),format=await load('components/student/orders/order-format.ts'),records=await load('data/student-records.ts');
assert.equal(fixtures.studentOrderFixtures.length,4);
assert.equal(new Set(fixtures.studentOrderFixtures.map(o=>o.id)).size,4);
assert.equal(fixtures.getStudentOrder('missing'),undefined);
assert.deepEqual(Object.keys(model.statusContent).sort(),['draft','submitted','pending','approved','confirmed','rejected','cancelled','completed'].sort());
for(const order of fixtures.studentOrderFixtures){
 assert.ok(model.statusContent[order.status].next);
 assert.ok(Number.isFinite(Date.parse(order.createdAt)));
 for(const event of order.timeline)assert.ok(Number.isFinite(Date.parse(event.timestamp)));
 const dates=order.timeline.map(e=>Date.parse(e.timestamp));assert.ok(dates.every((value,index)=>index===0||value>=dates[index-1]));
 for(const receipt of order.finance?.transactions??[])assert.equal(format.receiptHref(receipt,records.studentTransactions),undefined);
}
assert.equal(format.orderDay('2026-10-05T16:30:00+03:00'),'الاثنين');
assert.equal(format.orderDate('2026-10-05T16:30:00+03:00'),'5 أكتوبر 2026');
assert.ok(format.orderTime('2026-10-05T16:30:00+03:00').includes('4:30'));
assert.equal(format.orderDate('bad'),undefined);assert.equal(format.orderTime(undefined),undefined);
assert.equal(format.receiptHref({transactionId:'a',amount:100},[{id:'a',amount:100,href:'/student/finance/transactions/a'}]),'/student/finance/transactions/a');
assert.equal(format.receiptHref({transactionId:'a',amount:100},[{id:'a',amount:250,href:'/student/finance/transactions/a'}]),undefined);
assert.equal(fixtures.getStudentOrder('demo-booking-001').finance.remaining,150);
assert.equal(fixtures.getStudentOrder('demo-booking-rejected').finance,undefined);
assert.equal(fixtures.getStudentOrder('demo-booking-completed').location,undefined);
console.log('Order checks passed: 4 scenarios, 8 statuses, timelines, missing fields, Cairo dates and safe financial references.');

for(const [origin,expected] of [[undefined,''],['/student','home'],['/student/learning?tab=overview','learn'],['/student/finance','finance'],['/student/journey','journey'],['/student/account','account'],['/student/learning-fake',''],['/teachers',''],['/student/notifications','']])assert.equal(format.orderNavigationContext(origin),expected);
console.log('Order entry context checks passed: one matching module or no active tab.');
