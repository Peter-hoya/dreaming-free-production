import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

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

const [articles, indexRows, redirects, manifest] = await Promise.all([
  readJson(path.join(dataDir, "guideArticles.json")),
  readJson(path.join(dataDir, "guideIndex.json")),
  readJson(path.join(dataDir, "guideRedirects.json")),
  readJson(path.join(publicDir, "guides", "migration-manifest.json")),
]);

assert(articles.length === 45, `Expected 45 articles, found ${articles.length}`);
assert(indexRows.length === articles.length, "Guide index and article counts differ");
assert(manifest.articleCount === articles.length, "Manifest article count differs");
assert(manifest.imageCount === 518, `Expected 518 images, found ${manifest.imageCount}`);

const canonicalPaths = new Set();
const imagePaths = new Set();
for (const article of articles) {
  assert(article.slug === article.slug.normalize("NFC"), `Slug is not NFC: ${article.slug}`);
  const canonical = `/entry/${article.slug}`;
  assert(!canonicalPaths.has(canonical), `Duplicate canonical path: ${canonical}`);
  canonicalPaths.add(canonical);
  assert(article.title && article.description && article.contentHtml, `Incomplete article: ${canonical}`);
  assert(!/<(?:script|iframe|ins|form|style|object|embed|input|noscript|textarea)\b/i.test(article.contentHtml), `Forbidden HTML in ${canonical}`);
  assert(!/(?:kakaocdn|t1\.daumcdn|adsbygoogle)/i.test(article.contentHtml), `Remote or ad asset in ${canonical}`);
  assert(!/alt=(?:""|'')/i.test(article.contentHtml), `Empty image alt in ${canonical}`);
  assert(!/https?:\/\/(?:[^/]+\.)?dreaming-free\.com/i.test(article.contentHtml), `Broken legacy subdomain in ${canonical}`);
  assert(!/<p(?:\s[^>]*)?>\s*<(?:figure|aside|table|div)\b/i.test(article.contentHtml), `Invalid block nesting in ${canonical}`);
  assert(!/\s(?:on[a-z]+|style)=/i.test(article.contentHtml), `Unsafe HTML attribute in ${canonical}`);
  for (const match of article.contentHtml.matchAll(/href="([^"]+)"/g)) {
    const href = match[1].replaceAll("&amp;", "&");
    assert(/^(?:https?:\/\/|mailto:|tel:|\/|#)/i.test(href), `Unsafe href in ${canonical}: ${href}`);
  }
  assert(redirects[`/m/entry/${article.slug}`] === canonical, `Missing mobile 301 alias for ${canonical}`);
  for (const alias of article.aliases) {
    assert(redirects[`/entry/${alias}`] === canonical, `Missing title 301 alias: ${alias}`);
  }
  for (const image of article.images) {
    assert(image.src.startsWith("/guides/"), `Non-local image in ${canonical}`);
    assert(image.alt.trim(), `Missing image alt in ${canonical}`);
    assert(image.width > 0 && image.height > 0, `Invalid image dimensions in ${canonical}`);
    imagePaths.add(image.src);
  }
}

for (const row of indexRows) {
  const article = articles.find((candidate) => candidate.slug === row.slug);
  assert(article, `Guide index references a missing article: ${row.slug}`);
  for (const key of ["title", "description", "category", "publishedAt", "modifiedAt", "originalUrl", "characterCount"]) {
    assert(JSON.stringify(row[key]) === JSON.stringify(article[key]), `Guide index differs for ${row.slug}.${key}`);
  }
}

for (const [source, destination] of Object.entries(redirects)) {
  assert(!canonicalPaths.has(source), `Canonical URL must not redirect: ${source}`);
  assert(canonicalPaths.has(destination), `Redirect target is not canonical: ${source} -> ${destination}`);
}

const prioritySlugs = [
  "갤럭시-휴대폰-화면-안보일때-데이터-백업-옮기는-방법",
  "결혼-답례품-추천-Top-5-5천원대",
  "갤럭시-S23-울트라-액정-교체비용-S20-S21-S22-플립-폴드",
  "다이소-제품-검색하는-방법",
  "교통안전교육-예약-방법-운전면허-필수과정",
  "난방비-절약-방법-및-캐시백-받는-방법",
  "갤럭시-수리-예상-비용-조회",
  "국외발신-카드신청-완료-문자-대처-방법-신한-국민-삼성-등",
  "삼성화재-자녀사랑-할인-특약-서비스-신청-방법",
];
for (const slug of prioritySlugs) {
  assert(canonicalPaths.has(`/entry/${slug}`), `Missing priority article: ${slug}`);
}

const diskImages = await collectWebpFiles(path.join(publicDir, "guides"));
assert(diskImages.length === manifest.imageCount, `Disk image count differs: ${diskImages.length}`);
assert(imagePaths.size === manifest.imageCount, `Referenced image count differs: ${imagePaths.size}`);
for (const src of imagePaths) {
  const file = path.join(publicDir, ...src.split("/").filter(Boolean));
  const details = await stat(file);
  assert(details.size > 0, `Empty image file: ${src}`);
}

console.log(JSON.stringify({
  articles: articles.length,
  images: diskImages.length,
  redirects: Object.keys(redirects).length,
  canonicalPaths: canonicalPaths.size,
}, null, 2));
