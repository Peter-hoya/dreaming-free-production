"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Locale } from "@/data/site";

const CONSENT_KEY = "moatools:analytics-consent";
const CONSENT_EVENT = "moatools:analytics-consent-updated";
type ConsentChoice = "granted" | "denied" | null;

export function AnalyticsConsent({ locale }: { locale: Locale }) {
  const configuredId = process.env.NEXT_PUBLIC_GA_ID;
  const enabled = Boolean(configuredId && /^G-[A-Z0-9]+$/.test(configuredId));
  const [choice, setChoice] = useState<ConsentChoice>(null);
  const [ready, setReady] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    const syncChoice = () => {
      try {
        const stored = window.localStorage.getItem(CONSENT_KEY);
        setChoice(stored === "granted" || stored === "denied" ? stored : null);
      } catch {
        setChoice(null);
      }
      setReady(true);
    };
    syncChoice();
  }, [enabled]);

  if (!enabled || !ready) return null;

  const saveChoice = (nextChoice: Exclude<ConsentChoice, null>) => {
    const shouldReload = choice === "granted" && nextChoice === "denied";
    try {
      window.localStorage.setItem(CONSENT_KEY, nextChoice);
    } catch {
      // When storage is unavailable, keep the current page in the safer no-analytics state.
    }
    setChoice(nextChoice);
    setEditing(false);
    window.dispatchEvent(new Event(CONSENT_EVENT));
    if (shouldReload) window.location.reload();
  };

  const panelVisible = choice === null || editing;

  return (
    <>
      {choice !== null && !panelVisible ? (
        <button className="consent-settings" type="button" onClick={() => setEditing(true)}>
          {locale === "ko" ? "분석 설정" : "Analytics settings"}
        </button>
      ) : null}
      {panelVisible ? (
        <section className="consent-panel" aria-labelledby="analytics-consent-title">
          <div>
            <strong id="analytics-consent-title">
              {locale === "ko" ? "사이트 개선을 위한 선택적 분석" : "Optional analytics for site improvements"}
            </strong>
            <p>
              {locale === "ko"
                ? "허용하면 Google Analytics가 익명화된 이용 통계를 처리합니다. 도구에 입력한 내용은 분석 이벤트로 보내지 않으며, 거부해도 모든 기능을 사용할 수 있습니다."
                : "If allowed, Google Analytics processes anonymized usage statistics. Tool inputs are never included in analytics events, and every feature works if you decline."}
              {" "}<Link href={`/${locale}/privacy`}>{locale === "ko" ? "자세히 보기" : "Learn more"}</Link>
            </p>
          </div>
          <div className="consent-actions">
            <button type="button" className="button button-secondary" onClick={() => saveChoice("denied")}>
              {locale === "ko" ? "거부" : "Decline"}
            </button>
            <button type="button" className="button button-primary" onClick={() => saveChoice("granted")}>
              {locale === "ko" ? "분석 허용" : "Allow analytics"}
            </button>
          </div>
        </section>
      ) : null}
    </>
  );
}
