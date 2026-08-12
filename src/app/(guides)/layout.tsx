import type { Metadata, Viewport } from "next";
import Script from "next/script";
import type { ReactNode } from "react";
import { Analytics } from "@/components/Analytics";
import { JsonLd } from "@/components/JsonLd";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { adsenseClient } from "@/lib/adsense";
import {
  absoluteUrl,
  isSiteReadyForIndexing,
  operatorName,
  reviewerName,
  siteUrl,
  siteVerification,
} from "@/lib/seo";
import "../globals.css";
import "./guides.css";

const guideAdsEnabled = process.env.NEXT_PUBLIC_GUIDE_ADS_ENABLED === "true";

export const revalidate = 86400;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f6f2" },
    { media: "(prefers-color-scheme: dark)", color: "#151916" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "MoaTools",
  authors: [{ name: reviewerName || operatorName || "MoaTools Editorial Team" }],
  creator: "MoaTools",
  publisher: "MoaTools",
  formatDetection: { address: false, email: false, telephone: false },
  robots: isSiteReadyForIndexing
    ? {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-image-preview": "large",
          "max-snippet": -1,
          "max-video-preview": -1,
        },
      }
    : {
        index: false,
        follow: false,
        noarchive: true,
        googleBot: { index: false, follow: false, noarchive: true },
      },
  verification: siteVerification,
  other: { "google-adsense-account": adsenseClient },
};

export default function GuideLayout({ children }: { children: ReactNode }) {
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": absoluteUrl("/ko#organization"),
    name: "MoaTools",
    alternateName: "모아툴",
    legalName: operatorName || undefined,
    url: absoluteUrl("/ko"),
    description: "무료 온라인 도구와 실용적인 생활 가이드를 제공하는 웹사이트",
  };

  return (
    <html lang="ko" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className="guide-site" suppressHydrationWarning>
        <a className="skip-link" href="#main-content">본문 바로가기</a>
        <SiteHeader locale="ko" showLanguageSwitcher={false} />
        <main id="main-content">{children}</main>
        <SiteFooter locale="ko" />
        <JsonLd data={organization} />
        <Analytics />
        {guideAdsEnabled ? (
          <Script
            id="google-adsense"
            async
            strategy="afterInteractive"
            crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
          />
        ) : null}
      </body>
    </html>
  );
}
