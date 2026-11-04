import { studentV106Demo } from "@/data/student-v106-demo";
export type StudentClock = {date:string;minutes:number};
export const studentClockMode: "demo" | "production" = "demo";
export const initialStudentClock:StudentClock=studentV106Demo.referenceClock;
export function cairoClock(now:Date):StudentClock {
  const parts=new Intl.DateTimeFormat("en-CA",{timeZone:"Africa/Cairo",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).formatToParts(now);
  const value=(key:string)=>parts.find(p=>p.type===key)?.value??"";
  return {date:`${value("year")}-${value("month")}-${value("day")}`,minutes:Number(value("hour"))*60+Number(value("minute"))};
}
export function clockMinutes(time:string){const m=time.replace(/[٠-٩]/g,d=>String("٠١٢٣٤٥٦٧٨٩".indexOf(d))).match(/(\d{1,2}):(\d{2})\s*([مص])/);return m?Number(m[1])%12*60+Number(m[2])+(m[3]==="م"?720:0):undefined;}
export function isUpcoming(record:{date:string;time:string},clock:StudentClock){const minutes=clockMinutes(record.time);return minutes!==undefined&&(record.date>clock.date||record.date===clock.date&&minutes>=clock.minutes);}
export function chronological(a:{date:string;time:string},b:{date:string;time:string}){return a.date.localeCompare(b.date)||(clockMinutes(a.time)??0)-(clockMinutes(b.time)??0);}
