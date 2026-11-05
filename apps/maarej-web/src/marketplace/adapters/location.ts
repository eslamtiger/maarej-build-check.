'use client';
// Picks the governorate a search starts on, without asking for GPS:
// the city the student saved in their profile if it names a governorate or a known area, otherwise Giza.
// When there is a backend, the visitor's network location (IP region) can feed this too.
import {readStudentAppState} from '@/lib/student-app-state';
import {areaGovernorate,defaultGovernorate} from './places';

export function guessGovernorate():string{
 let city='';
 try{city=readStudentAppState().profile?.city?.trim()??'';}catch{city='';}
 if(!city)return defaultGovernorate;
 if(/جيز/.test(city))return 'الجيزة';
 if(/قاهر/.test(city))return 'القاهرة';
 for(const [area,gov] of areaGovernorate)if(city.includes(area))return gov;
 return defaultGovernorate;
}

// URL: no "governorate" → start from the guess; "governorate=all" → every governorate.
export function governorateFromUrl(params:URLSearchParams,parsed:string):string{
 const raw=params.get('governorate');
 if(raw==='all')return '';
 if(raw)return parsed;
 return guessGovernorate();
}
export const withGovernorate=(query:string,governorate:string)=>governorate?query:[query,'governorate=all'].filter(Boolean).join('&');
