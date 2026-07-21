import type { Metadata } from "next";
import type { ReactNode } from "react";
import { siteVerification } from "@/lib/seo";
import "../globals.css";

export const metadata: Metadata = { verification: siteVerification };

export default function RedirectLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
