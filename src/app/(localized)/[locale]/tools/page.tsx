import { ArrowDown } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { ToolCardGrid } from "@/components/ToolCardGrid";
import { ToolSearch } from "@/components/ToolSearch";
import { globalTools } from "@/data/globalTools";
import { koreanTools } from "@/data/koreanTools";
import { coreTools, isLocale, tools, type Locale } from "@/data/site";
import { getToolSearchMetadata } from "@/data/toolSeo";
import { absoluteUrl, pageMetadata } from "@/lib/seo";

const directoryCopy = {
  ko: {
    title: "무료 온라인 계산기와 도구 모음",
    description: "4대보험 계산기, 연봉·퇴직금·대출 계산기부터 PDF, 이미지, 개발, 글쓰기 도구까지 30개 무료 도구를 바로 사용하세요.",
    eyebrow: "모든 도구",
    action: "도구 목록 보기",
    coreTitle: "매일 쓰는 계산기와 변환기",
    coreBody: "나이, 퍼센트, 날짜, 단위, 금융, 이미지와 글쓰기처럼 일상에서 반복해서 찾는 도구입니다.",
    koreaTitle: "한국 생활 계산기",
    koreaBody: "4대보험, 연봉, 퇴직금, 주휴수당과 부동산처럼 한국 기준과 최신 요율이 중요한 계산을 모았습니다.",
    globalTitle: "업무와 학습을 위한 글로벌 도구",
    globalBody: "PDF, 시간대, JSON, UUID, 포모도로와 타자 테스트를 브라우저에서 빠르게 처리합니다.",
  },
  en: {
    title: "All Free Online Calculators and Tools",
    description: "Open 30 free calculators and browser tools for finance, PDFs, images, time zones, writing, development, health, and everyday planning.",
    eyebrow: "All tools",
    action: "Browse every tool",
    coreTitle: "Everyday calculators and converters",
    coreBody: "Handle age, percentages, dates, units, finance, images, writing, and other recurring everyday tasks.",
    koreaTitle: "Calculators for life in Korea",
    koreaBody: "Estimate Korean social insurance, salary, severance pay, weekly holiday pay, housing costs, and other locally specific values.",
    globalTitle: "Global work and study tools",
    globalBody: "Work with PDFs, time zones, JSON, UUIDs, focus sessions, typing practice, and travel planning directly in your browser.",
  },
} as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const copy = directoryCopy[locale];
  return pageMetadata({
    locale,
    title: copy.title,
    description: copy.description,
    path: "tools",
    keywords: locale === "ko"
      ? ["무료 온라인 계산기", "계산기 모음", "4대보험 계산기", "온라인 도구"]
      : ["free online calculators", "online tools", "browser tools", "calculator directory"],
  });
}

export default async function ToolDirectoryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const copy = directoryCopy[locale];
  const canonical = absoluteUrl(`/${locale}/tools`);
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": `${canonical}#webpage`,
      url: canonical,
      name: copy.title,
      description: copy.description,
      inLanguage: locale,
      isPartOf: { "@type": "WebSite", "@id": absoluteUrl("/#website") },
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: tools.length,
        itemListElement: tools.map((tool, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: getToolSearchMetadata(tool.slug, locale).heading,
          url: absoluteUrl(`/${locale}/tools/${tool.slug}`),
        })),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "@id": `${canonical}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: locale === "ko" ? "모아툴 홈" : "MoaTools home", item: absoluteUrl(`/${locale}`) },
        { "@type": "ListItem", position: 2, name: copy.eyebrow, item: canonical },
      ],
    },
  ];

  return (
    <>
      <section className="site-shell hero">
        <div className="hero-copy">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1>{copy.title}</h1>
          <p>{copy.description}</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#tool-directory">
              {copy.action}
              <ArrowDown size={18} weight="bold" aria-hidden="true" />
            </a>
          </div>
        </div>
        <div className="search-stage" aria-label={locale === "ko" ? "전체 도구 검색" : "Search all tools"}>
          <ToolSearch locale={locale} />
        </div>
      </section>

      <div id="tool-directory">
        <section className="section">
          <div className="site-shell">
            <header className="section-heading">
              <h2>{copy.coreTitle}</h2>
              <p>{copy.coreBody}</p>
            </header>
            <ToolCardGrid items={coreTools} locale={locale} />
          </div>
        </section>

        <section className="section section-toned">
          <div className="site-shell">
            <header className="section-heading">
              <p className="section-kicker">KOREA</p>
              <h2>{copy.koreaTitle}</h2>
              <p>{copy.koreaBody}</p>
            </header>
            <ToolCardGrid items={koreanTools} locale={locale} />
          </div>
        </section>

        <section className="section">
          <div className="site-shell">
            <header className="section-heading">
              <p className="section-kicker">GLOBAL</p>
              <h2>{copy.globalTitle}</h2>
              <p>{copy.globalBody}</p>
            </header>
            <ToolCardGrid items={globalTools} locale={locale} />
          </div>
        </section>
      </div>
      <JsonLd data={structuredData} />
    </>
  );
}
