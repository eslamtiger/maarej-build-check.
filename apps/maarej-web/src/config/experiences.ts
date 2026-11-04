import {
  CalendarDays,
  CircleUserRound, Settings, WalletCards,
  Compass,
  GraduationCap,
  Home,
  Route,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

export type ExperienceKey = "student" | "parent";

export type NavItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
};

export const experienceConfig: Record<ExperienceKey, {
  label: string;
  shortLabel: string;
  nav: NavItem[];
}> = {
  student: {
    label: "تجربة الطالب",
    shortLabel: "طالب",
    nav: [
      { id: "home", label: "الرئيسية", icon: Home, href: "/student" },
      { id: "learning", label: "تعلّمي", icon: GraduationCap, href: "/student/learning" },
      { id: "journey", label: "رحلتي", icon: Route, href: "/student/journey" },
      { id: "finance", label: "المالية", icon: WalletCards, href: "/student/finance" },
      { id: "account", label: "الإعدادات", icon: Settings, href: "/student/account" },
    ],
  },
  parent: {
    label: "تجربة ولي الأمر",
    shortLabel: "ولي أمر",
    nav: [
      { id: "home", label: "الرئيسية", icon: Home, href: "/parent" },
      { id: "children", label: "الأبناء", icon: UsersRound, href: "/parent#children" },
      { id: "followup", label: "المتابعة", icon: Compass, href: "/parent#followup" },
      { id: "schedule", label: "الجدول", icon: CalendarDays, href: "/parent#schedule" },
      { id: "account", label: "حسابي", icon: CircleUserRound, href: "/parent#account" },
    ],
  },
};
