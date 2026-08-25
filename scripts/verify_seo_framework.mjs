import { readFile } from "node:fs/promises";
import process from "node:process";

const testOrigin = (process.env.SEO_FRAMEWORK_ORIGIN || "http://127.0.0.1:3000").replace(/\/$/, "");
const canonicalOrigin = (process.env.EXPECTED_SITE_ORIGIN || "https://dreaming-free.com").replace(/\/$/, "");
const expectIndexable = process.env.EXPECT_INDEXABLE === "true";
const failures = [];
let checks = 0;

function expect(condition, message) {
  checks += 1;
  if (!condition) failures.push(message);
}

function encodedPath(pathname) {
  return pathname
    .split("/")
    .map((segment, index) => index === 0 ? "" : encodeURIComponent(segment))
    .join("/");
}

async function request(pathname) {
  return fetch(`${testOrigin}${encodedPath(pathname)}`, {
    redirect: "manual",
    signal: AbortSignal.timeout(20_000),
    headers: { "user-agent": "MoaToolsSeoFrameworkVerifier/1.0" },
  });
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

function hasSchema(html, type) {
  return html.includes(`"@type":"${type}"`);
}

const homeResponse = await request("/ko");
const homeHtml = await homeResponse.text();
expect(homeResponse.status === 200, `/ko expected 200, received ${homeResponse.status}`);
expect(homeResponse.headers.get("x-content-type-options") === "nosniff", "/ko is missing X-Content-Type-Options: nosniff");
expect(homeResponse.headers.get("x-frame-options") === "SAMEORIGIN", "/ko is missing X-Frame-Options: SAMEORIGIN");
expect(homeResponse.headers.get("referrer-policy") === "strict-origin-when-cross-origin", "/ko has an unexpected Referrer-Policy");
expect(homeResponse.headers.get("permissions-policy")?.includes("camera=()"), "/ko is missing the restrictive Permissions-Policy");
if (testOrigin.startsWith("https://")) {
  expect(homeResponse.headers.get("strict-transport-security")?.includes("max-age="), "/ko is missing Strict-Transport-Security");
}
expect(hasSchema(homeHtml, "Organization"), "/ko is missing Organization structured data");
expect(hasSchema(homeHtml, "WebSite"), "/ko is missing WebSite structured data");
expect(hasSchema(homeHtml, "WebPage"), "/ko is missing WebPage structured data");
expect(!hasSchema(homeHtml, "FAQPage"), "/ko still exposes non-eligible FAQPage structured data");
expect(homeHtml.includes("<details"), "/ko must keep its visible FAQ after structured-data cleanup");

const robotsResponse = await request("/robots.txt");
const robots = await robotsResponse.text();
expect(robotsResponse.status === 200, `/robots.txt expected 200, received ${robotsResponse.status}`);
expect(/User-agent:\s*\*/i.test(robots), "/robots.txt is missing the universal crawler rule");
if (expectIndexable) {
  expect(/Allow:\s*\//i.test(robots) && !/Disallow:\s*\/(?:\s|$)/im.test(robots), "/robots.txt blocks indexing unexpectedly");
}

const sitemapResponse = await request("/sitemap.xml");
const sitemap = await sitemapResponse.text();
const sitemapLocations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
expect(sitemapResponse.status === 200, `/sitemap.xml expected 200, received ${sitemapResponse.status}`);
expect(sitemapLocations.length >= 100, `/sitemap.xml expected at least 100 canonical URLs, received ${sitemapLocations.length}`);
expect(new Set(sitemapLocations).size === sitemapLocations.length, "/sitemap.xml contains duplicate canonical URLs");
expect(!/<priority>|<changefreq>/i.test(sitemap), "/sitemap.xml contains priority/changefreq values ignored by Google");
expect(/<lastmod>/i.test(sitemap), "/sitemap.xml is missing verifiable lastmod values");

const toolResponse = await request("/ko/tools/four-major-insurance");
const toolHtml = await toolResponse.text();
expect(toolResponse.status === 200, `/ko/tools/four-major-insurance expected 200, received ${toolResponse.status}`);
for (const type of ["WebPage", "WebApplication", "BreadcrumbList"]) {
  expect(hasSchema(toolHtml, type), `/ko/tools/four-major-insurance is missing ${type} structured data`);
}
expect(!hasSchema(toolHtml, "FAQPage"), "/ko/tools/four-major-insurance still exposes non-eligible FAQPage structured data");
expect(toolHtml.includes("<details"), "tool pages must keep their visible FAQ after structured-data cleanup");

const guides = JSON.parse(await readFile("src/data/guideIndex.json", "utf8"));
const guidePath = `/entry/${guides[0].slug}`;
const guideResponse = await request(guidePath);
const guideHtml = await guideResponse.text();
expect(guideResponse.status === 200, `${guidePath} expected 200, received ${guideResponse.status}`);
expect(hasSchema(guideHtml, "BlogPosting"), `${guidePath} is missing BlogPosting structured data`);
expect(hasSchema(guideHtml, "BreadcrumbList"), `${guidePath} is missing BreadcrumbList structured data`);
expect(guideHtml.includes("작성자") && guideHtml.includes("최종 수정"), `${guidePath} is missing visible authorship or freshness information`);

const sampleLocations = [
  `${canonicalOrigin}/ko`,
  `${canonicalOrigin}/en`,
  `${canonicalOrigin}/ko/tools/four-major-insurance`,
  `${canonicalOrigin}/en/tools/four-major-insurance`,
  `${canonicalOrigin}${encodedPath(guidePath)}`,
];
for (const location of sampleLocations) {
  expect(sitemapLocations.includes(location), `/sitemap.xml is missing ${location}`);
  const url = new URL(location);
  const response = await request(decodeURIComponent(url.pathname));
  const html = await response.text();
  expect(response.status === 200, `${url.pathname} expected 200, received ${response.status}`);
  expect(canonicalHref(html) === location, `${url.pathname} has an unexpected canonical URL`);
  const robotsMeta = metaContent(html, "robots");
  expect(expectIndexable ? !robotsMeta.includes("noindex") : robotsMeta.includes("noindex"), `${url.pathname} has an unexpected robots state`);
}

if (failures.length) {
  console.error("SEO framework verification failed:\n");
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({
    testOrigin,
    canonicalOrigin,
    checksPassed: checks,
    sitemapUrls: sitemapLocations.length,
    status: "passed",
  }, null, 2));
}
