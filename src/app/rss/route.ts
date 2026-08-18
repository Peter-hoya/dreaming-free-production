import { guidePath, guideSummaries, metadataDescription } from "@/lib/guides";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 86400;

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function GET() {
  const articles = [...guideSummaries].sort(
    (left, right) => Date.parse(right.modifiedAt) - Date.parse(left.modifiedAt),
  );
  const feedUrl = absoluteUrl("/rss");
  const hubUrl = absoluteUrl("/entry");
  const latestModifiedAt = articles.reduce(
    (latest, article) => Math.max(latest, Date.parse(article.modifiedAt)),
    0,
  );
  const items = articles.map((article) => {
    const canonical = absoluteUrl(guidePath(article.slug));
    return [
      "<item>",
      `<title>${escapeXml(article.title)}</title>`,
      `<link>${escapeXml(canonical)}</link>`,
      `<guid isPermaLink="true">${escapeXml(canonical)}</guid>`,
      `<description>${escapeXml(metadataDescription(article.description))}</description>`,
      `<category>${escapeXml(article.category)}</category>`,
      `<pubDate>${new Date(article.publishedAt).toUTCString()}</pubDate>`,
      "</item>",
    ].join("");
  }).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>MoaTools 생활 가이드</title>
<link>${escapeXml(hubUrl)}</link>
<description>생활 속 문제 해결에 도움이 되는 MoaTools의 한국어 실용 가이드</description>
<language>ko-KR</language>
<lastBuildDate>${new Date(latestModifiedAt).toUTCString()}</lastBuildDate>
<atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />
<ttl>1440</ttl>
${items}
</channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
