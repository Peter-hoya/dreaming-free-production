import { NextRequest, NextResponse } from "next/server";
import guideRedirects from "@/data/guideRedirects.json";
import siteRedirects from "@/data/siteRedirects.json";

const redirects = {
  ...(siteRedirects as Record<string, string>),
  ...(guideRedirects as Record<string, string>),
};
const canonicalOrigin = "https://dreaming-free.com";
const wwwHost = "www.dreaming-free.com";
const legacyTistoryHost = "1step-by-step.tistory.com";

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

export function proxy(request: NextRequest) {
  const hasTrailingSlash = request.nextUrl.pathname.length > 1 && request.nextUrl.pathname.endsWith("/");
  const source = normalizedPath(request.nextUrl.pathname);
  const destination = redirects[source];
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const requestHost = forwardedHost || request.headers.get("host") || request.nextUrl.hostname;
  const hostname = requestHost.split(":")[0].toLowerCase();
  const shouldNormalizeHost = hostname === wwwHost || hostname === legacyTistoryHost;
  if ((!destination || destination === source) && !shouldNormalizeHost && !hasTrailingSlash) return NextResponse.next();

  const target = shouldNormalizeHost
    ? new URL(destination || source, canonicalOrigin)
    : new URL(request.url);
  target.pathname = destination || source;
  target.search = request.nextUrl.search;
  return NextResponse.redirect(target, 301);
}

export const config = {
  matcher: ["/:path*"],
};
