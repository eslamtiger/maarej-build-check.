'use client';
// What visitors do on the public site goes to the database (searches, room bookings, join requests).
// No account is needed; rows carry this browser's id and the account id when signed in.
import {useEffect} from 'react';
import {track} from './backend';
import {sessions} from './schedule';
import type {DemoRequest} from './demo-requests';

export function recordRequest(r:DemoRequest){
 if(r.kind==='room'){track('site_room_bookings',{place_id:r.centerId,room_idx:r.room,days:r.days,start_hour:r.start,end_hour:r.end,repeat:r.repeat,period:r.period,collect:r.collect});return;}
 const x=sessions.find(s=>s.id===r.sessionId);
 track('site_join_requests',{session_ref:r.sessionId,teacher_id:x&&!x.teacherId.startsWith('guest')?x.teacherId:null,place_id:x?.centerId??null,subject:x?.subject,stage:x?.stage,day:x?.day,start_hour:x?.start,price:x?.price});
}
// One row per settled search (after the visitor stops typing for a moment).
export function useTrackSearch(kind:'teachers'|'centers'|'spaces',filters:Record<string,unknown>,results:number){
 const key=JSON.stringify(filters);
 useEffect(()=>{const {q,...rest}=filters as {q?:string};const active=Object.fromEntries(Object.entries(rest).filter(([,v])=>v&&v!=='default'));
  if(!q&&!Object.keys(active).length)return;
  const t=setTimeout(()=>track('site_searches',{kind,query:(q??'').slice(0,120),filters:active,results}),1500);return()=>clearTimeout(t);},[key,results]); // eslint-disable-line react-hooks/exhaustive-deps
}
