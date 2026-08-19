import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";
import { ArticleToc } from "@/components/guides/ArticleToc";
import { RelatedGuides } from "@/components/guides/RelatedGuides";
import { RgbColorTool } from "@/components/guides/RgbColorTool";
import { JsonLd } from "@/components/JsonLd";
import { isArchiveOnlyGuide, isGuideAdEligible } from "@/data/guideQuality";
import {
  formatGuideDate,
  getGuideBySlug,
  getRelatedGuides,
  guidePath,
  guides,
  metadataDescription,
} from "@/lib/guides";
import { absoluteUrl, isSiteReadyForIndexing } from "@/lib/seo";

type GuidePageProps = {
  params: Promise<{ slug: string[] }>;
};

function splitGuideContent(contentHtml: string) {
  const sectionStarts = [...contentHtml.matchAll(/<h2\b/gi)]
    .map((match) => match.index)
    .filter((index): index is number => typeof index === "number");
  const splitAt = sectionStarts[Math.floor(sectionStarts.length / 2)];
  if (!splitAt) return [contentHtml, ""] as const;
  return [contentHtml.slice(0, splitAt), contentHtml.slice(splitAt)] as const;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return guides.map((article) => ({ slug: article.slug.split("/") }));
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getGuideBySlug(slug);
  if (!article) return {};

  const canonicalPath = guidePath(article.slug);
  const canonical = absoluteUrl(canonicalPath);
  const title = `${article.title} | 모아툴`;
  const description = metadataDescription(article.description);
  const image = article.heroImage
    ? {
        url: absoluteUrl(article.heroImage.src),
        width: article.heroImage.width,
        height: article.heroImage.height,
        alt: article.heroImage.alt,
      }
    : {
        url: absoluteUrl("/ko/opengraph-image"),
        width: 1200,
        height: 630,
        alt: "모아툴 생활 가이드",
      };

  return {
    title,
    description,
    keywords: [article.title, article.category, "생활 가이드"],
    authors: [{ name: article.author }],
    alternates: { canonical },
    openGraph: {
      type: "article",
      locale: "ko_KR",
      url: canonical,
      siteName: "MoaTools",
      title,
      description,
      publishedTime: article.publishedAt,
      modifiedTime: article.modifiedAt,
      authors: [article.author],
      section: article.category,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image.url],
    },
    robots: !isSiteReadyForIndexing
      ? {
          index: false,
          follow: false,
          noarchive: true,
          googleBot: { index: false, follow: false, noarchive: true },
        }
      : undefined,
  };
}

export default async function GuideArticlePage({ params }: GuidePageProps) {
  const { slug } = await params;
  const article = getGuideBySlug(slug);
  if (!article) notFound();

  const canonicalPath = guidePath(article.slug);
  const canonical = absoluteUrl(canonicalPath);
  const related = getRelatedGuides(article);
  const showGuideAd = isGuideAdEligible(article.slug);
  const showRgbTool = article.slug === "RGB-색상표-컬러-색상-팔레트-바로-확인";
  const [contentBeforeAd, contentAfterAd] = showGuideAd
    ? splitGuideContent(article.contentHtml)
    : [article.contentHtml, ""];
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${canonical}#article`,
    mainEntityOfPage: canonical,
    url: canonical,
    headline: article.title,
    description: metadataDescription(article.description),
    image: article.heroImage ? [absoluteUrl(article.heroImage.src)] : undefined,
    datePublished: article.publishedAt,
    dateModified: article.modifiedAt,
    author: {
      "@type": "Person",
      name: article.author,
    },
    publisher: {
      "@type": "Organization",
      "@id": absoluteUrl("/ko#organization"),
      name: "MoaTools",
    },
    articleSection: article.category,
    inLanguage: "ko-KR",
    isPartOf: {
      "@type": "Blog",
      "@id": `${absoluteUrl("/entry")}#collection`,
      name: "모아툴 생활 가이드",
    },
    isBasedOn: article.originalUrl,
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "모아툴 홈",
        item: absoluteUrl("/ko"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "생활 가이드",
        item: absoluteUrl("/entry"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: article.title,
        item: canonical,
      },
    ],
  };

  return (
    <>
      <div className="guide-shell guide-article-page">
        <nav className="guide-breadcrumb" aria-label="현재 위치">
          <Link href="/ko">홈</Link>
          <span aria-hidden="true">/</span>
          <Link href="/entry">생활 가이드</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{article.title}</span>
        </nav>

        <div className="guide-article-layout">
          <article className="guide-article">
            <header className="guide-article__header">
              <span className="guide-article__category">{article.category}</span>
              <h1 id="article-title">{article.title}</h1>
              <p>{article.description}</p>
              <dl className="guide-article__dates">
                <div>
                  <dt>작성</dt>
                  <dd><time dateTime={article.publishedAt}>{formatGuideDate(article.publishedAt)}</time></dd>
                </div>
                <div>
                  <dt>최종 수정</dt>
                  <dd><time dateTime={article.modifiedAt}>{formatGuideDate(article.modifiedAt)}</time></dd>
                </div>
                <div>
                  <dt>작성자</dt>
                  <dd>{article.author}</dd>
                </div>
              </dl>
            </header>

            <aside className="guide-freshness-note" aria-label="정보 확인 안내">
              <strong>읽기 전에 확인해주세요.</strong>
              <p>
                2026년 8월 19일에 공식 출처를 기준으로 내용을 점검했습니다. 제도, 가격과 일정은
                바뀔 수 있으니 신청이나 결제 직전에 본문 하단의 공식 안내를 다시 확인하세요.
              </p>
            </aside>

            {isArchiveOnlyGuide(article.slug) ? (
              <section className="guide-archive-context" aria-labelledby="archive-context-title">
                <h2 id="archive-context-title">지난 일정의 보관 기록입니다</h2>
                <p>
                  이 글의 2024년 상반기 공연 일정은 종료되었습니다. 현재 공연과 예매 정보는
                  아티스트 및 공식 예매처의 최신 공지를 확인하세요. 아래 내용은 당시 일정을
                  확인하려는 독자를 위한 기록이며, 보관 글에는 광고를 표시하지 않습니다.
                </p>
              </section>
            ) : null}

            <div className="guide-toc-mobile">
              <ArticleToc headings={article.headings} />
            </div>

            {showRgbTool ? <RgbColorTool /> : null}

            <div
              className="guide-article-content"
              dangerouslySetInnerHTML={{ __html: contentBeforeAd }}
            />

            {showGuideAd ? (
              <div className="guide-article-ad">
                <AdSlot label="광고" />
              </div>
            ) : null}

            {contentAfterAd ? (
              <div
                className="guide-article-content"
                dangerouslySetInnerHTML={{ __html: contentAfterAd }}
              />
            ) : null}
          </article>

          <aside className="guide-article-sidebar" aria-label="글 정보와 목차">
            <ArticleToc headings={article.headings} />
            <div className="guide-source-card">
              <strong>콘텐츠 이력</strong>
              <p>{formatGuideDate(article.migratedAt)}에 기존 블로그 원문을 이전했습니다.</p>
              <a href={article.originalUrl} target="_blank" rel="noopener noreferrer">기존 글 주소 확인</a>
            </div>
          </aside>
        </div>

        <RelatedGuides articles={related} />
      </div>
      <JsonLd data={[articleSchema, breadcrumbSchema]} />
    </>
  );
}
