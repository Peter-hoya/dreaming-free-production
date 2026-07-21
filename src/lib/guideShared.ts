export type GuideHeadingLevel = "h2" | "h3";

export type GuideImage = {
  src: string;
  width: number;
  height: number;
  alt: string;
};

export type GuideHeading = {
  id: string;
  label: string;
  level: GuideHeadingLevel;
};

export type GuideIndexItem = {
  slug: string;
  aliases: string[];
  title: string;
  description: string;
  category: string;
  author: string;
  publishedAt: string;
  modifiedAt: string;
  migratedAt: string;
  originalUrl: string;
  heroImage: GuideImage | null;
  characterCount: number;
};

export type GuideArticle = GuideIndexItem & {
  images: GuideImage[];
  headings: GuideHeading[];
  contentHtml: string;
};

export function encodeGuideSlug(slug: string) {
  return slug
    .normalize("NFC")
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

export function guidePath(slug: string) {
  return `/entry/${encodeGuideSlug(slug)}`;
}

export function formatGuideDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Seoul",
  }).format(new Date(value));
}

export function metadataDescription(description: string, maxLength = 155) {
  const normalized = description.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`;
}
