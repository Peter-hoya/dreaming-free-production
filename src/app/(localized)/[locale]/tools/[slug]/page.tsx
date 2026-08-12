import { ArrowUpRight, CheckCircle } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";
import { FaqList } from "@/components/FaqList";
import { JsonLd } from "@/components/JsonLd";
import { ToolIcon } from "@/components/ToolIcon";
import { ToolWidget } from "@/components/tools/ToolWidgets";
import { getTool, isLocale, siteCopy, tools, type Locale } from "@/data/site";
import { getToolSearchMetadata } from "@/data/toolSeo";
import { absoluteUrl, pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return tools.map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const tool = getTool(slug);
  if (!tool) return {};
  const searchMetadata = getToolSearchMetadata(tool.slug, locale);
  return pageMetadata({
    locale,
    title: searchMetadata.title,
    description: searchMetadata.description,
    path: `tools/${tool.slug}`,
    keywords: [...new Set([...searchMetadata.queries, ...tool.keywords[locale]])],
  });
}

export default async function ToolPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: rawLocale, slug } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale as Locale;
  const tool = getTool(slug);
  if (!tool) notFound();
  const searchMetadata = getToolSearchMetadata(tool.slug, locale);
  const copy = siteCopy[locale];
  const related = [
    ...tools.filter((candidate) => candidate.slug !== tool.slug && candidate.category === tool.category),
    ...tools.filter((candidate) => candidate.slug !== tool.slug && candidate.category !== tool.category),
  ].slice(0, 3);
  const pageUrl = absoluteUrl(`/${locale}/tools/${tool.slug}`);
  const webPageId = `${pageUrl}#webpage`;
  const applicationId = `${pageUrl}#application`;
  const breadcrumbId = `${pageUrl}#breadcrumb`;
  const description = searchMetadata.description;
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": webPageId,
      name: searchMetadata.heading,
      alternateName: searchMetadata.queries.slice(1),
      description,
      url: pageUrl,
      inLanguage: locale,
      dateModified: "2026-07-21",
      isPartOf: { "@type": "WebSite", "@id": absoluteUrl("/ko#website"), name: "MoaTools", url: absoluteUrl("/ko") },
      breadcrumb: { "@id": breadcrumbId },
      mainEntity: { "@id": applicationId },
      citation: tool.sources?.[locale].map((source) => ({
        "@type": "CreativeWork",
        name: source.label,
        url: source.url,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "@id": applicationId,
      name: searchMetadata.heading,
      alternateName: searchMetadata.queries.slice(1),
      description,
      url: pageUrl,
      inLanguage: locale,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Web browser",
      browserRequirements: "Requires JavaScript and a modern web browser",
      isAccessibleForFree: true,
      featureList: tool.useCases[locale],
      provider: { "@type": "Organization", "@id": absoluteUrl("/ko#organization"), name: "MoaTools" },
      offers: { "@type": "Offer", price: "0", priceCurrency: locale === "ko" ? "KRW" : "USD" },
      potentialAction: { "@type": "UseAction", target: pageUrl },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "@id": breadcrumbId,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: copy.backHome, item: absoluteUrl(`/${locale}`) },
        { "@type": "ListItem", position: 2, name: copy.allTools, item: absoluteUrl(`/${locale}/tools`) },
        { "@type": "ListItem", position: 3, name: searchMetadata.heading, item: pageUrl },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": `${pageUrl}#faq`,
      url: `${pageUrl}#faq`,
      isPartOf: { "@id": webPageId },
      mainEntity: tool.faqs[locale].map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    },
  ];

  return (
    <>
      <section className="site-shell tool-hero">
        <header className="tool-intro">
          <nav className="breadcrumbs" aria-label={locale === "ko" ? "현재 위치" : "Breadcrumb"}>
            <Link href={`/${locale}`}>{copy.backHome}</Link>
            <span aria-hidden="true">/</span>
            <Link href={`/${locale}/tools`}>{copy.allTools}</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{searchMetadata.heading}</span>
          </nav>
          <ToolIcon name={tool.icon} large />
          <h1>{searchMetadata.heading}</h1>
          <p>{tool.short[locale]}</p>
          <p className="reviewed"><CheckCircle size={16} weight="fill" aria-hidden="true" /> {copy.updated}: 2026-07-21</p>
        </header>
        <ToolWidget slug={tool.slug} locale={locale} />
      </section>

      <AdSlot label={locale === "ko" ? "광고" : "Advertisement"} />

      <section className="section-compact">
        <div className="site-shell article-grid">
          <article className="content-block">
            <h2>{locale === "ko" ? "원리와 기준" : "Method and assumptions"}</h2>
            <p>{tool.description[locale]}</p>
          </article>
          <article className="content-block">
            <h2>{copy.toolGuide}</h2>
            <ol className="numbered-list">
              {tool.guide[locale].map((item) => <li key={item}>{item}</li>)}
            </ol>
          </article>
          <article className="content-block">
            <h2>{copy.useCases}</h2>
            <ul className="use-case-grid">
              {tool.useCases[locale].map((item) => (
                <li key={item}><CheckCircle size={18} weight="fill" aria-hidden="true" /> <span>{item}</span></li>
              ))}
            </ul>
          </article>
          <article className="content-block">
            <h2>{locale === "ko" ? "결과를 확인하는 법" : "How to verify the result"}</h2>
            <p>{locale === "ko"
              ? "입력 단위와 기준일을 먼저 확인하고, 중요한 결정에 사용할 때는 공식 기관이나 원본 문서의 기준과 비교하세요. 반올림된 표시값이 필요하면 원본 계산값과 차이가 날 수 있습니다."
              : "Check input units and reference dates first. For an important decision, compare the result with an official source or original document. A rounded display can differ slightly from the underlying value."}</p>
          </article>
          {tool.sources?.[locale].length ? (
            <article className="content-block">
              <h2>{locale === "ko" ? "공식 기준과 참고자료" : "Official references"}</h2>
              <ul className="source-list">
                {tool.sources[locale].map((source) => (
                  <li key={source.url}>
                    <a href={source.url} target="_blank" rel="noreferrer noopener">
                      <span>{source.label}</span>
                      <ArrowUpRight size={17} weight="bold" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            </article>
          ) : null}
        </div>
      </section>

      <section className="section-compact">
        <div className="site-shell">
          <header className="section-heading"><h2>{copy.faqTitle}</h2></header>
          <FaqList items={tool.faqs[locale]} />
        </div>
      </section>

      <section className="section-compact">
        <div className="site-shell">
          <header className="section-heading"><h2>{copy.related}</h2></header>
          <div className="related-grid">
            {related.map((relatedTool) => (
              <Link className="related-card" href={`/${locale}/tools/${relatedTool.slug}`} key={relatedTool.slug}>
                <ToolIcon name={relatedTool.icon} />
                <span>
                  <strong>{getToolSearchMetadata(relatedTool.slug, locale).heading}</strong>
                  <small>{relatedTool.short[locale]}</small>
                </span>
                <ArrowUpRight size={18} weight="bold" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </section>
      <JsonLd data={structuredData} />
    </>
  );
}
