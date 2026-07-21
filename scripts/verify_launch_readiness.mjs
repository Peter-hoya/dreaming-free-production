import { readFile } from "node:fs/promises";
import process from "node:process";

const liveOrigin = (process.env.LAUNCH_TEST_ORIGIN || "https://dreaming-free.com").replace(/\/$/, "");
const canonicalOrigin = (process.env.EXPECTED_SITE_ORIGIN || "https://dreaming-free.com").replace(/\/$/, "");
const allowLocalRedirectOrigin = process.env.ALLOW_LOCAL_REDIRECT_ORIGIN === "true";
const articles = JSON.parse(await readFile("src/data/guideIndex.json", "utf8"));
const redirects = JSON.parse(await readFile("src/data/guideRedirects.json", "utf8"));
const failures = [];
const checks = [];
let sitemapLocations = [];

function encodedPath(pathname) {
  return pathname
    .split("/")
    .map((segment, index) => index === 0 ? "" : encodeURIComponent(segment))
    .join("/");
}

async function request(pathname, init = {}) {
  try {
    return await fetch(`${liveOrigin}${encodedPath(pathname)}`, {
      ...init,
      redirect: "manual",
      signal: AbortSignal.timeout(15_000),
      headers: { "user-agent": "MoaToolsLaunchVerifier/1.0", ...init.headers },
    });
  } catch (error) {
    failures.push(`${pathname}: request failed (${error instanceof Error ? error.message : String(error)})`);
    return null;
  }
}

