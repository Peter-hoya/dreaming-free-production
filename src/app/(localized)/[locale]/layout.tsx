import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { Analytics } from "@/components/Analytics";
import { JsonLd } from "@/components/JsonLd";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { isLocale, locales, type Locale } from "@/data/site";
import { absoluteUrl, isSiteReadyForIndexing, operatorName, reviewerName, siteUrl, siteVerification } from "@/lib/seo";
import "../../globals.css";

const configuredAdsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
const adsenseClient = configuredAdsenseClient && /^ca-pub-\d+$/.test(configuredAdsenseClient)
  ? configuredAdsenseClient
  : undefined;

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
    ? { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } }
    : { index: false, follow: false, noarchive: true, googleBot: { index: false, follow: false, noarchive: true } },
  verification: siteVerification,
  other: adsenseClient ? { "google-adsense-account": adsenseClient } : undefined,
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale as Locale;
  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": absoluteUrl("/#organization"),
    name: "MoaTools",
    alternateName: "모아툴",
    legalName: operatorName || undefined,
    url: absoluteUrl(),
    description: locale === "ko" ? "무료 온라인 계산기와 생활 도구" : "Free online calculators and everyday tools",
  };

  return (
    <html lang={locale} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <a className="skip-link" href="#main-content">{locale === "ko" ? "본문 바로가기" : "Skip to content"}</a>
        <SiteHeader locale={locale} />
        <main id="main-content">{children}</main>
        <SiteFooter locale={locale} />
        <JsonLd data={organization} />
        <Analytics />
      </body>
    </html>
  );
}
