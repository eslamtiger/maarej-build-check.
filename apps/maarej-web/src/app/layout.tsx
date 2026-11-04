import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "معارج | مدرسين وسناتر ومساحات مذاكرة",
  description: "معارج: اكتشف المدرّس والسنتر ومساحة المذاكرة المناسبين لك.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <html lang="ar" dir="rtl"><body>{children}</body></html>;
}
