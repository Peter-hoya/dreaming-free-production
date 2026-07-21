import { ArrowDown, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { GuideExplorer } from "@/components/guides/GuideExplorer";
import { isLocale } from "@/data/site";
import { guidePath, guideSummaries } from "@/lib/guides";
import { absoluteUrl } from "@/lib/seo";

const featuredGuide = guideSummaries.find(
  (article) => article.slug === "갤럭시-휴대폰-화면-안보일때-데이터-백업-옮기는-방법",
) ?? guideSummaries[0];

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: locale === "ko" ? "생활 가이드 | 모아툴" : "Korean Guides | MoaTools",
    description: locale === "ko"
      ? "모아툴의 한국어 생활 가이드 아카이브로 이동합니다."
      : "Browse MoaTools' Korean-language archive while keeping the English site navigation.",
    alternates: { canonical: absoluteUrl("/entry") },
    robots: { index: false, follow: true },
  };
}

export default async function LocalizedGuidesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  if (locale === "ko") redirect("/entry");

  return (
    <div className="guide-site">
      <div className="guide-shell">
        <section className="guide-hub-hero" aria-labelledby="localized-guide-title">
          <div className="guide-hub-hero__copy">
            <span className="guide-eyebrow">KOREAN GUIDE ARCHIVE</span>
            <h1 id="localized-guide-title">Korean guides, inside the English menu</h1>
            <p>The articles remain in Korean so their original URLs and search history stay intact. You can browse the full archive here without changing the site navigation language.</p>
            <a className="guide-primary-link" href="#guide-library">
              Browse 45 Korean guides
              <ArrowDown size={18} weight="bold" aria-hidden="true" />
            </a>
          </div>

          {featuredGuide ? (
            <Link href={guidePath(featuredGuide.slug)} className="guide-featured-story" lang="ko">
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
                <small>한국어로 글 보기 <ArrowUpRight size={15} weight="bold" aria-hidden="true" /></small>
              </div>
            </Link>
          ) : null}
        </section>

        <GuideExplorer articles={guideSummaries} locale="en" />
      </div>
    </div>
  );
}
