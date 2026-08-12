import { ArrowDown } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { AdSlot } from "@/components/AdSlot";
import { FaqList } from "@/components/FaqList";
import { HomeToolDirectory } from "@/components/HomeToolDirectory";
import { JsonLd } from "@/components/JsonLd";
import { ToolIcon } from "@/components/ToolIcon";
import { ToolSearch } from "@/components/ToolSearch";
import { games, isLocale, siteCopy, tools, type Locale } from "@/data/site";
import { absoluteUrl, pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  return pageMetadata({
    locale,
    title: locale === "ko" ? "무료 온라인 계산기와 생활 도구" : "Free Online Calculators and Everyday Tools",
    description: locale === "ko"
      ? "한국 생활 계산기, PDF, 시간대, 개발, 이미지, 글쓰기까지 30개 도구와 3개 무료 웹 게임을 브라우저에서 사용하세요."
      : "Use 30 free browser tools plus 3 games for PDFs, time zones, finance, health, development, writing, images, and planning.",
    keywords: locale === "ko"
      ? ["무료 계산기", "온라인 도구", "생활 계산기", "모아툴"]
      : ["free online tools", "online calculator", "browser tools", "MoaTools"],
  });
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const copy = siteCopy[locale];
  const websiteData = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": absoluteUrl("/ko#website"),
      name: "MoaTools",
      alternateName: "모아툴",
      url: absoluteUrl("/ko"),
      inLanguage: ["ko", "en"],
      description: "Free bilingual calculators, browser utilities, and casual web games.",
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: copy.homeFaqs.map(([question, answer]) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: { "@type": "Answer", text: answer },
      })),
    },
  ];

  return (
    <>
      <section className="site-shell hero">
        <div className="hero-copy">
          <p className="eyebrow">{copy.heroEyebrow}</p>
          <h1>{copy.heroTitle}</h1>
          <p>{copy.heroBody}</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#tools">
              {copy.browseTools}
              <ArrowDown size={18} weight="bold" aria-hidden="true" />
            </a>
            <a className="button button-secondary" href="#games">{copy.playGames}</a>
          </div>
        </div>
        <div className="search-stage" aria-label={locale === "ko" ? "도구 빠른 검색" : "Quick tool search"}>
          <ToolSearch locale={locale} />
        </div>
      </section>

      <section className="section" id="tools">
        <div className="site-shell">
          <header className="section-heading">
            <h2>{copy.popularTitle}</h2>
            <p>{copy.popularBody}</p>
          </header>
          <HomeToolDirectory items={tools} locale={locale} />
        </div>
      </section>

      <AdSlot label={locale === "ko" ? "광고" : "Advertisement"} />

      <section className="section section-toned" id="games">
        <div className="site-shell">
          <header className="section-heading">
            <h2>{copy.gamesTitle}</h2>
            <p>{copy.gamesBody}</p>
          </header>
          <div className="games-grid">
            {games.map((game, index) => (
              <Link href={`/${locale}/games/${game.slug}`} className="game-card" key={game.slug}>
                <div className="game-card-copy">
                  <ToolIcon name={game.icon} />
                  <h3>{game.title[locale]}</h3>
                  <p>{game.short[locale]}</p>
                </div>
                <div className={`tile-art${index === 1 ? " memory-art" : index === 2 ? " shooter-art" : ""}`} aria-hidden="true">
                  {(index === 0
                    ? [2, 4, 8, 16, 32, 64]
                    : index === 1
                      ? ["A", "B", "C", "A", "C", "B"]
                      : ["▲", "•", "✦", "•", "▲", "✦"]).map((value, tileIndex) => (
                    <span key={`${value}-${tileIndex}`}>{value}</span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="site-shell trust-layout">
          <h2>{copy.trustTitle}</h2>
          <div className="trust-list">
            {copy.trustItems.map(([title, body], index) => {
              return (
                <article className="trust-item" key={title}>
                  <ToolIcon name={index === 0 ? "lock" : index === 1 ? "chart" : "text"} />
                  <div>
                    <h3>{title}</h3>
                    <p>{body}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-compact">
        <div className="site-shell">
          <header className="section-heading">
            <h2>{copy.faqTitle}</h2>
          </header>
          <FaqList items={copy.homeFaqs} />
        </div>
      </section>
      <JsonLd data={websiteData} />
    </>
  );
}
