"use client";

import { Translate } from "@phosphor-icons/react";
import { usePathname } from "next/navigation";
import type { MouseEventHandler } from "react";
import type { Locale } from "@/data/site";

export function LanguageLink({ locale, onClick }: { locale: Locale; onClick?: MouseEventHandler<HTMLAnchorElement> }) {
  const pathname = usePathname();
  const nextLocale = locale === "ko" ? "en" : "ko";
  const nextPath = pathname.replace(/^\/(ko|en)(?=\/|$)/, `/${nextLocale}`);

  return (
    <a
      href={nextPath || `/${nextLocale}`}
      className="language-link"
      hrefLang={nextLocale}
      lang={nextLocale}
      onClick={onClick}
      aria-label={locale === "ko" ? "View this page in English" : "이 페이지를 한국어로 보기"}
    >
      <Translate size={17} weight="bold" aria-hidden="true" />
      {locale === "ko" ? "EN" : "한국어"}
    </a>
  );
}
