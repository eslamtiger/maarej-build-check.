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
const data=await load('data/student-records.ts'),perf=await load('data/student-performance-view.ts'),clock=await load('lib/student-clock.ts'),nav=await load('lib/student-navigation.ts'),home=await load('components/student/home/home-launchpad-view.ts');
assert.equal(data.studentHomework.length,5);assert.equal(data.studentExams.length,2);
for(const collection of [data.studentHomework,data.studentExams,data.studentSessions,data.studentAttendance])assert.equal(new Set(collection.map(r=>r.id)).size,collection.length);
assert.equal(data.resolveStudentSource('homework','math-completed-1'),undefined);
assert.equal(data.resolveStudentSource('exam','math-assessment-1'),undefined);
for(const period of perf.studentPerformancePeriods){
 const attendance=data.studentAttendanceForReport(period.id);
 assert.equal(attendance.filter(a=>a.status==='حضور').length,period.attendance.present,period.id);
 assert.equal(attendance.filter(a=>a.status==='غياب').length,period.attendance.absent,period.id);
 assert.equal(attendance.filter(a=>a.status==='تأخير').length,period.attendance.late,period.id);
 for(const subject of period.subjects){const rows=attendance.filter(a=>a.subject===subject.subjectName);assert.equal(rows.filter(a=>a.status==='حضور').length,subject.attendance.present);assert.equal(rows.filter(a=>a.status==='غياب').length,subject.attendance.absent);assert.equal(rows.filter(a=>a.status==='تأخير').length,subject.attendance.late);}
}
const full=perf.studentPerformancePeriods[0];assert.equal(full.attendance.rate,92);assert.equal(full.overall.value,86);
const before={date:'2026-10-03',minutes:989},after={date:'2026-10-03',minutes:991};
const session=data.studentSessions.find(s=>s.id==='session-math');assert.equal(clock.isUpcoming(session,before),true);assert.equal(clock.isUpcoming(session,after),false);assert.equal(clock.isUpcoming(session,{date:'2026-10-04',minutes:0}),false);
assert.equal(clock.cairoClock(new Date('2026-10-03T13:31:00Z')).minutes,991);
assert.equal(home.homeLaunchpadView(after).timeline.some(a=>a.id==='session-math'),false);
for(const group of data.studentGroups){for(const s of data.studentSessions.filter(s=>s.groupId===group.id))assert.equal(s.teacherId,group.teacherId);for(const h of data.studentHomework.filter(h=>h.groupId===group.id))assert.equal(h.teacherId,group.teacherId);}
const origin='/student/learning/groups/math-excellence';const attendanceHref=nav.studentDetailHref('/student/learning/attendance',origin);assert.equal(new URL(attendanceHref,'https://example.test').searchParams.get('returnTo'),origin);
const nextHref=nav.studentDetailHref(session.href,attendanceHref);assert.equal(new URL(nextHref,'https://example.test').searchParams.get('returnTo'),attendanceHref);
for(const bad of ['https://evil.test','//evil.test','/student\\evil','/outside'])assert.equal(nav.safeStudentReturn(bad),undefined);
assert.equal(nav.studentDetailHref('/student/learning/homework/algebra-practice-4','/student/learning#homework').includes('returnTo='),true);
assert.equal(data.studentRecognitions[0].href,'/student/journey/achievements/thinker');
const analytics=(await load('data/student-performance-demo.ts')).performanceSourceRecords;
for(const period of perf.studentPerformancePeriods)for(const subject of period.subjects)for(const r of [...subject.academic.records,...subject.tasks.records])assert.ok(data.resolveStudentSource(r.sourceType,r.sourceId)||analytics.has(r.navigationTarget));
console.log('Student closure checks passed: operational isolation, attendance partitions, clock cutoffs, contextual back, source integrity.');
const subjectsView=await load('data/student-subject-view.ts');
assert.equal(clock.studentClockMode,'demo');
assert.equal(subjectsView.studentSubjects.length,4);
const english=subjectsView.subjectWorkspace('english');assert.equal(english.subject.status,'no_active_group');assert.equal(english.groups.length,0);assert.equal(english.teachers.length,0);assert.ok(english.performance.history.length>=6);
const math=subjectsView.subjectWorkspace('math');assert.equal(math.groups[0].id,'math-excellence');assert.equal(math.teachers[0].id,'ahmed-salem');assert.equal(math.performance.currentValue,full.subjects[0].currentValue);assert.equal(math.exams[0],data.studentExams.find(e=>e.id==='algebra-short'));
assert.equal(subjectsView.subjectWorkspace('math','week').performance,perf.studentPerformancePeriods.find(p=>p.id==='week').subjects[0]);
for(const s of subjectsView.studentSubjects){const v=subjectsView.subjectWorkspace(s.id);for(const f of v.feedback)assert.ok(data.resolveStudentSource(f.sourceType,f.sourceId));}
assert.ok(data.studentSessions.some(s=>clock.isUpcoming(s,clock.initialStudentClock)));assert.ok(data.studentSessions.some(s=>!clock.isUpcoming(s,clock.initialStudentClock)));assert.ok(data.studentSchedule.some(s=>s.kind==='exam'&&clock.isUpcoming(s,clock.initialStudentClock)));assert.ok(data.studentHomework.some(h=>h.dueAt.slice(0,10)>=clock.initialStudentClock.date));
console.log('V1.08 checks passed: shared subject entities, period context, English without fabricated group, stable demo time.');

assert.deepEqual({...clock.initialStudentClock},{date:'2026-10-04',minutes:640});
const nextSession=data.studentSessions.filter(s=>clock.isUpcoming(s,clock.initialStudentClock)).sort(clock.chronological)[0];assert.equal(nextSession.id,'session-physics');
const commitment=data.studentSchedule.filter(s=>s.kind!=='session'&&clock.isUpcoming(s,clock.initialStudentClock)).sort(clock.chronological)[0];assert.equal(commitment.sourceId,'physics-unit-2');
assert.ok(home.homeLaunchpadView().timeline.every(a=>a.date>=clock.initialStudentClock.date));
for(const period of perf.studentPerformancePeriods)for(const subject of period.subjects)assert.equal(subject.currentValue-subject.history[0].value,subject.trend.value,`${period.id}/${subject.subjectId}: trend baseline`);
assert.equal(nav.safeStudentReturn('/teachers/ahmed-salem'),undefined);
console.log('V1.08.1 freeze checks passed: 4 October clock, actual next session/exam, no past timeline commitments, trend endpoints and Student-only return context.');
