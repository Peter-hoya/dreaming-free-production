import type { MetadataRoute } from "next";
import { games, locales, tools } from "@/data/site";
import { infoPageOrder } from "@/data/info";
import guideIndex from "@/data/guideIndex.json";
import { isGuideIndexable } from "@/data/guideQuality";
import { guidePath } from "@/lib/guideShared";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 86400;

const reviewed = new Date("2026-07-21T00:00:00.000Z");

function entry(path: string, priority: number, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]): MetadataRoute.Sitemap[number] {
  return {
    url: absoluteUrl(path),
    lastModified: reviewed,
    changeFrequency,
    priority,
  };
}

function localizedEntry(
  locale: (typeof locales)[number],
  path: string,
  priority: number,
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
): MetadataRoute.Sitemap[number] {
  const suffix = path ? `/${path.replace(/^\//, "")}` : "";
  return {
    ...entry(`/${locale}${suffix}`, priority, changeFrequency),
    alternates: {
      languages: {
        ko: absoluteUrl(`/ko${suffix}`),
        en: absoluteUrl(`/en${suffix}`),
        "x-default": absoluteUrl(`/ko${suffix}`),
      },
    },
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = [];
  for (const locale of locales) {
    pages.push(localizedEntry(locale, "", 1, "weekly"));
    pages.push(localizedEntry(locale, "tools", 0.95, "weekly"));
    for (const tool of tools) pages.push(localizedEntry(locale, `tools/${tool.slug}`, 0.9, "monthly"));
    for (const game of games) pages.push(localizedEntry(locale, `games/${game.slug}`, 0.75, "monthly"));
    for (const info of infoPageOrder) pages.push(localizedEntry(locale, info, 0.45, "yearly"));
  }
  pages.push(entry("/entry", 0.8, "weekly"));
  for (const article of guideIndex) {
    if (!isGuideIndexable(article.slug)) continue;
    pages.push({
      url: absoluteUrl(guidePath(article.slug)),
      lastModified: new Date(article.modifiedAt),
      changeFrequency: "monthly",
      priority: 0.72,
      images: article.heroImage ? [absoluteUrl(article.heroImage.src)] : undefined,
    });
  }
  return pages;
}
