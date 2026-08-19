import { readFile, writeFile } from "node:fs/promises";
import process from "node:process";

const siteRedirectsPath = "src/data/siteRedirects.json";
const legacyGuidesPath = "src/data/legacyGuides.json";
const guideIndexPath = "src/data/guideIndex.json";
const outputPath = "public/_redirects";
const siteRedirects = JSON.parse(await readFile(siteRedirectsPath, "utf8"));
const legacyGuides = JSON.parse(await readFile(legacyGuidesPath, "utf8"));
const guideIndex = JSON.parse(await readFile(guideIndexPath, "utf8"));
const redirects = new Map(Object.entries(siteRedirects));

function entryPath(value) {
  return value.startsWith("/") ? value : `/entry/${value}`;
}

function pathVariants(pathname) {
  const variants = new Set([pathname]);
  if (pathname.startsWith("/entry/")) variants.add(`/m${pathname}`);
  for (const path of [...variants]) variants.add(`${path}/comments`);
  return variants;
}

for (const guide of legacyGuides) {
  if (guide.status === "GONE") continue;
  const canonicalSource = `/entry/${guide.currentSlug}`;
  const aliases = guide.aliases.map(entryPath);
  const explicitLegacyPaths = guide.legacyPaths.map(entryPath);
  const redirectSources = guide.status === "REDIRECT"
    ? [canonicalSource, ...aliases, ...explicitLegacyPaths]
    : [...aliases, ...explicitLegacyPaths];
  for (const sourcePath of redirectSources) {
    for (const variant of pathVariants(sourcePath)) redirects.set(variant, guide.targetUrl);
  }
}

for (const article of guideIndex) {
  const canonical = `/entry/${article.slug}`;
  redirects.set(`/m${canonical}`, canonical);
  redirects.set(`${canonical}/comments`, canonical);
  redirects.set(`/m${canonical}/comments`, canonical);
}

function encodePath(pathname) {
  return pathname
    .split("/")
    .map((segment) => encodeURIComponent(segment).replace(/[!'()*]/g, (character) =>
      `%${character.charCodeAt(0).toString(16).toUpperCase()}`))
    .join("/");
}

const lines = [
  "# Generated from legacyGuides.json, siteRedirects.json and guideIndex.json. Run npm run prebuild after editing migration data.",
  ...[...redirects.entries()].map(([source, destination]) =>
    `${encodePath(source)} ${encodePath(destination)} 308!`),
  "",
];
const expected = lines.join("\n");

if (process.argv.includes("--check")) {
  const current = await readFile(outputPath, "utf8").catch(() => "");
  if (current !== expected) {
    console.error(`${outputPath} is out of sync with the redirect data. Run npm run prebuild.`);
    process.exitCode = 1;
  } else {
    console.log(JSON.stringify({ redirects: redirects.size, status: "in-sync" }, null, 2));
  }
} else {
  await writeFile(outputPath, expected, "utf8");
  console.log(`Generated ${redirects.size} Netlify redirect rules in ${outputPath}.`);
}
