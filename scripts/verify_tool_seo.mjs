import process from "node:process";

const testOrigin = (process.env.SEO_TEST_ORIGIN || "http://127.0.0.1:3000").replace(/\/$/, "");
const canonicalOrigin = (process.env.EXPECTED_SITE_ORIGIN || "https://dreaming-free.com").replace(/\/$/, "");
const expectIndexable = process.env.EXPECT_INDEXABLE === "true";
const failures = [];

function expect(condition, message) {
  if (!condition) failures.push(message);
}

function hasHangul(value) {
  return /[\u3131-\u318e\uac00-\ud7a3]/u.test(value);
}

function metaContent(html, name) {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const direct = html.match(new RegExp(`<meta[^>]+name=["']${escapedName}["'][^>]+content=["']([^"']+)["']`, "i"));
  const reversed = html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${escapedName}["']`, "i"));
  return direct?.[1] || reversed?.[1] || "";
}

function canonicalHref(html) {
  const direct = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
  const reversed = html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
  return direct?.[1] || reversed?.[1] || "";
}

function elementText(html, tagName) {
  const match = html.match(new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i"));
  return (match?.[1] || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function alternateHref(html, language) {
  const tags = html.match(/<link\b[^>]*>/gi) || [];
  for (const tag of tags) {
    const rel = tag.match(/\brel=["']([^"']+)["']/i)?.[1] || "";
    const hreflang = tag.match(/\bhreflang=["']([^"']+)["']/i)?.[1] || "";
    const href = tag.match(/\bhref=["']([^"']+)["']/i)?.[1] || "";
    if (rel.split(/\s+/).includes("alternate") && hreflang === language) return href;
  }
  return "";
}

async function get(pathname) {
  return fetch(`${testOrigin}${pathname}`, {
    redirect: "manual",
    signal: AbortSignal.timeout(15_000),
    headers: { "user-agent": "MoaToolsToolSeoVerifier/1.0" },
  });
}

const sitemapResponse = await get("/sitemap.xml");
expect(sitemapResponse.status === 200, `/sitemap.xml expected 200, received ${sitemapResponse.status}`);
const sitemap = await sitemapResponse.text();
const toolLocations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)]
  .map((match) => match[1])
  .filter((location) => /^\/(ko|en)\/tools\/[^/]+$/.test(new URL(location).pathname));
expect(toolLocations.length === 60, `expected 60 localized tool URLs in sitemap, received ${toolLocations.length}`);

const titles = { ko: new Set(), en: new Set() };
const headings = { ko: new Set(), en: new Set() };
const descriptions = { ko: new Set(), en: new Set() };
const pageCounts = { ko: 0, en: 0 };
for (const location of toolLocations) {
  const canonical = new URL(location);
  const locale = canonical.pathname.split("/")[1];
  const slug = canonical.pathname.split("/").at(-1);
  const response = await get(canonical.pathname);
  const html = await response.text();
  const title = elementText(html, "title");
  const h1 = elementText(html, "h1");
  const description = metaContent(html, "description");
  const robots = metaContent(html, "robots");

  expect(response.status === 200, `${canonical.pathname}: expected 200, received ${response.status}`);
  expect(canonicalHref(html) === location, `${canonical.pathname}: incorrect canonical`);
  expect(h1.length > 0 && title.startsWith(h1), `${canonical.pathname}: title must start with the exact H1`);
  expect(title.length <= 75, `${canonical.pathname}: title exceeds 75 characters (${title.length})`);
  expect(description.length >= 60 && description.length <= 165, `${canonical.pathname}: description must be 60-165 characters (${description.length})`);
  if (locale === "ko") {
    expect(hasHangul(title), `${canonical.pathname}: Korean title must contain Hangul`);
    expect(hasHangul(h1), `${canonical.pathname}: Korean H1 must contain Hangul`);
    expect(hasHangul(description), `${canonical.pathname}: Korean description must contain Hangul`);
  } else {
    expect(!hasHangul(title), `${canonical.pathname}: English title must not contain Hangul`);
    expect(!hasHangul(h1), `${canonical.pathname}: English H1 must not contain Hangul`);
    expect(!hasHangul(description), `${canonical.pathname}: English description must not contain Hangul`);
  }
  expect(!titles[locale].has(title), `${canonical.pathname}: duplicate ${locale} title`);
  expect(!headings[locale].has(h1), `${canonical.pathname}: duplicate ${locale} H1`);
  expect(!descriptions[locale].has(description), `${canonical.pathname}: duplicate ${locale} description`);
  expect(alternateHref(html, "ko") === `${canonicalOrigin}/ko/tools/${slug}`, `${canonical.pathname}: incorrect ko hreflang`);
  expect(alternateHref(html, "en") === `${canonicalOrigin}/en/tools/${slug}`, `${canonical.pathname}: incorrect en hreflang`);
  expect(html.includes('"@type":"WebPage"'), `${canonical.pathname}: missing WebPage schema`);
  expect(html.includes('"@type":"WebApplication"'), `${canonical.pathname}: missing WebApplication schema`);
  expect(html.includes('"@type":"BreadcrumbList"'), `${canonical.pathname}: missing BreadcrumbList schema`);
  expect(expectIndexable ? !robots.includes("noindex") : robots.includes("noindex"), `${canonical.pathname}: unexpected robots state (${robots || "missing"})`);
  titles[locale].add(title);
  headings[locale].add(h1);
  descriptions[locale].add(description);
  pageCounts[locale] += 1;
}

for (const locale of ["ko", "en"]) {
  expect(pageCounts[locale] === 30, `expected 30 ${locale} tool pages, received ${pageCounts[locale]}`);
  expect(titles[locale].size === 30, `expected 30 unique ${locale} titles, received ${titles[locale].size}`);
  expect(headings[locale].size === 30, `expected 30 unique ${locale} H1 headings, received ${headings[locale].size}`);
  expect(descriptions[locale].size === 30, `expected 30 unique ${locale} descriptions, received ${descriptions[locale].size}`);
}

for (const locale of ["ko", "en"]) {
  const pathname = `/${locale}/tools`;
  const response = await get(pathname);
  const html = await response.text();
  expect(response.status === 200, `${pathname}: expected 200, received ${response.status}`);
  expect(canonicalHref(html) === `${canonicalOrigin}${pathname}`, `${pathname}: incorrect canonical`);
  expect(html.includes('"@type":"CollectionPage"'), `${pathname}: missing CollectionPage schema`);
}

const insuranceResponse = await get("/ko/tools/four-major-insurance");
const insuranceHtml = await insuranceResponse.text();
expect(elementText(insuranceHtml, "title").startsWith("4대보험 계산기"), "4대보험 계산기: title must start with the target query");
expect(elementText(insuranceHtml, "h1") === "4대보험 계산기", "4대보험 계산기: exact H1 mismatch");
expect(canonicalHref(insuranceHtml) === `${canonicalOrigin}/ko/tools/four-major-insurance`, "4대보험 계산기: canonical mismatch");

if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({
    testOrigin,
    canonicalOrigin,
    toolPages: toolLocations.length,
    directoryPages: 2,
    expectIndexable,
    status: "passed",
  }, null, 2));
}
