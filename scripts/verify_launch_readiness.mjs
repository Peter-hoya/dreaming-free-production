import { readFile } from "node:fs/promises";
import process from "node:process";

const liveOrigin = (process.env.LAUNCH_TEST_ORIGIN || "https://dreaming-free.com").replace(/\/$/, "");
const canonicalOrigin = (process.env.EXPECTED_SITE_ORIGIN || "https://dreaming-free.com").replace(/\/$/, "");
const allowLocalRedirectOrigin = process.env.ALLOW_LOCAL_REDIRECT_ORIGIN === "true";
const expectedAdsenseSlot = process.env.EXPECTED_ADSENSE_SLOT || "2675947950";
const guideAdsExpected = process.env.NEXT_PUBLIC_GUIDE_ADS_ENABLED === "true";
const googleMetaVerificationExpected = process.env.EXPECT_GOOGLE_META_VERIFICATION === "true";
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

function anchorHrefs(html) {
  return [...html.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["']/gi)].map((match) => match[1]);
}

function adSlotCount(html) {
  return (html.match(new RegExp(`data-ad-slot=["']${expectedAdsenseSlot}["']`, "g")) || []).length;
}

const rootResponse = await request("/");
if (rootResponse) {
  const location = rootResponse.headers.get("location");
  const target = location ? new URL(location, liveOrigin) : null;
  expect(rootResponse.status === 308, `/ returns 308 Permanent Redirect (received ${rootResponse.status})`);
  expect(Boolean(target) && target.pathname === "/ko", "/ redirects directly to /ko");
}

const koreanHomeResponse = await request("/ko");
if (koreanHomeResponse) {
  const koreanHomeHtml = await koreanHomeResponse.text();
  const hrefs = anchorHrefs(koreanHomeHtml);
  expect(koreanHomeResponse.status === 200, `/ko returns 200 without a redirect (received ${koreanHomeResponse.status})`);
  expect(canonicalHref(koreanHomeHtml) === `${canonicalOrigin}/ko`, "/ko has a self-canonical URL");
  expect(!metaContent(koreanHomeHtml, "robots").includes("noindex"), "/ko is not marked noindex");
  expect(alternateHref(koreanHomeHtml, "x-default") === `${canonicalOrigin}/ko`, "/ko declares Korean as x-default");
  expect(!hrefs.includes("/"), "/ko contains no internal home link to the redirecting root URL");
  expect(hrefs.includes("/ko"), "/ko home links point to the final Korean homepage URL");
  expect(adSlotCount(koreanHomeHtml) === 1, "/ko contains one manual responsive AdSense slot");
  expect(koreanHomeHtml.includes('data-full-width-responsive="true"'), "/ko enables full-width responsive mobile ads");
}

for (const [mobilePath, expectedPath] of [["/m", "/ko"], ["/m/", "/ko"], ["/m/entry", "/entry"]]) {
  const mobileResponse = await request(mobilePath);
  if (mobileResponse) {
    const location = mobileResponse.headers.get("location");
    const target = location ? new URL(location, liveOrigin) : null;
    expect(mobileResponse.status === 301, `${mobilePath} returns 301 Permanent Redirect (received ${mobileResponse.status})`);
    expect(Boolean(target) && target.pathname === expectedPath, `${mobilePath} redirects directly to ${expectedPath}`);
  }
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
  expect(sitemapLocations.some((location) => new URL(location).pathname === "/ko"), "/sitemap.xml contains the final /ko homepage URL");
  expect(!sitemapLocations.some((location) => new URL(location).pathname === "/"), "/sitemap.xml excludes the redirecting root URL");
  expect(!sitemapLocations.some((location) => {
    const pathname = new URL(location).pathname;
    return pathname === "/m" || pathname.startsWith("/m/");
  }), "/sitemap.xml excludes all legacy mobile URLs");
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
  expect(adSlotCount(insuranceHtml) === 1, "4대보험 계산기 contains one manual responsive AdSense slot");
  if (googleMetaVerificationExpected) {
    expect(Boolean(metaContent(insuranceHtml, "google-site-verification")), "Google site verification meta tag is present");
  }
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

const guideSitemapLocations = sitemapLocations.filter((location) => new URL(location).pathname.startsWith("/entry/"));
expect(
  guideSitemapLocations.length === articles.length,
  `/sitemap.xml contains all ${articles.length} canonical guide URLs (received ${guideSitemapLocations.length})`,
);

for (const article of articles) {
  const pathname = `/entry/${article.slug}`;
  const canonical = `${canonicalOrigin}${encodedPath(pathname)}`;
  const response = await request(pathname, {
    headers: {
      "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36 (compatible; Google-InspectionTool/1.0;)",
    },
  });
  if (!response) continue;
  const html = await response.text();
  expect(response.status === 200, `${pathname} returns 200 (received ${response.status})`);
  expect(canonicalHref(html) === canonical, `${pathname} has the expected self-canonical URL`);
  expect(!metaContent(html, "robots").includes("noindex"), `${pathname} is not marked noindex`);
  expect(!response.headers.get("x-robots-tag")?.includes("noindex"), `${pathname} has no X-Robots-Tag noindex rule`);
  expect(html.includes('"@type":"BlogPosting"'), `${pathname} includes BlogPosting structured data`);
  expect(sitemapLocations.includes(canonical), `${pathname} is included in /sitemap.xml`);

  const mobilePath = `/m${pathname}`;
  const mobileResponse = await request(mobilePath);
  if (!mobileResponse) continue;
  const location = mobileResponse.headers.get("location");
  const target = location ? new URL(location, liveOrigin) : null;
  expect(mobileResponse.status === 301, `${mobilePath} returns 301 (received ${mobileResponse.status})`);
  expect(Boolean(target) && decodeURIComponent(target.pathname) === pathname, `${mobilePath} redirects directly to its canonical guide`);
}

const representativePath = `/entry/${articles[0].slug}`;
const representativeResponse = await request(representativePath);
if (representativeResponse) {
  const representativeHtml = await representativeResponse.text();
  if (guideAdsExpected) expect(adSlotCount(representativeHtml) === 1, "representative guide contains one manual in-article AdSense slot");
}

const gamePath = "/ko/games/arcade-shooter";
const gameResponse = await request(gamePath);
if (gameResponse) {
  const gameHtml = await gameResponse.text();
  expect(gameResponse.status === 200, `${gamePath} returns 200 (received ${gameResponse.status})`);
  expect(adSlotCount(gameHtml) === 1, `${gamePath} contains one manual responsive AdSense slot`);
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
