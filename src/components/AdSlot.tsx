"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { adsenseClient, adsenseSlot } from "@/lib/adsense";

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

export function AdSlot({ label }: { label: string }) {
  const pathname = usePathname();
  const adRef = useRef<HTMLModElement>(null);
  const [status, setStatus] = useState<"loading" | "filled" | "unfilled">("loading");

  useEffect(() => {
    const ad = adRef.current;
    if (!ad) return;

    setStatus("loading");
    const syncStatus = () => {
      const nextStatus = ad.dataset.adStatus;
      if (nextStatus === "filled" || nextStatus === "unfilled") setStatus(nextStatus);
    };
    const observer = new MutationObserver(syncStatus);
    observer.observe(ad, { attributes: true, attributeFilter: ["data-ad-status"] });

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Ad blockers and delayed consent may prevent initialization.
    }
    syncStatus();
    return () => observer.disconnect();
  }, [pathname]);

  return (
    <aside className="ad-slot" aria-label={label} data-ad-state={status}>
      <span className="ad-slot__label">{label}</span>
      <ins
        key={`${pathname}-${adsenseSlot}`}
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block", width: "100%" }}
        data-ad-client={adsenseClient}
        data-ad-slot={adsenseSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
