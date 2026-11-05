"use client";
import Link from 'next/link';
import {StudentContextLink} from './student-context-link';
import {Search} from 'lucide-react';
import {studentDemo} from '@/data/student-v101';
import {studentNotifications} from '@/data/student-records';
import {useStudentAppState} from '@/lib/student-app-state';
import {MaarejLogo,ProductHeaderLink,ProductNotifications} from "@/product/components/header-primitives";
// Legacy export name retained; Student composition uses shared product primitives.
export function PublicWorkspaceHeader({compact=false}:{compact?:boolean}={}){const app=useStudentAppState();return <header className={`v104-header v108-public-header ${compact?"":"v1081-student-header"}`}><MaarejLogo className="v108-brand"/>{!compact&&<div className="v1081-search-actions" aria-label="استكشاف معارج"><ProductHeaderLink href="/teachers"><Search size={15} aria-hidden="true"/><span>البحث عن المدرسين</span></ProductHeaderLink><ProductHeaderLink href="/centers"><Search size={15} aria-hidden="true"/><span>السناتر والمساحات</span></ProductHeaderLink></div>}<div className="v108-user-actions"><ProductNotifications unread={app.preferences.notifications&&studentNotifications.some(n=>n.readState==='unread'&&!app.readNotifications.includes(n.id))}/><details className="v108-avatar-menu"><summary aria-label="قائمة الطالب"><span>{studentDemo.identity.name.slice(0,1)}</span></summary><nav><ProductHeaderLink href="/">استكشاف معارج</ProductHeaderLink><StudentContextLink href="/student/profile">الملف الشخصي</StudentContextLink><Link href="/student/account">الإعدادات</Link><StudentContextLink href="/student/security">الأمان</StudentContextLink><button disabled>تسجيل الخروج — غير متاح في النسخة التجريبية</button></nav></details></div></header>;}
