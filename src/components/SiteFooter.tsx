import Link from "next/link";
import { AnalyticsConsent } from "@/components/AnalyticsConsent";
import { siteCopy, type Locale } from "@/data/site";

export function SiteFooter({ locale }: { locale: Locale }) {
  const copy = siteCopy[locale];
  const guideHref = locale === "en" ? "/en/guides" : "/entry";
  return (
    <footer className="site-footer">
      <div className="site-shell footer-inner">
        <div className="footer-copy">
          <Link href={`/${locale}`} className="brand">
            <span className="brand-mark" aria-hidden="true"><span /></span>
            <span>{copy.brand}</span>
          </Link>
          <p>{copy.footerLine}</p>
        </div>
        <nav className="footer-links" aria-label={locale === "ko" ? "하단 메뉴" : "Footer navigation"}>
          <Link href={`/${locale}/tools`}>{copy.allTools}</Link>
          <Link href={`/${locale}#games`}>{copy.games}</Link>
          <Link href={guideHref} lang={locale === "ko" ? "ko" : undefined}>{copy.navGuides}</Link>
          <Link href={`/${locale}/about`}>{copy.about}</Link>
          <Link href={`/${locale}/editorial`}>{copy.editorial}</Link>
          <Link href={`/${locale}/privacy`}>{copy.privacy}</Link>
          <Link href={`/${locale}/terms`}>{copy.terms}</Link>
          <Link href={`/${locale}/contact`}>{copy.contact}</Link>
          <AnalyticsConsent locale={locale} />
        </nav>
      </div>
      <div className="site-shell footer-bottom">
        <span>© {new Date().getFullYear()} MoaTools</span>
        <span>{locale === "ko" ? "브라우저에서 빠르고 안전하게" : "Fast and private in your browser"}</span>
      </div>
    </footer>
  );
}
