"use client";

import { BookOpenText, List, PuzzlePiece, SquaresFour } from "@phosphor-icons/react";
import { useRef } from "react";
import Link from "next/link";
import { LanguageLink } from "@/components/LanguageLink";
import { siteCopy, type Locale } from "@/data/site";

export function MobileMenu({ locale, showLanguageSwitcher = true }: { locale: Locale; showLanguageSwitcher?: boolean }) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const copy = siteCopy[locale];
  const guideHref = locale === "en" ? "/en/guides" : "/entry";
  const closeMenu = () => detailsRef.current?.removeAttribute("open");

  return (
    <details ref={detailsRef} className="mobile-menu">
      <summary aria-label={locale === "ko" ? "메뉴 열기" : "Open menu"}>
        <List size={21} weight="bold" aria-hidden="true" />
      </summary>
      <nav className="mobile-panel" aria-label={locale === "ko" ? "모바일 메뉴" : "Mobile navigation"}>
        <Link href={`/${locale}/tools`} onClick={closeMenu}><SquaresFour size={18} aria-hidden="true" /> {copy.navTools}</Link>
        <Link href={`/${locale}#games`} onClick={closeMenu}><PuzzlePiece size={18} aria-hidden="true" /> {copy.navGames}</Link>
        <Link href={guideHref} lang={locale === "ko" ? "ko" : undefined} onClick={closeMenu}><BookOpenText size={18} aria-hidden="true" /> {copy.navGuides}</Link>
        <Link href={`/${locale}/editorial`} onClick={closeMenu}>{copy.navGuide}</Link>
        <Link href={`/${locale}/about`} onClick={closeMenu}>{copy.about}</Link>
        {showLanguageSwitcher ? <LanguageLink locale={locale} onClick={closeMenu} /> : null}
      </nav>
    </details>
  );
}
