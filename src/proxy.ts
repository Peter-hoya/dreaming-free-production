import { NextRequest, NextResponse } from "next/server";
import guideIndex from "@/data/guideIndex.json";
import siteRedirects from "@/data/siteRedirects.json";
import { legacyGonePaths, legacyRedirects } from "@/lib/legacyGuides";

const redirects = new Map<string, string>([
  ...Object.entries(siteRedirects as Record<string, string>),
  ...legacyRedirects,
]);
const canonicalGuidePaths = new Set(
  guideIndex.map((article) => `/entry/${article.slug}`),
);
const canonicalOrigin = "https://dreaming-free.com";
const wwwHost = "www.dreaming-free.com";
const legacyTistoryHost = "1step-by-step.tistory.com";
const legacySubdomainHosts = new Set([
  "dt.dreaming-free.com",
  "honor.dreaming-free.com",
  "bc.dreaming-free.com",
]);

function normalizedPath(pathname: string) {
  let decoded = pathname;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const next = decodeURIComponent(decoded);
      if (next === decoded) break;
      decoded = next;
    } catch {
      // The path may already contain a literal percent sign.
      break;
    }
  }
  return decoded.normalize("NFC").replace(/\/$/, "") || "/";
}

function liveGuideDestination(source: string) {
  let articlePath = source;
  if (articlePath.endsWith("/comments")) articlePath = articlePath.slice(0, -"/comments".length);
  if (articlePath.startsWith("/m/entry/")) articlePath = articlePath.slice(2);
  if (articlePath === source || !canonicalGuidePaths.has(articlePath)) return undefined;
  return articlePath;
}

export function proxy(request: NextRequest) {
  const hasTrailingSlash = request.nextUrl.pathname.length > 1 && request.nextUrl.pathname.endsWith("/");
  const source = normalizedPath(request.nextUrl.pathname);
  if (legacyGonePaths.has(source)) {
    return new NextResponse(null, {
      status: 410,
      statusText: "Gone",
      headers: {
        "Cache-Control": "public, max-age=3600",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  }
  const destination = redirects.get(source) || liveGuideDestination(source);
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const requestHost = forwardedHost || request.headers.get("host") || request.nextUrl.hostname;
  const hostname = requestHost.split(":")[0].toLowerCase();
  const shouldNormalizeHost = hostname === wwwHost
    || hostname === legacyTistoryHost
    || legacySubdomainHosts.has(hostname);
  if ((!destination || destination === source) && !shouldNormalizeHost && !hasTrailingSlash) return NextResponse.next();

  const hostDestination = source === "/" ? "/ko" : source;
  const target = shouldNormalizeHost
    ? new URL(destination || hostDestination, canonicalOrigin)
    : new URL(request.url);
  target.pathname = destination || hostDestination;
  target.search = request.nextUrl.search;
  return NextResponse.redirect(target, 308);
}

export const config = {
  matcher: ["/:path*"],
};
