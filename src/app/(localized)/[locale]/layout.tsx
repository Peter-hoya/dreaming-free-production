import type { Metadata, Viewport } from "next";
import Script from "next/script";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { Analytics } from "@/components/Analytics";
import { JsonLd } from "@/components/JsonLd";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { isLocale, locales, type Locale } from "@/data/site";
import { adsenseClient } from "@/lib/adsense";
import {
  absoluteUrl,
  isSiteReadyForIndexing,
  operatorName,
  reviewerName,
  siteUrl,
  siteVerification,
} from "@/lib/seo";
import "../../globals.css";

export const revalidate = 86400;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
  themeColor: [
    {
      media: "(prefers-color-scheme: light)",
      color: "#f5f6f2",
    },
    {
      media: "(prefers-color-scheme: dark)",
      color: "#151916",
    },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "MoaTools",
  authors: [
    {
      name:
        reviewerName ||
        operatorName ||
        "MoaTools Editorial Team",
    },
  ],
  creator: "MoaTools",
  publisher: "MoaTools",
  formatDetection: {
    address: false,
    email: false,
    telephone: false,
  },
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
        googleBot: {
          index: false,
          follow: false,
          noarchive: true,
        },
      },
  verification: siteVerification,
  other: {
    "google-adsense-account": adsenseClient,
  },
};

export function generateStaticParams() {
  return locales.map((locale) => ({
    locale,
  }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;

  if (!isLocale(rawLocale)) {
    notFound();
  }

  const locale = rawLocale as Locale;

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": absoluteUrl("/ko#organization"),
    name: "MoaTools",
    alternateName: "모아툴",
    legalName: operatorName || undefined,
    url: absoluteUrl("/ko"),
    description:
      locale === "ko"
        ? "무료 온라인 계산기와 생활 도구"
        : "Free online calculators and everyday tools",
  };

  return (
    <html
      lang={locale}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <a className="skip-link" href="#main-content">
          {locale === "ko"
            ? "본문 바로가기"
            : "Skip to content"}
        </a>

        <SiteHeader locale={locale} />

        <main id="main-content">
          {children}
        </main>

        <SiteFooter locale={locale} />
        <JsonLd data={organization} />
        <Analytics />
        <Script
          id="google-adsense"
          async
          strategy="afterInteractive"
          crossOrigin="anonymous"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
        />
      </body>
    </html>
  );
}
