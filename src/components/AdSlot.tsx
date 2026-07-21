"use client";

import { useEffect } from "react";
import Script from "next/script";

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

export function AdSlot({ label }: { label: string }) {
  const configuredClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const configuredSlot = process.env.NEXT_PUBLIC_ADSENSE_SLOT;
  const client = configuredClient && /^ca-pub-\d+$/.test(configuredClient) ? configuredClient : undefined;
  const slot = configuredSlot && /^\d+$/.test(configuredSlot) ? configuredSlot : undefined;

  useEffect(() => {
    if (!client || !slot) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Ad blockers and delayed consent may prevent initialization.
    }
  }, [client, slot]);

  if (!client || !slot) return null;

  return (
    <>
      <Script
        id="adsense-script"
        async
        strategy="afterInteractive"
        crossOrigin="anonymous"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
      />
      <aside className="ad-slot" aria-label={label}>
        <span className="ad-slot__label">{label}</span>
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client={client}
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </aside>
    </>
  );
}