function expect(condition, message) {
  if (condition) checks.push(message);
  else failures.push(message);
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

const robotsResponse = await request("/robots.txt");
if (robotsResponse) {
  const robots = await robotsResponse.text();
  expect(robotsResponse.status === 200, `/robots.txt returns 200 (received ${robotsResponse.status})`);
  expect(!/^Disallow:\s*\/$/im.test(robots), "/robots.txt does not block the entire site");
  expect(robots.includes(`${canonicalOrigin}/sitemap.xml`), "/robots.txt lists the production sitemap");
}

const sitemapResponse = await request("/sitemap.xml");
if (sitemapResponse) {
  const sitemap = await sitemapResponse.text();
  sitemapLocations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  expect(sitemapResponse.status === 200, `/sitemap.xml returns 200 (received ${sitemapResponse.status})`);
  expect(sitemapLocations.length >= 100, `/sitemap.xml contains at least 100 canonical URLs (received ${sitemapLocations.length})`);
  expect(sitemapLocations.every((location) => location.startsWith(`${canonicalOrigin}/`)), "/sitemap.xml uses only the production origin");
}

for (const locale of ["ko", "en"]) {
  const pathname = `/${locale}/tools`;
  const response = await request(pathname);
  if (!response) continue;
  const html = await response.text();
  expect(response.status === 200, `${pathname} returns 200 (received ${response.status})`);
  expect(canonicalHref(html) === `${canonicalOrigin}${pathname}`, `${pathname} has a self-canonical URL`);
  expect(!metaContent(html, "robots").includes("noindex"), `${pathname} is not marked noindex`);
}

const toolLocations = sitemapLocations.filter((location) => /^\/(ko|en)\/tools\/[^/]+$/.test(new URL(location).pathname));
expect(toolLocations.length === 60, `/sitemap.xml contains all 60 localized tool URLs (received ${toolLocations.length})`);
const localizedTitles = { ko: new Set(), en: new Set() };
const localizedHeadings = { ko: new Set(), en: new Set() };
const localizedDescriptions = { ko: new Set(), en: new Set() };
const localizedPageCounts = { ko: 0, en: 0 };

for (const location of toolLocations) {
  const target = new URL(location);
  const pathname = decodeURIComponent(target.pathname);
  const locale = target.pathname.split("/")[1];
  const response = await request(pathname);
  if (!response) continue;
  const html = await response.text();
  const title = elementText(html, "title");
  const h1 = elementText(html, "h1");
  const description = metaContent(html, "description");
  const robots = metaContent(html, "robots");
  const slug = target.pathname.split("/").at(-1);

  expect(response.status === 200, `${pathname} returns 200 (received ${response.status})`);
  expect(canonicalHref(html) === location, `${pathname} has the expected self-canonical URL`);
  expect(!robots.includes("noindex"), `${pathname} is indexable`);
  expect(Boolean(h1) && title.startsWith(h1), `${pathname} title starts with its H1`);
  expect(title.length <= 75, `${pathname} title is at most 75 characters (received ${title.length})`);
  expect(description.length >= 60 && description.length <= 165, `${pathname} description is 60-165 characters (received ${description.length})`);
  if (locale === "ko") {
    expect(hasHangul(title), `${pathname} Korean title contains Hangul`);
    expect(hasHangul(h1), `${pathname} Korean H1 contains Hangul`);
    expect(hasHangul(description), `${pathname} Korean description contains Hangul`);
  } else {
    expect(!hasHangul(title), `${pathname} English title contains no Hangul`);
    expect(!hasHangul(h1), `${pathname} English H1 contains no Hangul`);
    expect(!hasHangul(description), `${pathname} English description contains no Hangul`);
  }
  expect(html.includes('"@type":"WebApplication"'), `${pathname} includes WebApplication structured data`);
  expect(alternateHref(html, "ko") === `${canonicalOrigin}/ko/tools/${slug}`, `${pathname} links to its Korean alternate`);
  expect(alternateHref(html, "en") === `${canonicalOrigin}/en/tools/${slug}`, `${pathname} links to its English alternate`);
  expect(!localizedTitles[locale].has(title), `${pathname} has a unique ${locale} title`);
  expect(!localizedHeadings[locale].has(h1), `${pathname} has a unique ${locale} H1`);
  expect(!localizedDescriptions[locale].has(description), `${pathname} has a unique ${locale} description`);
  localizedTitles[locale].add(title);
  localizedHeadings[locale].add(h1);
  localizedDescriptions[locale].add(description);
  localizedPageCounts[locale] += 1;
}

for (const locale of ["ko", "en"]) {
  expect(localizedPageCounts[locale] === 30, `all 30 ${locale} tool pages are present (received ${localizedPageCounts[locale]})`);
  expect(localizedTitles[locale].size === 30, `all 30 ${locale} tool titles are unique (received ${localizedTitles[locale].size})`);
  expect(localizedHeadings[locale].size === 30, `all 30 ${locale} tool H1 headings are unique (received ${localizedHeadings[locale].size})`);
  expect(localizedDescriptions[locale].size === 30, `all 30 ${locale} tool descriptions are unique (received ${localizedDescriptions[locale].size})`);
}

const insurancePath = "/ko/tools/four-major-insurance";
const insuranceResponse = await request(insurancePath);
if (insuranceResponse) {
  const insuranceHtml = await insuranceResponse.text();
  expect(elementText(insuranceHtml, "title").startsWith("4대보험 계산기"), "4대보험 계산기 keeps the exact target query at the start of its title");
  expect(elementText(insuranceHtml, "h1") === "4대보험 계산기", "4대보험 계산기 has an exact-match H1");
  expect(canonicalHref(insuranceHtml) === `${canonicalOrigin}${insurancePath}`, "4대보험 계산기 points directly to its dedicated canonical URL");
  expect(Boolean(metaContent(insuranceHtml, "google-site-verification")), "Google site verification meta tag is present");
  expect(Boolean(metaContent(insuranceHtml, "naver-site-verification")), "Naver site verification meta tag is present");
}

const hubResponse = await request("/entry");
if (hubResponse) {
  const hubHtml = await hubResponse.text();
  expect(hubResponse.status === 200, `/entry returns 200 (received ${hubResponse.status})`);
  expect(canonicalHref(hubHtml) === `${canonicalOrigin}/entry`, "/entry has the production canonical URL");
  expect(!metaContent(hubHtml, "robots").includes("noindex"), "/entry is not marked noindex");
  expect(!hubHtml.includes("moatools.example"), "/entry contains no placeholder domain");
  expect(/^ca-pub-\d+$/.test(metaContent(hubHtml, "google-adsense-account")), "/entry exposes a valid AdSense site-verification meta tag");
}

const representativePath = `/entry/${articles[0].slug}`;
const articleResponse = await request(representativePath);
if (articleResponse) {
  const articleHtml = await articleResponse.text();
  expect(articleResponse.status === 200, `${representativePath} returns 200 (received ${articleResponse.status})`);
  expect(canonicalHref(articleHtml) === `${canonicalOrigin}${encodedPath(representativePath)}`, "representative guide has the production canonical URL");
  expect(!metaContent(articleHtml, "robots").includes("noindex"), "representative guide is not marked noindex");
  expect(articleHtml.includes('"@type":"BlogPosting"'), "representative guide includes BlogPosting structured data");
}

const [alias, destination] = Object.entries(redirects)[0];
const aliasResponse = await request(alias);
if (aliasResponse) {
  const location = aliasResponse.headers.get("location");
  const target = location ? new URL(location, liveOrigin) : null;
  const targetPath = target ? decodeURIComponent(target.pathname).normalize("NFC") : "";
  expect(aliasResponse.status === 301, `${alias} returns 301 (received ${aliasResponse.status})`);
  expect(
    Boolean(target)
      && targetPath === destination.normalize("NFC")
      && (allowLocalRedirectOrigin || target.origin === canonicalOrigin),
    `${alias} points directly to its production canonical URL`,
  );
}

const adsResponse = await request("/ads.txt");
if (adsResponse) {
  const adsText = await adsResponse.text();
  expect(adsResponse.status === 200, `/ads.txt returns 200 (received ${adsResponse.status})`);
  expect(/^google\.com, pub-\d+, DIRECT, f08c47fec0942fa0\s*$/m.test(adsText), "/ads.txt contains a valid Google publisher record");
}

const indexNowKeyResponse = await request("/indexnow-key.txt");
if (indexNowKeyResponse) {
  const indexNowKey = (await indexNowKeyResponse.text()).trim();
  expect(indexNowKeyResponse.status === 200, `/indexnow-key.txt returns 200 (received ${indexNowKeyResponse.status})`);
  expect(/^[a-fA-F0-9-]{8,128}$/.test(indexNowKey), "/indexnow-key.txt exposes a valid Naver IndexNow key");
}

for (const pathname of ["/ko/about", "/ko/editorial", "/ko/privacy", "/ko/terms", "/ko/contact"]) {
  const response = await request(pathname);
  if (response) expect(response.status === 200, `${pathname} returns 200 (received ${response.status})`);
}

if (failures.length) {
  console.error("Launch readiness verification failed:\n");
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({
    liveOrigin,
    canonicalOrigin,
    checksPassed: checks.length,
    toolPagesChecked: toolLocations.length,
    status: "ready-for-manual-review",
  }, null, 2));
}
