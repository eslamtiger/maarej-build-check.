"use client";
import Link from "next/link";
import { Trophy } from "lucide-react";
import { Confetti } from "@/components/magicui/confetti";
export function AchievementCelebration({show}:{show:boolean}){
 if(!show) return null;
 return <div className="v104-achievement-celebration"><Confetti/><span><Trophy size={30}/></span><small>إنجاز جديد</small><h2>ملتزم الأسبوع</h2><p>حافظت على حضورك طوال الأسبوع</p><Link href="/student/journey" className="v104-primary-button">رؤية رحلتي</Link></div>
}
