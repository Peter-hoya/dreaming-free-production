"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

const ANALYTICS_CONSENT_KEY = "moatools:analytics-consent";
const ANALYTICS_CONSENT_EVENT = "moatools:analytics-consent-updated";

export function Analytics() {
  const configuredAnalyticsId = process.env.NEXT_PUBLIC_GA_ID;
  const analyticsId = configuredAnalyticsId && /^G-[A-Z0-9]+$/.test(configuredAnalyticsId)
    ? configuredAnalyticsId
    : undefined;
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    if (!analyticsId) return;
    const syncConsent = () => {
      try {
        setConsented(window.localStorage.getItem(ANALYTICS_CONSENT_KEY) === "granted");
      } catch {
        setConsented(false);
      }
    };
    syncConsent();
    window.addEventListener("storage", syncConsent);
    window.addEventListener(ANALYTICS_CONSENT_EVENT, syncConsent);
    return () => {
      window.removeEventListener("storage", syncConsent);
      window.removeEventListener(ANALYTICS_CONSENT_EVENT, syncConsent);
    };
  }, [analyticsId]);

  return (
    <>
      {analyticsId && consented ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${analyticsId}`} strategy="afterInteractive" />
          <Script id="google-analytics" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)};gtag('js',new Date());gtag('config','${analyticsId}',{anonymize_ip:true});`}
          </Script>
        </>
      ) : null}
    </>
  );
}
