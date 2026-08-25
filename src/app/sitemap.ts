import type { MetadataRoute } from "next";
import { games, locales, tools } from "@/data/site";
import { infoPageOrder } from "@/data/info";
import guideIndex from "@/data/guideIndex.json";
import { guidePath } from "@/lib/guideShared";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 86400;

const reviewed = new Date("2026-07-21T00:00:00.000Z");

function entry(path: string): MetadataRoute.Sitemap[number] {
  return {
    url: absoluteUrl(path),
    lastModified: reviewed,
  };
}

function localizedEntry(
  locale: (typeof locales)[number],
  path: string,
): MetadataRoute.Sitemap[number] {
  const suffix = path ? `/${path.replace(/^\//, "")}` : "";
  return {
    ...entry(`/${locale}${suffix}`),
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
    pages.push(localizedEntry(locale, ""));
    pages.push(localizedEntry(locale, "tools"));
    for (const tool of tools) pages.push(localizedEntry(locale, `tools/${tool.slug}`));
    for (const game of games) pages.push(localizedEntry(locale, `games/${game.slug}`));
    for (const info of infoPageOrder) pages.push(localizedEntry(locale, info));
  }
  pages.push(entry("/entry"));
  for (const article of guideIndex) {
    pages.push({
      url: absoluteUrl(guidePath(article.slug)),
      lastModified: new Date(article.modifiedAt),
      images: article.heroImage ? [absoluteUrl(article.heroImage.src)] : undefined,
    });
  }
  return pages;
}
