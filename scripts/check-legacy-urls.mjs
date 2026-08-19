import { readFile } from "node:fs/promises";
import process from "node:process";

const origin = (process.env.REDIRECT_TEST_ORIGIN || "http://127.0.0.1:3000").replace(/\/$/, "");
const canonicalOrigin = "https://dreaming-free.com";
const queryMarker = "?utm_source=legacy-test&ref=one-hop";
const articles = JSON.parse(await readFile("src/data/guideIndex.json", "utf8"));
const legacyGuides = JSON.parse(await readFile("src/data/legacyGuides.json", "utf8"));
const siteRedirects = JSON.parse(await readFile("src/data/siteRedirects.json", "utf8"));
const failures = [];

function encodedPath(pathname) {
  return pathname.split("/").map((segment, index) => index === 0 ? "" : encodeURIComponent(segment)).join("/");
}

function decodedPath(value) {
  return decodeURIComponent(new URL(value, origin).pathname).normalize("NFC");
}

function entryPath(value) {
  return value.startsWith("/") ? value : `/entry/${value}`;
}

function pathVariants(pathname) {
  const variants = new Set([pathname]);
  if (pathname.startsWith("/entry/")) variants.add(`/m${pathname}`);
  for (const path of [...variants]) variants.add(`${path}/comments`);
  return [...variants];
}

function canonicalHref(html) {
  const tag = (html.match(/<link\b[^>]*rel=["']canonical["'][^>]*>/i)
    || html.match(/<link\b[^>]*href=["'][^"']+["'][^>]*rel=["']canonical["'][^>]*>/i))?.[0] || "";
  return tag.match(/href=["']([^"']+)["']/i)?.[1] || "";
}

async function request(pathname, { search = "", userAgent = "MoaToolsLegacyVerifier/2.0", forwardedHost } = {}) {
  return fetch(`${origin}${encodedPath(pathname)}${search}`, {
    redirect: "manual",
    signal: AbortSignal.timeout(15_000),
    headers: {
      "user-agent": userAgent,
      ...(forwardedHost ? { "x-forwarded-host": forwardedHost } : {}),
    },
  });
}

async function expectRedirect(source, destination) {
  const response = await request(source, { search: queryMarker });
  const location = response.headers.get("location");
  if (response.status !== 308) failures.push(`${source}: expected 308, received ${response.status}`);
  if (!location || decodedPath(location) !== destination.normalize("NFC")) failures.push(`${source}: expected Location ${destination}, received ${location || "<missing>"}`);
  if (location && new URL(location, origin).search !== queryMarker) failures.push(`${source}: query string was not preserved`);
  if (location) {
    const targetResponse = await request(decodedPath(location));
    if (targetResponse.status !== 200) failures.push(`${source}: target is not a one-hop 200 (received ${targetResponse.status})`);
  }
}

async function expectGone(pathname) {
  const response = await request(pathname, { search: queryMarker });
  if (response.status !== 410) failures.push(`${pathname}: expected 410, received ${response.status}`);
  if (response.headers.get("location")) failures.push(`${pathname}: 410 response must not redirect`);
  if (!response.headers.get("x-robots-tag")?.includes("noindex")) failures.push(`${pathname}: 410 response is missing X-Robots-Tag noindex`);
  if ((await response.text()).includes("adsbygoogle")) failures.push(`${pathname}: 410 response must not contain AdSense code`);
}

for (const [source, destination] of Object.entries(siteRedirects)) await expectRedirect(source, destination);

for (const article of articles) {
  const canonicalPath = `/entry/${article.slug}`;
  const desktop = await request(canonicalPath, { userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" });
  const mobile = await request(canonicalPath, { userAgent: "Mozilla/5.0 (Linux; Android 14; Mobile)" });
  if (desktop.status !== 200) failures.push(`${canonicalPath}: desktop expected 200, received ${desktop.status}`);
  if (mobile.status !== 200) failures.push(`${canonicalPath}: mobile expected 200, received ${mobile.status}`);
  const desktopCanonical = canonicalHref(await desktop.text());
  const mobileCanonical = canonicalHref(await mobile.text());
  const expectedCanonical = `${canonicalOrigin}${encodedPath(canonicalPath)}`;
  if (desktopCanonical !== expectedCanonical) failures.push(`${canonicalPath}: incorrect desktop canonical ${desktopCanonical || "<missing>"}`);
  if (mobileCanonical !== expectedCanonical) failures.push(`${canonicalPath}: incorrect mobile canonical ${mobileCanonical || "<missing>"}`);
  if (desktopCanonical !== mobileCanonical) failures.push(`${canonicalPath}: canonical differs by user-agent`);
  await expectRedirect(`/m${canonicalPath}`, canonicalPath);
  await expectRedirect(`${canonicalPath}/comments`, canonicalPath);
  await expectRedirect(`/m${canonicalPath}/comments`, canonicalPath);
}

for (const guide of legacyGuides) {
  const canonicalSource = `/entry/${guide.currentSlug}`;
  const sources = [canonicalSource, ...guide.aliases.map(entryPath), ...guide.legacyPaths.map(entryPath)];
  if (guide.status === "KEEP" || guide.status === "UPDATE") {
    const response = await request(canonicalSource);
    if (response.status !== 200) failures.push(`${canonicalSource}: ${guide.status} expected 200, received ${response.status}`);
    for (const alias of [...guide.aliases.map(entryPath), ...guide.legacyPaths.map(entryPath)]) {
      for (const variant of pathVariants(alias)) await expectRedirect(variant, guide.targetUrl);
    }
  } else if (guide.status === "REDIRECT") {
    for (const source of sources) {
      for (const variant of pathVariants(source)) await expectRedirect(variant, guide.targetUrl);
    }
  } else {
    for (const source of sources) {
      for (const variant of pathVariants(source)) await expectGone(variant);
    }
  }
}

const sitemapResponse = await request("/sitemap.xml");
const sitemap = await sitemapResponse.text();
const sitemapPaths = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => decodedPath(match[1])));
if (sitemapResponse.status !== 200) failures.push(`/sitemap.xml: expected 200, received ${sitemapResponse.status}`);
if ([...sitemapPaths].some((path) => path.startsWith("/m/") || path.endsWith("/comments"))) failures.push("sitemap contains a mobile or comments URL");
for (const article of articles) {
  if (!sitemapPaths.has(`/entry/${article.slug}`)) failures.push(`sitemap is missing /entry/${article.slug}`);
}
for (const guide of legacyGuides.filter((entry) => entry.status === "REDIRECT" || entry.status === "GONE")) {
  if (sitemapPaths.has(`/entry/${guide.currentSlug}`)) failures.push(`sitemap contains non-200 source /entry/${guide.currentSlug}`);
}

const unknown = await request("/entry/존재하지-않는-글");
if (unknown.status !== 404) failures.push(`unknown guide: expected 404, received ${unknown.status}`);

const counts = Object.fromEntries(["KEEP", "UPDATE", "REDIRECT", "GONE"].map((status) => [status, legacyGuides.filter((guide) => guide.status === status).length]));
if (legacyGuides.length !== 45 || counts.KEEP !== 2 || counts.UPDATE !== 26 || counts.REDIRECT !== 4 || counts.GONE !== 13) failures.push(`invalid legacy counts: ${JSON.stringify(counts)}`);

if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({ origin, liveCanonical200: articles.length, legacy: legacyGuides.length, ...counts, sitemapCanonicalGuides: articles.length, status: "passed" }, null, 2));
}
