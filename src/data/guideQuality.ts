const archiveOnlyGuideSlugs = new Set([
  "2024-상반기-나훈아-라스트-콘서트-예매일",
]);

export function isGuideIndexable(slug: string) {
  return !archiveOnlyGuideSlugs.has(slug);
}

export function isGuideAdEligible(slug: string) {
  return isGuideIndexable(slug) && process.env.NEXT_PUBLIC_GUIDE_ADS_ENABLED === "true";
}
