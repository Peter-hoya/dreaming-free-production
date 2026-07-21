import Link from "next/link";
import { LanguageLink } from "@/components/LanguageLink";
import { MobileMenu } from "@/components/MobileMenu";
import { siteCopy, type Locale } from "@/data/site";

export function SiteHeader({ locale, showLanguageSwitcher = true }: { locale: Locale; showLanguageSwitcher?: boolean }) {
  const copy = siteCopy[locale];
  const guideHref = locale === "en" ? "/en/guides" : "/entry";
  return (
    <header className="site-header">
      <div className="site-shell header-inner">
        <Link href={`/${locale}`} className="brand" aria-label={`${copy.brand} ${locale === "ko" ? "홈" : "home"}`}>
          <span className="brand-mark" aria-hidden="true"><span /></span>
          <span>{copy.brand}</span>
        </Link>

        <nav className="desktop-nav" aria-label={locale === "ko" ? "주요 메뉴" : "Primary navigation"}>
          <Link href={`/${locale}/tools`}>{copy.navTools}</Link>
          <Link href={`/${locale}#games`}>{copy.navGames}</Link>
          <Link href={guideHref} lang={locale === "ko" ? "ko" : undefined}>{copy.navGuides}</Link>
          <Link href={`/${locale}/editorial`}>{copy.navGuide}</Link>
          <Link href={`/${locale}/about`}>{copy.about}</Link>
        </nav>

        <div className="header-actions">
          {showLanguageSwitcher ? <LanguageLink locale={locale} /> : null}
          <MobileMenu locale={locale} showLanguageSwitcher={showLanguageSwitcher} />
        </div>
      </div>
    </header>
  );
}
