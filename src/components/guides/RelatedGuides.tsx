import Image from "next/image";
import Link from "next/link";
import {
  formatGuideDate,
  guidePath,
  type GuideIndexItem,
} from "@/lib/guideShared";

export function RelatedGuides({ articles }: { articles: readonly GuideIndexItem[] }) {
  if (articles.length === 0) return null;

  return (
    <section className="guide-related" aria-labelledby="related-guides-title">
      <div className="guide-related__heading">
        <h2 id="related-guides-title">함께 읽으면 좋은 글</h2>
        <Link href="/entry">전체 가이드 보기</Link>
      </div>
      <div className="guide-related__grid">
        {articles.map((article) => (
          <article key={article.slug}>
            <Link href={guidePath(article.slug)}>
              {article.heroImage ? (
                <div className="guide-related__media">
                  <Image
                    src={article.heroImage.src}
                    alt={article.heroImage.alt}
                    fill
                    sizes="(max-width: 760px) 100vw, 30vw"
                  />
                </div>
              ) : null}
              <div className="guide-related__copy">
                <span>{article.category}</span>
                <h3>{article.title}</h3>
                <time dateTime={article.modifiedAt}>{formatGuideDate(article.modifiedAt)}</time>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
