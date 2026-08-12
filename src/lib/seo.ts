import type { Metadata } from "next";
import type { Locale } from "@/data/site";

const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
const defaultProductionUrl = "https://dreaming-free.com";
const candidateSiteUrl = configuredSiteUrl || defaultProductionUrl;

function isUsableSiteUrl(value: string) {
  try {
    const url = new URL(value);
    return (url.protocol === "https:" || url.hostname === "localhost")
      && !url.hostname.endsWith(".example")
      && !url.hostname.includes("your-domain");
  } catch {
    return false;
  }
}

export const isSiteUrlConfigured = isUsableSiteUrl(candidateSiteUrl);
export const operatorName = process.env.NEXT_PUBLIC_OPERATOR_NAME?.trim() || "";
export const reviewerName = process.env.NEXT_PUBLIC_REVIEWER_NAME?.trim() || "";
export const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || "";
const googleSiteVerification = process.env.GOOGLE_SITE_VERIFICATION?.trim() || "";
const naverSiteVerification = process.env.NAVER_SITE_VERIFICATION?.trim() || "";
export const hasValidContactEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)
  && !contactEmail.includes("your-domain");
export const isSiteReadyForIndexing = isSiteUrlConfigured && Boolean(operatorName) && hasValidContactEmail;
export const siteUrl = (isSiteUrlConfigured
  ? candidateSiteUrl
  : process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : defaultProductionUrl).replace(/\/$/, "");
export const siteVerification: Metadata["verification"] = {
  google: googleSiteVerification || undefined,
  other: naverSiteVerification
    ? { "naver-site-verification": naverSiteVerification }
    : undefined,
};

export function absoluteUrl(path = "") {
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function searchDescription(summary: string, detail: string, maxLength = 160) {
  const normalizedSummary = summary.replace(/\s+/g, " ").trim();
  const normalizedDetail = detail.replace(/\s+/g, " ").trim();
  const combined = normalizedDetail.startsWith(normalizedSummary)
    ? normalizedDetail
    : `${normalizedSummary} ${normalizedDetail}`.trim();
  if (combined.length <= maxLength) return combined;

  const candidate = combined.slice(0, maxLength + 1);
  const sentenceEnd = Math.max(
    candidate.lastIndexOf(". "),
    candidate.lastIndexOf("다. "),
    candidate.lastIndexOf("요. "),
  );
  if (sentenceEnd >= Math.floor(maxLength * 0.62)) return candidate.slice(0, sentenceEnd + 1);

  const wordEnd = candidate.lastIndexOf(" ");
  return `${candidate.slice(0, wordEnd > 0 ? wordEnd : maxLength).trimEnd()}…`;
}

export function localizedAlternates(locale: Locale, path = "") {
  const suffix = path ? `/${path.replace(/^\//, "")}` : "";
  return {
    canonical: absoluteUrl(`/${locale}${suffix}`),
    languages: {
      ko: absoluteUrl(`/ko${suffix}`),
      en: absoluteUrl(`/en${suffix}`),
      "x-default": absoluteUrl(`/ko${suffix}`),
    },
  } satisfies NonNullable<Metadata["alternates"]>;
}

export function pageMetadata({
  locale,
  title,
  description,
  path = "",
  keywords = [],
}: {
  locale: Locale;
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
}): Metadata {
  const fullTitle = `${title} | ${locale === "ko" ? "모아툴" : "MoaTools"}`;
  const canonical = absoluteUrl(`/${locale}${path ? `/${path.replace(/^\//, "")}` : ""}`);
  const socialImage = absoluteUrl(`/${locale}/opengraph-image`);
  return {
    title: fullTitle,
    description,
    keywords,
    alternates: localizedAlternates(locale, path),
    openGraph: {
      type: "website",
      locale: locale === "ko" ? "ko_KR" : "en_US",
      url: canonical,
      siteName: "MoaTools",
      title: fullTitle,
      description,
      images: [{ url: socialImage, width: 1200, height: 630, alt: locale === "ko" ? "모아툴 온라인 도구" : "MoaTools online utilities" }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [socialImage],
    },
  };
}
