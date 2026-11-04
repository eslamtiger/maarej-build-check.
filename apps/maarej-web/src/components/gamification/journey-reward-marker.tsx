import Link from "next/link";
import { Gift } from "lucide-react";

export function JourneyRewardMarker({ amount, href }: { amount: number; href: string }) {
  return <Link href={href} className="v1052-reward-marker" aria-label={`تفاصيل مكافأة ${amount} جنيه`}><span><Gift size={16}/></span><div><small>حافز ممول</small><b>{amount} ج.م</b></div></Link>;
}
