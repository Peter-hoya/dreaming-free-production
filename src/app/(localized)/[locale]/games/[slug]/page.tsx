import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/AdSlot";
import { FaqList } from "@/components/FaqList";
import { GameWidget } from "@/components/games/GameWidgets";
import { JsonLd } from "@/components/JsonLd";
import { ToolIcon } from "@/components/ToolIcon";
import { games, getGame, isLocale, siteCopy, type Locale } from "@/data/site";
import { absoluteUrl, pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return games.map((game) => ({ slug: game.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale: Locale = isLocale(rawLocale) ? rawLocale : "en";
  const game = getGame(slug);
  if (!game) return {};
  return pageMetadata({
    locale,
    title: game.title[locale],
    description: game.short[locale],
    path: `games/${game.slug}`,
    keywords: locale === "ko" ? [game.title.ko, "무료 웹 게임", "두뇌 게임"] : [game.title.en, "free web game", "brain game"],
  });
}

export default async function GamePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: rawLocale, slug } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale as Locale;
  const game = getGame(slug);
  if (!game) notFound();
  const copy = siteCopy[locale];
  const isMerge = game.slug === "merge-2048";
  const isShooter = game.slug === "arcade-shooter";
  const rules = isMerge
    ? (locale === "ko"
      ? ["방향키, 스와이프 또는 화면 버튼으로 모든 타일을 움직입니다.", "같은 숫자 두 개가 닿으면 합쳐지고 점수가 올라갑니다.", "빈칸이 없고 움직일 수 없으면 라운드가 끝납니다."]
      : ["Use arrow keys, swipe, or the on-screen controls to move every tile.", "Two equal tiles merge when they meet and add to your score.", "The round ends when the board is full and no move remains."])
    : isShooter
      ? (locale === "ko"
        ? ["방향키 또는 A와 D로 이동하고 Space로 발사합니다.", "화면 버튼은 누르고 있는 동안 계속 이동하거나 발사합니다.", "생명 세 개로 최대한 많은 웨이브와 점수에 도전하세요."]
        : ["Move with arrow keys or A and D, then fire with Space.", "Hold the on-screen controls to keep moving or firing.", "Use three lives to reach the highest wave and score you can."])
      : (locale === "ko"
      ? ["카드를 두 장씩 선택해 같은 문자를 찾습니다.", "다른 카드라면 잠시 표시된 뒤 다시 뒤집힙니다.", "모든 짝을 적은 이동과 짧은 시간 안에 찾으세요."]
      : ["Choose two cards at a time and look for matching letters.", "A mismatched pair stays visible briefly, then turns back over.", "Find every pair in as few moves and as little time as possible."]);
  const faqs = isMerge
    ? (locale === "ko"
      ? [
        { question: "2048 타일을 만들면 게임이 끝나나요?", answer: "계속하기를 선택하면 빈칸이 남아 있는 동안 더 높은 점수에 도전할 수 있습니다." },
        { question: "최고 점수는 어디에 저장되나요?", answer: "현재 브라우저의 로컬 저장소에만 저장되며 서버로 전송되지 않습니다." },
        { question: "모바일에서도 할 수 있나요?", answer: "네. 보드에서 스와이프하거나 화면 방향 버튼을 사용할 수 있습니다." },
      ]
      : [
        { question: "Does the game end when I make 2048?", answer: "You can choose to continue and build a higher score while valid moves remain." },
        { question: "Where is my high score stored?", answer: "It is saved only in local browser storage and is not sent to our server." },
        { question: "Can I play on mobile?", answer: "Yes. Swipe on the board or use the on-screen direction controls." },
      ])
    : isShooter
      ? (locale === "ko"
        ? [
          { question: "모바일에서도 플레이할 수 있나요?", answer: "네. 화면 아래의 이동과 발사 버튼을 누르고 있는 방식으로 조작할 수 있습니다." },
          { question: "게임을 멈출 수 있나요?", answer: "네. 일시정지 버튼이나 P 키를 사용하면 현재 라운드를 멈췄다가 이어서 할 수 있습니다." },
          { question: "최고 점수는 어디에 저장되나요?", answer: "현재 브라우저의 로컬 저장소에만 저장되며 서버로 전송되지 않습니다." },
        ]
        : [
          { question: "Can I play on mobile?", answer: "Yes. Hold the movement and fire controls below the game area." },
          { question: "Can I pause the game?", answer: "Yes. Use the pause button or the P key to stop and resume the current run." },
          { question: "Where is the best score stored?", answer: "It is stored only in this browser and is not sent to our server." },
        ])
      : (locale === "ko"
      ? [
        { question: "카드는 매번 같은 순서인가요?", answer: "아닙니다. 새 게임을 시작할 때마다 카드가 무작위로 섞입니다." },
        { question: "좋은 기록은 어떻게 정하나요?", answer: "이동 횟수가 적은 기록을 우선하고, 같다면 완료 시간이 짧은 기록을 더 좋게 봅니다." },
        { question: "기록이 서버에 저장되나요?", answer: "아닙니다. 최고 기록은 현재 브라우저에만 저장됩니다." },
      ]
      : [
        { question: "Are the cards in the same order every time?", answer: "No. The deck is shuffled whenever you start a new round." },
        { question: "What counts as a better score?", answer: "Fewer moves rank first. If moves are equal, a shorter completion time is better." },
        { question: "Is my result saved on a server?", answer: "No. Your best result is stored only in the current browser." },
      ]);
  const pageUrl = absoluteUrl(`/${locale}/games/${game.slug}`);

  return (
    <>
      <header className="site-shell game-page-header">
        <nav className="breadcrumbs" aria-label={locale === "ko" ? "현재 위치" : "Breadcrumb"}>
          <Link href={`/${locale}`}>{copy.backHome}</Link>
          <span aria-hidden="true">/</span>
          <Link href={`/${locale}#games`}>{copy.games}</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{game.title[locale]}</span>
        </nav>
        <ToolIcon name={game.icon} large />
        <h1>{game.title[locale]}</h1>
        <p>{game.short[locale]}</p>
      </header>

      <section className="site-shell game-layout">
        <GameWidget slug={game.slug} locale={locale} />
        <aside className="game-sidebar">
          <div className="game-panel">
            <h2>{locale === "ko" ? "게임 방법" : "How to play"}</h2>
            <ul className="use-case-grid">
              {rules.map((rule) => <li key={rule}><CheckCircle size={18} weight="fill" aria-hidden="true" /><span>{rule}</span></li>)}
            </ul>
          </div>
          <div className="game-panel">
            <h2>{locale === "ko" ? "기록과 개인정보" : "Scores and privacy"}</h2>
            <p>{locale === "ko"
              ? "게임은 브라우저 안에서 실행됩니다. 최고 기록은 이 기기에만 저장되며 계정이나 개인정보가 필요하지 않습니다."
              : "The game runs in your browser. Best scores stay on this device and no account or personal information is required."}</p>
          </div>
        </aside>
      </section>

      <AdSlot label={locale === "ko" ? "광고" : "Advertisement"} />

      <section className="section-compact">
        <div className="site-shell">
          <header className="section-heading"><h2>{copy.faqTitle}</h2></header>
          <FaqList items={faqs} />
        </div>
      </section>
      <JsonLd data={[
        {
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: game.title[locale],
          description: game.description[locale],
          url: pageUrl,
          inLanguage: locale,
          dateModified: "2026-07-21",
          isPartOf: { "@type": "WebSite", "@id": absoluteUrl("/ko#website"), name: "MoaTools", url: absoluteUrl("/ko") },
          mainEntity: {
            "@type": ["VideoGame", "WebApplication"],
            name: game.title[locale],
            description: game.description[locale],
            url: pageUrl,
            applicationCategory: "GameApplication",
            gamePlatform: "Web browser",
            operatingSystem: "Any",
            browserRequirements: "Requires JavaScript and a modern web browser",
            playMode: "SinglePlayer",
            isAccessibleForFree: true,
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          },
        },
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: copy.backHome, item: absoluteUrl(`/${locale}`) },
            { "@type": "ListItem", position: 2, name: game.title[locale], item: pageUrl },
          ],
        },
        {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
          })),
        },
      ]} />
    </>
  );
}
