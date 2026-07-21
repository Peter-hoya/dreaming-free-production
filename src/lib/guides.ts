import rawGuideArticles from "@/data/guideArticles.json";
import rawGuideIndex from "@/data/guideIndex.json";
import type { GuideArticle, GuideIndexItem } from "@/lib/guideShared";

export {
  encodeGuideSlug,
  formatGuideDate,
  guidePath,
  metadataDescription,
} from "@/lib/guideShared";
export type {
  GuideArticle,
  GuideHeading,
  GuideHeadingLevel,
  GuideImage,
  GuideIndexItem,
} from "@/lib/guideShared";

const guideArticles = rawGuideArticles as GuideArticle[];
const guideIndex = rawGuideIndex as GuideIndexItem[];

const articleBySlug = new Map(
  guideArticles.map((article) => [article.slug.normalize("NFC"), article]),
);

export const guides = guideArticles as readonly GuideArticle[];
export const guideSummaries = guideIndex as readonly GuideIndexItem[];

export const guideCategories = Array.from(
  new Set(guideIndex.map((article) => article.category)),
).sort((a, b) => a.localeCompare(b, "ko"));

export function normalizeGuideSlug(slug: string | string[]) {
  const joined = Array.isArray(slug) ? slug.join("/") : slug;

  try {
    return decodeURIComponent(joined).normalize("NFC");
  } catch {
    return joined.normalize("NFC");
  }
}

export function getGuideBySlug(slug: string | string[]) {
  return articleBySlug.get(normalizeGuideSlug(slug));
}

export function getRelatedGuides(article: GuideArticle, limit = 3) {
  const sameCategory = guideIndex.filter(
    (candidate) => candidate.slug !== article.slug && candidate.category === article.category,
  );
  const otherCategories = guideIndex.filter(
    (candidate) => candidate.slug !== article.slug && candidate.category !== article.category,
  );

  return [...sameCategory, ...otherCategories].slice(0, limit);
}
