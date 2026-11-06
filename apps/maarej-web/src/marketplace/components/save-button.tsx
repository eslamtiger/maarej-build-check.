'use client';
// "حفظ" call-to-action at the top-left of a profile (like Facebook's save): filled and labelled "محفوظ" once saved.
import {Bookmark} from 'lucide-react';
import {useSaved,toggleSaved} from '../adapters/saved';
import type {SavedKind} from '../adapters/saved';
import k from './profile-kit.module.css';

export function SaveButton({kind,id}:{kind:SavedKind;id:string}){
 const saved=useSaved().some(x=>x.kind===kind&&x.id===id);
 return <button type="button" className={k.save} aria-pressed={saved} onClick={()=>toggleSaved({kind,id})}><Bookmark size={18} fill={saved?'currentColor':'none'} aria-hidden="true"/>{saved?'محفوظ':'حفظ'}</button>;
}
