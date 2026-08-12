import { readFile } from "node:fs/promises";
import process from "node:process";

const origin = (process.env.REDIRECT_TEST_ORIGIN || "http://127.0.0.1:3000").replace(/\/$/, "");
const canonicalOrigin = "https://dreaming-free.com";
const queryMarker = "?utm_source=redirect-test&ref=legacy";
const articles = JSON.parse(await readFile("src/data/guideIndex.json", "utf8"));
const redirects = JSON.parse(await readFile("src/data/guideRedirects.json", "utf8"));

function encodedPath(pathname) {
  return pathname
    .split("/")
    .map((segment, index) => index === 0 ? "" : encodeURIComponent(segment))
    .join("/");
}

function decodedPath(url) {
  return decodeURIComponent(new URL(url, origin).pathname).normalize("NFC");
}

async function request(pathname, { search = "", forwardedHost } = {}) {
  return fetch(`${origin}${encodedPath(pathname)}${search}`, {
    redirect: "manual",
    headers: {
      "user-agent": "MoaToolsRouteVerifier/1.0",
      ...(forwardedHost ? { "x-forwarded-host": forwardedHost } : {}),
    },
  });
}

const failures = [];
for (const article of articles) {
  const pathname = `/entry/${article.slug}`;
  const response = await request(pathname);
  if (response.status !== 200) failures.push(`${pathname}: expected 200, received ${response.status}`);
}

for (const [source, destination] of Object.entries(redirects)) {
  const response = await request(source, { search: queryMarker });
  const location = response.headers.get("location");
  if (response.status !== 301) {
    failures.push(`${source}: expected 301, received ${response.status}`);
  } else if (!location || decodedPath(location) !== destination.normalize("NFC")) {
    failures.push(`${source}: expected Location ${destination}, received ${location || "<missing>"}`);
  } else if (new URL(location, origin).search !== queryMarker) {
    failures.push(`${source}: redirect did not preserve ${queryMarker}`);
  }
}

const representativeCanonical = `/entry/${articles[0].slug}`;
const [representativeAlias, representativeAliasDestination] = Object.entries(redirects)[0];
const doubleEncodedAlias = encodedPath(representativeAlias).replaceAll("%", "%25");
const doubleEncodedResponse = await fetch(`${origin}${doubleEncodedAlias}${queryMarker}`, {
  redirect: "manual",
  headers: { "user-agent": "MoaToolsRouteVerifier/1.0" },
});
const doubleEncodedLocation = doubleEncodedResponse.headers.get("location");
if (
  doubleEncodedResponse.status !== 301
  || !doubleEncodedLocation
  || decodedPath(doubleEncodedLocation) !== representativeAliasDestination.normalize("NFC")
) {
  failures.push(`Double-encoded legacy alias: expected 301 to ${representativeAliasDestination}, received ${doubleEncodedResponse.status} ${doubleEncodedLocation || "<missing>"}`);
}
const hostChecks = [
  { host: "www.dreaming-free.com", source: representativeCanonical, destination: representativeCanonical },
  { host: "www.dreaming-free.com", source: representativeAlias, destination: representativeAliasDestination },
  { host: "1step-by-step.tistory.com", source: representativeCanonical, destination: representativeCanonical },
  { host: "1step-by-step.tistory.com", source: representativeAlias, destination: representativeAliasDestination },
];

for (const { host, source, destination } of hostChecks) {
  const response = await request(source, { search: queryMarker, forwardedHost: host });
  const location = response.headers.get("location");
  if (response.status !== 301) {
    failures.push(`${host}${source}: expected 301, received ${response.status}`);
    continue;
  }
  const target = location ? new URL(location, origin) : null;
  if (!target || target.origin !== canonicalOrigin || decodedPath(target.href) !== destination.normalize("NFC")) {
    failures.push(`${host}${source}: expected ${canonicalOrigin}${destination}, received ${location || "<missing>"}`);
  } else if (target.search !== queryMarker) {
    failures.push(`${host}${source}: redirect did not preserve ${queryMarker}`);
  }
}

const missing = await request("/entry/존재하지-않는-글");
if (missing.status !== 404) failures.push(`Unknown guide: expected 404, received ${missing.status}`);

if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({
    origin,
    canonical200: articles.length,
    permanent301: Object.keys(redirects).length,
    queryPreservationChecks: Object.keys(redirects).length + hostChecks.length,
    wwwHost301: hostChecks.filter(({ host }) => host === "www.dreaming-free.com").length,
    defensiveLegacyHost301: hostChecks.filter(({ host }) => host === "1step-by-step.tistory.com").length,
    doubleEncodedAlias301: 1,
    unknown404: 1,
  }, null, 2));
}
