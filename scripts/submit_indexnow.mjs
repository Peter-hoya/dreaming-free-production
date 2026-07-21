import process from "node:process";

const origin = (process.env.INDEXNOW_ORIGIN || "https://dreaming-free.com").replace(/\/$/, "");
const key = process.env.INDEXNOW_KEY?.trim() || "";
const endpoint = "https://searchadvisor.naver.com/indexnow";
const input = process.argv.slice(2);

if (!/^[a-fA-F0-9-]{8,128}$/.test(key)) {
  console.error("INDEXNOW_KEY must contain 8-128 hexadecimal characters or hyphens.");
  process.exit(1);
}

async function urlsFromSitemap() {
  const response = await fetch(`${origin}/sitemap.xml`, { signal: AbortSignal.timeout(15_000) });
  if (!response.ok) throw new Error(`sitemap request returned ${response.status}`);
  const xml = await response.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
}

const requested = input.includes("--sitemap")
  ? await urlsFromSitemap()
  : input.filter((value) => value !== "--sitemap");

if (!requested.length) {
  console.error("Pass one or more new/changed paths, or use --sitemap for an initial launch.");
  console.error("Example: npm run submit:indexnow -- /ko/tools/four-major-insurance");
  process.exit(1);
}

const expectedOrigin = new URL(origin).origin;
const urlList = [...new Set(requested.map((value) => new URL(value, `${origin}/`).href))];
if (urlList.some((url) => new URL(url).origin !== expectedOrigin)) {
  console.error(`Every submitted URL must belong to ${expectedOrigin}.`);
  process.exit(1);
}
if (urlList.length > 10_000) {
  console.error("IndexNow accepts at most 10,000 URLs per request.");
  process.exit(1);
}

const keyLocation = `${origin}/indexnow-key.txt`;
const keyResponse = await fetch(keyLocation, { signal: AbortSignal.timeout(15_000) });
const hostedKey = keyResponse.ok ? (await keyResponse.text()).trim() : "";
if (hostedKey !== key) {
  console.error(`${keyLocation} does not expose the configured INDEXNOW_KEY.`);
  console.error("Deploy the key route and environment variable before submitting URLs.");
  process.exit(1);
}

const response = await fetch(endpoint, {
  method: "POST",
  signal: AbortSignal.timeout(30_000),
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    host: new URL(origin).host,
    key,
    keyLocation,
    urlList,
  }),
});

const responseBody = await response.text();
if (response.status !== 200 && response.status !== 202) {
  console.error(`IndexNow returned HTTP ${response.status}.`);
  if (responseBody) console.error(responseBody);
  process.exit(1);
}

console.log(JSON.stringify({
  endpoint,
  status: response.status,
  submitted: urlList.length,
  urls: urlList,
}, null, 2));
