import rawLegacyGuides from "@/data/legacyGuides.json";

export type LegacyStatus = "KEEP" | "UPDATE" | "REDIRECT" | "GONE";

export type LegacyGuide = {
  title: string;
  currentSlug: string;
  status: LegacyStatus;
  targetSlug: string | null;
  targetUrl: string | null;
  aliases: string[];
  legacyPaths: string[];
  notes: string;
};

export const legacyGuides = rawLegacyGuides as LegacyGuide[];

function entryPath(value: string) {
  return value.startsWith("/") ? value : `/entry/${value}`;
}

function pathVariants(pathname: string) {
  const variants = new Set([pathname]);
  if (pathname.startsWith("/entry/")) variants.add(`/m${pathname}`);
  for (const path of [...variants]) variants.add(`${path}/comments`);
  return variants;
}

const redirectMap = new Map<string, string>();
const gonePaths = new Set<string>();

for (const guide of legacyGuides) {
  const canonicalSource = `/entry/${guide.currentSlug}`;
  const aliases = guide.aliases.map(entryPath);
  const explicitLegacyPaths = guide.legacyPaths.map(entryPath);
  const sourcePaths = [canonicalSource, ...aliases, ...explicitLegacyPaths];

  if (guide.status === "GONE") {
    for (const sourcePath of sourcePaths) {
      for (const variant of pathVariants(sourcePath)) gonePaths.add(variant);
    }
    continue;
  }

  if (!guide.targetUrl) throw new Error(`Missing targetUrl for ${guide.currentSlug}`);
  const redirectSources = guide.status === "REDIRECT"
    ? sourcePaths
    : [...aliases, ...explicitLegacyPaths];

  for (const sourcePath of redirectSources) {
    for (const variant of pathVariants(sourcePath)) redirectMap.set(variant, guide.targetUrl);
  }

  if (guide.status === "KEEP" || guide.status === "UPDATE") {
    redirectMap.set(`/m${canonicalSource}`, guide.targetUrl);
    redirectMap.set(`${canonicalSource}/comments`, guide.targetUrl);
    redirectMap.set(`/m${canonicalSource}/comments`, guide.targetUrl);
  }
}

export const legacyRedirects = redirectMap;
export const legacyGonePaths = gonePaths;

export const legacyStatusCounts = Object.freeze({
  KEEP: legacyGuides.filter((guide) => guide.status === "KEEP").length,
  UPDATE: legacyGuides.filter((guide) => guide.status === "UPDATE").length,
  REDIRECT: legacyGuides.filter((guide) => guide.status === "REDIRECT").length,
  GONE: legacyGuides.filter((guide) => guide.status === "GONE").length,
});
