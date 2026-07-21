import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { isLocale, siteCopy, type Locale } from "@/data/site";
import { infoPageOrder, infoPages, isInfoSlug } from "@/data/info";
import {
  absoluteUrl,
  contactEmail,
  hasValidContactEmail,
  operatorName,
  pageMetadata,
  reviewerName,
} from "@/lib/seo";

export function generateStaticParams() {
  return infoPageOrder.map((info) => ({ info }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; info: string }> }): Promise<Metadata> {
  const { locale: rawLocale, info } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  if (!isInfoSlug(info)) return {};
  const page = infoPages[locale][info];
  return pageMetadata({ locale, title: page.title, description: page.intro, path: info });
}

export default async function InfoPage({ params }: { params: Promise<{ locale: string; info: string }> }) {
  const { locale: rawLocale, info } = await params;
  if (!isLocale(rawLocale) || !isInfoSlug(info)) notFound();
  const locale = rawLocale as Locale;
  const page = infoPages[locale][info];
  const copy = siteCopy[locale];
  const pageUrl = absoluteUrl(`/${locale}/${info}`);
  const showTrustCard = info === "about" || info === "editorial";
  const pending = locale === "ko" ? "배포 전 실제 정보를 등록하세요." : "Add the verified details before launch.";

  return (
    <>
      <header className="site-shell legal-header">
        <nav className="breadcrumbs" aria-label={locale === "ko" ? "현재 위치" : "Breadcrumb"}>
          <Link href={`/${locale}`}>{copy.backHome}</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{page.title}</span>
        </nav>
        <h1>{page.title}</h1>
        <p>{page.intro}</p>
        <p className="reviewed"><CheckCircle size={16} weight="fill" aria-hidden="true" /> {copy.updated}: 2026-07-21</p>
      </header>

      <div className="site-shell legal-layout">
        <nav className="legal-nav" aria-label={locale === "ko" ? "안내 페이지" : "Information pages"}>
          {infoPageOrder.map((slug) => (
            <Link href={`/${locale}/${slug}`} key={slug} aria-current={slug === info ? "page" : undefined}>
              {infoPages[locale][slug].title}
            </Link>
          ))}
        </nav>
        <article className="legal-content">
          {showTrustCard ? (
            <section className="operator-card" aria-label={locale === "ko" ? "운영 및 검수 정보" : "Operator and review details"}>
              <h2>{locale === "ko" ? "운영 및 검수 정보" : "Operator and review details"}</h2>
              <dl>
                <div>
                  <dt>{locale === "ko" ? "운영 주체" : "Operator"}</dt>
                  <dd>{operatorName || pending}</dd>
                </div>
                <div>
                  <dt>{locale === "ko" ? "콘텐츠 검수" : "Content reviewer"}</dt>
                  <dd>{reviewerName || pending}</dd>
                </div>
                <div>
                  <dt>{locale === "ko" ? "문의" : "Contact"}</dt>
                  <dd>{hasValidContactEmail ? <a href={`mailto:${contactEmail}`}>{contactEmail}</a> : pending}</dd>
                </div>
              </dl>
            </section>
          ) : null}
          {page.sections.map((section) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              {section.bullets ? (
                <ul>
                  {section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
                </ul>
              ) : null}
              {section.partnerLink ? (
                <p>
                  <a href="https://policies.google.com/technologies/partner-sites" rel="noreferrer" target="_blank">
                    {locale === "ko" ? "Google 파트너 사이트의 데이터 사용 방식 보기" : "How Google uses data on partner sites"}
                  </a>
                </p>
              ) : null}
              {section.contactLink ? (
                hasValidContactEmail
                  ? <p><a href={`mailto:${contactEmail}`}>{contactEmail}</a></p>
                  : <p>{pending}</p>
              ) : null}
            </section>
          ))}
        </article>
      </div>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: page.title,
        description: page.intro,
        url: pageUrl,
        inLanguage: locale,
        dateModified: "2026-07-21",
        ...(operatorName ? { publisher: { "@type": "Organization", name: operatorName } } : {}),
        ...(reviewerName ? { reviewedBy: { "@type": "Person", name: reviewerName } } : {}),
      }} />
    </>
  );
}
