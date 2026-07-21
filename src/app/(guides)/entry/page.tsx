import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { GuideExplorer } from "@/components/guides/GuideExplorer";
import { JsonLd } from "@/components/JsonLd";
import {
  guideCategories,
  guidePath,
  guideSummaries,
  metadataDescription,
} from "@/lib/guides";
import { absoluteUrl } from "@/lib/seo";

const pageTitle = "생활 가이드 | 모아툴";
const pageDescription = "디지털, 자동차, 생활 금융, 가족과 건강 등 일상에서 자주 찾는 실용 정보를 한곳에서 확인하세요.";
const featuredGuide = guideSummaries.find(
  (article) => article.slug === "갤럭시-휴대폰-화면-안보일때-데이터-백업-옮기는-방법",
) ?? guideSummaries[0];

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  keywords: ["생활 가이드", "생활 정보", "신청 방법", "디지털 가이드", "생활 금융"],
  alternates: { canonical: absoluteUrl("/entry") },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: absoluteUrl("/entry"),
    siteName: "MoaTools",
    title: pageTitle,
    description: pageDescription,
    images: [
      {
        url: absoluteUrl("/ko/opengraph-image"),
        width: 1200,
        height: 630,
        alt: "모아툴 생활 가이드",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
    images: [absoluteUrl("/ko/opengraph-image")],
  },
};

export const dynamic = "force-static";

export default function GuideIndexPage() {
  const canonical = absoluteUrl("/entry");
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${canonical}#collection`,
    url: canonical,
    name: "모아툴 생활 가이드",
    description: pageDescription,
    inLanguage: "ko-KR",
    isPartOf: {
      "@type": "WebSite",
      "@id": absoluteUrl("/#website"),
      name: "MoaTools",
      url: absoluteUrl(),
    },
    about: guideCategories,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: guideSummaries.length,
      itemListOrder: "https://schema.org/ItemListOrderDescending",
      itemListElement: guideSummaries.map((article, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "BlogPosting",
          "@id": `${absoluteUrl(guidePath(article.slug))}#article`,
          url: absoluteUrl(guidePath(article.slug)),
          name: article.title,
          description: metadataDescription(article.description),
          datePublished: article.publishedAt,
          dateModified: article.modifiedAt,
          image: article.heroImage ? absoluteUrl(article.heroImage.src) : undefined,
        },
      })),
    },
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
        item: canonical,
      },
    ],
  };

  return (
    <>
      <div className="guide-shell">
        <section className="guide-hub-hero" aria-labelledby="guide-hub-title">
          <div className="guide-hub-hero__copy">
            <span className="guide-eyebrow">생활 가이드</span>
            <h1 id="guide-hub-title">생활에 필요한 답을 한곳에</h1>
            <p>직접 정리한 45개의 생활 정보를 기존 주소 그대로 이어서 제공합니다.</p>
            <a className="guide-primary-link" href="#guide-library">전체 글 찾아보기</a>
          </div>

          {featuredGuide ? (
            <Link href={guidePath(featuredGuide.slug)} className="guide-featured-story">
              <div className="guide-featured-story__media">
                {featuredGuide.heroImage ? (
                  <Image
                    src={featuredGuide.heroImage.src}
                    alt={featuredGuide.heroImage.alt}
                    fill
                    priority
                    sizes="(max-width: 760px) 100vw, 46vw"
                  />
                ) : null}
              </div>
              <div className="guide-featured-story__copy">
                <span>{featuredGuide.category}</span>
                <strong>{featuredGuide.title}</strong>
                <small>많이 찾는 글 바로 보기</small>
              </div>
            </Link>
          ) : null}
        </section>

        <GuideExplorer articles={guideSummaries} />
      </div>
      <JsonLd data={[collectionSchema, breadcrumbSchema]} />
    </>
  );
}
