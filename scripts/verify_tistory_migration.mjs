import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const dataDir = path.join(root, "src", "data");
const publicDir = path.join(root, "public");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

async function collectWebpFiles(directory) {
  const files = [];
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const itemPath = path.join(directory, item.name);
    if (item.isDirectory()) files.push(...await collectWebpFiles(itemPath));
    else if (item.name.endsWith(".webp")) files.push(itemPath);
  }
  return files;
}

function decodedInternalPath(href) {
  if (!href.startsWith("/")) return null;
  try {
    return decodeURIComponent(new URL(href, "https://dreaming-free.com").pathname).normalize("NFC");
  } catch {
    return href.normalize("NFC");
  }
}

const [articles, indexRows, legacyGuides, siteRedirects, manifest] = await Promise.all([
  readJson(path.join(dataDir, "guideArticles.json")),
  readJson(path.join(dataDir, "guideIndex.json")),
  readJson(path.join(dataDir, "legacyGuides.json")),
  readJson(path.join(dataDir, "siteRedirects.json")),
  readJson(path.join(publicDir, "guides", "migration-manifest.json")),
]);

const statusCounts = Object.fromEntries(["KEEP", "UPDATE", "REDIRECT", "GONE"].map((status) => [status, legacyGuides.filter((guide) => guide.status === status).length]));
assert(legacyGuides.length === 45, `Expected 45 legacy records, found ${legacyGuides.length}`);
assert(statusCounts.KEEP === 2 && statusCounts.UPDATE === 26 && statusCounts.REDIRECT === 4 && statusCounts.GONE === 13, `Unexpected classification counts: ${JSON.stringify(statusCounts)}`);
assert(articles.length === 31, `Expected 31 live canonical guides, found ${articles.length}`);
assert(indexRows.length === articles.length, "Guide index and article counts differ");
assert(manifest.articleCount === legacyGuides.length, "Migration manifest must retain the original 45-article count");
assert(manifest.imageCount === 518, `Expected 518 migrated image files, found ${manifest.imageCount}`);
assert(siteRedirects["/m"] === "/ko", "Missing exact legacy mobile homepage redirect");
assert(siteRedirects["/m/entry"] === "/entry", "Missing exact legacy mobile guide index redirect");
assert(!Object.keys(siteRedirects).some((source) => source.includes("*")), "Wildcard /m redirect is forbidden");

const canonicalPaths = new Set(articles.map((article) => `/entry/${article.slug}`));
const non200LegacySources = new Set(legacyGuides.filter((guide) => guide.status === "REDIRECT" || guide.status === "GONE").map((guide) => `/entry/${guide.currentSlug}`));
const referencedImages = new Set();

for (const article of articles) {
  const canonical = `/entry/${article.slug}`;
  assert(article.slug === article.slug.normalize("NFC"), `Slug is not NFC: ${article.slug}`);
  assert(article.title && article.description && article.contentHtml, `Incomplete article: ${canonical}`);
  assert(article.characterCount >= 500, `Thin guide content (${article.characterCount} characters): ${canonical}`);
  assert(!/<(?:script|iframe|ins|form|style|object|embed|input|noscript|textarea)\b/i.test(article.contentHtml), `Forbidden HTML in ${canonical}`);
  assert(!/(?:kakaocdn|t1\.daumcdn|adsbygoogle)/i.test(article.contentHtml), `Remote or ad asset in ${canonical}`);
  assert(!/https?:\/\/(?:dt|honor|bc)\.dreaming-free\.com/i.test(article.contentHtml), `Dead legacy subdomain in ${canonical}`);
  assert(!/https?:\/\/1step-by-step\.tistory\.com/i.test(article.contentHtml), `Navigational Tistory link remains in ${canonical}`);
  assert(!/<p(?:\s[^>]*)?>\s*<(?:figure|aside|table|div)\b/i.test(article.contentHtml), `Invalid block nesting in ${canonical}`);
  assert(!/\s(?:on[a-z]+|style)=/i.test(article.contentHtml), `Unsafe HTML attribute in ${canonical}`);
  for (const match of article.contentHtml.matchAll(/href="([^"]+)"/g)) {
    const href = match[1].replaceAll("&amp;", "&");
    assert(/^(?:https?:\/\/|mailto:|tel:|\/|#)/i.test(href), `Unsafe href in ${canonical}: ${href}`);
    const internalPath = decodedInternalPath(href);
    if (internalPath) {
      assert(!internalPath.startsWith("/m/"), `Mobile internal link in ${canonical}: ${internalPath}`);
      assert(!internalPath.endsWith("/comments"), `Comments internal link in ${canonical}: ${internalPath}`);
      assert(!non200LegacySources.has(internalPath), `Internal link points to non-200 legacy source in ${canonical}: ${internalPath}`);
    }
  }
  for (const image of article.images) {
    assert(image.src.startsWith("/guides/"), `Non-local image in ${canonical}`);
    assert(image.alt.trim(), `Missing image alt in ${canonical}`);
    assert(image.width > 0 && image.height > 0, `Invalid image dimensions in ${canonical}`);
    referencedImages.add(image.src);
  }
}

for (const row of indexRows) {
  const article = articles.find((candidate) => candidate.slug === row.slug);
  assert(article, `Guide index references a missing article: ${row.slug}`);
  for (const key of ["title", "description", "category", "publishedAt", "modifiedAt", "originalUrl", "characterCount"]) {
    assert(JSON.stringify(row[key]) === JSON.stringify(article[key]), `Guide index differs for ${row.slug}.${key}`);
  }
}

for (const guide of legacyGuides) {
  if (guide.status === "KEEP" || guide.status === "UPDATE") assert(canonicalPaths.has(guide.targetUrl), `Live legacy target is missing: ${guide.targetUrl}`);
  if (guide.status === "REDIRECT") assert(canonicalPaths.has(guide.targetUrl), `Redirect target is missing: ${guide.targetUrl}`);
  if (guide.status === "GONE") assert(guide.targetUrl === null && guide.targetSlug === null, `GONE entry must not have a target: ${guide.currentSlug}`);
}

const backupArticle = articles.find((article) => article.slug === "갤럭시-휴대폰-화면-안보일때-데이터-백업-옮기는-방법");
assert(backupArticle, "Missing priority Galaxy backup article");
assert(!/(Android 12|namu\.wiki|link\.coupang|honor\.dreaming-free\.com|bc\.dreaming-free\.com)/i.test(backupArticle.contentHtml), "P0 Galaxy backup article still contains obsolete guidance");
assert(/Smart Switch/i.test(backupArticle.contentHtml) && /Samsung DeX/i.test(backupArticle.contentHtml), "P0 Galaxy backup article is missing official recovery paths");

const diskImages = await collectWebpFiles(path.join(publicDir, "guides"));
assert(diskImages.length === manifest.imageCount, `Disk image count differs: ${diskImages.length}`);
for (const src of referencedImages) {
  const file = path.join(publicDir, ...src.split("/").filter(Boolean));
  const details = await stat(file);
  assert(details.size > 0, `Empty referenced image file: ${src}`);
}

console.log(JSON.stringify({ legacyGuides: legacyGuides.length, liveGuides: articles.length, migratedImages: diskImages.length, referencedImages: referencedImages.size, ...statusCounts }, null, 2));
