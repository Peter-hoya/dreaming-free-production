import guideIndex from "@/data/guideIndex.json";
import { infoPageOrder, infoPages } from "@/data/info";
import { categoryLabels, games, tools, type ToolDefinition } from "@/data/site";
import { getToolSearchMetadata } from "@/data/toolSeo";
import { guidePath } from "@/lib/guideShared";
import { absoluteUrl, isSiteReadyForIndexing } from "@/lib/seo";

export const dynamic = "force-static";

// llms.txt (llmstxt.org): H1 site name, optional blockquote summary, then
// Markdown link lists. It is a discovery aid for AI agents only; it is not a
// Google Search signal and no consumer agent is confirmed to read it.

const categoryOrder: ToolDefinition["category"][] = ["daily", "finance", "health", "writing", "digital"];

function oneLine(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function toolLines(locale: "ko" | "en") {
  const lines: string[] = [];
  for (const category of categoryOrder) {
    const inCategory = tools.filter((tool) => tool.category === category);
    if (!inCategory.length) continue;
    lines.push(`### ${categoryLabels[category][locale]}`, "");
    for (const tool of inCategory) {
      const meta = getToolSearchMetadata(tool.slug, locale);
      lines.push(`- [${meta.heading}](${absoluteUrl(`/${locale}/tools/${tool.slug}`)}): ${oneLine(meta.description)}`);
    }
    lines.push("");
  }
  return lines;
}

function buildLlmsTxt() {
  const lines: string[] = [
    "# MoaTools (모아툴)",
    "",
    "> Free bilingual (Korean/English) browser-based calculators, converters, generators, and casual web games, plus Korean everyday-life guides. Most tools run entirely in the browser; inputs are not sent to the server.",
    "",
    "Each tool has a fixed-language canonical URL (`/ko/...` for Korean, `/en/...` for English) with usage steps, method/assumptions, FAQs, and official references where relevant. Results are for everyday reference; confirm financial, medical, or legal decisions with the relevant authority.",
    "",
    "## Hubs",
    "",
    `- [모아툴 홈 (Korean home)](${absoluteUrl("/ko")}): 한국어 도구·게임 전체 소개`,
    `- [MoaTools home (English)](${absoluteUrl("/en")}): Overview of all tools and games in English`,
    `- [모든 도구 (Korean tool directory)](${absoluteUrl("/ko/tools")}): 30개 도구 목록`,
    `- [All tools (English tool directory)](${absoluteUrl("/en/tools")}): Directory of all 30 tools`,
    `- [생활 가이드 (Korean guides)](${absoluteUrl("/entry")}): 한국 생활 정보 가이드 목록`,
    "",
    "## Tools (English)",
    "",
    ...toolLines("en"),
    "## 도구 (한국어)",
    "",
    ...toolLines("ko"),
    "## Games",
    "",
    ...games.map((game) => `- [${game.title.en}](${absoluteUrl(`/en/games/${game.slug}`)}): ${oneLine(game.short.en)}`),
    "",
    "## 생활 가이드 (Korean guides)",
    "",
    ...guideIndex.map((article) => `- [${oneLine(article.title)}](${absoluteUrl(guidePath(article.slug))}): ${oneLine(article.description).slice(0, 160)}`),
    "",
    "## Optional",
    "",
    ...infoPageOrder.map((slug) => `- [${infoPages.en[slug].title}](${absoluteUrl(`/en/${slug}`)})`),
    `- [Sitemap](${absoluteUrl("/sitemap.xml")})`,
    `- [RSS (Korean guides)](${absoluteUrl("/rss")})`,
    "",
  ];
  return lines.join("\n");
}

export function GET() {
  if (!isSiteReadyForIndexing) {
    return new Response("Not Found\n", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
  return new Response(buildLlmsTxt(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
      "X-Robots-Tag": "noindex",
    },
  });
}
