import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

function prefersKorean(value: string) {
  const accepted = value
    .split(",")
    .map((entry, index) => {
      const [language, ...parameters] = entry.trim().toLowerCase().split(";");
      const qualityParameter = parameters.find((parameter) => parameter.trim().startsWith("q="));
      const parsedQuality = qualityParameter ? Number(qualityParameter.trim().slice(2)) : 1;
      return {
        language,
        quality: Number.isFinite(parsedQuality) ? parsedQuality : 0,
        index,
      };
    })
    .filter((entry) => entry.quality > 0)
    .sort((first, second) => second.quality - first.quality || first.index - second.index);
  return accepted[0]?.language === "ko" || accepted[0]?.language.startsWith("ko-");
}

export default async function LocaleRedirectPage() {
  const requestHeaders = await headers();
  const country = (
    requestHeaders.get("x-vercel-ip-country") ||
    requestHeaders.get("cf-ipcountry") ||
    requestHeaders.get("x-country-code") ||
    ""
  ).toUpperCase();
  const acceptsKorean = prefersKorean(requestHeaders.get("accept-language") || "");
  redirect(country === "KR" || (!country && acceptsKorean) ? "/ko" : "/en");
}
